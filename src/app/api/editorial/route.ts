import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, readJson } from "@/lib/http";
import { cycleSchema } from "@/lib/editorial";
import { editorialError, loadEditorial } from "@/lib/editorial-server";

export async function GET() {
  try {
    const { supabase, workspace } = await requireApiContext();
    return NextResponse.json(await loadEditorial(supabase, workspace.id), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("edit");
    const input = cycleSchema.parse(await readJson(request));
    const { data, error } = await supabase.rpc("editorial_create_cycle", { p_week: input.week_start, p_theme: input.theme });
    if (error) editorialError(error);
    return NextResponse.json({ id: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
