import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { can, type Permission } from "@/lib/permissions";
import { HttpError } from "@/lib/http";

export async function getWorkspaceContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;
  const { data: member, error } = await supabase.from("workspace_members").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Não foi possível consultar seu acesso. Confira as migrações do banco.");
  if (!member) return null;
  const { data: workspace, error: workspaceError } = await supabase.from("workspaces").select("*").eq("id", member.workspace_id).single();
  if (workspaceError) throw new Error("Não foi possível carregar o espaço Piersec.");
  return { supabase, user, member, workspace };
}

export async function requirePageContext() {
  if (!isSupabaseConfigured()) redirect("/setup");
  const context = await getWorkspaceContext();
  if (!context) redirect("/login?reason=access");
  return context;
}

export async function requireApiContext(permission: Permission = "read") {
  if (!isSupabaseConfigured()) throw new HttpError(503, "A conexão com o banco ainda não foi configurada.");
  const context = await getWorkspaceContext();
  if (!context) throw new HttpError(401, "Entre com uma conta convidada para a Piersec.");
  if (!can(context.member.role, permission)) throw new HttpError(403, "Seu perfil não permite esta ação.");
  return context;
}
