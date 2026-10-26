"use client";

import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { OpenAIMark } from "@/components/openai-mark";
import { fetchGenerationJson, fetchJson } from "@/lib/api-client";
import { channelLabels, isPiersecBriefing, type CarouselSlide, type EditorialAsset, type EditorialCycle, type EditorialPost, type GeneratedDraft } from "@/lib/editorial";
import { addGenerationCost, emptyGenerationCost, formatCostRange, formatUsd, PRICING_URL, type GenerationCost, type GenerationEstimate } from "@/lib/generation-cost";
import { GenerationConfirmationDialog } from "./generation-confirmation-dialog";

type Props = {
  cycle: EditorialCycle;
  posts: EditorialPost[];
  assets: EditorialAsset[];
  canEdit: boolean;
  pending: boolean;
  dirty: boolean;
  onPending: (value: boolean) => void;
  onNotice: (value: string) => void;
  onError: (value: string) => void;
  refresh: () => Promise<unknown>;
};

function hasArticle(post: EditorialPost | undefined) { return Boolean(post?.body.trim() && !isPiersecBriefing(post.body)); }
function photoIndexes(slides: CarouselSlide[]) { return slides.flatMap((slide, index) => slide.visual_type === "photo" ? [index] : []); }
function missingPhotoIndexes(post: EditorialPost | undefined, assets: EditorialAsset[]) {
  if (!post) return [];
  const names = new Set(assets.filter((asset) => asset.post_id === post.id).map((asset) => asset.file_name));
  return photoIndexes(post.slides).filter((index) => !names.has(`slide-${String(index + 1).padStart(2, "0")}.webp`));
}

function packageIsComplete(posts: EditorialPost[], assets: EditorialAsset[]) {
  const blog = posts.find((post) => post.channel === "blog");
  if (!hasArticle(blog)) return false;
  if (["news", "lkpost", "carrossel"].some((channel) => !posts.find((post) => post.channel === channel)?.body.trim())) return false;
  return missingPhotoIndexes(posts.find((post) => post.channel === "carrossel"), assets).length === 0;
}

export function PackageGenerationPanel({ cycle, posts, assets, canEdit, pending, dirty, onPending, onNotice, onError, refresh }: Props) {
  const [generationCost, setGenerationCost] = useState<GenerationCost | null>(null);
  const [progress, setProgress] = useState("");
  const [checkingEstimate, setCheckingEstimate] = useState(false);
  const [estimateToConfirm, setEstimateToConfirm] = useState<GenerationEstimate | null>(null);
  const running = useRef(false);
  const checkingEstimateRef = useRef(false);
  const complete = packageIsComplete(posts, assets);
  const revisionsKey = posts.map((post) => `${post.id}:${post.revision}:${post.status}:${post.body.length}`).join("|");
  const assetsKey = assets.map((asset) => `${asset.post_id}:${asset.file_name}`).sort().join("|");
  const estimate = useQuery({
    queryKey: ["package-generation-estimate", cycle.id, revisionsKey, assetsKey],
    queryFn: ({ signal }) => fetchJson<GenerationEstimate>(`/api/editorial/cycles/${cycle.id}/estimate`, { signal }),
    enabled: canEdit && !pending && !dirty && !complete,
    staleTime: 30_000,
    retry: false,
  });
  const recordCost = (cost: GenerationCost) => setGenerationCost((current) => addGenerationCost(current ?? emptyGenerationCost(), cost));

  async function requestGenerationConfirmation() {
    if (checkingEstimateRef.current || running.current || pending || dirty || complete) return;
    checkingEstimateRef.current = true;
    setCheckingEstimate(true);
    onError("");
    onNotice("");
    try {
      preflight();
      const refreshed = await estimate.refetch();
      if (refreshed.isError || !refreshed.data) throw refreshed.error ?? new Error("A estimativa não retornou dados.");
      if (!refreshed.data.total) throw new Error("Não há uma tarifa cadastrada para todos os modelos deste pacote. A geração foi bloqueada para evitar um custo sem previsão.");
      setEstimateToConfirm(refreshed.data);
    } catch (cause) {
      onError(`Não foi possível confirmar o custo, então a geração não foi iniciada. ${cause instanceof Error ? cause.message : "Tente calcular novamente."}`);
    } finally {
      checkingEstimateRef.current = false;
      setCheckingEstimate(false);
    }
  }

  function preflight() {
    const blog = posts.find((post) => post.channel === "blog");
    if (!blog) throw new Error("O rascunho do artigo não foi encontrado nesta semana.");
    const articleReady = hasArticle(blog);
    const briefingReady = blog.body.trim() && isPiersecBriefing(blog.body);
    const canGenerateArticle = blog.status === "draft" && (!blog.body.trim() || briefingReady) || blog.status === "approved" && briefingReady;
    if (!articleReady && !canGenerateArticle) throw new Error("O artigo está em revisão ou agendado. Devolva a peça para edição antes de gerar o restante do pacote.");
    const articleCanBeSource = blog.status === "draft" || blog.status === "approved" && blog.approved_revision === blog.revision;
    for (const channel of ["news", "lkpost", "carrossel"] as const) {
      const post = posts.find((item) => item.channel === channel);
      if (!post) throw new Error(`A peça ${channelLabels[channel]} não foi criada nesta semana.`);
      if (!post.body.trim() && post.status !== "draft") throw new Error(`${channelLabels[channel]} está fora de rascunho. Devolva a peça para edição antes de gerar o pacote.`);
    }
    const carousel = posts.find((post) => post.channel === "carrossel");
    const derivedTextMissing = posts.some((post) => ["news", "lkpost", "carrossel"].includes(post.channel) && !post.body.trim());
    const photosMissing = missingPhotoIndexes(carousel, assets).length > 0;
    if (articleReady && (derivedTextMissing || photosMissing) && !articleCanBeSource) throw new Error("O artigo ainda não está em rascunho ou aprovado nesta versão. Reabra a peça antes de gerar os derivados.");
    if (carousel?.status === "published" && missingPhotoIndexes(carousel, assets).length) throw new Error("O carrossel já foi publicado e ainda tem fotos pendentes.");
  }

  async function generateText(post: EditorialPost, label: string) {
    setProgress(label);
    const generated = await fetchGenerationJson<GeneratedDraft & { generation_cost: GenerationCost }>(`/api/editorial/posts/${post.id}/generate`, {
      method: "POST",
      body: JSON.stringify({ revision: post.revision, working_title: post.title, package_mode: true }),
    }, recordCost);
    const saved = await fetchJson<EditorialPost>(`/api/editorial/posts/${post.id}`, {
      method: "PATCH",
      body: JSON.stringify({ revision: post.revision, title: generated.title, body: generated.body, hashtags: generated.hashtags, slides: generated.slides, planned_for: post.planned_for }),
    });
    return saved;
  }

  async function generatePackage() {
    if (running.current || pending || dirty || complete) return;
    running.current = true;
    setGenerationCost(emptyGenerationCost());
    setProgress("Preparando as etapas do pacote…");
    onError("");
    onNotice("");
    onPending(true);
    let textPieces = 0;
    let generatedPhotos = 0;
    try {
      preflight();
      let blog = posts.find((post) => post.channel === "blog")!;
      if (!hasArticle(blog)) {
        if (!blog.body.trim()) {
          blog = await generateText(blog, "Pesquisando fontes e preparando o briefing do artigo…");
          textPieces += 1;
        }
        if (isPiersecBriefing(blog.body)) {
          blog = await generateText(blog, "Redigindo o artigo completo com título, SEO, fontes e base de conhecimento…");
          textPieces += 1;
        }
      }
      if (!hasArticle(blog)) throw new Error("O artigo ainda não ficou pronto. A etapa concluída foi salva; tente retomar o pacote.");

      const latestPosts = new Map(posts.map((post) => [post.channel, post]));
      latestPosts.set("blog", blog);
      for (const [channel, label] of [["news", "Escrevendo a newsletter e o HTML…"], ["lkpost", "Escrevendo o post de LinkedIn e as hashtags…"], ["carrossel", "Criando lâminas, legenda e hashtags do carrossel…"]] as const) {
        let post = latestPosts.get(channel);
        if (!post) throw new Error(`A peça ${channelLabels[channel]} não foi encontrada.`);
        if (channel === "carrossel" && post.body.trim()) continue;
        if (!post.body.trim()) {
          post = await generateText(post, label);
          latestPosts.set(channel, post);
          textPieces += 1;
        }
      }

      const carousel = latestPosts.get("carrossel");
      if (carousel && carousel.status !== "published") {
        let revision = carousel.revision;
        const carouselAssets = assets.filter((asset) => asset.post_id === carousel!.id);
        const existingNames = new Set(carouselAssets.map((asset) => asset.file_name));
        const photoTasks = photoIndexes(carousel.slides).filter((index) => !existingNames.has(`slide-${String(index + 1).padStart(2, "0")}.webp`));
        for (const [position, index] of photoTasks.entries()) {
          if (carouselAssets.length + generatedPhotos >= 10) throw new Error("O texto foi salvo, mas o limite de dez imagens do carrossel foi atingido. Remova uma imagem e retome o pacote.");
          setProgress(`Gerando foto ${position + 1} de ${photoTasks.length} do carrossel…`);
          const result = await fetchGenerationJson<{ revision: number; file_name: string; generation_cost: GenerationCost }>(`/api/editorial/posts/${carousel.id}/generate-image`, {
            method: "POST",
            body: JSON.stringify({ revision, slide_index: index, package_mode: true }),
          }, recordCost);
          revision = result.revision;
          existingNames.add(result.file_name);
          generatedPhotos += 1;
        }
      }
      await refresh();
      const textSummary = textPieces ? `${textPieces} etapa(s) de texto` : "os textos já salvos";
      const photoSummary = generatedPhotos ? ` e ${generatedPhotos} foto(s)` : "";
      onNotice(`Pacote preparado: ${textSummary}${photoSummary}. Todas as peças continuam como rascunho para revisão e aprovação humana.`);
    } catch (cause) {
      await refresh().catch(() => undefined);
      const message = cause instanceof Error ? cause.message : "Não foi possível concluir a geração do pacote.";
      onError(`${message} O que já foi gerado permanece salvo; clique novamente para continuar de onde parou.`);
    } finally {
      setProgress("");
      running.current = false;
      onPending(false);
    }
  }

  if (!canEdit) return null;
  return <section className="editorial-package-generation" aria-labelledby="package-generation-title">
    <div className="editorial-package-generation__copy">
      <h3 id="package-generation-title">Geração completa da semana</h3>
      <p className="editorial-muted">Um clique prepara o artigo, a newsletter, o post de LinkedIn e o carrossel, com títulos, textos, tags ou hashtags definidos por cada manual e as fotos previstas. Tudo fica salvo como rascunho para revisão.</p>
    </div>
    <Button variant="primary" className="editorial-package-generation__button" isPending={pending || checkingEstimate} isDisabled={pending || checkingEstimate || dirty || complete} onPress={() => void requestGenerationConfirmation()}>
      {pending ? <span>{progress || "Gerando o pacote…"}</span> : checkingEstimate ? "Calculando custo…" : complete ? "Conteúdo completo" : estimate.isError || Boolean(estimate.data && !estimate.data.total) ? "Recalcular custo" : <span className="inline-flex items-center gap-2">Gerar tudo com <OpenAIMark /></span>}
    </Button>
    {dirty && <p className="editorial-muted" role="status">Salve as alterações da peça aberta antes de iniciar a geração do pacote.</p>}
    <div className="editorial-package-generation__cost editorial-ai__cost" aria-live="polite" aria-atomic="true">
      {!complete && estimate.isFetching && !estimate.data && <p className="editorial-muted" role="status">Calculando o custo estimado do pacote…</p>}
      {!complete && estimate.isError && <p className="editorial-muted">A estimativa não carregou. A geração só começa depois que o custo puder ser calculado.</p>}
      {estimate.data && !complete && <p role={estimate.data.total ? undefined : "status"}><strong>Estimativa para o pacote: </strong>{estimate.data.total ? formatCostRange(estimate.data.total) : "indisponível para os modelos configurados; a geração fica bloqueada até haver uma tarifa calculável"}{estimate.data.images?.max_count ? `, incluindo até ${estimate.data.images.max_count} fotos.` : "."}</p>}
      {generationCost && generationCost.requests > 0 && <p role="status"><strong>Custo desta execução: </strong>{generationCost.unpriced_requests === generationCost.requests ? "consumo ou tarifa indisponível para calcular" : `${formatUsd(generationCost.usd)}${generationCost.unpriced_requests ? " (parcial)" : ""}`}{generationCost.unpriced_requests ? ". Há chamadas sem custo confirmado." : "."}</p>}
      {estimate.data && <details className="editorial-muted">
        <summary>Como a estimativa é calculada</summary>
        <p>Inclui as etapas de texto que ainda faltam, uma margem para eventuais correções automáticas e até a quantidade máxima de fotos prevista para o carrossel. O custo final varia conforme o tamanho das respostas e o número de fotos.</p>
        {estimate.data.text && <p>Texto e pesquisa: {formatCostRange(estimate.data.text)} · {estimate.data.text_model}.</p>}
        {estimate.data.images?.per_image && <p>Cada foto em 1088 × 1360, qualidade alta: {formatCostRange(estimate.data.images.per_image)} · {estimate.data.image_model}.</p>}
        <p>Valores em dólar, antes de impostos e câmbio. Após gerar, o custo usa o consumo informado pela OpenAI, incluindo correções e fotos concluídas mesmo se uma etapa posterior falhar.</p>
        <p><a href={PRICING_URL} target="_blank" rel="noreferrer">Preços oficiais da OpenAI</a>, conferidos em {new Date(`${estimate.data.pricing_date}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })}.</p>
      </details>}
    </div>
    {estimateToConfirm?.total && <GenerationConfirmationDialog
      isOpen
      estimate={estimateToConfirm}
      cost={estimateToConfirm.total}
      description={`O pacote de ${cycle.theme} prepara os textos e as imagens que ainda faltam. Confira a previsão antes de iniciar.`}
      onClose={() => setEstimateToConfirm(null)}
      onConfirm={() => { setEstimateToConfirm(null); void generatePackage(); }}
    />}
  </section>;
}
