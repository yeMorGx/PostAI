import { EditorialWorkspace } from "@/features/editorial/editorial-workspace";
import { loadEditorial } from "@/lib/editorial-server";
import { requirePageContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function IdentityPage() {
  const { supabase, workspace, member } = await requirePageContext();
  const initialData = await loadEditorial(supabase, workspace.id);
  return <EditorialWorkspace mode="identity" initialData={initialData} role={member.role}/>;
}
