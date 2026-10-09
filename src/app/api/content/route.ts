import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, readJson } from "@/lib/http";
import { contentSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const { supabase, workspace } = await requireApiContext();
    const { data, error } = await supabase.from("content_items").select("*").eq("workspace_id", workspace.id).order("updated_at", { ascending: false }).limit(500);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace } = await requireApiContext("edit");
    const input = contentSchema.parse(await readJson(request));
    const { data, error } = await supabase.from("content_items").insert({ ...input, workspace_id: workspace.id }).select("*").single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) { return apiError(error); }
}
