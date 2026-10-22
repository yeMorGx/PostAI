import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  formatPiersecKnowledgeContext,
  selectPiersecKnowledgePages,
  type PiersecKnowledgeKind,
  type PiersecKnowledgePage,
} from "./piersec-knowledge-search";

const baseDirectory = join(process.cwd(), "docs", "piersec", "piersec-base-ciberseguranca", "piersec-base-ciberseguranca");
const contentDirectories = ["conceito", "fontes", "estrategia", "acervo"];
let knowledgePromise: Promise<{ index: string; pages: PiersecKnowledgePage[] }> | undefined;

export class PiersecKnowledgeUnavailableError extends Error {}

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.toLocaleLowerCase("en-US").endsWith(".md") ? [path] : [];
  }));
  return files.flat();
}

function aliasesFromFrontmatter(content: string) {
  const frontmatter = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/u)?.[1];
  const aliasesLine = frontmatter?.match(/^aliases:\s*(.+)$/mu)?.[1];
  if (!aliasesLine) return [];
  return aliasesLine.replace(/^\[|\]$/gu, "").split(",").map((alias) => alias.trim().replace(/^["']|["']$/gu, "")).filter(Boolean);
}

async function loadKnowledgeFiles() {
  const indexPath = join(baseDirectory, "index.md");
  const pageDirectories = contentDirectories.map((directory) => join(baseDirectory, "wiki", directory));
  const [index, files] = await Promise.all([
    readFile(indexPath, "utf8"),
    Promise.all(pageDirectories.map(markdownFiles)).then((groups) => groups.flat()),
  ]);
  const pages = await Promise.all(files.map(async (path) => {
    const content = await readFile(path, "utf8");
    const fileName = path.split(/[\\/]/u).at(-1)?.replace(/\.md$/iu, "") ?? path;
    const title = content.match(/^#\s+(.+)$/mu)?.[1]?.trim() ?? fileName;
    return {
      title,
      path: relative(baseDirectory, path).replaceAll("\\", "/"),
      content,
      aliases: aliasesFromFrontmatter(content),
    } satisfies PiersecKnowledgePage;
  }));
  if (!pages.length) throw new Error("Nenhuma página Markdown foi encontrada na base Piersec.");
  return { index, pages };
}

async function getKnowledgeFiles() {
  knowledgePromise ??= loadKnowledgeFiles().catch((cause: unknown) => {
    knowledgePromise = undefined;
    throw cause;
  });
  return knowledgePromise;
}

export async function loadPiersecKnowledgeContext(theme: string, kind: PiersecKnowledgeKind, maxLength = 24000) {
  try {
    const { index, pages } = await getKnowledgeFiles();
    const selection = selectPiersecKnowledgePages(index, theme, kind, pages);
    return formatPiersecKnowledgeContext(selection, theme, maxLength);
  } catch (cause) {
    if (cause instanceof PiersecKnowledgeUnavailableError) throw cause;
    throw new PiersecKnowledgeUnavailableError("A base Piersec não está disponível no servidor. A geração foi interrompida para não produzir conteúdo sem consultar o manual.");
  }
}
