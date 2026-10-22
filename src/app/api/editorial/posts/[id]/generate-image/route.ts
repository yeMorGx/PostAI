import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { isPiersecBriefing } from "@/lib/editorial";
import { editorialError } from "@/lib/editorial-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { imageType } from "@/lib/media-upload";
import { buildImageGenerationPrompt } from "@/lib/editorial-image-generation";
import { loadCarouselVisualRules, PiersecManualUnavailableError } from "@/lib/piersec-manual";
import { uuidSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 180;

const imageRequestSchema = z.object({
  revision: z.number().int().positive(),
  slide_index: z.number().int().min(0).max(8),
}).strict();

const slideSchema = z.object({
  role: z.enum(["cover", "content", "final"]),
  visual_type: z.enum(["photo", "graphic"]),
  visual_direction: z.string().trim().min(1).max(600),
}).passthrough();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace, user } = await requireApiContext("edit");
    const id = uuidSchema.parse((await params).id);
    const input = imageRequestSchema.parse(await readJson(request));
    const { data: post, error: postError } = await supabase.from("editorial_posts")
      .select("id,cycle_id,channel,status,revision,slides")
      .eq("id", id).eq("workspace_id", workspace.id).maybeSingle();
    if (postError) editorialError(postError);
    if (!post) throw new HttpError(404, "Peça não encontrada.");
    if (post.channel !== "carrossel") throw new HttpError(422, "A geração de imagem está disponível para lâminas de carrossel.");
    if (post.status === "published" || post.revision !== input.revision) throw new HttpError(409, "A peça foi alterada ou publicada. Atualize antes de gerar a imagem.");

    const { data: article, error: articleError } = await supabase.from("editorial_posts")
      .select("body,status,revision,approved_revision")
      .eq("cycle_id", post.cycle_id).eq("workspace_id", workspace.id).eq("channel", "blog").maybeSingle();
    if (articleError) editorialError(articleError);
    if (!article || article.status !== "approved" || article.approved_revision !== article.revision || isPiersecBriefing(article.body)) {
      throw new HttpError(409, "Aprove o artigo do blog antes de gerar as imagens do carrossel.");
    }

    const slides = Array.isArray(post.slides) ? post.slides : [];
    const parsedSlide = slideSchema.safeParse(slides[input.slide_index]);
    if (!parsedSlide.success) throw new HttpError(422, "A lâmina precisa estar salva com uma direção visual antes de gerar a imagem.");
    if (parsedSlide.data.visual_type !== "photo") throw new HttpError(422, "O manual reserva a geração de imagem para lâminas definidas como foto.");
    if (/[áàâãéêíóôõúç]|\b(?:com|para|uma|reuniao|escritorio|equipe|pessoas|empresa|luz)\b/iu.test(parsedSlide.data.visual_direction)) {
      throw new HttpError(422, "A direção visual da foto precisa estar em inglês, conforme o manual Piersec.");
    }

    const fileName = `slide-${String(input.slide_index + 1).padStart(2, "0")}.webp`;
    const { data: assets, error: assetsError } = await supabase.from("editorial_assets")
      .select("file_name").eq("post_id", id).eq("workspace_id", workspace.id);
    if (assetsError) editorialError(assetsError);
    if ((assets?.length ?? 0) >= 10) throw new HttpError(409, "O carrossel já tem dez imagens. Remova uma antes de gerar outra.");
    if (assets?.some((asset) => asset.file_name === fileName)) throw new HttpError(409, "Esta lâmina já tem uma imagem. Remova o arquivo atual antes de gerar outra versão.");

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new HttpError(503, "A geração de imagem ainda não foi configurada. Adicione OPENAI_API_KEY às variáveis do servidor.");
    let visualRules: string;
    try { visualRules = await loadCarouselVisualRules(); }
    catch (cause) {
      if (cause instanceof PiersecManualUnavailableError) throw new HttpError(503, cause.message);
      throw cause;
    }

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2.5-flare",
          prompt: buildImageGenerationPrompt(visualRules, parsedSlide.data),
          size: "1088x1360",
          quality: "high",
          output_format: "webp",
          output_compression: 82,
          n: 1,
          safety_identifier: createHash("sha256").update(user.id).digest("hex"),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(150_000),
      });
    } catch (cause) {
      const timedOut = cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name);
      throw new HttpError(timedOut ? 504 : 502, timedOut ? "A geração levou mais de dois minutos. Tente novamente." : "Não foi possível conectar à OpenAI para gerar a imagem.");
    }

    if (!response.ok) {
      console.error("OpenAI editorial image generation failed", { status: response.status, requestId: response.headers.get("x-request-id") });
      if (response.status === 429) throw new HttpError(429, "A OpenAI atingiu um limite de uso. Confira os limites do projeto e tente mais tarde.");
      if (response.status === 401 || response.status === 403) throw new HttpError(502, "A OpenAI recusou a chave ou a conta não está habilitada para gerar imagens.");
      if (response.status === 400) throw new HttpError(502, "A OpenAI recusou o modelo ou as opções de imagem configuradas. Confira OPENAI_IMAGE_MODEL.");
      throw new HttpError(502, "A OpenAI não conseguiu gerar esta imagem. Tente novamente.");
    }

    const payload: unknown = await response.json().catch(() => null);
    const encoded = payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? ((payload as { data: unknown[] }).data[0] as { b64_json?: unknown } | undefined)?.b64_json
      : null;
    if (typeof encoded !== "string" || !encoded) throw new HttpError(502, "A OpenAI não retornou um arquivo de imagem válido.");
    const bytes = new Uint8Array(Buffer.from(encoded, "base64"));
    if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new HttpError(502, "A imagem gerada excedeu o limite de armazenamento.");
    const type = imageType(bytes);
    if (type.mime !== "image/webp") throw new HttpError(502, "A OpenAI retornou um formato diferente de WebP. Gere novamente.");

    const path = `${workspace.id}/${id}/${randomUUID()}.webp`;
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage.from("editorial-media").upload(path, bytes, { contentType: type.mime, upsert: false });
    if (uploadError) throw new HttpError(503, "Não foi possível armazenar a imagem. Confira o bucket privado de mídia do Supabase.");

    const { data: assetId, error: attachError } = await supabase.rpc("editorial_attach_asset", {
      p_post: id,
      p_revision: input.revision,
      p_path: path,
      p_name: fileName,
      p_mime: type.mime,
      p_size: bytes.byteLength,
    });
    if (attachError) {
      await admin.storage.from("editorial-media").remove([path]);
      editorialError(attachError);
    }

    return NextResponse.json({ id: assetId, file_name: fileName, revision: input.revision + 1 }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
