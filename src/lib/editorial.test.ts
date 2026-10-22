import { describe, expect, it } from "vitest";
import { generationRequestSchema, sameScheduledTime } from "./editorial";

describe("generationRequestSchema", () => {
  it("inicia a geração sem campos manuais além da revisão e do título de trabalho", () => {
    expect(generationRequestSchema.parse({ revision: 1 })).toEqual({ revision: 1, working_title: "" });
    expect(() => generationRequestSchema.parse({ revision: 1, direction: "texto opcional" })).toThrow();
    expect(() => generationRequestSchema.parse({ revision: 1, newsletter_conversation: "conversa consultiva" })).toThrow();
  });
});

describe("sameScheduledTime", () => {
  it("trata formatos UTC diferentes como o mesmo horário local", () => {
    expect(sameScheduledTime("2026-10-30T10:00", "2026-10-30T13:00:00+00:00")).toBe(true);
    expect(sameScheduledTime("2026-10-30T10:00", "2026-10-30T13:00:00.000Z")).toBe(true);
  });

  it("detecta mudanças de horário e diferenças entre vazio e preenchido", () => {
    expect(sameScheduledTime("2026-10-30T10:00", "2026-10-30T13:01:00+00:00")).toBe(false);
    expect(sameScheduledTime("", null)).toBe(true);
    expect(sameScheduledTime("2026-10-30T10:00", null)).toBe(false);
  });
});
