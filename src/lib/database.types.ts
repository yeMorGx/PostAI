import type { Role } from "./permissions";

export type Workspace = { id: string; name: string; slug: string; timezone: string; created_at: string; singleton: boolean };
export type Member = { workspace_id: string; user_id: string; email: string; display_name: string; role: Role; created_at: string };
export type Invitation = { id: string; workspace_id: string; email: string; role: Role; invited_by: string | null; created_at: string; expires_at: string; accepted_at: string | null; accepted_by: string | null; revoked_at: string | null };
export type Content = { id: string; workspace_id: string; title: string; platform: "linkedin" | "instagram"; body: string; planned_for: string | null; revision: number; created_by: string; updated_by: string; created_at: string; updated_at: string };
export type Activity = { id: string; workspace_id: string; actor_id: string | null; resource_id: string | null; action: string; created_at: string };
type Table<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      workspaces: Table<Workspace, { name: string; slug?: string }, { name?: string; timezone?: string }>;
      workspace_members: Table<Member, never, never>;
      workspace_invitations: Table<Invitation, { workspace_id: string; email: string; role: Role }, never>;
      content_items: Table<Content, { workspace_id: string; title: string; platform: Content["platform"]; body?: string; planned_for?: string | null }, { title?: string; platform?: Content["platform"]; body?: string; planned_for?: string | null }>;
      activity_log: Table<Activity, never, never>;
    };
    Views: Record<string, never>;
    Functions: {
      accept_piersec_invitation: { Args: Record<string, never>; Returns: string | null };
      change_member_role: { Args: { target_user_id: string; next_role: Role }; Returns: undefined };
      remove_workspace_member: { Args: { target_user_id: string }; Returns: undefined };
      revoke_workspace_invitation: { Args: { invitation_id: string }; Returns: undefined };
    };
    Enums: { workspace_role: Role; social_platform: "linkedin" | "instagram" };
    CompositeTypes: Record<string, never>;
  };
};
