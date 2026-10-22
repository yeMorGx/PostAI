import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { formatPiersecKnowledgeContext, selectPiersecKnowledgePages, type PiersecKnowledgePage } from "./piersec-knowledge-search";

const pages: PiersecKnowledgePage[] = [
  { title: "Panorama de Ameaças Cibernéticas 2026", path: "wiki/conceito/panorama.md", content: "Hub geral." },
  { title: "Gestão Contínua de Exposição (CTEM)", path: "wiki/conceito/ctem.md", content: "Tese e validade do conceito." },
  { title: "Verizon DBIR", path: "wiki/conceito/dbir.md", content: "Fonte de referência." },
  { title: "CISA KEV", path: "wiki/conceito/cisa.md", content: "Catálogo de vulnerabilidades exploradas." },
  { title: "exploracao-vulnerabilidades-gestao-exposicao", path: "wiki/fontes/exposicao.md", content: "Fichamento com ressalvas." },
  { title: "ciclo-0003-janela-de-exposicao", path: "wiki/fontes/ciclo-0003.md", content: "Ciclo anterior." },
  { title: "post-instagram-exposicao", path: "wiki/acervo/post-instagram.md", content: "Carrossel anterior." },
  { title: "post-linkedin-exposicao", path: "wiki/acervo/post-linkedin.md", content: "Post anterior." },
];

const index = `
## 🎯 Rotas por tarefa
- **Pauta ou peça de conteúdo** → [[Panorama de Ameaças Cibernéticas 2026]], o conceito do tema e a tabela de ciclos abaixo.
- **Gestão de vulnerabilidade e exposição** → [[Gestão Contínua de Exposição (CTEM)]] · [[Verizon DBIR]] · [[CISA KEV]] · [[ciclo-0003-janela-de-exposicao]]
## 💡 Conceitos
| [[Panorama de Ameaças Cibernéticas 2026]] | Hub geral |
| [[Gestão Contínua de Exposição (CTEM)]] | vulnerabilidade e gestão de exposição |
| [[Verizon DBIR]] | referência anual |
## 📚 Fontes
| [[exploracao-vulnerabilidades-gestao-exposicao]] | exploração de vulnerabilidades e gestão contínua |
## 🗂️ Acervo de peças
| tema exposição | [[ciclo-exposicao]] | [[post-linkedin-exposicao|linkedin]] · [[post-instagram-exposicao|instagram]] |
## 🧭 Estratégia
| [[mercado-fidc]] | gestoras e exposição |
`;

describe("consulta automática da base Piersec", () => {
  it("segue a rota do índice e escolhe conceito, fonte e peça do canal pertinente", () => {
    const result = selectPiersecKnowledgePages(index, "gestão de exposição e vulnerabilidades", "carousel", pages);
    expect(result.pages.map((page) => page.title)).toEqual([
      "Panorama de Ameaças Cibernéticas 2026",
      "Gestão Contínua de Exposição (CTEM)",
      "Verizon DBIR",
      "CISA KEV",
      "ciclo-0003-janela-de-exposicao",
      "exploracao-vulnerabilidades-gestao-exposicao",
      "post-instagram-exposicao",
    ]);
    expect(result.pages.some((page) => page.title === "post-linkedin-exposicao")).toBe(false);
    expect(result.route).toContain("Pauta ou peça de conteúdo");
  });

  it("mantém o hub quando o tema não tem página específica e registra as páginas consultadas", () => {
    const result = selectPiersecKnowledgePages(index, "quasar ultravioleta", "briefing", pages);
    const formatted = formatPiersecKnowledgeContext(result, "quasar ultravioleta");
    expect(result.pages.map((page) => page.title)).toEqual(["Panorama de Ameaças Cibernéticas 2026"]);
    expect(formatted.context).toContain("não encontrou páginas específicas");
    expect(formatted.context).toContain('consultou_base: ["Panorama de Ameaças Cibernéticas 2026"]');
  });

  it("mantém cada página dentro do limite sem perder a lista de consulta", () => {
    const result = selectPiersecKnowledgePages(index, "gestão de exposição e vulnerabilidades", "carousel", pages);
    const formatted = formatPiersecKnowledgeContext(result, "gestão de exposição e vulnerabilidades", 1800);
    expect(formatted.context.length).toBeLessThanOrEqual(1800);
    expect(formatted.context).toContain("consultou_base:");
  });

  it("resolve a rota real do índice Piersec e o nome do canal no acervo", async () => {
    const baseDirectory = join(process.cwd(), "docs", "piersec", "piersec-base-ciberseguranca", "piersec-base-ciberseguranca");
    const index = await readFile(join(baseDirectory, "index.md"), "utf8");
    const pageDirectories = ["conceito", "fontes", "estrategia", "acervo"].map((directory) => join(baseDirectory, "wiki", directory));
    const files = (await Promise.all(pageDirectories.map(async (directory) =>
      (await readdir(directory, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.toLocaleLowerCase("en-US").endsWith(".md"))
        .map((entry) => join(directory, entry.name)),
    ))).flat();
    const actualPages = await Promise.all(files.map(async (path) => {
      const content = await readFile(path, "utf8");
      return {
        title: content.match(/^#\s+(.+)$/mu)?.[1]?.trim() ?? "",
        path: relative(baseDirectory, path).replaceAll("\\", "/"),
        content,
      };
    }));

    const result = selectPiersecKnowledgePages(index, "Gestão de vulnerabilidade e exposição", "carousel", actualPages);
    const paths = result.pages.map((page) => page.path);
    expect(result.pages.map((page) => page.title)).toContain("Gestão Contínua de Exposição (CTEM)");
    expect(result.pages.map((page) => page.title)).toContain("Verizon DBIR");
    expect(result.pages.map((page) => page.title)).toContain("CISA KEV");
    expect(paths.some((path) => path.includes("0015-instagram-gestao-continua-de-exposicao"))).toBe(true);
  });
});
