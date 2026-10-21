import { EditorialWorkspace } from "@/features/editorial/editorial-workspace";
import { loadEditorial } from "@/lib/editorial-server";
import { requirePageContext } from "@/lib/auth";
import { cycleChannels } from "@/lib/editorial";

export const dynamic = "force-dynamic";

export default async function DeliveryPage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
  const [{ channel }, context] = await Promise.all([searchParams, requirePageContext()]);
  const initialChannel = cycleChannels.find((item) => item === channel) ?? "carrossel";
  const initialData = await loadEditorial(context.supabase, context.workspace.id);
  return <EditorialWorkspace mode="delivery" initialData={initialData} role={context.member.role} initialChannel={initialChannel}/>;
}
