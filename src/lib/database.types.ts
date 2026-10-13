import type { Role } from "./permissions";
import type { BrandProfile, EditorialAsset, EditorialCycle, EditorialPost } from "./editorial";

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
      editorial_cycles: Table<EditorialCycle, never, never>;
      editorial_posts: Table<EditorialPost, never, never>;
      editorial_assets: Table<Omit<EditorialAsset, "url">, never, never>;
      brand_profiles: Table<BrandProfile, never, never>;
    };
    Views: Record<string, never>;
    Functions: {
      accept_piersec_invitation: { Args: Record<string, never>; Returns: string | null };
      change_member_role: { Args: { target_user_id: string; next_role: Role }; Returns: undefined };
      remove_workspace_member: { Args: { target_user_id: string }; Returns: undefined };
      revoke_workspace_invitation: { Args: { invitation_id: string }; Returns: undefined };
      editorial_create_cycle: { Args: { p_week: string; p_theme: string }; Returns: string };
      editorial_save_post: { Args: { p_id: string; p_revision: number; p_title: string; p_body: string; p_hashtags: string; p_slides: { title: string; text: string }[]; p_planned: string | null }; Returns: EditorialPost };
      editorial_transition: { Args: { p_id: string; p_revision: number; p_action: string; p_note?: string; p_planned?: string | null; p_url?: string | null }; Returns: EditorialPost };
      editorial_approve_week: { Args: { p_cycle: string }; Returns: number };
      editorial_submit_week: { Args: { p_cycle: string }; Returns: number };
      editorial_attach_asset: { Args: { p_post: string; p_revision: number; p_path: string; p_name: string; p_mime: string; p_size: number }; Returns: string };
      editorial_remove_asset: { Args: { p_asset: string; p_revision: number }; Returns: string };
      editorial_save_brand: { Args: { p_tone: string; p_guidance: string; p_forbidden: string; p_primary: string; p_accent: string; p_revision: number }; Returns: undefined };
    };
    Enums: { workspace_role: Role; social_platform: "linkedin" | "instagram" };
    CompositeTypes: Record<string, never>;
  };
};
