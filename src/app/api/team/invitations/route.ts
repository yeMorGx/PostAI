import { NextResponse, type NextRequest } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, assertSameOrigin, HttpError, readJson } from "@/lib/http";
import { invitationSchema, uuidSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { supabase, workspace } = await requireApiContext("manage_team");
    const input = invitationSchema.parse(await readJson(request));
    if (!process.env.SUPABASE_SECRET_KEY) throw new HttpError(503, "O envio de convites ainda não foi configurado.");
    const { data: invitation, error } = await supabase.from("workspace_invitations").insert({ ...input, workspace_id: workspace.id }).select("*").single();
    if (error?.code === "23505") throw new HttpError(409, "Já existe um convite pendente para este e-mail. Revogue o anterior antes de criar outro.");
    if (error) throw error;
    const admin = createAdminClient();
    const { error: mailError } = await admin.auth.admin.inviteUserByEmail(input.email, { redirectTo: `${process.env.APP_URL ?? new URL(request.url).origin}/auth/confirm` });
    return NextResponse.json({
      invitation,
      warning: mailError ? "O convite foi registrado, mas o e-mail não foi enviado. Se a conta já existir, a pessoa pode usar o link de entrada; caso contrário, confira o serviço de e-mail." : null,
    }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { supabase } = await requireApiContext("manage_team");
    const invitationId = uuidSchema.parse(request.nextUrl.searchParams.get("id"));
    const { error } = await supabase.rpc("revoke_workspace_invitation", { invitation_id: invitationId });
    if (error) throw new HttpError(403, "Não foi possível revogar este convite.");
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
