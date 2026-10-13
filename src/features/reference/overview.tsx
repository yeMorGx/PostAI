"use client";

import { AppLink } from "@/components/ui";
import data from "./reference-data.json";
import { ReferenceBadge, ReferenceCard, ReferenceHeader, ReferenceNotice, ReferenceTable } from "./reference-ui";

export function ReferenceOverview() {
  const company = data.EMP[0];
  return <div className="reference-page">
    <ReferenceHeader title="Visão geral" description="Semana de 5 a 11 de outubro de 2026" company={false}><ReferenceBadge tone="p-amber">Dados de exemplo</ReferenceBadge></ReferenceHeader>
    <section className="reference-stats" aria-label="Resumo">
      {[["0", "Aguardando seu ok", "Peças em revisão ou na aprovação final"], ["1", "Prontas para colar", "Pacotes aprovados esperando publicação"], ["0", "Com atraso", "Etapa parada além do combinado"]].map(([value, name, note]) => <ReferenceCard key={name}><p className="reference-stat-value">{value}</p><p className="font-semibold mt-2">{name}</p><p className="muted text-sm">{note}</p></ReferenceCard>)}
    </section>
    <ReferenceCard title="Onde a empresa está no ciclo" description="Cada trilho tem 11 etapas. A parte preenchida mostra o que já foi feito." className="reference-table-card">
      <ReferenceTable label="Ciclo da Piersec" columns={["Empresa", "Trilho do ciclo", "Etapa atual", "Próximo passo", "Ação"]} rows={[[
        <div key="company"><p className="reference-company text-base"><span/>{company.nome}</p><p className="muted text-sm ml-6">{company.pecas}</p></div>,
        <div key="track" className="min-w-48"><div className="reference-track" aria-label="Etapa 10 de 11">{data.ETAPAS.map((step, index) => <span key={step} style={{ background: index < 9 ? "#10151f" : index === 9 ? company.cor : "#dce0e8" }}/>)}</div><p className="muted text-sm mt-1">Etapa 10 de 11</p></div>,
        <ReferenceBadge key="stage" tone="p-teal">Publicação</ReferenceBadge>,
        <span key="next">{company.proximo}</span>,
        <AppLink key="action" href="/cycle" variant="secondary">Abrir ciclo</AppLink>,
      ]]}/>
    </ReferenceCard>
    <ReferenceNotice/>
  </div>;
}
