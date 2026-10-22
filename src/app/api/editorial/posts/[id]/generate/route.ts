import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { channelLabels, generatedDraftSchema, generationRequestSchema, isPiersecBriefing } from "@/lib/editorial";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { editorialError } from "@/lib/editorial-server";
import { buildGeneratedDraftWithRepair, buildGenerationRepairRequest, extractResponseText, extractWebSearchUrls, generationInstructions, outputFormat } from "@/lib/editorial-generation";
import { loadCarouselVisualRules, loadEditorialManual, PiersecManualUnavailableError } from "@/lib/piersec-manual";
import { loadPiersecKnowledgeContext, PiersecKnowledgeUnavailableError } from "@/lib/piersec-knowledge";
import { uuidSchema } from "@/lib/schemas";
import { buildImageGenerationPrompt } from "@/lib/editorial-image-generation";
import { addGenerationCost, DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, emptyGenerationCost, estimateGenerationCost, MAX_GENERATION_REPAIRS, MAX_SEARCH_CALLS, textResponseCost } from "@/lib/generation-cost";
import { generationApiError } from "@/lib/generation-cost-server";

export const maxDuration = 180;

type GenerationKind = "briefing" | "article" | "newsletter" | "linkedin_post" | "carousel";

async function prepareGeneration(id: string, input: { revision: number; working_title: string; package_mode?: boolean }) {
    const { supabase, workspace } = await requireApiContext("edit");
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
    let parentArticle: { status: string; revision: number; approved_revision: number | null; body: string } | null = null;

    if (post.channel === "blog") {
      if (input.package_mode && post.status === "draft" && isPiersecBriefing(post.body)) {
        kind = "article";
        approvedBriefing = post.body;
      } else if (post.status === "draft" && !post.body.trim()) {
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
      const approvedSource = article?.status === "approved" && article.approved_revision === article.revision;
      const packageDraftSource = input.package_mode && article?.status === "draft" && Boolean(article.body.trim()) && !isPiersecBriefing(article.body);
      if (!article || (!approvedSource && !packageDraftSource)) {
        throw new HttpError(409, "Aprove o artigo do blog nesta semana antes de gerar newsletter, LinkedIn ou carrossel.");
      }
      parentArticle = article;
      approvedArticleBody = article.body;
      kind = post.channel === "news" ? "newsletter" : post.channel === "lkpost" ? "linkedin_post" : "carousel";
    }

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
      briefing_reference: approvedBriefing,
      article_reference: approvedArticleBody,
    };
    let manual: string;
    try { manual = await loadEditorialManual(kind); }
    catch (cause) {
      if (cause instanceof PiersecManualUnavailableError) throw new HttpError(503, cause.message);
      throw cause;
    }
    const requestBody: Record<string, unknown> = {
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_TEXT_MODEL,
      instructions: generationInstructions(kind, manual, input.package_mode),
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
    return { supabase, workspace, post, kind, knowledgeContext, approvedBriefing, approvedArticleBody, parentArticle, appUrl, context, requestBody };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = uuidSchema.parse((await params).id);
    const query = request.nextUrl.searchParams;
    const input = generationRequestSchema.parse({ revision: Number(query.get("revision")), working_title: query.get("working_title") ?? "", package_mode: query.get("package_mode") === "true" });
    const { supabase, workspace, kind, context, requestBody } = await prepareGeneration(id, input);
    let imagePrompt: string | undefined;
    let maxPhotos = 0;
    if (kind === "carousel") {
      const [rules, knowledge, assets] = await Promise.all([
        loadCarouselVisualRules(),
        loadPiersecKnowledgeContext(context.weekly_theme, "carousel", 6000),
        supabase.from("editorial_assets").select("file_name").eq("post_id", id).eq("workspace_id", workspace.id),
      ]);
      if (assets.error) editorialError(assets.error);
      const occupiedSlots = new Set((assets.data ?? []).flatMap((asset) => /^slide-0[1-9]\.webp$/u.test(asset.file_name) ? [asset.file_name] : []));
      maxPhotos = Math.max(0, Math.min(9 - occupiedSlots.size, 10 - (assets.data?.length ?? 0)));
      imagePrompt = buildImageGenerationPrompt(rules, { role: "content", visual_direction: "A".repeat(600) }, knowledge.context);
    }
    const estimate = estimateGenerationCost({
      model: String(requestBody.model), prompt: JSON.stringify(requestBody), maxOutputTokens: Number(requestBody.max_output_tokens), search: kind === "briefing",
      maxRepairs: MAX_GENERATION_REPAIRS,
      ...(kind === "carousel" ? { imageModel: process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL, imagePrompt, maxPhotos } : {}),
    });
    return NextResponse.json(estimate, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let generationCost = emptyGenerationCost();
  try {
    assertSameOrigin(request);
    const id = uuidSchema.parse((await params).id);
    const input = generationRequestSchema.parse(await readJson(request));
    const { supabase, workspace, post, kind, knowledgeContext, approvedBriefing, approvedArticleBody, parentArticle, appUrl, context, requestBody } = await prepareGeneration(id, input);
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new HttpError(503, "A geração ainda não foi configurada. Adicione OPENAI_API_KEY às variáveis do servidor.");

    async function requestGeneration(body: Record<string, unknown>) {
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(55_000),
      });
    } catch (cause) {
      generationCost = addGenerationCost(generationCost, { usd: 0, requests: 1, unpriced_requests: 1 });
      const timedOut = cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name);
      throw new HttpError(timedOut ? 504 : 502, timedOut ? "A pesquisa ou geração levou mais que o esperado. Tente novamente." : "Não foi possível conectar à OpenAI. Tente novamente.");
    }

    if (!response.ok) {
      if (response.status >= 500) generationCost = addGenerationCost(generationCost, { usd: 0, requests: 1, unpriced_requests: 1 });
      console.error("OpenAI editorial generation failed", { status: response.status, requestId: response.headers.get("x-request-id") });
      if (response.status === 429) throw new HttpError(429, "A OpenAI atingiu um limite de uso. Confira o projeto e tente novamente mais tarde.");
      if (response.status === 401 || response.status === 403 || response.status === 400) throw new HttpError(502, "A OpenAI recusou a solicitação. Confira OPENAI_API_KEY e se OPENAI_MODEL aceita Structured Outputs e, para briefing, web_search.");
      throw new HttpError(502, "A OpenAI não conseguiu gerar o conteúdo. Tente novamente.");
    }

    const payload: unknown = await response.json().catch(() => null);
    generationCost = addGenerationCost(generationCost, textResponseCost(payload, String(body.model)));
    const output = extractResponseText(payload);
    if (output.refused) throw new HttpError(422, "A OpenAI não conseguiu elaborar este conteúdo. Revise o tema da semana e tente novamente.");
    if (output.status !== "completed" || !output.text) throw new HttpError(502, "A OpenAI retornou uma resposta incompleta. Tente novamente.");
    let generated: unknown;
    try { generated = JSON.parse(output.text); }
    catch { throw new HttpError(502, "A resposta da OpenAI veio em um formato inválido. Tente novamente."); }
    return { payload, generated };
    }

    const { payload, generated } = await requestGeneration(requestBody);
    let draft;
    try {
      draft = await buildGeneratedDraftWithRepair(kind, generated, {
        title: context.current_title,
        knowledgeContext,
        webUrls: kind === "briefing" ? extractWebSearchUrls(payload) : [],
        approvedArticleBody: kind === "article" ? approvedBriefing : approvedArticleBody,
        appUrl,
      }, async (invalidDraft, feedback) => {
        const repair = buildGenerationRepairRequest(kind, requestBody, context, invalidDraft, feedback);
        const repaired = (await requestGeneration(repair.body)).generated;
        return repair.field ? { ...(invalidDraft as Record<string, unknown>), [repair.field]: repaired && typeof repaired === "object" ? (repaired as Record<string, unknown>)[repair.field] : undefined } : repaired;
      }, MAX_GENERATION_REPAIRS);
    } catch (cause) {
      if (cause instanceof HttpError) throw cause;
      const message = cause instanceof Error ? cause.message : "A resposta não passou na revisão do formato Piersec.";
      throw new HttpError(422, message);
    }
    const parsedDraft = generatedDraftSchema.safeParse(draft);
    if (!parsedDraft.success) throw new HttpError(502, "A resposta da OpenAI veio fora do formato esperado. Tente gerar novamente.");

    const [latestPostResult, latestParentResult] = await Promise.all([
      supabase.from("editorial_posts").select("status,revision,approved_revision,body").eq("id", id).eq("workspace_id", workspace.id).maybeSingle(),
      parentArticle ? supabase.from("editorial_posts").select("status,revision,approved_revision,body").eq("cycle_id", post.cycle_id).eq("workspace_id", workspace.id).eq("channel", "blog").maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (latestPostResult.error) editorialError(latestPostResult.error);
    if (latestParentResult.error) editorialError(latestParentResult.error);
    const latestPost = latestPostResult.data;
    if (!latestPost || latestPost.status !== post.status || latestPost.revision !== input.revision || latestPost.approved_revision !== post.approved_revision || (kind === "article" && latestPost.body !== approvedBriefing)) {
      throw new HttpError(409, "A peça mudou enquanto o conteúdo era gerado. Atualize e tente novamente.");
    }
    if (parentArticle) {
      const latestParent = latestParentResult.data;
      if (!latestParent || latestParent.status !== parentArticle.status || latestParent.revision !== parentArticle.revision || latestParent.approved_revision !== parentArticle.approved_revision || latestParent.body !== parentArticle.body) {
        throw new HttpError(409, "O artigo de referência mudou enquanto o conteúdo era gerado. Atualize e tente novamente.");
      }
    }

    return NextResponse.json({ ...parsedDraft.data, generation_cost: generationCost }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return generationApiError(error, generationCost); }
}
