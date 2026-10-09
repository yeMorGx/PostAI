import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { memberRoleSchema, uuidSchema } from "@/lib/schemas";

type Context = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("manage_team");
    const target = uuidSchema.parse((await context.params).userId);
    const { role } = memberRoleSchema.parse(await readJson(request));
    const { error } = await supabase.rpc("change_member_role", { target_user_id: target, next_role: role });
    if (error) throw new HttpError(409, error.code === "P0001" ? "Mantenha pelo menos uma pessoa com acesso de administração." : "Não foi possível alterar o acesso.");
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("manage_team");
    const target = uuidSchema.parse((await context.params).userId);
    const { error } = await supabase.rpc("remove_workspace_member", { target_user_id: target });
    if (error) throw new HttpError(409, error.code === "P0001" ? "Mantenha pelo menos uma pessoa com acesso de administração." : "Não foi possível remover o acesso.");
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
