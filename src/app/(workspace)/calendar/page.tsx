import { EditorialWorkspace } from "@/features/editorial/editorial-workspace";
import { loadEditorial } from "@/lib/editorial-server";
import { requirePageContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { supabase, workspace, member } = await requirePageContext();
  const initialData = await loadEditorial(supabase, workspace.id);
  return <EditorialWorkspace mode="calendar" initialData={initialData} role={member.role}/>;
}
