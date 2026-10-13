import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/http";
import { uuidSchema } from "@/lib/schemas";
import { editorialError } from "@/lib/editorial-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("edit");
    const { data, error } = await supabase.rpc("editorial_submit_week", { p_cycle: uuidSchema.parse((await params).id) });
    if (error) editorialError(error);
    return NextResponse.json({ submitted: data });
  } catch (error) { return apiError(error); }
}
