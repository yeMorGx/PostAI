export const PRICING_DATE = "2026-10-26";
export const PRICING_URL = "https://developers.openai.com/api/docs/pricing";
export const DEFAULT_TEXT_MODEL = "gpt-6-luna";
export const DEFAULT_IMAGE_MODEL = "gpt-image-2.5-flare";
export const IMAGE_SIZE = "1088x1360";
export const IMAGE_QUALITY = "high";
export const MAX_SEARCH_CALLS = 4;
export const MAX_GENERATION_REPAIRS = 3;

type TextRate = { input: number; cached: number; output: number };
const textRates: Record<string, TextRate> = {
  "gpt-6-luna": { input: 0.1, cached: 0.01, output: 0.5 },
  "gpt-6.1-sol": { input: 2, cached: 0.1, output: 10 },
  "gpt-6-astra": { input: 10, cached: 1, output: 50 },
};

export type CostRange = { min: number; max: number };
export type GenerationEstimate = {
  currency: "USD";
  pricing_date: string;
  text_model: string;
  image_model: string | null;
  text: CostRange | null;
  images: { max_count: number; per_image: CostRange | null } | null;
  total: CostRange | null;
};
export type GenerationCost = { usd: number; requests: number; unpriced_requests: number };
export const emptyGenerationCost = (): GenerationCost => ({ usd: 0, requests: 0, unpriced_requests: 0 });

export function addGenerationCost(current: GenerationCost, next: GenerationCost): GenerationCost {
  return { usd: current.usd + next.usd, requests: current.requests + next.requests, unpriced_requests: current.unpriced_requests + next.unpriced_requests };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}
function count(value: unknown) { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null; }
function baseModel(model: string) { return model.replace(/-\d{4}-\d{2}-\d{2}$/u, ""); }
const perMillion = (tokens: number, rate: number) => tokens * rate / 1_000_000;

export function textResponseCost(payload: unknown, model: string): GenerationCost {
  const result = record(payload);
  const usage = record(result.usage);
  const details = record(usage.input_tokens_details);
  const rate = textRates[baseModel(model)];
  const input = count(usage.input_tokens);
  const output = count(usage.output_tokens);
  const cached = count(details.cached_tokens) ?? 0;
  const writes = count(details.cache_write_tokens) ?? 0;
  const writeDetails = record(details.cache_write_tokens_details);
  const shortWrites = count(writeDetails.ttl_30m_tokens) ?? 0;
  const longWrites = count(writeDetails.ttl_12h_tokens) ?? 0;
  if (!rate || input === null || output === null || cached + writes > input || shortWrites + longWrites !== writes || (result.service_tier && result.service_tier !== "default")) {
    return { usd: 0, requests: 1, unpriced_requests: 1 };
  }
  const searches = Array.isArray(result.output) ? result.output.filter((item) => record(item).type === "web_search_call" && record(record(item).action).type === "search").length : 0;
  return {
    usd: perMillion(input - cached - writes, rate.input) + perMillion(cached, rate.cached) + perMillion(shortWrites, rate.input * 1.25) + perMillion(longWrites, rate.input * 2.5) + perMillion(output, rate.output) + searches * 0.01,
    requests: 1, unpriced_requests: 0,
  };
}

function imageRates(model: string) {
  const name = baseModel(model);
  if (["gpt-image-2.5-flare", "gpt-image-2.5-sunburst"].includes(name)) return { text: 5, image: 8, output: 30, grid: 48 };
  return null;
}

export function imageResponseCost(payload: unknown, model: string): GenerationCost {
  const usage = record(record(payload).usage);
  const details = record(usage.input_tokens_details);
  const rate = imageRates(model);
  const input = count(usage.input_tokens);
  const text = count(details.text_tokens);
  const image = count(details.image_tokens);
  const output = count(usage.output_tokens);
  if (!rate || input === null || text === null || image === null || output === null || text + image !== input) return { usd: 0, requests: 1, unpriced_requests: 1 };
  return { usd: perMillion(text, rate.text) + perMillion(image, rate.image) + perMillion(output, rate.output), requests: 1, unpriced_requests: 0 };
}

// Formula used by the official image calculator: /api/docs/guides/image-generation#cost-and-latency.
export function imageOutputTokens(model: string, width = 1088, height = 1360) {
  const rate = imageRates(model);
  if (!rate) return null;
  const shorter = rate.grid / (Math.max(width, height) / Math.min(width, height));
  const floor = Math.floor(shorter);
  const rounded = shorter - floor === 0.5 ? floor + floor % 2 : Math.round(shorter);
  return Math.ceil(rate.grid * rounded * (2_000_000 + width * height) / 4_000_000);
}

// UTF-8 bytes / 3 is a planning heuristic, not a tokenizer or a spending limit.
function estimatedTokens(value: string) { return Math.ceil(new TextEncoder().encode(value).length / 3); }

export function estimateGenerationCost(input: { model: string; prompt: string; maxOutputTokens: number; search: boolean; imageModel?: string; imagePrompt?: string; maxPhotos?: number; maxRepairs?: number }): GenerationEstimate {
  const rate = textRates[baseModel(input.model)];
  const promptTokens = estimatedTokens(input.prompt);
  const searchBudget = input.search ? MAX_SEARCH_CALLS : 0;
  const repairCount = input.maxRepairs ?? 1;
  const text = rate ? {
    min: perMillion(promptTokens * 0.8, rate.input) + perMillion(input.maxOutputTokens * 0.35, rate.output) + (input.search ? 0.01 : 0),
    max: perMillion((promptTokens * 1.3 + searchBudget * 8000) * (repairCount + 1) + input.maxOutputTokens + 1000, rate.input * 1.25) + perMillion(input.maxOutputTokens * (repairCount + 1), rate.output) + searchBudget * 0.01,
  } : null;
  const imageRate = input.imageModel ? imageRates(input.imageModel) : null;
  const outputTokens = input.imageModel ? imageOutputTokens(input.imageModel) : null;
  const imageInput = estimatedTokens(input.imagePrompt ?? "");
  const perImage = imageRate && outputTokens !== null ? {
    min: perMillion(outputTokens, imageRate.output) + perMillion(imageInput * 0.8, imageRate.text),
    max: perMillion(outputTokens, imageRate.output) + perMillion(imageInput * 1.3, imageRate.text),
  } : null;
  const maxPhotos = input.maxPhotos ?? 0;
  return {
    currency: "USD", pricing_date: PRICING_DATE, text_model: input.model, image_model: input.imageModel ?? null,
    text, images: input.imageModel ? { max_count: maxPhotos, per_image: perImage } : null,
    total: text && (!maxPhotos || perImage) ? {
      min: text.min + (perImage?.min ?? 0) * maxPhotos,
      max: text.max + (perImage?.max ?? 0) * maxPhotos,
    } : null,
  };
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(value);
}

export function formatCostRange(range: CostRange) { return `${formatUsd(range.min)} a ${formatUsd(range.max)}`; }
