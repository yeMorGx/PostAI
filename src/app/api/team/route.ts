import { NextResponse } from "next/server";
import { requireApiContext } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { can } from "@/lib/permissions";
import type { Invitation } from "@/lib/database.types";

export async function GET() {
  try {
    const { supabase, member, workspace } = await requireApiContext();
    const { data: members, error } = await supabase.from("workspace_members").select("*").eq("workspace_id", workspace.id).order("created_at");
    if (error) throw error;
    let invitations: Invitation[] = [];
    if (can(member.role, "manage_team")) {
      const result = await supabase.from("workspace_invitations").select("*").eq("workspace_id", workspace.id).is("accepted_at", null).is("revoked_at", null).order("created_at", { ascending: false });
      if (result.error) throw result.error;
      invitations = result.data;
    }
    return NextResponse.json({ members, invitations });
  } catch (error) { return apiError(error); }
}
