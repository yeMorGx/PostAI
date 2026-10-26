"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import { formatCostRange, formatUsd, type GenerationCost, type GenerationEstimate } from "@/lib/generation-cost";

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
      {enabled && estimate.isError && <p className="editorial-muted">Custo indisponível. Clique em gerar para tentar novamente.</p>}
      {value && <p role={value.total ? undefined : "status"}><strong>Estimativa: </strong>{value.total ? formatCostRange(value.total) : "tarifa indisponível; geração bloqueada"}</p>}
      {value && retryPhotos > 0 && <p className="editorial-muted">Retomar somente {retryPhotos} foto(s): {imageRate ? formatCostRange({ min: imageRate.min * retryPhotos, max: imageRate.max * retryPhotos }) : "estimativa de imagem indisponível"}.</p>}
      {cost && cost.requests > 0 && <p role="status"><strong>{costLabel}: </strong>{cost.unpriced_requests === cost.requests ? "consumo ou tarifa indisponível para calcular" : `${formatUsd(cost.usd)}${cost.unpriced_requests ? " (parcial)" : ""}`}{cost.unpriced_requests > 0 ? ". Há chamadas sem custo confirmado." : "."}</p>}
    </div>
  </div>;
}
