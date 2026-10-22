import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type EditorialManualKind = "briefing" | "article" | "newsletter" | "linkedin_post" | "carousel";

const commonManual = "00-voz-da-marca.md";
const agentManual: Record<EditorialManualKind, string> = {
  briefing: "01-agente-pesquisa-e-artigo.md",
  article: "01-agente-pesquisa-e-artigo.md",
  newsletter: "02-agente-newsletter.md",
  linkedin_post: "03-agente-linkedin.md",
  carousel: "04-agente-carrossel.md",
};

export class PiersecManualUnavailableError extends Error {}

async function readBaselineManual(fileName: string) {
  return readFile(join(process.cwd(), "docs", "piersec", "baseline_piersec", fileName), "utf8");
}

export async function loadEditorialManual(kind: EditorialManualKind) {
  try {
    const [voice, agent] = await Promise.all([
      readBaselineManual(commonManual),
      readBaselineManual(agentManual[kind]),
    ]);
    return `${voice.trim()}\n\n---\n\n${agent.trim()}`;
  } catch {
    throw new PiersecManualUnavailableError("Os documentos canônicos de geração não estão disponíveis no servidor.");
  }
}

export async function loadCarouselVisualRules() {
  const manual = await loadEditorialManual("carousel");
  const start = manual.indexOf("## Padrão visual");
  const end = manual.indexOf("\n## Limites", start);
  if (start < 0 || end < 0) throw new PiersecManualUnavailableError("As regras visuais do carrossel não foram encontradas no manual Piersec.");
  return manual.slice(start, end).trim();
}
