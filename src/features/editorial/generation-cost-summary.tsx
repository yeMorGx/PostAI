"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import { formatCostRange, formatUsd, PRICING_URL, type GenerationCost, type GenerationEstimate } from "@/lib/generation-cost";

export function GenerationCostSummary({ postId, revision, stage, title, enabled, retryPhotos, cost, costLabel }: {
  postId: string; revision: number; stage: string; title: string; enabled: boolean; retryPhotos: number; cost: GenerationCost | null; costLabel: string;
}) {
  const estimate = useQuery({
    queryKey: ["generation-estimate", postId, revision, stage, title],
    queryFn: ({ signal }) => fetchJson<GenerationEstimate>(`/api/editorial/posts/${postId}/generate?${new URLSearchParams({ revision: String(revision), working_title: title })}`, { signal }),
    enabled, staleTime: 60_000, retry: false,
  });
  const value = estimate.data;
  const imageRate = value?.images?.per_image;
  return <div className="editorial-ai__cost">
    <div aria-live="polite" aria-atomic="true">
      {enabled && estimate.isFetching && !value && <p className="editorial-muted" role="status">Calculando o custo estimado…</p>}
      {enabled && estimate.isError && <p className="editorial-muted">Não foi possível calcular a estimativa agora. A geração fica bloqueada até que o custo possa ser previsto. {estimate.error.message}</p>}
      {value && <p role={value.total ? undefined : "status"}><strong>Estimativa desta geração: </strong>{value.total ? formatCostRange(value.total) : "indisponível para os modelos configurados; a geração fica bloqueada até haver uma tarifa calculável"}{value.images && value.images.max_count > 0 ? `, incluindo texto e até ${value.images.max_count} fotos.` : "."}</p>}
      {value && retryPhotos > 0 && <p className="editorial-muted">Retomar somente {retryPhotos} foto(s): {imageRate ? formatCostRange({ min: imageRate.min * retryPhotos, max: imageRate.max * retryPhotos }) : "estimativa de imagem indisponível"}.</p>}
      {cost && cost.requests > 0 && <p role="status"><strong>{costLabel}: </strong>{cost.unpriced_requests === cost.requests ? "consumo ou tarifa indisponível para calcular" : `${formatUsd(cost.usd)}${cost.unpriced_requests ? " (parcial)" : ""}`}{cost.unpriced_requests > 0 ? ". Há chamadas sem custo confirmado." : "."}</p>}
    </div>
    {value && <details className="editorial-muted">
      <summary>Como o custo é calculado</summary>
      <p>Texto e conferência automática: {value.text ? formatCostRange(value.text) : "tarifa indisponível"}. Modelo: {value.text_model}.</p>
      {value.images && <p>Cada foto em 1088 × 1360, qualidade alta: {imageRate ? formatCostRange(imageRate) : "tarifa indisponível"}. Modelo: {value.image_model}. A quantidade final depende do roteiro; imagens já anexadas são descontadas da previsão.</p>}
      <p>A estimativa usa o tamanho dos manuais e do material aprovado, uma margem para a resposta e até três correções automáticas. Na pesquisa, inclui de uma a quatro buscas e uma previsão de conteúdo consultado. O valor pode variar.</p>
      <p>Valores em dólar, antes de impostos e câmbio. Após gerar, o custo é calculado pelo consumo retornado pela OpenAI, incluindo correções e fotos concluídas mesmo se uma etapa posterior falhar. O valor exibido acompanha esta geração enquanto a peça estiver aberta.</p>
      <p><a href={PRICING_URL} target="_blank" rel="noreferrer">Preços oficiais da OpenAI</a>, conferidos em {new Date(`${value.pricing_date}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })}.</p>
    </details>}
  </div>;
}
