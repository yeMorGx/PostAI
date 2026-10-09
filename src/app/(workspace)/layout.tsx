import { AppShell } from "@/components/app-shell";
import { requirePageContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { member } = await requirePageContext();
  return <AppShell member={member}>{children}</AppShell>;
}
