"use client";

import { AppLink } from "@/components/ui";
import data from "./reference-data.json";
import { useReferenceState } from "./reference-state";
import { ReferenceBadge, ReferenceCard, ReferenceHeader, ReferenceNotice, ReferenceTable } from "./reference-ui";

const pieces = [
  ["blog", "Artigo no blog", "WordPress da empresa"],
  ["lkart", "Artigo no LinkedIn", "Editor de artigos do LinkedIn"],
  ["lkpost", "Post no LinkedIn", "Página da empresa no LinkedIn"],
  ["news", "Newsletter", "Editor de e-mail do Brevo"],
  ["carrossel", "Carrossel no Instagram", "Meta Business Suite"],
];

export function WeeklyCycle() {
  const { published } = useReferenceState();
  return <div className="reference-page">
    <ReferenceHeader title="Ciclo da semana" description="Semana de 5 a 11 de outubro de 2026. Tema: gestão de acessos privilegiados"><ReferenceBadge tone="p-teal">Etapa 10 de 11: Publicação</ReferenceBadge></ReferenceHeader>
    <ReferenceCard className="reference-next-step"><div className="reference-between"><div><p className="reference-label">Próximo passo</p><h2 className="mt-1">Colar nas redes e marcar como publicada</h2><p className="muted text-sm mt-1">Nada vai ao ar sem o ok explícito de uma pessoa.</p></div><AppLink href="/delivery" variant="primary">Abrir pacote de entrega</AppLink></div></ReferenceCard>
    <section className="reference-phases" aria-label="Etapas do ciclo">{data.FASES.map((phase) => <ReferenceCard key={phase.nome}><h2 className="text-lg">{phase.nome}</h2><p className="muted text-sm mb-3">{phase.nota}</p><ol className="space-y-2">{data.ETAPAS.slice(phase.de - 1, phase.ate).map((step, index) => {
      const number = phase.de + index;
      return <li key={step} className={`reference-stage ${number === 10 ? "is-current" : ""}`}><span className={`reference-stage-dot ${number < 10 ? "is-done" : number === 10 ? "is-current" : ""}`}>{number < 10 ? "✓" : number}</span><span>{step}</span></li>;
    })}</ol></ReferenceCard>)}</section>
    <ReferenceCard title="Peças do ciclo" description="O artigo é a peça-mãe. As outras peças nascem dele e usam os mesmos dados e fontes." className="reference-table-card">
      <ReferenceTable label="Peças do ciclo" columns={["Peça", "Onde será colada", "Situação", "Ação"]} rows={pieces.map(([key, name, destination]) => [
        <div key="name"><p className="font-bold">{name}</p>{key === "blog" && <p className="muted text-sm">Peça-mãe, nutre todos os formatos</p>}</div>,
        <span key="destination" className="muted">{destination}</span>,
        <ReferenceBadge key="status" tone="p-teal">{published[key] ? "Publicada" : "Pronta para colar"}</ReferenceBadge>,
        <AppLink key="action" variant="primary" href={`/delivery?channel=${key}`}>Abrir pacote</AppLink>,
      ])}/>
    </ReferenceCard><ReferenceNotice/>
  </div>;
}
