import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, readJson } from "@/lib/http";
import { brandSchema } from "@/lib/editorial";
import { editorialError } from "@/lib/editorial-server";

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("edit");
    const input = brandSchema.parse(await readJson(request));
    const { error } = await supabase.rpc("editorial_save_brand", { p_tone: input.tone, p_guidance: input.guidance, p_forbidden: input.forbidden_terms, p_primary: input.primary_color, p_accent: input.accent_color, p_revision: input.revision });
    if (error) editorialError(error);
    return NextResponse.json({ saved: true });
  } catch (error) { return apiError(error); }
}
