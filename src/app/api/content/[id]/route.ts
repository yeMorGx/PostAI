import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { contentSchema, uuidSchema } from "@/lib/schemas";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace } = await requireApiContext("edit");
    const id = uuidSchema.parse((await context.params).id);
    const input = contentSchema.parse(await readJson(request));
    const { data, error } = await supabase.from("content_items").update(input).eq("id", id).eq("workspace_id", workspace.id).select("*").maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Este conteúdo não está disponível.");
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace } = await requireApiContext("edit");
    const id = uuidSchema.parse((await context.params).id);
    const { data, error } = await supabase.from("content_items").delete().eq("id", id).eq("workspace_id", workspace.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Este conteúdo não está disponível.");
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
