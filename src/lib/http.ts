import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const trusted = new URL(process.env.APP_URL ?? request.url).origin;
  if (!origin || origin !== trusted) throw new HttpError(403, "A origem da solicitação não é permitida.");
}

export async function readJson(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 65536) throw new HttpError(413, "A solicitação excede o tamanho permitido.");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 65536) throw new HttpError(413, "A solicitação excede o tamanho permitido.");
  try { return JSON.parse(raw); } catch { throw new HttpError(400, "Envie os dados no formato JSON."); }
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Confira os dados informados." }, { status: 400 });
  console.error("PostAI request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: "Não foi possível concluir a ação. Tente novamente." }, { status: 500 });
}
