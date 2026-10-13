import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, readJson } from "@/lib/http";
import { postSchema } from "@/lib/editorial";
import { uuidSchema } from "@/lib/schemas";
import { editorialError } from "@/lib/editorial-server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("edit");
    const id = uuidSchema.parse((await params).id);
    const input = postSchema.parse(await readJson(request));
    const { data, error } = await supabase.rpc("editorial_save_post", { p_id: id, p_revision: input.revision, p_title: input.title, p_body: input.body, p_hashtags: input.hashtags, p_slides: input.slides, p_planned: input.planned_for });
    if (error) editorialError(error);
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}
