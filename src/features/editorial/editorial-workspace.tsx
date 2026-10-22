"use client";

import { Button, Card, Chip, Form, Input, Label, TextArea, TextField } from "@heroui/react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppLink, Choice, Notice } from "@/components/ui";
import { can, type Role } from "@/lib/permissions";
import { channelLabels, cycleChannels, formatScheduled, isPiersecBriefing, localDateTime, nextMonday, sameScheduledTime, saoPauloDate, toScheduledIso, type BrandProfile, type CarouselSlide, type Channel, type EditorialAsset, type EditorialCycle, type EditorialData, type EditorialPost, type GeneratedDraft } from "@/lib/editorial";
import { fetchGenerationJson, fetchJson } from "@/lib/api-client";
import { useEditorial } from "./use-editorial";
import { CarouselMarquee } from "@/features/reference/carousel-marquee";
import { addGenerationCost, emptyGenerationCost, type GenerationCost } from "@/lib/generation-cost";
import { GenerationCostSummary } from "./generation-cost-summary";
import { PackageGenerationPanel } from "./package-generation-panel";

type Mode = "overview" | "cycle" | "delivery" | "identity" | "results" | "calendar";
const channelList: Channel[] = ["blog", "news", "lkpost", "carrossel", "lkart"];
const statusText: Record<EditorialPost["status"], string> = { draft: "Rascunho", review: "Em aprovação", approved: "Aprovada", scheduled: "Agendada", published: "Publicada", cancelled: "Cancelada" };

export function EditorialWorkspace({ mode, initialData, role, initialChannel = "blog" }: { mode: Mode; initialData: EditorialData; role: Role; initialChannel?: Channel }) {
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
  const [activeComposerDirty, setActiveComposerDirty] = useState(false);

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
      await state.refresh(); setSelectedCycleId(result.id); setSelectedPostId(""); setChannel("blog"); setActiveComposerDirty(false); setNotice("Semana criada com quatro entregáveis em rascunho.");
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
      <CyclePicker cycles={cycles} active={activeCycle} onSelect={(cycle) => { setSelectedCycleId(cycle.id); setSelectedPostId(""); setChannel("blog"); setActiveComposerDirty(false); }}/>
      {activeCycle ? <>
        <div className="editorial-summary-row"><div><h2>{formatWeek(activeCycle.week_start)} · {activeCycle.theme}</h2><p className="editorial-muted">Gere as quatro peças em sequência e revise os rascunhos antes das aprovações.</p></div>
          <div className="editorial-actions">
            {canApprove && hasRequiredCyclePosts && !packageFinalized && <Button variant="primary" isPending={pending} isDisabled={!packageApproved || approvedBriefingNeedsArticle} onPress={() => void approveWeek()}>{approvedBriefingNeedsArticle ? "Finalize o artigo antes do pacote" : packageApproved ? "Confirmar pacote e agendar" : "Aprove cada peça antes do pacote"}</Button>}
          </div>
        </div>
        {hasRequiredCyclePosts && <PackageGenerationPanel key={activeCycle.id} cycle={activeCycle} posts={posts} assets={data.assets.filter((asset) => posts.some((post) => post.id === asset.post_id))} canEdit={canEdit && !packageFinalized} pending={pending} dirty={activeComposerDirty} onPending={setPending} onNotice={setNotice} onError={setError} refresh={state.refresh}/>}
        {approvedBriefingNeedsArticle ? <Notice status="accent">O briefing foi aprovado. O botão de geração completa prepara o artigo e os três derivados em sequência, mantendo as peças como rascunhos para revisão.</Notice> : packageFinalized ? <Notice status="success">Pacote confirmado e agendado. A publicação nas plataformas continua manual.</Notice> : hasRequiredCyclePosts && <Notice status="accent">Depois de gerar, revise e aprove cada peça. A confirmação agenda o pacote; a publicação nas plataformas continua manual.</Notice>}
        <div className="editorial-cycle-layout">
          <Card className="editorial-post-list"><Card.Header><Card.Title>Peças da semana</Card.Title><Card.Description>{posts.filter((post) => post.status === "scheduled").length} agendadas de {posts.length}</Card.Description></Card.Header><Card.Content className="editorial-post-list__items">
            {posts.map((post) => <Button key={post.id} variant={activePost?.id === post.id ? "secondary" : "ghost"} className="editorial-post-picker" isDisabled={pending} onPress={() => { setSelectedPostId(post.id); setChannel(post.channel); setActiveComposerDirty(false); }}>
              <span className="editorial-post-picker__copy"><strong>{channelLabels[post.channel]}</strong><span>{post.title}</span><small>{formatScheduled(post.planned_for)}</small></span><StatusChip post={post}/>
            </Button>)}
          </Card.Content></Card>
          {activePost && <PostComposer key={activePost.id} post={activePost} cycleTheme={activeCycle.theme} hasApprovedArticle={hasApprovedArticle} assets={data.assets.filter((asset) => asset.post_id === activePost.id)} canEdit={canEdit} canApprove={canApprove} pending={pending} onPending={setPending} onNotice={setNotice} onError={setError} onDirtyChange={setActiveComposerDirty} refresh={state.refresh} mutate={state.mutate}/>}
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
function pageDescription(mode: Mode) { return ({ overview: "Acompanhe o que precisa de revisão e o que está programado para publicar.", cycle: "Gere as quatro peças de uma vez e revise os rascunhos antes de aprovar.", delivery: "Confira o conteúdo final e registre a publicação manual nas redes.", identity: "Edite as regras e a identidade que orientam as peças da Piersec.", results: "Acompanhe o volume de conteúdo registrado no PostAI.", calendar: "Visualize a programação da Piersec e exporte os eventos para seu calendário.", })[mode]; }
function formatWeek(date: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`)); }

function StatusChip({ post }: { post: EditorialPost }) {
  const color = post.status === "review" ? "warning" : post.status === "approved" || post.status === "published" ? "success" : post.status === "scheduled" ? "accent" : post.status === "cancelled" ? "danger" : "default";
  return <Chip color={color} variant="soft" aria-label={`Situação: ${statusText[post.status]}`}>{statusText[post.status]}</Chip>;
}

function OpenAIMark() {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </svg>;
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
type CarouselImageTask = { slides: CarouselSlide[]; revision: number; slideIndexes: number[] };
function PostComposer({ post, cycleTheme, hasApprovedArticle, assets, canEdit, canApprove, pending, onPending, onNotice, onError, onDirtyChange, refresh, mutate }: { post: EditorialPost; cycleTheme: string; hasApprovedArticle: boolean; assets: EditorialAsset[]; canEdit: boolean; canApprove: boolean; pending: boolean; onPending: (value: boolean) => void; onNotice: (value: string) => void; onError: (value: string) => void; onDirtyChange: (value: boolean) => void; refresh: () => Promise<unknown>; mutate: ReturnType<typeof useEditorial>["mutate"] }) {
  const [draft, setDraft] = useState<Draft>(() => draftFromPost(post));
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [generationCost, setGenerationCost] = useState<GenerationCost | null>(null);
  const [costLabel, setCostLabel] = useState("Custo desta geração");
  const [carouselImageRetry, setCarouselImageRetry] = useState<CarouselImageTask | null>(() => {
    if (post.channel !== "carrossel") return null;
    const attached = new Set(assets.filter((asset) => asset.post_id === post.id).map((asset) => asset.file_name));
    const photoIndexes = post.slides.flatMap((slide, index) => slide.visual_type === "photo" ? [index] : []);
    const slideIndexes = photoIndexes.filter((index) => !attached.has(`slide-${String(index + 1).padStart(2, "0")}.webp`));
    return slideIndexes.length ? { slides: post.slides, revision: post.revision, slideIndexes } : null;
  });
  const [reviewNote, setReviewNote] = useState(post.review_note);
  const [publishUrl, setPublishUrl] = useState(post.publication_url ?? "");
  const [syncedRevision, setSyncedRevision] = useState(post.revision);
  const uploadRef = useRef<HTMLInputElement>(null);
  const dirty = draft.title !== post.title || draft.body !== post.body || draft.hashtags !== post.hashtags || JSON.stringify(draft.slides) !== JSON.stringify(post.slides) || !sameScheduledTime(draft.planned_for, post.planned_for);
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  const assetsInPosition = [...assets].sort((a, b) => a.position - b.position);
  const generatedAssetForSlide = (index: number) => assets.find((asset) => asset.file_name === `slide-${String(index + 1).padStart(2, "0")}.webp`);
  const isBriefingDraft = post.channel === "blog" && post.status === "draft" && (!post.body.trim() || isPiersecBriefing(post.body));
  const isApprovedBriefing = post.channel === "blog" && post.status === "approved" && post.approved_revision === post.revision && isPiersecBriefing(post.body);
  const isApprovedArticle = post.channel === "blog" && post.status === "approved" && post.approved_revision === post.revision && !isPiersecBriefing(post.body);
  const canGenerate = post.channel !== "lkart" && !dirty && (isBriefingDraft || isApprovedBriefing || (post.channel !== "blog" && post.status === "draft" && hasApprovedArticle));
  const carouselGenerationBlockReason = [
    post.status !== "draft" ? "A geração só fica disponível enquanto a peça estiver em rascunho." : "",
    dirty ? "Salve ou descarte as alterações antes de gerar." : "",
    !hasApprovedArticle ? "Para gerar o pacote inteiro em sequência, use o botão de geração completa no topo do ciclo." : "",
  ].filter(Boolean).join(" ");

  if (syncedRevision !== post.revision) {
    setSyncedRevision(post.revision);
    setDraft(draftFromPost(post));
    setReviewNote(post.review_note);
    setPublishUrl(post.publication_url ?? "");
    setCarouselImageRetry((current) => current && JSON.stringify(current.slides) === JSON.stringify(post.slides)
      ? { ...current, revision: post.revision }
      : null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); onError(""); onNotice(""); onPending(true);
    try {
      await persistDraft(draft);
      onNotice("Rascunho salvo. A aprovação anterior é removida sempre que o conteúdo muda.");
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível salvar a peça."); }
    finally { onPending(false); }
  }

  async function persistDraft(values: Draft) {
    return await mutate.mutateAsync({ url: `/api/editorial/posts/${post.id}`, method: "PATCH", body: { ...values, planned_for: toScheduledIso(values.planned_for) } }) as EditorialPost;
  }

  async function generateDraft() {
    const hasSavedContent = Boolean(post.body.trim() || post.hashtags.trim() || post.slides.length || post.title !== cycleTheme);
    if (hasSavedContent && !window.confirm("Gerar novamente substitui o conteúdo salvo desta peça. Ela continuará como rascunho e não será publicada. Deseja continuar?")) return;
    setGenerationCost(emptyGenerationCost()); setCostLabel("Custo desta geração");
    onError(""); onNotice(""); setGenerating(true); onPending(true);
    try {
      setGenerationProgress(post.channel === "carrossel" ? "Gerando texto e direções visuais…" : isBriefingDraft ? "Pesquisando fontes e preparando o briefing…" : "Gerando o conteúdo a partir da etapa aprovada…");
      const result = await fetchGenerationJson<GeneratedDraft & { generation_cost: GenerationCost }>(`/api/editorial/posts/${post.id}/generate`, {
        method: "POST",
        body: JSON.stringify({ revision: post.revision, working_title: draft.title }),
      }, recordGenerationCost);
      setGenerationProgress("Salvando a peça completa para revisão…");
      const saved = await persistDraft({ ...draft, title: result.title, body: result.body, hashtags: result.hashtags, slides: result.slides });
      setDraft(draftFromPost(saved));
      if (post.channel === "carrossel" && result.content_type === "carousel") {
        setCarouselImageRetry(null);
        const photoIndexes = saved.slides.flatMap((slide, index) => slide.visual_type === "photo" ? [index] : []);
        if (!photoIndexes.length) {
          await refresh();
          onNotice("Carrossel completo gerado e salvo para revisão. O manual definiu lâminas gráficas, então não há fotos a criar. Nada foi publicado.");
          return;
        }
        await generateCarouselImages({ slides: saved.slides, revision: saved.revision, slideIndexes: photoIndexes });
        return;
      }
      await refresh();
      const label = result.content_type === "briefing" ? "Briefing" : result.content_type === "article" ? "Artigo" : result.content_type === "newsletter" ? "Newsletter" : "Post de LinkedIn";
      onNotice(`${label} gerado e salvo em rascunho. Revise a peça antes de enviá-la para aprovação. Nada foi publicado.`);
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Não foi possível gerar e salvar a peça."); }
    finally { setGenerating(false); setGenerationProgress(""); onPending(false); }
  }

  function recordGenerationCost(cost: GenerationCost | undefined) {
    if (cost) setGenerationCost((current) => addGenerationCost(current ?? emptyGenerationCost(), cost));
  }

  async function generateCarouselImages(task: CarouselImageTask) {
    let revision = task.revision;
    let completed = 0;
    let existing = 0;
    let remaining = task.slideIndexes;
    setGenerating(true); onPending(true); setCarouselImageRetry(null); onError(""); onNotice("");
    try {
      const latest = await fetchJson<EditorialData>("/api/editorial");
      const currentPost = latest.posts.find((item) => item.id === post.id);
      if (!currentPost || JSON.stringify(currentPost.slides) !== JSON.stringify(task.slides)) {
        await refresh();
        onError("O carrossel mudou antes da geração das fotos. Atualize a peça e gere novamente para manter texto e imagens alinhados.");
        return;
      }
      revision = currentPost.revision;
      const fileName = (index: number) => `slide-${String(index + 1).padStart(2, "0")}.webp`;
      const existingNames = new Set(latest.assets.filter((asset) => asset.post_id === post.id).map((asset) => asset.file_name));
      const missing = task.slideIndexes.filter((index) => !existingNames.has(fileName(index)));
      existing = task.slideIndexes.length - missing.length;
      const capacity = Math.max(0, 10 - latest.assets.filter((asset) => asset.post_id === post.id).length);
      const toGenerate = missing.slice(0, capacity);

      if (!toGenerate.length && missing.length) {
        remaining = missing;
        setCarouselImageRetry({ slides: task.slides, revision, slideIndexes: remaining });
        setDraft((current) => ({ ...current, revision }));
        await refresh();
        onError("O texto está salvo, mas o carrossel já atingiu o limite de dez imagens. Remova uma imagem e retome a geração das fotos pendentes.");
        return;
      }

      for (const [position, index] of toGenerate.entries()) {
        setGenerationProgress(`Gerando foto ${position + 1} de ${toGenerate.length} · lâmina ${index + 1}…`);
        const result = await fetchGenerationJson<{ revision: number; generation_cost: GenerationCost }>(`/api/editorial/posts/${post.id}/generate-image`, {
          method: "POST",
          body: JSON.stringify({ revision, slide_index: index }),
        }, recordGenerationCost);
        revision = result.revision;
        completed += 1;
      }

      const updated = await fetchJson<EditorialData>("/api/editorial");
      const updatedPost = updated.posts.find((item) => item.id === post.id);
      const attachedNames = new Set(updated.assets.filter((asset) => asset.post_id === post.id).map((asset) => asset.file_name));
      remaining = task.slideIndexes.filter((index) => !attachedNames.has(fileName(index)));
      revision = updatedPost?.revision ?? revision;
      setDraft((current) => ({ ...current, revision }));
      await refresh();

      if (remaining.length) {
        setCarouselImageRetry({ slides: task.slides, revision, slideIndexes: remaining });
        onError(`O texto foi salvo e ${completed} foto(s) foram anexadas. ${remaining.length} foto(s) ficaram pendentes porque o carrossel atingiu o limite de dez imagens. Remova uma imagem e retome a geração.`);
        return;
      }

      setCarouselImageRetry(null);
      onNotice(`Carrossel completo gerado e salvo: texto e ${completed} foto(s) criada(s)${existing ? `; ${existing} imagem(ns) existente(s) foram preservadas` : ""}. O rascunho segue para revisão humana; nada foi publicado.`);
    } catch (cause) {
      let latestRevision = revision;
      try {
        const latest = await fetchJson<EditorialData>("/api/editorial");
        const currentPost = latest.posts.find((item) => item.id === post.id);
        if (currentPost && JSON.stringify(currentPost.slides) === JSON.stringify(task.slides)) {
          latestRevision = currentPost.revision;
          const attachedNames = new Set(latest.assets.filter((asset) => asset.post_id === post.id).map((asset) => asset.file_name));
          remaining = task.slideIndexes.filter((index) => !attachedNames.has(`slide-${String(index + 1).padStart(2, "0")}.webp`));
        }
      } catch { remaining = task.slideIndexes; }
      setDraft((current) => ({ ...current, revision: latestRevision }));
      if (remaining.length) setCarouselImageRetry({ slides: task.slides, revision: latestRevision, slideIndexes: remaining });
      await refresh();
      const detail = cause instanceof Error ? cause.message : "Não foi possível concluir a geração das fotos.";
      onError(`O texto está salvo${completed ? ` e ${completed} foto(s) foram anexadas` : ""}. ${remaining.length ? `${remaining.length} foto(s) continuam pendentes. Use “Retomar geração das fotos”.` : "Confira as imagens anexadas."} ${detail}`);
    } finally {
      setGenerationProgress(""); setGenerating(false); onPending(false);
    }
  }

  async function resumeCarouselImages() {
    if (!generationCost) { setGenerationCost(emptyGenerationCost()); setCostLabel("Custo desta retomada"); }
    if (carouselImageRetry) await generateCarouselImages(carouselImageRetry);
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
      {(canGenerate || post.channel === "carrossel") && <section className="editorial-ai" aria-labelledby="editorial-ai-title">
        <div className="editorial-ai__top"><div><h3 id="editorial-ai-title">{isBriefingDraft ? "Pesquisa e briefing" : isApprovedBriefing ? "Artigo a partir do briefing" : "Regenerar esta peça"}</h3><p className="editorial-muted">{isBriefingDraft ? "Esta ação isolada gera somente a pesquisa e o briefing. Para preparar artigo, newsletter, LinkedIn e carrossel em sequência, use a geração completa no topo." : isApprovedBriefing ? "Esta ação isolada gera o artigo a partir do briefing. A geração completa do ciclo também prepara os três derivados." : "Esta ação regenera somente a peça aberta, usando o artigo e as fontes registrados nesta semana."}</p></div><Button type="button" className="editorial-ai__action" variant="secondary" aria-label={`Gerar somente ${channelLabels[post.channel]} com OpenAI`} aria-describedby={post.channel === "carrossel" && carouselGenerationBlockReason ? "carousel-generation-help" : undefined} isPending={generating} isDisabled={generating || pending || !canGenerate} onPress={() => void generateDraft()}>{generating ? post.channel === "carrossel" ? "Gerando carrossel…" : "Gerando conteúdo…" : <span className="inline-flex items-center gap-2">Gerar só esta peça com <OpenAIMark /></span>}</Button></div>
        <p className="editorial-muted">Tema: {cycleTheme}. Esta ação salva um único rascunho. No carrossel, também cria as fotos indicadas pelo manual. As aprovações continuam humanas e nada é publicado automaticamente.</p>
        <GenerationCostSummary postId={post.id} revision={post.revision} stage={isBriefingDraft ? "briefing" : isApprovedBriefing ? "article" : post.channel} title={draft.title} enabled={canEdit && canGenerate && !generating} retryPhotos={carouselImageRetry?.slideIndexes.length ?? 0} cost={generationCost} costLabel={costLabel}/>
        {post.channel === "carrossel" && carouselGenerationBlockReason && <p id="carousel-generation-help" className="editorial-muted" role="status" aria-live="polite">{carouselGenerationBlockReason}</p>}
        {generating && <p className="editorial-muted" role="status" aria-live="polite">{generationProgress || "Aguardando a resposta da OpenAI…"}</p>}
        {carouselImageRetry && post.channel === "carrossel" && <div className="editorial-ai__actions"><p className="editorial-muted" role="status">O texto já está salvo. {carouselImageRetry.slideIndexes.length} foto(s) aguardam geração.</p><Button type="button" className="editorial-ai__action" variant="secondary" isPending={generating} isDisabled={generating || pending || dirty} onPress={() => void resumeCarouselImages()}>{generating ? "Retomando fotos…" : "Retomar geração das fotos"}</Button></div>}
        {post.channel === "news" && draft.body.includes("{{unsubscribe_url}}") && <Notice status="accent">Antes de disparar o HTML, substitua {"{{unsubscribe_url}}"} pelo link real da plataforma de e-mail.</Notice>}
      </section>}
      {canEdit && post.channel === "lkart" && <Notice status="accent">O manual Piersec não define um agente para Artigo LinkedIn. Este canal não recebe geração automática.</Notice>}
      {canEdit && post.channel !== "blog" && post.channel !== "lkart" && post.channel !== "carrossel" && post.status === "draft" && !hasApprovedArticle && <Notice status="accent">A geração isolada deste derivado usa o artigo aprovado. Para gerar todas as peças em sequência, use o botão de geração completa no topo do ciclo.</Notice>}
      {isApprovedArticle && <Notice status="accent">Este artigo já está aprovado. As peças derivadas podem usar esta versão como fonte.</Notice>}
      {isApprovedBriefing && <Notice status="accent">Briefing aprovado. Redija o artigo antes de agendar ou publicar esta peça.</Notice>}
      <TextField value={draft.title} onChange={(title) => setDraft((current) => ({ ...current, title }))} isReadOnly={generating || pending} isRequired><Label>Título</Label><Input minLength={3} maxLength={180}/></TextField>
      <TextField value={draft.body} onChange={(body) => setDraft((current) => ({ ...current, body }))} isReadOnly={generating || pending}><Label>Texto da publicação</Label><TextArea rows={9} maxLength={30000} placeholder="Escreva o conteúdo. Para enviar à aprovação, o texto precisa ter ao menos 20 caracteres."/></TextField>
      <TextField value={draft.hashtags} onChange={(hashtags) => setDraft((current) => ({ ...current, hashtags }))} isReadOnly={generating || pending}><Label>Hashtags</Label><TextArea rows={2} maxLength={1000} placeholder="#ciberseguranca #Piersec"/></TextField>
      <TextField value={draft.planned_for} onChange={(planned_for) => setDraft((current) => ({ ...current, planned_for }))} isReadOnly={generating || pending}><Label>Data e hora de publicação · São Paulo</Label><Input type="datetime-local"/></TextField>
      {post.channel === "carrossel" && <section className="editorial-slides"><div className="editorial-section-title"><div><h3>Lâminas do carrossel</h3><p className="editorial-muted">A estrutura Piersec usa capa, quatro a sete lâminas de conteúdo e um slide final.</p></div><Button variant="secondary" isDisabled={generating || pending || draft.slides.length >= 9} onPress={() => setDraft((current) => ({ ...current, slides: [...current.slides, { title: "", text: "", role: "content", visual_type: "graphic", visual_direction: "", source_attribution: "" }] }))}>Adicionar lâmina</Button></div>
        {draft.slides.map((slide, index) => {
          const generatedAsset = generatedAssetForSlide(index);
          return <div className="editorial-slide-fields" key={index}>
            <p className="editorial-muted">Lâmina {index + 1}{slide.role ? ` · ${slide.role === "cover" ? "capa" : slide.role === "final" ? "final" : "conteúdo"}` : ""}</p>
            <Choice value={slide.role ?? "content"} onChange={(value) => updateSlide(index, "role", value)} disabled={generating || pending} label={`Função da lâmina ${index + 1}`} options={[{ id: "cover", label: "Capa" }, { id: "content", label: "Conteúdo" }, { id: "final", label: "Final" }]}/>
            <TextField value={slide.title} onChange={(value) => updateSlide(index, "title", value)} isReadOnly={generating || pending}><Label>Título</Label><Input maxLength={180}/></TextField>
            <TextField value={slide.text} onChange={(value) => updateSlide(index, "text", value)} isReadOnly={generating || pending}><Label>Texto</Label><TextArea rows={2} maxLength={1200}/></TextField>
            <TextField value={slide.source_attribution ?? ""} onChange={(value) => updateSlide(index, "source_attribution", value)} isReadOnly={generating || pending}><Label>Fonte de apoio (nome exato da fonte do artigo)</Label><Input maxLength={240}/></TextField>
            <Choice value={slide.visual_type ?? "graphic"} onChange={(value) => updateSlide(index, "visual_type", value)} disabled={generating || pending} label={`Tipo visual da lâmina ${index + 1}`} options={[{ id: "photo", label: "Foto" }, { id: "graphic", label: "Gráfico" }]}/>
            <TextField value={slide.visual_direction ?? ""} onChange={(value) => updateSlide(index, "visual_direction", value)} isReadOnly={generating || pending}><Label>Direção visual</Label><TextArea rows={2} maxLength={600}/></TextField>
            {slide.visual_type === "photo" && <div className="editorial-image-generation">
              <p className="editorial-muted">A base fotográfica sem texto é gerada junto com o carrossel completo; a direção precisa estar em inglês, como determina o manual.</p>
              {generatedAsset && <p className="editorial-muted" role="status">Imagem anexada. Para manter texto e imagem sincronizados, a geração acontece pelo fluxo completo do carrossel.</p>}
            </div>}
            {draft.slides.length > 1 && <Button variant="ghost" isDisabled={generating || pending} onPress={() => setDraft((current) => ({ ...current, slides: current.slides.filter((_, slideIndex) => slideIndex !== index) }))}>Remover lâmina</Button>}
          </div>;
        })}
      </section>}
      <div className="editorial-actions"><Button type="submit" variant="primary" isPending={pending} isDisabled={generating || pending || !dirty}>{pending ? "Salvando…" : "Salvar rascunho"}</Button>{dirty && <span className="editorial-muted">Salve as alterações antes de enviar a peça para revisão ou anexar imagens.</span>}</div>
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
