import "server-only";
import { NextResponse } from "next/server";
import { apiError } from "./http";
import type { GenerationCost } from "./generation-cost";

export async function generationApiError(error: unknown, cost: GenerationCost) {
  const response = apiError(error);
  return NextResponse.json({ ...await response.json(), generation_cost: cost }, { status: response.status, headers: { "Cache-Control": "private, no-store" } });
}
