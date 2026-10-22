export type PiersecKnowledgeKind = "briefing" | "article" | "newsletter" | "linkedin_post" | "carousel";

export type PiersecKnowledgePage = {
  title: string;
  path: string;
  content: string;
  aliases?: string[];
};

type IndexSection = "concepts" | "sources" | "archive";
type IndexLink = { target: string; label: string };
type IndexRow = { section: IndexSection; text: string; links: IndexLink[]; score: number };
type TaskRoute = { label: string; text: string; links: IndexLink[]; score: number };

const ignoredTerms = new Set([
  "a", "ao", "aos", "as", "com", "como", "da", "das", "de", "do", "dos", "e", "em", "entre", "na", "nas", "no", "nos", "o", "os", "ou", "para", "pela", "pelas", "pelo", "pelos", "por", "que", "sem", "sobre", "uma", "umas", "um", "uns",
]);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLocaleLowerCase("pt-BR");
}

function words(value: string) {
  return normalize(value).split(/[^a-z0-9]+/u).filter((word) => word.length > 2 && !ignoredTerms.has(word) && !/^20\d{2}$/u.test(word));
}

function tokenMatches(left: string, right: string) {
  if (left === right) return true;
  if (left.length < 5 || right.length < 5) return false;
  const singularLeft = left.endsWith("s") ? left.slice(0, -1) : left;
  const singularRight = right.endsWith("s") ? right.slice(0, -1) : right;
  return singularLeft === singularRight || left.startsWith(right) || right.startsWith(left);
}

function scoreText(query: string[], text: string) {
  const candidates = words(text);
  let score = 0;
  for (const term of query) {
    if (candidates.some((candidate) => tokenMatches(term, candidate))) score += 1;
  }
  return score;
}

function parseLinks(line: string): IndexLink[] {
  return [...line.matchAll(/\[\[([^\]]+)\]\]/gu)].map((match) => {
    const [target, label = ""] = match[1].split("|", 2).map((part) => part.replaceAll("\\|", "|").trim());
    return { target: target.split("#", 1)[0].replaceAll("\\", "").trim(), label };
  }).filter((link) => link.target.length > 0);
}

function parseIndexRows(index: string, query: string[]): IndexRow[] {
  const rows: IndexRow[] = [];
  let section: IndexSection | null = null;

  for (const line of index.split(/\r?\n/u)) {
    if (line.startsWith("## ")) {
      const heading = normalize(line);
      section = heading.includes("conceitos") ? "concepts" : heading.includes("fontes") ? "sources" : heading.includes("acervo de pecas") ? "archive" : null;
      continue;
    }
    if (!section) continue;
    const links = parseLinks(line);
    if (!links.length) continue;
    const score = scoreText(query, line);
    if (score) rows.push({ section, text: line.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/gu, "$1 $2"), links, score });
  }

  return rows;
}

function parseTaskRoutes(index: string, query: string[]) {
  const routes: TaskRoute[] = [];
  let inRoutes = false;

  for (const line of index.split(/\r?\n/u)) {
    if (line.startsWith("## ")) {
      if (inRoutes) break;
      inRoutes = normalize(line).includes("rotas por tarefa");
      continue;
    }
    if (!inRoutes) continue;
    const links = parseLinks(line);
    if (!links.length) continue;
    const label = line.split("→", 1)[0].replace(/^-\s*/u, "").replaceAll("**", "").trim();
    const text = `${label} ${links.map((link) => `${link.target} ${link.label}`).join(" ")}`;
    routes.push({ label, text, links, score: scoreText(query, text) });
  }

  return routes;
}

function pageAliases(page: PiersecKnowledgePage) {
  const fileName = page.path.split(/[\\/]/u).at(-1)?.replace(/\.md$/iu, "") ?? "";
  const heading = page.content.match(/^#\s+(.+)$/mu)?.[1]?.trim() ?? "";
  return [page.title, fileName, heading, ...(page.aliases ?? [])].filter(Boolean).map(normalize);
}

function selectArchiveLink(links: IndexLink[], kind: PiersecKnowledgeKind) {
  const wanted = kind === "newsletter" ? "newsletter" : kind === "linkedin_post" ? "linkedin" : kind === "carousel" ? "instagram" : "artigo";
  return links.find((link) => normalize(link.label) === wanted)
    ?? links.find((link) => normalize(link.target).includes(wanted));
}

export function selectPiersecKnowledgePages(index: string, theme: string, kind: PiersecKnowledgeKind, pages: PiersecKnowledgePage[]) {
  const byAlias = new Map<string, PiersecKnowledgePage>();
  for (const page of pages) for (const alias of pageAliases(page)) byAlias.set(alias, page);

  const findPage = (target: string) => byAlias.get(normalize(target));
  const hub = findPage("Panorama de Ameaças Cibernéticas 2026");
  if (!hub) throw new Error("O índice Piersec não aponta para o conceito central da base.");

  const route = index.split(/\r?\n/u).find((line) => normalize(line).includes("pauta ou peca de conteudo"))?.trim()
    ?? "Pauta ou peça de conteúdo: consulte o conceito do tema e os ciclos relacionados.";
  const query = words(theme);
  const routes = parseTaskRoutes(index, query);
  const topicRoute = routes
    .filter((candidate) => !normalize(candidate.label).includes("pauta ou peca de conteudo") && candidate.score > 0)
    .sort((a, b) => b.score - a.score)[0];
  const rows = parseIndexRows(index, query).sort((a, b) => b.score - a.score);
  const selected: PiersecKnowledgePage[] = [hub];
  const add = (page: PiersecKnowledgePage | undefined) => {
    if (page && !selected.some((item) => item.path === page.path)) selected.push(page);
  };

  for (const link of topicRoute?.links.slice(0, 4) ?? []) add(findPage(link.target));
  for (const row of rows.filter((item) => item.section === "concepts").slice(0, 2)) add(findPage(row.links[0].target));
  for (const row of rows.filter((item) => item.section === "sources").slice(0, 2)) add(findPage(row.links[0].target));
  for (const row of rows.filter((item) => item.section === "archive").slice(0, 1)) {
    const link = selectArchiveLink(row.links, kind);
    if (link) add(findPage(link.target));
  }

  const selectedRoute = topicRoute ? `${route}\nRota temática selecionada: ${topicRoute.label}` : route;
  return { route: selectedRoute, pages: selected, hasTopicMatches: rows.length > 0 || Boolean(topicRoute) };
}

export function formatPiersecKnowledgeContext(selection: ReturnType<typeof selectPiersecKnowledgePages>, theme: string, maxLength = 24000) {
  const pageNames = selection.pages.map((page) => page.title);
  const header = [
    "Base consultada automaticamente pelo PostAI, seguindo o índice e a rota por tarefa da Piersec.",
    `Rota: ${selection.route}`,
    `Tema do ciclo: ${theme}`,
    `consultou_base: ${JSON.stringify(pageNames)}`,
    selection.hasTopicMatches
      ? "Use as páginas abaixo como referência; respeite validade, veredito e ressalvas. Não reaproveite números vencidos sem reconferir a fonte primária."
      : "O índice não encontrou páginas específicas para este tema. A base central foi consultada; registre que não havia conteúdo temático pertinente e pesquise fontes primárias novas.",
  ];
  const pageSections = selection.pages.map((page) => `## ${page.title}\nArquivo: ${page.path}\n\n${page.content.trim()}`);
  const sections = [...header, ...pageSections];
  const context = sections.join("\n\n");
  if (context.length <= maxLength) return { context, pageNames };

  const fixedHeader = header.join("\n\n");
  const availableForPages = Math.max(0, maxLength - fixedHeader.length - 2 - pageSections.length * 2);
  const pageLimit = Math.floor(availableForPages / pageSections.length);
  const clippedPages = pageSections.map((section) => {
    if (section.length <= pageLimit) return section;
    const marker = "\n\n[Trecho limitado para manter o contexto enxuto.]";
    return `${section.slice(0, Math.max(0, pageLimit - marker.length)).trimEnd()}${marker}`;
  });

  return { context: [...header, ...clippedPages].join("\n\n").slice(0, maxLength), pageNames };
}
