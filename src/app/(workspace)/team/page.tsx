import { requirePageContext } from "@/lib/auth";
import { TeamPanel } from "@/features/workspaces/team-panel";
import { can } from "@/lib/permissions";
import type { Invitation } from "@/lib/database.types";

export default async function TeamPage() {
  const { supabase, member, workspace } = await requirePageContext();
  const { data: members, error } = await supabase.from("workspace_members").select("*").eq("workspace_id", workspace.id).order("created_at");
  if (error) throw error;
  let invitations: Invitation[] = [];
  if (can(member.role, "manage_team")) {
    const result = await supabase.from("workspace_invitations").select("*").eq("workspace_id", workspace.id).is("accepted_at", null).is("revoked_at", null).order("created_at", { ascending: false });
    if (result.error) throw result.error;
    invitations = result.data;
  }
  return <TeamPanel member={member} initialData={{ members, invitations }}/>;
}
