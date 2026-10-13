"use client";

import { useState } from "react";
import data from "./reference-data.json";
import { FilterButtons, ReferenceBadge, ReferenceCard, ReferenceHeader, ReferenceNotice, ReferenceTable } from "./reference-ui";

export function ClientDashboard() {
  const [period, setPeriod] = useState<keyof typeof data.KP>("30");
  const [metric, setMetric] = useState<keyof typeof data.MET>("ig");
  const [channel, setChannel] = useState("todos");
  const chart = data.MET[metric];
  const rows = data.ALL.filter((row) => channel === "todos" || row.canal === channel);
  return <div className="reference-page">
    <ReferenceHeader title="Resultados do conteúdo" description="Atualização de exemplo às 08:00. Fontes: Instagram, Google Analytics, Search Console e Brevo"><ReferenceBadge tone="p-amber">Dados de exemplo</ReferenceBadge></ReferenceHeader>
    <FilterButtons label="Período" options={[{ id: "7", name: "7 dias" }, { id: "30", name: "30 dias" }, { id: "90", name: "90 dias" }]} value={period} onChange={(value) => setPeriod(value as keyof typeof data.KP)}/>
    <section className="reference-kpis" aria-label="Indicadores">{data.KP[period].map(([name, value, delta]) => <ReferenceCard key={name}><p className="reference-label">{name}</p><p className="reference-stat-value mt-2">{value}</p><p className="reference-delta">{delta}</p></ReferenceCard>)}</section>
    <ReferenceCard><div className="reference-between"><div><h2>Evolução semanal</h2><p className="muted text-sm mt-1">{chart.desc}</p></div><FilterButtons label="Indicador do gráfico" value={metric} onChange={(value) => setMetric(value as keyof typeof data.MET)} options={Object.entries(data.MET).map(([id, item]) => ({ id, name: item.nome }))}/></div>
      <div className="reference-chart" role="img" aria-label={`Gráfico de barras: ${chart.nome} nas últimas 8 semanas, de ${chart.vals[0]} para ${chart.vals[7]}`}><div className="reference-chart-bars">{chart.vals.map((value, index) => <div key={index}><span>{value.toLocaleString("pt-BR")}</span><i style={{ height: `${Math.round(value / chart.max * 150)}px`, background: index === 7 ? "#2d4bff" : "#b7c2f5" }}/></div>)}</div><div className="reference-chart-labels">{data.SEM.map((week) => <span key={week}>{week}</span>)}</div></div>
    </ReferenceCard>
    <ReferenceCard className="reference-table-card"><div className="reference-between p-5"><div><h2>Resultado por peça</h2><p className="muted text-sm mt-1">Cada canal é medido do jeito que a plataforma permite. A última coluna mostra a fonte.</p></div><FilterButtons label="Canal" value={channel} onChange={setChannel} options={data.CN.map((item) => ({ id: item.k, name: item.n }))}/></div>
      <ReferenceTable label="Resultado por peça" columns={["Peça", "Canal", "Publicada", "Resultado", "Medido por"]} rows={rows.map((row) => [<span key="title" className="font-semibold">{row.titulo}</span>, <ReferenceBadge key="channel" tone={row.pill}>{row.canal}</ReferenceBadge>, row.data, <span key="result" className="font-semibold">{row.resultado}</span>, row.fonte])}/>
      <p className="muted text-sm px-5 pb-4 pt-3">No LinkedIn o painel mostra as visitas que cada publicação leva ao site, por links rastreados. Curtidas e comentários do LinkedIn não aparecem aqui.</p>
    </ReferenceCard><ReferenceNotice/>
  </div>;
}
