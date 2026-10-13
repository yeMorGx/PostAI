import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, readJson } from "@/lib/http";
import { transitionSchema } from "@/lib/editorial";
import { uuidSchema } from "@/lib/schemas";
import { editorialError } from "@/lib/editorial-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const input = transitionSchema.parse(await readJson(request));
    const { supabase } = await requireApiContext(input.action === "review" ? "edit" : "approve");
    const id = uuidSchema.parse((await params).id);
    const { data, error } = await supabase.rpc("editorial_transition", { p_id: id, p_revision: input.revision, p_action: input.action, p_note: input.note, p_planned: input.planned_for, p_url: input.publication_url });
    if (error) editorialError(error);
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}
