import { EditorialWorkspace } from "@/features/editorial/editorial-workspace";
import { loadEditorial } from "@/lib/editorial-server";
import { requirePageContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CyclePage() {
  const { supabase, workspace, member } = await requirePageContext();
  const initialData = await loadEditorial(supabase, workspace.id);
  return <EditorialWorkspace mode="cycle" initialData={initialData} role={member.role}/>;
}
