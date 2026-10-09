import { requirePageContext } from "@/lib/auth";
import { ContentPanel } from "@/features/content/content-panel";

export default async function ContentPage() {
  const { supabase, workspace, member } = await requirePageContext();
  const { data, error } = await supabase.from("content_items").select("*").eq("workspace_id", workspace.id).order("updated_at", { ascending: false }).limit(500);
  if (error) throw error;
  return <ContentPanel member={member} initialData={data}/>;
}
