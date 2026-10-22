import { describe, expect, it } from "vitest";
import { sameScheduledTime } from "./editorial";

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
