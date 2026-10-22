import type { GenerationCost } from "./generation-cost";

export class ApiRequestError extends Error {
  constructor(message: string, public generationCost?: GenerationCost) { super(message); }
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...options, headers, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new ApiRequestError(data.error ?? "Não foi possível concluir a ação.", data.generation_cost);
  return data as T;
}

export async function fetchGenerationJson<T extends { generation_cost?: GenerationCost }>(url: string, options: RequestInit, onCost: (cost: GenerationCost) => void): Promise<T> {
  let result: T;
  const unknownCost = { usd: 0, requests: 1, unpriced_requests: 1 };
  try { result = await fetchJson<T>(url, options); }
  catch (cause) {
    onCost(cause instanceof ApiRequestError && cause.generationCost ? cause.generationCost : unknownCost);
    throw cause;
  }
  onCost(result.generation_cost ?? unknownCost);
  return result;
}
