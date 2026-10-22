import { describe, expect, it, vi } from "vitest";
import { ApiRequestError, fetchGenerationJson } from "./api-client";
import { addGenerationCost, DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, emptyGenerationCost, estimateGenerationCost, imageOutputTokens, imageResponseCost, textResponseCost } from "./generation-cost";

describe("custos de geração OpenAI", () => {
  it("preserva o gasto retornado quando a API rejeita a peça depois de gerar", async () => {
    const cost = { usd: 0.003, requests: 2, unpriced_requests: 0 };
    const mock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "A correção automática não concluiu a peça.", generation_cost: cost }), { status: 422 }));
    const onCost = vi.fn();
    try {
      const result = fetchGenerationJson("/api/editorial/posts/test/generate", { method: "POST" }, onCost);
      await expect(result).rejects.toMatchObject({ generationCost: cost });
      await expect(result).rejects.toBeInstanceOf(ApiRequestError);
      expect(onCost).toHaveBeenCalledExactlyOnceWith(cost);
    } finally { mock.mockRestore(); }
  });

  it("marca o consumo como desconhecido se a conexão cair antes da resposta", async () => {
    const mock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const onCost = vi.fn();
    try {
      await expect(fetchGenerationJson("/api/editorial/posts/test/generate-image", { method: "POST" }, onCost)).rejects.toThrow("Failed to fetch");
      expect(onCost).toHaveBeenCalledExactlyOnceWith({ usd: 0, requests: 1, unpriced_requests: 1 });
    } finally { mock.mockRestore(); }
  });

  it("cobra tokens de entrada, cache, saída e apenas as ações de pesquisa", () => {
    const cost = textResponseCost({
      usage: { input_tokens: 1_000_000, output_tokens: 1_000_000, input_tokens_details: { cached_tokens: 200_000 } },
      output: [{ type: "web_search_call", action: { type: "search" } }, { type: "web_search_call", action: { type: "open_page" } }, { type: "web_search_call", action: { type: "search" } }],
    }, "gpt-6-luna-2026-09-08");
    expect(cost.usd).toBeCloseTo(0.602, 8);
    expect(cost.unpriced_requests).toBe(0);
  });

  it("considera escritas de cache quando a API informa o prazo", () => {
    const payload = { usage: { input_tokens: 1_000_000, output_tokens: 1_000_000, input_tokens_details: { cached_tokens: 100_000, cache_write_tokens: 300_000, cache_write_tokens_details: { ttl_30m_tokens: 200_000, ttl_12h_tokens: 100_000 } } } };
    expect(textResponseCost(payload, DEFAULT_TEXT_MODEL).usd).toBeCloseTo(0.611, 8);
    delete (payload.usage.input_tokens_details as { cache_write_tokens_details?: unknown }).cache_write_tokens_details;
    expect(textResponseCost(payload, DEFAULT_TEXT_MODEL).unpriced_requests).toBe(1);
  });

  it("sinaliza custo desconhecido para consumo ausente, modelo ou tarifa não cadastrados", () => {
    const usage = { input_tokens: 1000, output_tokens: 500 };
    expect(textResponseCost({}, DEFAULT_TEXT_MODEL).unpriced_requests).toBe(1);
    expect(textResponseCost({ usage }, "modelo-personalizado").unpriced_requests).toBe(1);
    expect(textResponseCost({ usage, service_tier: "priority" }, DEFAULT_TEXT_MODEL).unpriced_requests).toBe(1);
    expect(imageResponseCost({}, DEFAULT_IMAGE_MODEL).unpriced_requests).toBe(1);
  });

  it("reproduz a calculadora oficial para a foto 4:5 de qualidade alta", () => {
    expect(imageOutputTokens(DEFAULT_IMAGE_MODEL)).toBe(1587);
    expect(imageOutputTokens(DEFAULT_IMAGE_MODEL, 1360, 1088)).toBe(1587);
    const cost = imageResponseCost({ usage: { input_tokens: 1000, input_tokens_details: { text_tokens: 800, image_tokens: 200 }, output_tokens: 1587 } }, DEFAULT_IMAGE_MODEL);
    expect(cost.usd).toBeCloseTo(0.05321, 8);
    expect(cost.unpriced_requests).toBe(0);
  });

  it("soma texto, correção e fotos preservando o aviso de consumo parcial", () => {
    const cost = [{ usd: 0.002, requests: 2, unpriced_requests: 0 }, { usd: 0.05321, requests: 1, unpriced_requests: 0 }, { usd: 0, requests: 1, unpriced_requests: 1 }].reduce(addGenerationCost, emptyGenerationCost());
    expect(cost.usd).toBeCloseTo(0.05521, 8);
    expect(cost).toMatchObject({ requests: 4, unpriced_requests: 1 });
  });

  it("prevê até nove fotos e desconta as fotos que não serão geradas", () => {
    const request = { model: DEFAULT_TEXT_MODEL, prompt: "manual ".repeat(1000), maxOutputTokens: 6000, search: false, imageModel: DEFAULT_IMAGE_MODEL, imagePrompt: "scene ".repeat(1000) };
    const full = estimateGenerationCost({ ...request, maxPhotos: 9 });
    const remaining = estimateGenerationCost({ ...request, maxPhotos: 2 });
    const textOnly = estimateGenerationCost({ ...request, maxPhotos: 0 });
    expect(full.total!.max - remaining.total!.max).toBeCloseTo(full.images!.per_image!.max * 7, 8);
    expect(textOnly.total).toEqual(textOnly.text);
    expect(full.total!.min).toBeLessThan(full.total!.max);
    expect(estimateGenerationCost({ ...request, imageModel: "imagem-desconhecida", maxPhotos: 1 }).total).toBeNull();
    expect(estimateGenerationCost({ ...request, model: "texto-desconhecido" }).total).toBeNull();
  });

  it("inclui a pesquisa e cresce com o material enviado", () => {
    const request = { model: DEFAULT_TEXT_MODEL, prompt: "manual", maxOutputTokens: 6000, search: false };
    const plain = estimateGenerationCost(request);
    const research = estimateGenerationCost({ ...request, search: true });
    const long = estimateGenerationCost({ ...request, prompt: "manual ".repeat(5000) });
    expect(research.total!.min - plain.total!.min).toBeCloseTo(0.01, 8);
    expect(research.total!.max).toBeGreaterThan(plain.total!.max + 0.04);
    expect(long.total!.max).toBeGreaterThan(plain.total!.max);
  });
});
