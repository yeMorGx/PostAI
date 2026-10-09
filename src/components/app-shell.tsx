"use client";

import { Button } from "@heroui/react";
import { BrandLogo } from "@/components/brand-logo";
import { AppLink as Link } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Member } from "@/lib/database.types";
import { roleLabels } from "@/lib/permissions";
import { fetchJson } from "@/lib/api-client";

export function AppShell({ member, children }: { member: Member; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const queryClient = useQueryClient();
  const [pending, setPending] = useState(false); const [error, setError] = useState("");
  async function logout() {
    setPending(true); setError("");
    try { await fetchJson("/api/auth/logout", { method: "POST" }); queryClient.clear(); router.replace("/login"); router.refresh(); }
    catch { setError("Não foi possível sair. Tente novamente."); setPending(false); }
  }
  const nav = [["/dashboard", "Visão geral"], ["/content", "Conteúdos"], ["/team", "Equipe e acessos"], ["/identity", "Padrões da Piersec"]];
  return <div className="shell"><Link href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-3">Ir para o conteúdo</Link>
    <aside className="sidebar"><div className="px-3"><BrandLogo href="/dashboard" compact/><p className="mt-1 text-sm text-[#bcc6d8]">Espaço Piersec</p></div><nav aria-label="Navegação principal" className="mt-10 space-y-2">{nav.map(([href, label]) => <Link href={href} key={href} className={`side-link ${pathname.startsWith(href) ? "active" : ""}`} current={pathname.startsWith(href)}>{label}</Link>)}</nav>
    <div className="sidebar-footer mt-auto border-t border-[#334055] px-3 pt-5"><p className="break-all text-sm text-white">{member.display_name || member.email}</p><p className="mt-1 text-sm text-[#bcc6d8]">{roleLabels[member.role]}</p><Button variant="ghost" className="mt-3 text-white" onPress={logout} isPending={pending}>{pending ? "Saindo…" : "Sair da conta"}</Button>{error && <p role="alert" className="mt-2 text-sm text-[#ffc6be]">{error}</p>}</div></aside>
    <main id="main-content" className="main-content">{children}</main>
  </div>;
}
