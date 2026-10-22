"use client";

import { Button, Card, Chip, Form, Input, Label, TextArea, TextField } from "@heroui/react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppLink, Choice, Notice } from "@/components/ui";
import { can, type Role } from "@/lib/permissions";
import { channelLabels, cycleChannels, formatScheduled, isPiersecBriefing, localDateTime, nextMonday, saoPauloDate, toScheduledIso, type BrandProfile, type CarouselSlide, type Channel, type EditorialAsset, type EditorialCycle, type EditorialData, type EditorialPost, type GeneratedDraft } from "@/lib/editorial";
import { fetchJson } from "@/lib/api-client";
import { useEditorial } from "./use-editorial";
import { CarouselMarquee } from "@/features/reference/carousel-marquee";

type Mode = "overview" | "cycle" | "delivery" | "identity" | "results" | "calendar";
const channelList: Channel[] = ["blog", "news", "lkpost", "carrossel", "lkart"];
const statusText: Record<EditorialPost["status"], string> = { draft: "Rascunho", review: "Em aprovação", approved: "Aprovada", scheduled: "Agendada", published: "Publicada", cancelled: "Cancelada" };

export function EditorialWorkspace({ mode, initialData, role, initialChannel = "carrossel" }: { mode: Mode; initialData: EditorialData; role: Role; initialChannel?: Channel }) {
  const state = useEditorial(initialData);
  const data = state.data ?? initialData;
  const canEdit = can(role, "edit");
  const canApprove = can(role, "approve");
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [channel, setChannel] = useState<Channel>(initialChannel);
  const [weekStart, setWeekStart] = useState(nextMonday());
  const [theme, setTheme] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const cycles = data.cycles;
  const activeCycle = cycles.find((cycle) => cycle.id === selectedCycleId) ?? cycles[0] ?? null;
  const posts = activeCycle ? data.posts.filter((post) => post.cycle_id === activeCycle.id).sort((a, b) => channelList.indexOf(a.channel) - channelList.indexOf(b.channel)) : [];
  const activePost = posts.find((post) => post.id === selectedPostId) ?? posts.find((post) => post.channel === channel) ?? posts[0] ?? null;
  const approvedBriefingNeedsArticle = posts.some((post) => post.channel === "blog" && post.status === "approved" && post.approved_revision === post.revision && isPiersecBriefing(post.body));
  const hasApprovedArticle = posts.some((post) => post.channel === "blog" && post.status === "approved" && post.approved_revision === post.revision && !isPiersecBriefing(post.body));
  const hasRequiredCyclePosts = cycleChannels.every((requiredChannel) => posts.some((post) => post.channel === requiredChannel));
  const packageFinalized = cycleChannels.every((requiredChannel) => {
    const item = posts.find((post) => post.channel === requiredChannel);
    return item && ["scheduled", "published"].includes(item.status) && item.approved_revision === item.revision;
  });
  const packageApproved = cycleChannels.every((requiredChannel) => {
    const item = posts.find((post) => post.channel === requiredChannel);
    return item?.status === "approved" && item.approved_revision === item.revision;
  });

  async function runAction(url: string, method: "POST" | "PATCH", body?: unknown, success?: string) {
    setError(""); setNotice(""); setPending(true);
    try {
      await fetchJson(url, { method, body: body === undefined ? undefined : JSON.stringify(body) });
      await state.refresh();
      if (success) setNotice(success);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível concluir a ação."); }
    finally { setPending(false); }
  }

  async function createCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!weekStart || !theme.trim()) return;
    setError(""); setNotice(""); setPending(true);
    try {
      const result = await fetchJson<{ id: string }>("/api/editorial", { method: "POST", body: JSON.stringify({ week_start: weekStart, theme }) });
      await state.refresh(); setSelectedCycleId(result.id); setSelectedPostId(""); setNotice("Semana criada com quatro entregáveis em rascunho.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível criar a semana."); }
    finally { setPending(false); }
  }

  async function approveWeek() {
    if (!activeCycle) return;
    await runAction(`/api/editorial/cycles/${activeCycle.id}/approve`, "POST", undefined, "Pacote confirmado e peças aprovadas adicionadas ao calendário. A publicação continua manual.");
  }

  if (!data.ready) return <main className="editorial-page">
    <header className="editorial-heading"><div><p className="editorial-eyebrow">Piersec · Fluxo editorial</p><h1>{pageTitle(mode)}</h1></div></header>
    <Notice status="accent">A estrutura de aprovação e agendamento ainda não está no Supabase. O restante da tela ficará disponível assim que a migração for aplicada.</Notice>
  </main>;

  return <main className="editorial-page">
    <header className="editorial-heading">
      <div><p className="editorial-eyebrow">Piersec · Conteúdo e calendário</p><h1>{pageTitle(mode)}</h1><p className="editorial-muted">{pageDescription(mode)}</p></div>
      {mode === "calendar" && <Button variant="secondary" onPress={() => window.location.assign("/api/editorial/calendar")}>Baixar calendário (.ics)</Button>}
      {mode === "delivery" && <AppLink href="/calendar" variant="secondary">Abrir calendário</AppLink>}
    </header>
    {error && <Notice status="danger">{error}</Notice>}{notice && <Notice status="success">{notice}</Notice>}
    {state.isFetching && <p role="status" className="editorial-muted">Atualizando dados…</p>}

    {mode === "overview" && <Overview data={data} role={role}/>}
    {mode === "cycle" && <>
      {canEdit && <Form className="editorial-create-form" onSubmit={(event) => void createCycle(event)}>
        <TextField value={weekStart} onChange={setWeekStart} isRequired><Label>Segunda-feira da semana</Label><Input type="date"/></TextField>
        <TextField value={theme} onChange={setTheme} isRequired><Label>Tema editorial da semana</Label><Input minLength={3} maxLength={180} placeholder="Ex.: gestão de acessos privilegiados"/></TextField>
        <Button type="submit" variant="primary" isPending={pending}>{pending ? "Criando…" : "Criar semana"}</Button>
      </Form>}
      <CyclePicker cycles={cycles} active={activeCycle} onSelect={(cycle) => { setSelectedCycleId(cycle.id); setSelectedPostId(""); }}/>
      {activeCycle ? <>
        <div className="editorial-summary-row"><div><h2>{formatWeek(activeCycle.week_start)} · {activeCycle.theme}</h2><p className="editorial-muted">Prepare artigo, newsletter, post de LinkedIn e carrossel. A confirmação do pacote só fica disponível após a aprovação individual das quatro peças.</p></div>
          <div className="editorial-actions">
            {canApprove && hasRequiredCyclePosts && !packageFinalized && <Button variant="primary" isPending={pending} isDisabled={!packageApproved || approvedBriefingNeedsArticle} onPress={() => void approveWeek()}>{approvedBriefingNeedsArticle ? "Finalize o artigo antes do pacote" : packageApproved ? "Confirmar pacote e agendar" : "Aprove cada peça antes do pacote"}</Button>}
          </div>
        </div>
        {approvedBriefingNeedsArticle ? <Notice status="accent">O briefing do artigo foi aprovado. Redija e aprove o artigo antes de gerar os três derivados e concluir a revisão das quatro peças.</Notice> : packageFinalized ? <Notice status="success">Pacote confirmado e agendado. A publicação nas plataformas continua manual.</Notice> : hasRequiredCyclePosts && <Notice status="accent">Envie cada etapa para revisão e aprove as quatro peças individualmente. Depois, confirme o pacote para agendar. A publicação nas plataformas é manual.</Notice>}
        <div className="editorial-cycle-layout">
          <Card className="editorial-post-list"><Card.Header><Card.Title>Peças da semana</Card.Title><Card.Description>{posts.filter((post) => post.status === "scheduled").length} agendadas de {posts.length}</Card.Description></Card.Header><Card.Content className="editorial-post-list__items">
            {posts.map((post) => <Button key={post.id} variant={activePost?.id === post.id ? "secondary" : "ghost"} className="editorial-post-picker" onPress={() => { setSelectedPostId(post.id); setChannel(post.channel); }}>
              <span className="editorial-post-picker__copy"><strong>{channelLabels[post.channel]}</strong><span>{post.title}</span><small>{formatScheduled(post.planned_for)}</small></span><StatusChip post={post}/>
            </Button>)}
          </Card.Content></Card>
          {activePost && <PostComposer key={`${activePost.id}:${activePost.revision}:${activePost.status}:${activePost.planned_for ?? ""}:${activePost.review_note}`} post={activePost} cycleTheme={activeCycle.theme} hasApprovedArticle={hasApprovedArticle} assets={data.assets.filter((asset) => asset.post_id === activePost.id)} canEdit={canEdit} canApprove={canApprove} pending={pending} onPending={setPending} onNotice={setNotice} onError={setError} refresh={state.refresh} mutate={state.mutate}/>}
        </div>
      </> : <Card><Card.Content><p className="editorial-muted">Crie a primeira semana para começar os rascunhos e horários.</p></Card.Content></Card>}
    </>}
    {mode === "delivery" && <Delivery data={data} channel={channel} setChannel={setChannel} role={role} pending={pending} runAction={runAction}/>}
    {mode === "identity" && <BrandEditor key={data.brand?.revision ?? 0} brand={data.brand} role={role} runAction={runAction} pending={pending}/>}
    {mode === "results" && <Results data={data}/>}
    {mode === "calendar" && <Calendar data={data}/>}
  </main>;
}

function pageTitle(mode: Mode) { return ({ overview: "Visão geral", cycle: "Ciclo da semana", delivery: "Pacote de entrega", identity: "Identidade da empresa", results: "Resultados do conteúdo", calendar: "Calendário editorial" })[mode]; }
function pageDescription(mode: Mode) { return ({ overview: "Acompanhe o que precisa de revisão e o que está programado para publicar.", cycle: "Prepare os quatro entregáveis do manual Piersec em etapas com aprovação humana.", delivery: "Confira o conteúdo final e registre a publicação manual nas redes.", identity: "Edite as regras e a identidade que orientam as peças da Piersec.", results: "Acompanhe o volume de conteúdo registrado no PostAI.", calendar: "Visualize a programação da Piersec e exporte os eventos para seu calendário.", })[mode]; }
function formatWeek(date: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`)); }

function StatusChip({ post }: { post: EditorialPost }) {
  const color = post.status === "review" ? "warning" : post.status === "approved" || post.status === "published" ? "success" : post.status === "scheduled" ? "accent" : post.status === "cancelled" ? "danger" : "default";
  return <Chip color={color} variant="soft" aria-label={`Situação: ${statusText[post.status]}`}>{statusText[post.status]}</Chip>;
}

function CyclePicker({ cycles, active, onSelect }: { cycles: EditorialCycle[]; active: EditorialCycle | null; onSelect: (cycle: EditorialCycle) => void }) {
  if (cycles.length < 2) return null;
  return <div className="editorial-cycle-picker"><p className="editorial-muted">Selecionar semana</p><Choice value={active?.id ?? ""} onChange={(id) => { const cycle = cycles.find((item) => item.id === id); if (cycle) onSelect(cycle); }} label="Selecionar semana" options={cycles.map((cycle) => ({ id: cycle.id, label: `${formatWeek(cycle.week_start)} · ${cycle.theme}` }))}/></div>;
}

function Overview({ data, role }: { data: EditorialData; role: Role }) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setNow(Date.now()), 0); return () => window.clearTimeout(timer); }, []);
  const cycle = data.cycles[0];
  const posts = cycle ? data.posts.filter((post) => post.cycle_id === cycle.id) : [];
  const reviewCount = posts.filter((post) => post.status === "review").length;
  const scheduledCount = data.posts.filter((post) => post.status === "scheduled").length;
  const overdue = now === null ? 0 : data.posts.filter((post) => post.status === "scheduled" && post.planned_for && Date.parse(post.planned_for) < now).length;
  const next = data.posts.filter((post) => post.status === "scheduled" && post.planned_for).sort((a, b) => Date.parse(a.planned_for!) - Date.parse(b.planned_for!))[0];
  return <>
    <section className="editorial-stats" aria-label="Resumo do fluxo">
      <Stat value={reviewCount} label="Aguardando aprovação" note="Peças desta semana em revisão"/>
      <Stat value={scheduledCount} label="Agendadas" note="Publicação manual nos horários definidos"/>
      <Stat value={overdue} label="Horário passado" note="Revise o calendário e atualize o status"/>
    </section>
    <Card><Card.Header><Card.Title>{cycle ? `Semana de ${formatWeek(cycle.week_start)}` : "Planejamento semanal"}</Card.Title><Card.Description>{cycle?.theme ?? "Crie uma semana para organizar os quatro entregáveis."}</Card.Description></Card.Header><Card.Content>
      {next ? <div className="editorial-next-post"><StatusChip post={next}/><div><strong>{channelLabels[next.channel]} · {next.title}</strong><p>{formatScheduled(next.planned_for)}</p></div></div> : <p className="editorial-muted">{data.posts.length ? "Nenhuma publicação está agendada no momento." : "Ainda não há semanas no calendário."}</p>}
      <div className="editorial-actions mt-4"><Button variant="primary" onPress={() => router.push("/cycle")}>{can(role, "approve") && reviewCount ? "Revisar a semana" : "Abrir ciclo da semana"}</Button><Button variant="secondary" onPress={() => router.push("/calendar")}>Ver calendário</Button></div>
    </Card.Content></Card>
  </>;
}

function Stat({ value, label, note }: { value: number; label: string; note: string }) { return <Card className="editorial-stat"><Card.Content><p className="editorial-stat__value">{value}</p><p className="editorial-stat__label">{label}</p><p className="editorial-muted">{note}</p></Card.Content></Card>; }

type Draft = { revision: number; title: string; body: string; hashtags: string; slides: CarouselSlide[]; planned_for: string };
function PostComposer({ post, cycleTheme, hasApprovedArticle, assets, canEdit, canApprove, pending, onPending, onNotice, onError, refresh, mutate }: { post: EditorialPost; cycleTheme: string; hasApprovedArticle: boolean; assets: EditorialAsset[]; canEdit: boolean; canApprove: boolean; pending: boolean; onPending: (value: boolean) => void; onNotice: (value: string) => void; onError: (value: string) => void; refresh: () => Promise<unknown>; mutate: ReturnType<typeof useEditorial>["mutate"] }) {
  const [draft, setDraft] = useState<Draft>(() => draftFromPost(post));
  const [generationDirection, setGenerationDirection] = useState("");
  const [knowledgeBaseContext, setKnowledgeBaseContext] = useState("");
  const [newsletterConversation, setNewsletterConversation] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedDraft | null>(null);
  const [generatedRevision, setGeneratedRevision] = useState<number | null>(null);
  const [generatedStatus, setGeneratedStatus] = useState<EditorialPost["status"] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState(post.review_note);
  const [publishUrl, setPublishUrl] = useState(post.publication_url ?? "");
  const uploadRef = useRef<HTMLInputElement>(null);
  const dirty = draft.title !== post.title || draft.body !== post.body || draft.hashtags !== post.hashtags || JSON.stringify(draft.slides) !== JSON.stringify(post.slides) || toScheduledIso(draft.planned_for) !== post.planned_for;
  const assetsInPosition = [...assets].sort((a, b) => a.position - b.position);
  const generatedAssetForSlide = (index: number) => assets.find((asset) => asset.file_name === `slide-${String(index + 1).padStart(2, "0")}.webp`);
  const isBriefingDraft = post.channel === "blog" && post.status === "draft" && (!post.body.trim() || isPiersecBriefing(post.body));
  const isApprovedBriefing = post.channel === "blog" && post.status === "approved" && post.approved_revision === post.revision && isPiersecBriefing(post.body);
  const isApprovedArticle = post.channel === "blog" && post.status === "approved" && post.approved_revision === post.revision && !isPiersecBriefing(post.body);
  const canGenerate = post.channel !== "lkart" && !dirty && (isBriefingDraft || isApprovedBriefing || (post.channel !== "blog" && post.status === "draft" && hasApprovedArticle));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); onError(""); onNotice(""); onPending(true);
    try {
      await mutate.mutateAsync({ url: `/api/editorial/posts/${post.id}`, method: "PATCH", body: { ...draft, planned_for: toScheduledIso(draft.planned_for) } });
      onNotice("Rascunho salvo. A aprovação anterior é removida sempre que o conteúdo muda.");
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível salvar a peça."); }
    finally { onPending(false); }
  }

  async function generateDraft() {
    setGeneratedDraft(null); setGeneratedRevision(null); setGeneratedStatus(null); onError(""); onNotice(""); setGenerating(true);
    try {
      const result = await fetchJson<GeneratedDraft>(`/api/editorial/posts/${post.id}/generate`, {
        method: "POST",
        body: JSON.stringify({ revision: post.revision, working_title: draft.title, direction: generationDirection, knowledge_base_context: knowledgeBaseContext, newsletter_conversation: newsletterConversation }),
      });
      setGeneratedDraft(result); setGeneratedRevision(post.revision); setGeneratedStatus(post.status);
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível gerar a prévia."); }
    finally { setGenerating(false); }
  }

  function applyGeneratedDraft() {
    if (!generatedDraft) return;
    if (generatedRevision !== post.revision || post.status !== generatedStatus || !canEdit) {
      setGeneratedDraft(null); setGeneratedRevision(null); setGeneratedStatus(null);
      onError("A peça foi alterada. Atualize a tela antes de aplicar esta prévia.");
      return;
    }
    setDraft((current) => ({ ...current, title: generatedDraft.title, body: generatedDraft.body, hashtags: generatedDraft.hashtags, slides: generatedDraft.slides }));
    setGeneratedDraft(null); setGeneratedRevision(null); setGeneratedStatus(null);
    onNotice(generatedDraft.content_type === "briefing" ? "Briefing aplicado. Revise, salve e envie esta etapa para aprovação." : "Prévia aplicada. Revise o conteúdo e salve o rascunho.");
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []); event.target.value = "";
    if (!files.length) return;
    if (assets.length + files.length > 10) { onError("Cada carrossel aceita até dez imagens."); return; }
    onError(""); onNotice(""); onPending(true);
    try {
      let revision = post.revision;
      for (const file of files) {
        const form = new FormData(); form.set("revision", String(revision)); form.set("file", file);
        const response = await fetch(`/api/editorial/posts/${post.id}/assets`, { method: "POST", body: form, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Não foi possível enviar a imagem.");
        revision = result.revision;
      }
      await refresh(); onNotice(`${files.length} imagem(ns) adicionada(s). A peça precisa ser enviada para aprovação novamente.`);
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível enviar a imagem."); await refresh(); }
    finally { onPending(false); }
  }

  async function generateSlideImage(index: number) {
    onError(""); onNotice(""); onPending(true); setGeneratingImageIndex(index);
    try {
      await fetchJson<unknown>(`/api/editorial/posts/${post.id}/generate-image`, {
        method: "POST",
        body: JSON.stringify({ revision: post.revision, slide_index: index }),
      });
      await refresh();
      onNotice(`Imagem da lâmina ${index + 1} gerada e anexada como base sem texto. A revisão anterior foi invalidada e a peça precisa ser revisada novamente.`);
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Não foi possível gerar a imagem.");
    } finally { setGeneratingImageIndex(null); onPending(false); }
  }

  async function removeAsset(asset: EditorialAsset) {
    onError(""); onNotice(""); onPending(true);
    try {
      const response = await fetch(`/api/editorial/assets/${asset.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: post.revision }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Não foi possível remover a imagem.");
      await refresh(); onNotice(result.warning ?? "Imagem removida da peça.");
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível remover a imagem."); }
    finally { onPending(false); }
  }

  async function transition(action: string, note = "", url: string | null = null) {
    onError(""); onNotice(""); onPending(true);
    try {
      await fetchJson(`/api/editorial/posts/${post.id}/transition`, { method: "POST", body: JSON.stringify({ revision: post.revision, action, note, planned_for: post.planned_for, publication_url: url }) });
      await refresh(); onNotice(action === "reject" ? "Peça devolvida para ajuste." : "Situação atualizada.");
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível atualizar a situação."); }
    finally { onPending(false); }
  }

  function updateSlide(index: number, field: keyof CarouselSlide, value: string) {
    setDraft((current) => ({ ...current, slides: current.slides.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: value } as CarouselSlide : slide) }));
  }

  const canSubmitReview = canEdit && post.status === "draft" && !dirty;
  const isApprovedBriefingPost = post.channel === "blog" && post.status === "approved" && isPiersecBriefing(post.body);
  return <Card className="editorial-composer"><Card.Header><div className="editorial-composer__heading"><div><Card.Title>{channelLabels[post.channel]}</Card.Title><Card.Description>Versão {post.revision} · {post.status === "published" ? `publicada ${formatScheduled(post.published_at)}` : `horário ${formatScheduled(post.planned_for)}`}</Card.Description></div><StatusChip post={post}/></div></Card.Header><Card.Content>
    {post.review_note && <Notice status="accent">Ajuste solicitado: {post.review_note}</Notice>}
    {post.publication_url && <p className="editorial-published-link"><a href={post.publication_url} target="_blank" rel="noreferrer">Abrir publicação registrada</a></p>}
    {canEdit && post.status !== "published" ? <Form className="editorial-form" onSubmit={(event) => void save(event)}>
      {canGenerate && <section className="editorial-ai" aria-labelledby="editorial-ai-title">
        <div className="editorial-ai__top"><div><h3 id="editorial-ai-title">{isBriefingDraft ? "Pesquisa e briefing" : isApprovedBriefing ? "Artigo a partir do briefing aprovado" : "Peça derivada do artigo aprovado"}</h3><p className="editorial-muted">{isBriefingDraft ? "A busca usa fontes primárias. O briefing precisa de aprovação humana antes da redação do artigo." : isApprovedBriefing ? "A redação usa somente o briefing aprovado. Salvar a nova versão remove a aprovação anterior." : "A geração usa o artigo de blog aprovado nesta semana e preserva as fontes dele."}</p></div><Button type="button" className="editorial-ai__action" variant="secondary" isPending={generating} isDisabled={generating || pending || dirty || (isBriefingDraft && knowledgeBaseContext.trim().length < 20) || (post.channel === "news" && newsletterConversation.trim().length < 20)} onPress={() => void generateDraft()}>{generating ? "Pesquisando e redigindo…" : isBriefingDraft ? "Pesquisar e gerar briefing" : isApprovedBriefing ? "Redigir artigo" : "Gerar prévia"}</Button></div>
        <p className="editorial-muted">Tema: {cycleTheme}. A prévia não salva nem publica conteúdo. A revisão e a aprovação continuam com a equipe.</p>
        {isBriefingDraft && <TextField value={knowledgeBaseContext} onChange={setKnowledgeBaseContext} isRequired><Label>Base Piersec consultada</Label><TextArea rows={4} maxLength={12000} placeholder="Informe os nomes das páginas da rota consultada e cole uma síntese dos conceitos, fontes, validade e ressalvas relevantes. Se não houver material sobre o tema, registre a rota verificada e que a base não tinha conteúdo pertinente."/><p className="editorial-muted">Não inclua nomes, dados de clientes, leads ou informações confidenciais.</p></TextField>}
        {post.channel === "news" && <TextField value={newsletterConversation} onChange={setNewsletterConversation} isRequired><Label>Conversa que a operação quer abrir</Label><TextArea rows={2} maxLength={500} placeholder="Ex.: convidar o leitor a conversar sobre avaliação de maturidade, sem prometer diagnóstico."/></TextField>}
        <TextField value={generationDirection} onChange={setGenerationDirection}><Label>Orientação extra (opcional)</Label><TextArea rows={2} maxLength={1000} placeholder="Ex.: priorize um impacto de negócio específico para gestores de TI"/></TextField>
        {generating && <p className="editorial-muted" role="status" aria-live="polite">Aguardando a resposta da OpenAI…</p>}
        {generatedDraft && generatedRevision === post.revision && <div className="editorial-ai__preview" role="region" aria-label="Prévia do conteúdo gerado" aria-live="polite">
          <div><p className="editorial-muted">Prévia para revisar · {generatedDraft.content_type === "briefing" ? "briefing" : generatedDraft.content_type === "article" ? "artigo" : generatedDraft.content_type === "newsletter" ? "newsletter" : generatedDraft.content_type === "linkedin_post" ? "LinkedIn" : "carrossel"}</p><h4>{generatedDraft.title}</h4></div>
          <p className="editorial-ai__body">{generatedDraft.body}</p>
          {generatedDraft.hashtags && <p className="editorial-hashtags">{generatedDraft.hashtags}</p>}
          {generatedDraft.sources.length > 0 && <section aria-label="Fontes verificadas"><h5>Fontes para conferência</h5><ul className="editorial-ai__sources">{generatedDraft.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></section>}
          {generatedDraft.slides.length > 0 && <ol className="editorial-ai__slides">{generatedDraft.slides.map((slide, index) => <li key={`${slide.title}-${index}`}><strong>{slide.role === "cover" ? "Capa" : slide.role === "final" ? "Slide final" : `Conteúdo ${index}`}: {slide.title}</strong><span>{slide.text}</span>{slide.source_attribution && <span>Fonte: {slide.source_attribution}</span>}<span>Direção visual: {slide.visual_direction}</span>{slide.visual_type === "photo" && <span>Base fotográfica gerada separadamente, sem texto sobreposto.</span>}</li>)}</ol>}
          <p className="editorial-muted">Aplicar substitui título, texto, hashtags e lâminas deste formulário. Nada é salvo até você salvar o rascunho.</p>
          {generatedDraft.content_type === "newsletter" && <Notice status="accent">Antes de disparar o HTML, substitua {"{{unsubscribe_url}}"} pelo link real da plataforma de e-mail.</Notice>}
          <div className="editorial-actions editorial-ai__actions"><Button type="button" className="editorial-ai__action" variant="primary" onPress={applyGeneratedDraft}>Aplicar ao editor</Button><Button type="button" className="editorial-ai__action" variant="ghost" onPress={() => { setGeneratedDraft(null); setGeneratedRevision(null); setGeneratedStatus(null); }}>Descartar prévia</Button></div>
        </div>}
      </section>}
      {canEdit && post.channel === "lkart" && <Notice status="accent">O manual Piersec não define um agente para Artigo LinkedIn. Este canal não recebe geração automática.</Notice>}
      {canEdit && post.channel !== "blog" && post.channel !== "lkart" && post.status === "draft" && !hasApprovedArticle && <Notice status="accent">A geração deste derivado será liberada depois que o artigo de blog desta semana estiver aprovado.</Notice>}
      {isApprovedArticle && <Notice status="accent">Este artigo já está aprovado. As peças derivadas podem usar esta versão como fonte.</Notice>}
      {isApprovedBriefing && <Notice status="accent">Briefing aprovado. Redija o artigo antes de agendar ou publicar esta peça.</Notice>}
      <TextField value={draft.title} onChange={(title) => setDraft((current) => ({ ...current, title }))} isRequired><Label>Título</Label><Input minLength={3} maxLength={180}/></TextField>
      <TextField value={draft.body} onChange={(body) => setDraft((current) => ({ ...current, body }))}><Label>Texto da publicação</Label><TextArea rows={9} maxLength={30000} placeholder="Escreva o conteúdo. Para enviar à aprovação, o texto precisa ter ao menos 20 caracteres."/></TextField>
      <TextField value={draft.hashtags} onChange={(hashtags) => setDraft((current) => ({ ...current, hashtags }))}><Label>Hashtags</Label><TextArea rows={2} maxLength={1000} placeholder="#ciberseguranca #Piersec"/></TextField>
      <TextField value={draft.planned_for} onChange={(planned_for) => setDraft((current) => ({ ...current, planned_for }))}><Label>Data e hora de publicação · São Paulo</Label><Input type="datetime-local"/></TextField>
      {post.channel === "carrossel" && <section className="editorial-slides"><div className="editorial-section-title"><div><h3>Lâminas do carrossel</h3><p className="editorial-muted">A estrutura Piersec usa capa, quatro a sete lâminas de conteúdo e um slide final.</p></div><Button variant="secondary" isDisabled={draft.slides.length >= 9} onPress={() => setDraft((current) => ({ ...current, slides: [...current.slides, { title: "", text: "", role: "content", visual_type: "graphic", visual_direction: "", source_attribution: "" }] }))}>Adicionar lâmina</Button></div>
        {draft.slides.map((slide, index) => {
          const generatedAsset = generatedAssetForSlide(index);
          return <div className="editorial-slide-fields" key={index}>
            <p className="editorial-muted">Lâmina {index + 1}{slide.role ? ` · ${slide.role === "cover" ? "capa" : slide.role === "final" ? "final" : "conteúdo"}` : ""}</p>
            <Choice value={slide.role ?? "content"} onChange={(value) => updateSlide(index, "role", value)} label={`Função da lâmina ${index + 1}`} options={[{ id: "cover", label: "Capa" }, { id: "content", label: "Conteúdo" }, { id: "final", label: "Final" }]}/>
            <TextField value={slide.title} onChange={(value) => updateSlide(index, "title", value)}><Label>Título</Label><Input maxLength={180}/></TextField>
            <TextField value={slide.text} onChange={(value) => updateSlide(index, "text", value)}><Label>Texto</Label><TextArea rows={2} maxLength={1200}/></TextField>
            <TextField value={slide.source_attribution ?? ""} onChange={(value) => updateSlide(index, "source_attribution", value)}><Label>Fonte de apoio (nome exato da fonte do artigo)</Label><Input maxLength={240}/></TextField>
            <Choice value={slide.visual_type ?? "graphic"} onChange={(value) => updateSlide(index, "visual_type", value)} label={`Tipo visual da lâmina ${index + 1}`} options={[{ id: "photo", label: "Foto" }, { id: "graphic", label: "Gráfico" }]}/>
            <TextField value={slide.visual_direction ?? ""} onChange={(value) => updateSlide(index, "visual_direction", value)}><Label>Direção visual</Label><TextArea rows={2} maxLength={600}/></TextField>
            {slide.visual_type === "photo" && <div className="editorial-image-generation">
              <p className="editorial-muted">A foto é gerada sem texto; a direção precisa estar em inglês, como determina o manual.</p>
              {generatedAsset ? <p className="editorial-muted" role="status">Imagem anexada. Remova-a na lista abaixo para gerar outra versão.</p> : <Button type="button" variant="secondary" isPending={generatingImageIndex === index} isDisabled={dirty || pending || generatingImageIndex !== null || !hasApprovedArticle || assets.length >= 10 || !slide.visual_direction?.trim()} onPress={() => void generateSlideImage(index)}>{generatingImageIndex === index ? "Gerando foto…" : `Gerar foto da lâmina ${index + 1}`}</Button>}
              {generatingImageIndex === index && <p className="editorial-muted" role="status" aria-live="polite">A OpenAI está criando a base fotográfica. Isso pode levar alguns minutos.</p>}
            </div>}
            {draft.slides.length > 1 && <Button variant="ghost" onPress={() => setDraft((current) => ({ ...current, slides: current.slides.filter((_, slideIndex) => slideIndex !== index) }))}>Remover lâmina</Button>}
          </div>;
        })}
      </section>}
      <div className="editorial-actions"><Button type="submit" variant="primary" isPending={pending} isDisabled={!dirty}>{pending ? "Salvando…" : "Salvar rascunho"}</Button>{dirty && <span className="editorial-muted">Salve as alterações antes de enviar a peça para revisão ou anexar imagens.</span>}</div>
    </Form> : <div className="editorial-readonly-copy"><h3>{post.title}</h3><p>{post.body || "Sem texto cadastrado."}</p>{post.hashtags && <p className="editorial-hashtags">{post.hashtags}</p>}</div>}

    {canSubmitReview && <div className="editorial-review-actions"><p className="editorial-muted">Envie esta etapa para aprovação humana. O conteúdo não será publicado automaticamente.</p><Button variant="secondary" isPending={pending} onPress={() => void transition("review")}>Enviar peça para aprovação</Button></div>}

    {post.channel === "carrossel" && <section className="editorial-assets"><div className="editorial-section-title"><div><h3>Artes do carrossel</h3><p className="editorial-muted">PNG, JPEG ou WebP · até 5 MB cada · mínimo de duas imagens para revisão.</p></div>{canEdit && post.status !== "published" && <><Button variant="secondary" isDisabled={dirty || pending || assets.length >= 10} onPress={() => uploadRef.current?.click()}>Adicionar imagens</Button><input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" aria-label="Enviar imagens para o carrossel" onChange={(event) => void uploadFiles(event)}/></>}</div>
      {assetsInPosition.length ? <div className="editorial-asset-grid">{assetsInPosition.map((asset) => {
        const slideNumber = slideNumberFromAssetName(asset.file_name);
        const slide = slideNumber ? post.slides[slideNumber - 1] : undefined;
        return <figure className="editorial-asset" key={asset.id}>
          {asset.url ? <img src={asset.url} alt={`Lâmina ${slideNumber ?? asset.position}${slide?.title ? `: ${slide.title}` : ""}`}/> : <div className="editorial-asset__missing">Prévia indisponível</div>}
          <figcaption><span>{slideNumber ? `Lâmina ${slideNumber}: ${slide?.title || "base fotográfica"}` : `${asset.position}. ${asset.file_name}`}</span>{canEdit && post.status !== "published" && <Button variant="ghost" isDisabled={dirty || pending} onPress={() => void removeAsset(asset)}>Remover</Button>}</figcaption>
        </figure>;
      })}</div> : <p className="editorial-empty-assets">Nenhuma imagem anexada. Gere as bases fotográficas das lâminas indicadas como foto ou envie arquivos da equipe.</p>}
    </section>}

    {canApprove && post.status === "review" && <section className="editorial-review-actions"><h3>Decisão da aprovação</h3><TextField value={reviewNote} onChange={setReviewNote}><Label>Observação se devolver para ajuste</Label><TextArea rows={2} maxLength={2000} placeholder="Explique o que deve ser revisado."/></TextField><div className="editorial-actions"><Button variant="secondary" isPending={pending} onPress={() => void transition("reject", reviewNote)}>Devolver para ajuste</Button><Button variant="primary" isPending={pending} onPress={() => void transition("approve")}>Aprovar peça</Button></div></section>}
     {canApprove && post.status === "approved" && !isApprovedBriefingPost && <Notice status="accent">Peça aprovada individualmente. O calendário só é liberado depois da confirmação do pacote completo.</Notice>}
     {canApprove && post.status === "scheduled" && <section className="editorial-review-actions"><h3>Registrar publicação manual</h3><p className="editorial-muted">Depois de publicar na plataforma, informe o endereço da publicação.</p><TextField value={publishUrl} onChange={setPublishUrl}><Label>Link HTTPS da publicação</Label><Input type="url" placeholder="https://www.linkedin.com/posts/…"/></TextField><Button variant="secondary" isPending={pending} isDisabled={!publishUrl.startsWith("https://")} onPress={() => void transition("publish", "", publishUrl)}>Marcar como publicada</Button></section>}
    {canApprove && post.status === "scheduled" && <Button className="mt-3" variant="ghost" isPending={pending} onPress={() => void transition("cancel")}>Cancelar agendamento</Button>}
    {post.status === "scheduled" && <Notice status="accent">O PostAI organiza a fila. A publicação na rede ainda é feita manualmente pela equipe.</Notice>}
  </Card.Content></Card>;
}

function draftFromPost(post: EditorialPost): Draft { return { revision: post.revision, title: post.title, body: post.body, hashtags: post.hashtags, slides: post.slides ?? [], planned_for: localDateTime(post.planned_for) }; }
function slideNumberFromAssetName(fileName: string) { const match = /^slide-(\d{2})\.webp$/u.exec(fileName); return match ? Number(match[1]) : null; }

function Delivery({ data, channel, setChannel, role, pending, runAction }: { data: EditorialData; channel: Channel; setChannel: (channel: Channel) => void; role: Role; pending: boolean; runAction: (url: string, method: "POST" | "PATCH", body?: unknown, success?: string) => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  const [publishUrl, setPublishUrl] = useState("");
  const [note, setNote] = useState("");
  const cycle = data.cycles[0]; const posts = cycle ? data.posts.filter((post) => post.cycle_id === cycle.id) : [];
  const post = posts.find((item) => item.channel === channel);
  const assets = post ? data.assets.filter((asset) => asset.post_id === post.id).sort((a, b) => a.position - b.position) : [];
  const canApprove = can(role, "approve");
  async function copy() {
    if (!post) return;
    try { await navigator.clipboard.writeText([post.body, post.hashtags].filter(Boolean).join("\n\n")); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setNote("A cópia automática não foi permitida neste navegador. Selecione o conteúdo e copie manualmente."); }
  }
  return <>
    <div className="editorial-channel-tabs" role="group" aria-label="Canal de publicação">{cycleChannels.map((item) => <Button key={item} variant={item === channel ? "primary" : "secondary"} aria-pressed={item === channel} onPress={() => setChannel(item)}>{channelLabels[item]}</Button>)}</div>
    {post ? <div className="editorial-delivery-layout"><Card><Card.Header><div className="editorial-composer__heading"><div><Card.Title>{channelLabels[post.channel]}</Card.Title><Card.Description>{post.title}</Card.Description></div><StatusChip post={post}/></div></Card.Header><Card.Content>
      {post.channel === "carrossel" && <CarouselMarquee assets={assets} slides={post.slides}/>}
      <div className="editorial-readonly-copy"><h3>Texto da publicação</h3><p>{post.body || "Ainda não há texto salvo."}</p>{post.hashtags && <p className="editorial-hashtags">{post.hashtags}</p>}</div>
      <div className="editorial-actions mt-4"><Button variant="secondary" onPress={() => void copy()}>{copied ? "Copiado" : "Copiar texto"}</Button><AppLink href="/cycle" variant="secondary">Editar no ciclo</AppLink></div>
      {post.status === "scheduled" && <p className="editorial-muted mt-3">Horário planejado: {formatScheduled(post.planned_for)} · A publicação é manual.</p>}
      {canApprove && post.status === "scheduled" && <div className="editorial-publish-form"><h3>Registrar publicação</h3><TextField value={publishUrl} onChange={setPublishUrl}><Label>Link HTTPS da publicação</Label><Input type="url" placeholder="https://…"/></TextField><Button variant="primary" isPending={pending} isDisabled={!publishUrl.startsWith("https://")} onPress={() => void runAction(`/api/editorial/posts/${post.id}/transition`, "POST", { revision: post.revision, action: "publish", publication_url: publishUrl }, "Publicação registrada.")}>Marcar como publicada</Button></div>}
    </Card.Content></Card>
    <Card><Card.Header><Card.Title>Publicação manual</Card.Title><Card.Description>Próximos passos desta peça</Card.Description></Card.Header><Card.Content><ol className="editorial-steps"><li>Copie o texto final e abra a rede indicada.</li><li>Publique a peça no horário que consta no calendário.</li><li>Depois, registre aqui o link da publicação.</li></ol><p className="editorial-muted mt-4">O PostAI não acessa nem publica nas contas de LinkedIn ou Instagram.</p>{post.publication_url && <AppLink href={post.publication_url} variant="secondary">Abrir publicação registrada</AppLink>}</Card.Content></Card></div> : <Card><Card.Content><p className="editorial-muted">Crie a semana e salve a peça no ciclo para preparar o pacote de entrega.</p></Card.Content></Card>}
    {note && <Notice>{note}</Notice>}
  </>;
}

function BrandEditor({ brand, role, runAction, pending }: { brand: BrandProfile | null; role: Role; runAction: (url: string, method: "POST" | "PATCH", body?: unknown, success?: string) => Promise<void>; pending: boolean }) {
  const canEdit = can(role, "edit");
  const [tone, setTone] = useState(brand?.tone ?? ""); const [guidance, setGuidance] = useState(brand?.guidance ?? ""); const [forbidden, setForbidden] = useState(brand?.forbidden_terms ?? ""); const [primary, setPrimary] = useState(brand?.primary_color ?? "#0A0F1E"); const [accent, setAccent] = useState(brand?.accent_color ?? "#33C3ED");
  const changed = !!brand && (tone !== brand.tone || guidance !== brand.guidance || forbidden !== brand.forbidden_terms || primary !== brand.primary_color || accent !== brand.accent_color);
  return brand ? <Card><Card.Header><Card.Title>Padrões de comunicação Piersec</Card.Title><Card.Description>Estas regras são mantidas pela equipe. Atualizar padrões devolve para revisão o conteúdo ainda não publicado.</Card.Description></Card.Header><Card.Content>
    <Form className="editorial-form" onSubmit={(event) => { event.preventDefault(); void runAction("/api/editorial/brand", "PATCH", { revision: brand.revision, tone, guidance, forbidden_terms: forbidden, primary_color: primary, accent_color: accent }, "Padrões salvos. As peças em revisão precisam ser conferidas novamente."); }}>
      <TextField value={tone} onChange={setTone} isReadOnly={!canEdit} isRequired><Label>Tom da marca</Label><Input maxLength={500}/></TextField>
      <TextField value={guidance} onChange={setGuidance} isReadOnly={!canEdit} isRequired><Label>Orientações de conteúdo</Label><TextArea rows={7} maxLength={12000}/></TextField>
      <TextField value={forbidden} onChange={setForbidden} isReadOnly={!canEdit}><Label>Termos a evitar · separados por vírgula</Label><TextArea rows={3} maxLength={2000}/></TextField>
      <div className="editorial-brand-colors"><TextField value={primary} onChange={setPrimary} isReadOnly={!canEdit}><Label>Cor principal</Label><Input type="color"/></TextField><TextField value={accent} onChange={setAccent} isReadOnly={!canEdit}><Label>Cor de destaque</Label><Input type="color"/></TextField><div className="editorial-brand-preview" style={{ background: primary, borderColor: accent }}><span style={{ color: accent }}>Piersec</span><small>Identidade visual</small></div></div>
      {canEdit && <div className="editorial-actions"><Button type="submit" variant="primary" isPending={pending} isDisabled={!changed}>{pending ? "Salvando…" : "Salvar padrões"}</Button>{changed && <p className="editorial-muted">Salvar padrões cancela as peças agendadas que ainda não foram publicadas.</p>}</div>}
    </Form>
  </Card.Content></Card> : <Notice status="danger">Os padrões da empresa ainda não foram carregados.</Notice>;
}

function Results({ data }: { data: EditorialData }) {
  const published = data.posts.filter((post) => post.status === "published");
  const scheduled = data.posts.filter((post) => post.status === "scheduled");
  return <><section className="editorial-stats"><Stat value={published.length} label="Publicações registradas" note="Quantidade registrada manualmente"/><Stat value={scheduled.length} label="Na programação" note="Conteúdo organizado no calendário"/><Stat value={data.posts.length} label="Peças planejadas" note="Todos os canais da Piersec"/></section><Notice status="accent">Métricas de alcance, engajamento e tráfego ainda não estão integradas. Esta tela mostra apenas dados salvos no fluxo editorial.</Notice><Card className="mt-5"><Card.Header><Card.Title>Últimas publicações registradas</Card.Title></Card.Header><Card.Content>{published.length ? <ul className="editorial-result-list">{published.toSorted((a, b) => Date.parse(b.published_at ?? "") - Date.parse(a.published_at ?? "")).map((post) => <li key={post.id}><div><strong>{post.title}</strong><p>{channelLabels[post.channel]} · {formatScheduled(post.published_at)}</p></div>{post.publication_url && <a href={post.publication_url} target="_blank" rel="noreferrer">Abrir publicação</a>}</li>)}</ul> : <p className="editorial-muted">Nenhuma publicação foi registrada ainda.</p>}</Card.Content></Card></>;
}

function Calendar({ data }: { data: EditorialData }) {
  const [month, setMonth] = useState(() => { const today = saoPauloDate(); return new Date(`${today.slice(0, 7)}-01T12:00:00Z`); });
  const [selectedChannel, setSelectedChannel] = useState<Channel | "todos">("todos");
  const monthKey = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
  const startOffset = (new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).getUTCDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, index) => { const day = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1 - startOffset + index)); return day.toISOString().slice(0, 10); });
  const scheduled = data.posts.filter((post) => post.planned_for && post.status !== "draft" && post.status !== "review" && post.status !== "approved").filter((post) => selectedChannel === "todos" || selectedChannel === post.channel);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(month);
  return <>
    <div className="editorial-calendar-toolbar"><div className="editorial-calendar-month"><Button variant="secondary" aria-label="Mês anterior" onPress={() => setMonth((value) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() - 1, 1)))}>←</Button><h2>{monthLabel}</h2><Button variant="secondary" aria-label="Próximo mês" onPress={() => setMonth((value) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 1)))}>→</Button><Button variant="ghost" onPress={() => { const today = saoPauloDate(); setMonth(new Date(`${today.slice(0, 7)}-01T12:00:00Z`)); }}>Hoje</Button></div>
      <Choice value={selectedChannel} onChange={(value) => setSelectedChannel(value as Channel | "todos")} label="Filtrar por canal" options={[{ id: "todos", label: "Todos os canais" }, ...cycleChannels.map((item) => ({ id: item, label: channelLabels[item] }))]}/>
    </div>
    <Card className="editorial-calendar-card"><Card.Content><div className="editorial-calendar-grid" role="grid" aria-label={`Calendário de publicações: ${monthLabel}`}><div className="editorial-calendar-weekday">Seg</div><div className="editorial-calendar-weekday">Ter</div><div className="editorial-calendar-weekday">Qua</div><div className="editorial-calendar-weekday">Qui</div><div className="editorial-calendar-weekday">Sex</div><div className="editorial-calendar-weekday">Sáb</div><div className="editorial-calendar-weekday">Dom</div>
      {days.map((day) => { const dayPosts = scheduled.filter((post) => post.planned_for?.slice(0, 10) === day); const inMonth = day.startsWith(monthKey); return <div className={`editorial-calendar-day ${inMonth ? "" : "is-outside"} ${day === saoPauloDate() ? "is-today" : ""}`} role="gridcell" key={day}><span className="editorial-calendar-day__number">{Number(day.slice(-2))}</span>{dayPosts.map((post) => <AppLink className={`editorial-calendar-event is-${post.status}`} href={`/delivery?channel=${post.channel}`} key={post.id}><time>{new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(post.planned_for!))}</time><span>{channelLabels[post.channel]}</span></AppLink>)}</div>; })}
    </div></Card.Content></Card>
    <p className="editorial-muted mt-3">A exportação .ics é uma cópia para importar no Outlook, Microsoft 365 ou Google Calendar. As alterações posteriores exigem baixar o arquivo atualizado e importar novamente.</p>
  </>;
}
