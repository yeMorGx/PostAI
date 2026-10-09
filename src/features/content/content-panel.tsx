"use client";

import { useState } from "react";
import { Button, Form, Input, Label, TextArea, TextField } from "@heroui/react";
import { Choice, Notice, Panel } from "@/components/ui";
import type { Content, Member } from "@/lib/database.types";
import { can } from "@/lib/permissions";
import { contentSchema, type ContentInput } from "@/lib/schemas";
import { useContent } from "@/hooks/use-content";
import { ConfirmDialog } from "@/components/confirm-dialog";

const empty: ContentInput = { title: "", platform: "linkedin", body: "", planned_for: null };

export function ContentPanel({ member, initialData }: { member: Member; initialData: Content[] }) {
  const { query, save, remove } = useContent(member.workspace_id, initialData);
  const editable = can(member.role, "edit");
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [input, setInput] = useState<ContentInput>(empty); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const [target, setTarget] = useState<Content | null>(null);
  function open(content?: Content) { setEditing(content?.id ?? null); setInput(content ? { title: content.title, body: content.body, platform: content.platform, planned_for: content.planned_for } : empty); setError(""); setMessage(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const parsed = contentSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    try { await save.mutateAsync({ id: editing ?? undefined, input: parsed.data }); setEditing(undefined); setMessage("Rascunho salvo para a equipe."); }
    catch (error) { setError(error instanceof Error ? error.message : "Não foi possível salvar o conteúdo."); }
  }
  async function confirmRemove() {
    if (!target) return; setError("");
    try { await remove.mutateAsync(target.id); setTarget(null); setMessage("Rascunho removido."); }
    catch (error) { setTarget(null); setError(error instanceof Error ? error.message : "Não foi possível remover o conteúdo."); }
  }
  return <><header className="page-heading"><div><p className="eyeline mb-2">LinkedIn e Instagram</p><h1>Conteúdos</h1><p className="muted mt-3">Reúna temas e textos para as próximas peças da Piersec.</p></div>{editable && editing === undefined && <Button variant="primary" onPress={() => open()}>Novo rascunho</Button>}</header>
    {(error || query.error) && <Notice status="danger" className="mb-6">{error || query.error?.message}</Notice>}{message && <Notice status="success" className="mb-6">{message}</Notice>}
    {editing !== undefined ? <Panel className="p-6 sm:p-8" title={editable ? editing ? "Editar rascunho" : "Novo rascunho" : "Ver rascunho"}><Form onSubmit={submit} className="mt-6 space-y-5">
      <TextField value={input.title} onChange={(title) => setInput({ ...input, title })} isRequired isReadOnly={!editable}><Label>Título da pauta</Label><Input maxLength={180}/></TextField>
      <Choice label="Rede social" className="max-w-xs" value={input.platform} onChange={(platform) => setInput({ ...input, platform: platform as ContentInput["platform"] })} disabled={!editable} options={[{ id: "linkedin", label: "LinkedIn" }, { id: "instagram", label: "Instagram" }]}/>
      <TextField value={input.body} onChange={(body) => setInput({ ...input, body })} isReadOnly={!editable}><Label>Texto do rascunho</Label><TextArea rows={10} maxLength={12000}/></TextField>
      <p className="muted text-sm">O conteúdo fica salvo como rascunho. Salvar aqui não publica nas redes sociais.</p><div className="flex flex-wrap gap-3">{editable && <Button type="submit" variant="primary" isPending={save.isPending}>{save.isPending ? "Salvando…" : "Salvar rascunho"}</Button>}<Button type="button" variant="secondary" onPress={() => setEditing(undefined)} isDisabled={save.isPending}>Voltar aos conteúdos</Button></div></Form></Panel>
    : <Panel className="p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2>Rascunhos da equipe</h2><Button variant="secondary" onPress={() => { void query.refetch(); }} isPending={query.isFetching}>Atualizar lista</Button></div>{query.data.length ? <ul className="mt-4 divide-y divide-[#e9ecf2]">{query.data.map((content) => <li className="flex flex-wrap items-center justify-between gap-5 py-5" key={content.id}><div className="min-w-0"><p className="break-words font-semibold">{content.title}</p><p className="muted mt-1 text-sm">{content.platform === "linkedin" ? "LinkedIn" : "Instagram"} · Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(content.updated_at))}</p></div><div className="flex gap-3"><Button variant="secondary" onPress={() => open(content)}>{editable ? "Editar" : "Ver conteúdo"}</Button>{editable && <Button variant="danger-soft" onPress={() => setTarget(content)}>Remover</Button>}</div></li>)}</ul> : <div className="pb-10 pt-8"><h3>Nenhum rascunho por enquanto</h3><p className="muted mt-3">{editable ? "Crie a primeira pauta para começar a organizar o conteúdo." : "Os rascunhos aparecerão aqui quando a equipe começar a criar."}</p></div>}</Panel>}
    {target && <ConfirmDialog title="Remover este rascunho?" description={`O conteúdo “${target.title}” será removido do espaço Piersec.`} pending={remove.isPending} onConfirm={confirmRemove} onClose={() => setTarget(null)}/>}
  </>;
}
