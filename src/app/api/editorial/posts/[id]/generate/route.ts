import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { channelLabels, generatedDraftSchema, generationRequestSchema, isPiersecBriefing } from "@/lib/editorial";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { editorialError } from "@/lib/editorial-server";
import { buildGeneratedDraft, extractResponseText, extractWebSearchUrls, generationInstructions, outputFormat } from "@/lib/editorial-generation";
import { loadEditorialManual, PiersecManualUnavailableError } from "@/lib/piersec-manual";
import { loadPiersecKnowledgeContext, PiersecKnowledgeUnavailableError } from "@/lib/piersec-knowledge";
import { uuidSchema } from "@/lib/schemas";

export const maxDuration = 60;

type GenerationKind = "briefing" | "article" | "newsletter" | "linkedin_post" | "carousel";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace } = await requireApiContext("edit");
    const id = uuidSchema.parse((await params).id);
    const input = generationRequestSchema.parse(await readJson(request));
    const { data: post, error: postError } = await supabase.from("editorial_posts")
      .select("id,cycle_id,channel,title,body,status,revision,approved_revision")
      .eq("id", id).eq("workspace_id", workspace.id).maybeSingle();
    if (postError) editorialError(postError);
    if (!post) throw new HttpError(404, "Peça não encontrada.");
    if (post.revision !== input.revision) throw new HttpError(409, "A peça mudou. Atualize a tela antes de iniciar a geração.");

    const [cycleResult, brandResult] = await Promise.all([
      supabase.from("editorial_cycles").select("theme").eq("id", post.cycle_id).eq("workspace_id", workspace.id).maybeSingle(),
      supabase.from("brand_profiles").select("tone,guidance,forbidden_terms").eq("workspace_id", workspace.id).maybeSingle(),
    ]);
    if (cycleResult.error) editorialError(cycleResult.error);
    if (brandResult.error) editorialError(brandResult.error);
    if (!cycleResult.data) throw new HttpError(404, "Semana editorial não encontrada.");

    if (post.channel === "lkart") throw new HttpError(422, "O manual Piersec não define um agente para Artigo LinkedIn. Este canal permanece manual até receber uma especificação própria.");

    let kind: GenerationKind;
    let knowledgeContext = "";
    let approvedBriefing = "";
    let approvedArticleBody = "";
    let parentArticle: { revision: number; approved_revision: number | null; body: string } | null = null;

    if (post.channel === "blog") {
      if (post.status === "draft" && (!post.body.trim() || isPiersecBriefing(post.body))) {
        kind = "briefing";
      } else if (post.status === "approved" && post.approved_revision === post.revision && isPiersecBriefing(post.body)) {
        kind = "article";
        approvedBriefing = post.body;
      } else {
        throw new HttpError(409, "O artigo começa pelo briefing. Aprove o briefing antes de redigir o artigo; uma peça já aprovada não pode ser regenerada nesta etapa.");
      }
    } else {
      if (post.status !== "draft") throw new HttpError(409, "Gere peças derivadas apenas enquanto o rascunho estiver em edição.");
      const { data: article, error: articleError } = await supabase.from("editorial_posts")
        .select("body,status,revision,approved_revision")
        .eq("cycle_id", post.cycle_id).eq("workspace_id", workspace.id).eq("channel", "blog").maybeSingle();
      if (articleError) editorialError(articleError);
      if (!article || article.status !== "approved" || article.approved_revision !== article.revision || isPiersecBriefing(article.body)) {
        throw new HttpError(409, "Aprove o artigo do blog nesta semana antes de gerar newsletter, LinkedIn ou carrossel.");
      }
      parentArticle = article;
      approvedArticleBody = article.body;
      kind = post.channel === "news" ? "newsletter" : post.channel === "lkpost" ? "linkedin_post" : "carousel";
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new HttpError(503, "A geração ainda não foi configurada. Adicione OPENAI_API_KEY às variáveis do servidor.");
    try {
      knowledgeContext = (await loadPiersecKnowledgeContext(cycleResult.data.theme, kind)).context;
    } catch (cause) {
      if (cause instanceof PiersecKnowledgeUnavailableError) throw new HttpError(503, cause.message);
      throw cause;
    }
    let appUrl = process.env.APP_URL?.trim() ?? "";
    if (kind === "newsletter") {
      try {
        const configuredUrl = new URL(appUrl);
        if (configuredUrl.protocol !== "https:" || configuredUrl.username || configuredUrl.password) throw new Error("APP_URL inválida");
        appUrl = configuredUrl.origin;
      } catch { throw new HttpError(503, "Configure APP_URL com o endereço HTTPS da aplicação para montar o HTML da newsletter com a marca."); }
    }

    const context = {
      channel: post.channel === "blog" ? "Artigo no blog" : channelLabels[post.channel],
      weekly_theme: cycleResult.data.theme,
      current_title: input.working_title || post.title || cycleResult.data.theme,
      current_date: new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "long" }).format(new Date()),
      brand: brandResult.data ?? null,
      knowledge_base_context: knowledgeContext,
      approved_briefing: approvedBriefing,
      approved_article: approvedArticleBody,
    };
    let manual: string;
    try { manual = await loadEditorialManual(kind); }
    catch (cause) {
      if (cause instanceof PiersecManualUnavailableError) throw new HttpError(503, cause.message);
      throw cause;
    }
    const requestBody: Record<string, unknown> = {
      model: process.env.OPENAI_MODEL?.trim() || "gpt-6-luna",
      instructions: generationInstructions(kind, manual),
      input: JSON.stringify(context),
      max_output_tokens: kind === "article" || kind === "newsletter" ? 8000 : 6000,
      store: false,
      text: { format: outputFormat(kind) },
    };
    if (kind === "briefing") {
      requestBody.tools = [{ type: "web_search" }];
      requestBody.tool_choice = "required";
      requestBody.include = ["web_search_call.action.sources"];
    }

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(55_000),
      });
    } catch (cause) {
      const timedOut = cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name);
      throw new HttpError(timedOut ? 504 : 502, timedOut ? "A pesquisa ou geração levou mais que o esperado. Tente novamente." : "Não foi possível conectar à OpenAI. Tente novamente.");
    }

    if (!response.ok) {
      console.error("OpenAI editorial generation failed", { status: response.status, requestId: response.headers.get("x-request-id") });
      if (response.status === 429) throw new HttpError(429, "A OpenAI atingiu um limite de uso. Confira o projeto e tente novamente mais tarde.");
      if (response.status === 401 || response.status === 403 || response.status === 400) throw new HttpError(502, "A OpenAI recusou a solicitação. Confira OPENAI_API_KEY e se OPENAI_MODEL aceita Structured Outputs e, para briefing, web_search.");
      throw new HttpError(502, "A OpenAI não conseguiu gerar o conteúdo. Tente novamente.");
    }

    const payload: unknown = await response.json().catch(() => null);
    const output = extractResponseText(payload);
    if (output.refused) throw new HttpError(422, "A OpenAI não conseguiu elaborar este conteúdo. Ajuste a orientação e tente novamente.");
    if (output.status !== "completed" || !output.text) throw new HttpError(502, "A OpenAI retornou uma resposta incompleta. Tente novamente.");
    let generated: unknown;
    try { generated = JSON.parse(output.text); }
    catch { throw new HttpError(502, "A resposta da OpenAI veio em um formato inválido. Tente novamente."); }

    let draft;
    try {
      draft = buildGeneratedDraft(kind, generated, {
        title: context.current_title,
        knowledgeContext,
        webUrls: kind === "briefing" ? extractWebSearchUrls(payload) : [],
        approvedArticleBody: kind === "article" ? approvedBriefing : approvedArticleBody,
        appUrl,
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "A resposta não passou na revisão do formato Piersec.";
      throw new HttpError(422, message);
    }
    const parsedDraft = generatedDraftSchema.safeParse(draft);
    if (!parsedDraft.success) throw new HttpError(502, "A resposta da OpenAI veio fora do formato esperado. Tente gerar novamente.");

    const [latestPostResult, latestParentResult] = await Promise.all([
      supabase.from("editorial_posts").select("status,revision,approved_revision,body").eq("id", id).eq("workspace_id", workspace.id).maybeSingle(),
      parentArticle ? supabase.from("editorial_posts").select("status,revision,approved_revision").eq("cycle_id", post.cycle_id).eq("workspace_id", workspace.id).eq("channel", "blog").maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (latestPostResult.error) editorialError(latestPostResult.error);
    if (latestParentResult.error) editorialError(latestParentResult.error);
    const latestPost = latestPostResult.data;
    if (!latestPost || latestPost.status !== post.status || latestPost.revision !== input.revision || latestPost.approved_revision !== post.approved_revision || (kind === "article" && latestPost.body !== approvedBriefing)) {
      throw new HttpError(409, "A peça mudou enquanto o conteúdo era gerado. Atualize e tente novamente.");
    }
    if (parentArticle) {
      const latestParent = latestParentResult.data;
      if (!latestParent || latestParent.status !== "approved" || latestParent.revision !== parentArticle.revision || latestParent.approved_revision !== parentArticle.approved_revision) {
        throw new HttpError(409, "O artigo aprovado mudou enquanto o conteúdo era gerado. Atualize e tente novamente.");
      }
    }

    return NextResponse.json(parsedDraft.data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
