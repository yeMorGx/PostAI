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
import { SectionIcon } from "@/components/section-icon";

export function AppShell({ member, children }: { member: Member; children: React.ReactNode }) {
  return <WorkspaceShell member={member}>{children}</WorkspaceShell>;
}

function WorkspaceShell({ member, children }: { member: Member; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const queryClient = useQueryClient();
  const [pending, setPending] = useState(false); const [error, setError] = useState("");
  async function logout() {
    setPending(true); setError("");
    try { await fetchJson("/api/auth/logout", { method: "POST" }); queryClient.clear(); router.replace("/login"); router.refresh(); }
    catch { setError("Não foi possível sair. Tente novamente."); setPending(false); }
  }
  const nav = [
    { href: "/dashboard", label: "Visão geral", icon: "overview" },
    { href: "/cycle", label: "Ciclo da semana", icon: "cycle" },
    { href: "/delivery", label: "Pacote de entrega", icon: "delivery" },
    { href: "/identity", label: "Identidade da empresa", icon: "identity" },
    { href: "/calendar", label: "Calendário", icon: "calendar" },
    { href: "/client-dashboard", label: "Resultados", icon: "results" },
  ] as const;
  return <div className="shell reference-shell"><Link href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-3">Ir para o conteúdo</Link>
    <aside className="sidebar dark" data-theme="dark"><div className="px-3"><BrandLogo href="/dashboard" compact/><p className="mt-1 text-sm text-[#9aa4b8]">Conteúdo da Piersec</p></div>
      <nav aria-label="Seções" className="section-nav"><p className="section-nav-label">Seções</p>{nav.map(({ href, label, icon }) => <Link href={href} key={href} variant={pathname.startsWith(href) ? "primary" : "ghost"} className={`side-link ${pathname.startsWith(href) ? "active" : ""}`} current={pathname.startsWith(href)}><SectionIcon name={icon}/><span>{label}</span></Link>)}</nav>
      <div className="sidebar-footer mt-auto px-3 pt-6"><p className="text-sm text-[#9aa4b8] mt-3">Publicação manual após aprovação.</p>
        <div className="reference-management-links"><Link href="/cycle">Peças da semana</Link><Link href="/team">Equipe e acessos</Link></div>
        <div className="border-t border-[#334055] mt-5 pt-4"><p className="break-all text-sm text-white">{member.display_name || member.email}</p><p className="mt-1 text-sm text-[#bcc6d8]">{roleLabels[member.role]}</p><Button variant="ghost" className="mt-2 text-white" onPress={logout} isPending={pending}>{pending ? "Saindo…" : "Sair da conta"}</Button>{error && <p role="alert" className="mt-2 text-sm text-[#ffc6be]">{error}</p>}</div>
      </div></aside>
    <main id="main-content" className={`main-content ${pathname === "/dashboard" ? "reference-overview-main" : ""}`}><div className="reference-company-stripe"/>{children}</main>
  </div>;
}
