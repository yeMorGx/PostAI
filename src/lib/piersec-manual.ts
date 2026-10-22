import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type EditorialManualKind = "briefing" | "article" | "newsletter" | "linkedin_post" | "carousel";

const commonManual = "00-voz-da-marca.md";
const flowManual = "05-etapas-do-fluxo.md";
const knowledgeInstructionsPath = join(
  process.cwd(),
  "docs",
  "piersec",
  "piersec-guia-base-de-conhecimento",
  "piersec-guia-base-de-conhecimento",
  "modelos",
  "instrucoes-para-agentes.md",
);
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

function extractCommonKnowledgeInstructions(document: string) {
  const start = document.indexOf("**Antes de produzir:**");
  const end = document.indexOf("**Ao terminar:**", start);
  if (start < 0 || end < 0) throw new PiersecManualUnavailableError("As instruções comuns da base Piersec não foram encontradas.");
  return document.slice(start, end)
    .replace(
      /1\. Leia `<CAMINHO-DA-BASE>\/index\.md`\. Veja a seção 📥 Recém-depositado e a 🎯 Rota por tarefa que bate com o seu trabalho\./u,
      "1. O PostAI já leu `index.md`, selecionou a rota de conteúdo e anexou abaixo as páginas indicadas pelo tema.",
    )
    .replace(
      /2\. Leia só as páginas indicadas na rota \(nunca a base inteira\)\./u,
      "2. Leia somente as páginas listadas em `consultou_base` no contexto da base. A base inteira não foi enviada ao modelo.",
    )
    .trim();
}

export async function loadEditorialManual(kind: EditorialManualKind) {
  try {
    const [voice, agent, flow, knowledgeInstructions] = await Promise.all([
      readBaselineManual(commonManual),
      readBaselineManual(agentManual[kind]),
      readBaselineManual(flowManual),
      readFile(knowledgeInstructionsPath, "utf8"),
    ]);
    const commonKnowledge = extractCommonKnowledgeInstructions(knowledgeInstructions);
    return [voice, agent, flow, `## Regras comuns da base de conhecimento\n\n${commonKnowledge}`].map((section) => section.trim()).join("\n\n---\n\n");
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
