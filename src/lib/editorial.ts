import { z } from "zod";

export const channels = ["blog", "lkart", "lkpost", "news", "carrossel"] as const;
export type Channel = typeof channels[number];
export const channelLabels: Record<Channel, string> = { blog: "Artigo no blog", lkart: "Artigo LinkedIn", lkpost: "Post LinkedIn", news: "Newsletter", carrossel: "Carrossel Instagram" };
export const cycleChannels = ["blog", "news", "lkpost", "carrossel"] as const;
export const statusLabels = { draft: "Rascunho", review: "Em aprovação", approved: "Aprovada", scheduled: "Agendada", published: "Publicada", cancelled: "Cancelada" };
export type PostStatus = keyof typeof statusLabels;
export type EditorialCycle = { id: string; workspace_id: string; week_start: string; theme: string; created_by: string; created_at: string };
export type CarouselSlide = { title: string; text: string; role?: "cover" | "content" | "final"; visual_type?: "photo" | "graphic"; visual_direction?: string; image_prompt?: string; source_attribution?: string };
export type EditorialPost = { id: string; workspace_id: string; cycle_id: string; channel: Channel; title: string; body: string; hashtags: string; slides: CarouselSlide[]; status: PostStatus; revision: number; calendar_sequence: number; approved_revision: number | null; approved_by: string | null; approved_at: string | null; planned_for: string | null; published_at: string | null; published_by: string | null; publication_url: string | null; review_note: string; created_by: string; updated_by: string; created_at: string; updated_at: string };
export type EditorialAsset = { id: string; workspace_id: string; post_id: string; storage_path: string; file_name: string; mime_type: string; size_bytes: number; position: number; created_by: string; created_at: string; url?: string };
export type BrandProfile = { workspace_id: string; tone: string; guidance: string; forbidden_terms: string; primary_color: string; accent_color: string; revision: number; updated_by: string | null; updated_at: string };
export type EditorialData = { ready: boolean; cycles: EditorialCycle[]; posts: EditorialPost[]; assets: EditorialAsset[]; brand: BrandProfile | null };

export const cycleSchema = z.object({ week_start: z.iso.date(), theme: z.string().trim().min(3).max(180) }).strict().refine((input) => new Date(`${input.week_start}T12:00:00Z`).getUTCDay() === 1, { message: "Escolha uma segunda-feira para iniciar a semana." });
const slideSchema = z.object({ title: z.string().max(180), text: z.string().max(1200), role: z.enum(["cover", "content", "final"]).optional(), visual_type: z.enum(["photo", "graphic"]).optional(), visual_direction: z.string().max(600).optional(), image_prompt: z.string().max(1600).optional(), source_attribution: z.string().max(240).optional() }).strict();
export const postSchema = z.object({ revision: z.number().int().positive(), title: z.string().trim().min(3).max(180), body: z.string().max(30000), hashtags: z.string().max(1000), slides: z.array(slideSchema).max(10), planned_for: z.iso.datetime({ offset: true }).nullable() }).strict();
export const transitionSchema = z.object({ revision: z.number().int().positive(), action: z.enum(["review", "approve", "reject", "cancel", "publish"]), note: z.string().trim().max(2000).default(""), planned_for: z.iso.datetime({ offset: true }).nullable().default(null), publication_url: z.url().max(2000).refine((value) => new URL(value).protocol === "https:", "Use um link HTTPS.").nullable().default(null) }).strict();
export const brandSchema = z.object({ revision: z.number().int().positive(), tone: z.string().trim().min(3).max(500), guidance: z.string().trim().min(3).max(12000), forbidden_terms: z.string().max(2000), primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/), accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/) }).strict();
export type EditorialPostInput = z.infer<typeof postSchema>;

export const generationRequestSchema = z.object({
  revision: z.number().int().positive(),
  working_title: z.string().trim().max(180).default(""),
  direction: z.string().trim().max(1000).default(""),
  newsletter_conversation: z.string().trim().max(500).default(""),
}).strict();
export const BRIEFING_MARKER = "<!-- PIERSEC_BRIEFING_V1 -->";
export function isPiersecBriefing(value: string) { return value.trimStart().startsWith(BRIEFING_MARKER); }

const generatedSlideSchema = z.object({
  title: z.string().trim().min(1).max(180),
  text: z.string().trim().min(1).max(1200),
  role: z.enum(["cover", "content", "final"]),
  visual_type: z.enum(["photo", "graphic"]),
  visual_direction: z.string().trim().min(1).max(600),
  source_attribution: z.string().max(240),
}).strict();
const generatedSourceSchema = z.object({ label: z.string().trim().min(1).max(240), url: z.string().url().max(2000).refine((value) => new URL(value).protocol === "https:") }).strict();
export const generatedDraftSchema = z.object({
  content_type: z.enum(["briefing", "article", "newsletter", "linkedin_post", "carousel"]),
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(20).max(30000),
  hashtags: z.string().max(1000),
  slides: z.array(generatedSlideSchema).max(9),
  sources: z.array(generatedSourceSchema).max(12),
}).strict();
export type GeneratedDraft = z.infer<typeof generatedDraftSchema>;

export function saoPauloDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function nextMonday() {
  const current = new Date(`${saoPauloDate()}T12:00:00Z`);
  const offset = ((8 - current.getUTCDay()) % 7) || 7;
  current.setUTCDate(current.getUTCDate() + offset);
  return current.toISOString().slice(0, 10);
}
export function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const v = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`;
}
export function toScheduledIso(value: string) { return value ? new Date(`${value}:00-03:00`).toISOString() : null; }
export function sameScheduledTime(value: string, scheduledAt: string | null) {
  const normalized = toScheduledIso(value);
  if (normalized === null || scheduledAt === null) return normalized === scheduledAt;
  const normalizedTime = Date.parse(normalized);
  return Number.isFinite(normalizedTime) && normalizedTime === Date.parse(scheduledAt);
}
export function formatScheduled(value: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "Sem horário definido";
}
