import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { BRIEFING_MARKER, channelLabels, isPiersecBriefing } from "@/lib/editorial";
import { apiError, HttpError } from "@/lib/http";
import { editorialError } from "@/lib/editorial-server";
import { buildImageGenerationPrompt } from "@/lib/editorial-image-generation";
import { generationInstructions, outputFormat } from "@/lib/editorial-generation";
import { loadCarouselVisualRules, loadEditorialManual, PiersecManualUnavailableError } from "@/lib/piersec-manual";
import { loadPiersecKnowledgeContext, PiersecKnowledgeUnavailableError } from "@/lib/piersec-knowledge";
import { uuidSchema } from "@/lib/schemas";
import { DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, estimateGenerationCost, MAX_GENERATION_REPAIRS, MAX_SEARCH_CALLS, PRICING_DATE, type CostRange, type GenerationEstimate } from "@/lib/generation-cost";

export const maxDuration = 60;

type GenerationKind = "briefing" | "article" | "newsletter" | "linkedin_post" | "carousel";
type PackagePost = { id: string; channel: string; title: string; body: string; status: string; revision: number; approved_revision: number | null; slides: unknown };
const articlePlaceholder = `# Artigo de referência para previsão de custo\n\n${"Parágrafo estimado sobre o tema editorial, com análise, contexto, implicações operacionais e fonte primária. ".repeat(105)}\n\n## Fontes\n- [Fonte primária](https://example.com/fonte)\n`;
const briefingPlaceholder = `${BRIEFING_MARKER}\n${"Resumo estimado da pesquisa, dados e contexto do tema para calcular o tamanho do próximo prompt. ".repeat(42)}`;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, workspace } = await requireApiContext("edit");
    const cycleId = uuidSchema.parse((await params).id);
    const [cycleResult, brandResult, postsResult, assetsResult] = await Promise.all([
      supabase.from("editorial_cycles").select("id,theme").eq("id", cycleId).eq("workspace_id", workspace.id).maybeSingle(),
      supabase.from("brand_profiles").select("tone,guidance,forbidden_terms").eq("workspace_id", workspace.id).maybeSingle(),
      supabase.from("editorial_posts").select("id,channel,title,body,status,revision,approved_revision,slides").eq("cycle_id", cycleId).eq("workspace_id", workspace.id),
      supabase.from("editorial_assets").select("post_id,file_name").eq("workspace_id", workspace.id),
    ]);
    if (cycleResult.error) editorialError(cycleResult.error);
    if (brandResult.error) editorialError(brandResult.error);
    if (postsResult.error) editorialError(postsResult.error);
    if (assetsResult.error) editorialError(assetsResult.error);
    if (!cycleResult.data) throw new HttpError(404, "Semana editorial não encontrada.");

    const posts = (postsResult.data ?? []) as PackagePost[];
    const assets = assetsResult.data ?? [];
    const blog = posts.find((post) => post.channel === "blog");
    const briefingExists = Boolean(blog?.body.trim() && isPiersecBriefing(blog.body));
    const articleExists = Boolean(blog?.body.trim() && !isPiersecBriefing(blog.body));
    const canBuildBriefing = blog?.status === "draft" && !blog.body.trim();
    const approvedBriefingReady = blog?.status === "approved" && blog.approved_revision === blog.revision && briefingExists;
    const canBuildArticle = !articleExists && Boolean(blog && (blog.status === "draft" || approvedBriefingReady) && (briefingExists || canBuildBriefing));
    const articleSourceReady = articleExists && Boolean(blog && (blog.status === "draft" || blog.status === "approved" && blog.approved_revision === blog.revision));
    const articleReference = articleExists ? blog!.body : articlePlaceholder;
    const sourceBriefing = briefingExists ? blog!.body : briefingPlaceholder;
    const date = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "long" }).format(new Date());
    const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_TEXT_MODEL;
    const textRanges: CostRange[] = [];
    let unpricedText = false;

    async function addTextEstimate(kind: GenerationKind, post: PackagePost, references: { briefing?: string; article?: string } = {}) {
      let knowledgeContext: string;
      let manual: string;
      try {
        [knowledgeContext, manual] = await Promise.all([
          loadPiersecKnowledgeContext(cycleResult.data!.theme, kind).then((result) => result.context),
          loadEditorialManual(kind),
        ]);
      } catch (cause) {
        if (cause instanceof PiersecKnowledgeUnavailableError || cause instanceof PiersecManualUnavailableError) throw new HttpError(503, cause.message);
        throw cause;
      }
      const context = {
        channel: post.channel === "blog" ? "Artigo no blog" : channelLabels[post.channel as keyof typeof channelLabels],
        weekly_theme: cycleResult.data!.theme,
        current_title: post.title || cycleResult.data!.theme,
        current_date: date,
        brand: brandResult.data ?? null,
        knowledge_base_context: knowledgeContext,
        briefing_reference: references.briefing ?? "",
        article_reference: references.article ?? "",
      };
      const requestBody: Record<string, unknown> = {
        model,
        instructions: generationInstructions(kind, manual, true),
        input: JSON.stringify(context),
        max_output_tokens: kind === "article" ? 10000 : kind === "newsletter" ? 8000 : 6000,
        store: false,
        service_tier: "default",
        text: { format: outputFormat(kind) },
      };
      if (kind === "briefing") {
        requestBody.tools = [{ type: "web_search" }];
        requestBody.tool_choice = "required";
        requestBody.include = ["web_search_call.action.sources"];
        requestBody.max_tool_calls = MAX_SEARCH_CALLS;
      }
      const estimate = estimateGenerationCost({ model, prompt: JSON.stringify(requestBody), maxOutputTokens: Number(requestBody.max_output_tokens), search: kind === "briefing", maxRepairs: MAX_GENERATION_REPAIRS });
      if (estimate.text) textRanges.push(estimate.text);
      else unpricedText = true;
    }

    if (canBuildBriefing && blog) await addTextEstimate("briefing", blog);
    if (canBuildArticle && blog) await addTextEstimate("article", blog, { briefing: sourceBriefing });

    const derivativeKinds: [string, GenerationKind][] = [["news", "newsletter"], ["lkpost", "linkedin_post"], ["carrossel", "carousel"]];
    const carousel = posts.find((post) => post.channel === "carrossel");
    const carouselHasText = Boolean(carousel?.body.trim());
    const carouselCanBeGenerated = carousel?.status === "draft" && !carouselHasText && (articleSourceReady || canBuildArticle);
    for (const [channel, kind] of derivativeKinds) {
      const post = posts.find((item) => item.channel === channel);
      if (post && post.status === "draft" && !post.body.trim() && (articleSourceReady || canBuildArticle)) {
        await addTextEstimate(kind, post, { article: articleReference });
      }
    }

    const imageModel = process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
    let imageEstimate: GenerationEstimate["images"] = null;
    const carouselAssets = assets.filter((asset) => asset.post_id === carousel?.id);
    const occupiedNames = new Set(carouselAssets.map((asset) => asset.file_name));
    const slideList = Array.isArray(carousel?.slides) ? carousel!.slides as { visual_type?: string }[] : [];
    const knownPhotoCount = slideList.filter((slide, index) => slide.visual_type === "photo" && !occupiedNames.has(`slide-${String(index + 1).padStart(2, "0")}.webp`)).length;
    const maxPhotos = !articleSourceReady && !canBuildArticle || carousel?.status === "published" ? 0 : Math.max(0, Math.min(carouselCanBeGenerated ? 9 : knownPhotoCount, 10 - carouselAssets.length));
    if (maxPhotos > 0) {
      let visualRules: string;
      let knowledgeContext: string;
      try {
        [visualRules, knowledgeContext] = await Promise.all([
          loadCarouselVisualRules(),
          loadPiersecKnowledgeContext(cycleResult.data.theme, "carousel", 6000).then((result) => result.context),
        ]);
      } catch (cause) {
        if (cause instanceof PiersecManualUnavailableError || cause instanceof PiersecKnowledgeUnavailableError) throw new HttpError(503, cause.message);
        throw cause;
      }
      const prompt = buildImageGenerationPrompt(visualRules, { role: "content", visual_direction: "A".repeat(600) }, knowledgeContext);
      const estimate = estimateGenerationCost({ model, prompt: "", maxOutputTokens: 0, search: false, imageModel, imagePrompt: prompt, maxPhotos });
      imageEstimate = estimate.images;
    }

    const text = unpricedText ? null : {
      min: textRanges.reduce((sum, range) => sum + range.min, 0),
      max: textRanges.reduce((sum, range) => sum + range.max, 0),
    };
    const total = text && (!maxPhotos || imageEstimate?.per_image)
      ? {
        min: text.min + (imageEstimate?.per_image?.min ?? 0) * maxPhotos,
        max: text.max + (imageEstimate?.per_image?.max ?? 0) * maxPhotos,
      }
      : null;
    const result: GenerationEstimate = {
      currency: "USD",
      pricing_date: PRICING_DATE,
      text_model: model,
      image_model: imageEstimate ? imageModel : null,
      text,
      images: imageEstimate,
      total,
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
