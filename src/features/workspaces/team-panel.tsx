"use client";

import { useState } from "react";
import { Button, Chip, Form, Input, Label, Table, TextField } from "@heroui/react";
import { Choice, Notice, Panel } from "@/components/ui";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/database.types";
import { can, roles, roleLabels, type Role } from "@/lib/permissions";
import { invitationSchema } from "@/lib/schemas";
import { useTeam, type TeamData } from "@/hooks/use-team";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function TeamPanel({ member, initialData }: { member: Member; initialData: TeamData }) {
  const { query, invite, changeRole, removeMember, revoke } = useTeam(member.workspace_id, initialData);
  const router = useRouter(); const admin = can(member.role, "manage_team");
  const [email, setEmail] = useState(""); const [role, setRole] = useState<Role>("editor");
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [target, setTarget] = useState<Member | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const result = invitationSchema.safeParse({ email: email.trim(), role });
    if (!result.success) { setError("Informe um e-mail válido e um perfil de acesso."); return; }
    try { const response = await invite.mutateAsync(result.data); setMessage(response.warning ?? "Convite enviado. A pessoa terá acesso após entrar com o e-mail convidado."); setEmail(""); }
    catch (error) { setError(error instanceof Error ? error.message : "Não foi possível criar o convite."); }
  }
  async function updateRole(userId: string, nextRole: Role) {
    setError(""); setMessage("");
    try { await changeRole.mutateAsync({ userId, role: nextRole }); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Não foi possível alterar o acesso."); }
  }
  async function remove() {
    if (!target) return; setError("");
    try { await removeMember.mutateAsync(target.user_id); setTarget(null); router.refresh(); }
    catch (error) { setTarget(null); setError(error instanceof Error ? error.message : "Não foi possível remover o acesso."); }
  }
  async function revokeInvite(id: string) {
    setError(""); setMessage("");
    try { await revoke.mutateAsync(id); setMessage("Convite revogado."); }
    catch (error) { setError(error instanceof Error ? error.message : "Não foi possível revogar o convite."); }
  }
  return <div className="space-y-6">
    <header className="page-heading"><div><p className="eyeline mb-2">Espaço Piersec</p><h1>Equipe e acessos</h1><p className="muted mt-3">Quem pode acompanhar, editar e aprovar os conteúdos.</p></div><Button variant="secondary" onPress={() => { void query.refetch(); }} isPending={query.isFetching}>Atualizar equipe</Button></header>
    {(error || query.error) && <Notice status="danger">{error || query.error?.message}</Notice>}{message && <Notice status="success">{message}</Notice>}
    <Panel title="Pessoas da equipe" className="p-5"><Table><Table.ScrollContainer><Table.Content aria-label="Pessoas da equipe Piersec"><Table.Header><Table.Column isRowHeader>Pessoa</Table.Column><Table.Column>Perfil de acesso</Table.Column><Table.Column>Ações</Table.Column></Table.Header><Table.Body>{query.data.members.map((person) => <Table.Row key={person.user_id} id={person.user_id}><Table.Cell><p className="font-semibold">{person.display_name || person.email}{person.user_id === member.user_id && " (você)"}</p>{person.display_name && <p className="muted text-sm">{person.email}</p>}</Table.Cell><Table.Cell>{admin ? <Choice label={`Perfil de ${person.email}`} className="min-w-40" value={person.role} disabled={changeRole.isPending} onChange={(value) => { void updateRole(person.user_id, value as Role); }} options={roles.map((id) => ({ id, label: roleLabels[id] }))}/> : <Chip>{roleLabels[person.role]}</Chip>}</Table.Cell><Table.Cell>{admin ? <Button variant="danger-soft" onPress={() => setTarget(person)}>Remover</Button> : "—"}</Table.Cell></Table.Row>)}</Table.Body></Table.Content></Table.ScrollContainer></Table></Panel>
    {admin && <Panel title="Convidar uma pessoa" className="p-6"><p className="muted mt-2">O convite vale por sete dias e só pode ser usado pelo e-mail informado.</p><Form className="mt-5 flex flex-wrap items-end gap-4" onSubmit={submit}><TextField className="min-w-0 flex-[2_1_240px]" type="email" value={email} onChange={setEmail} isRequired isDisabled={invite.isPending}><Label>E-mail</Label><Input/></TextField><Choice label="Perfil de acesso do convite" className="flex-[1_1_180px]" value={role} onChange={(value) => setRole(value as Role)} disabled={invite.isPending} options={roles.map((id) => ({ id, label: roleLabels[id] }))}/><Button type="submit" variant="primary" isPending={invite.isPending}>{invite.isPending ? "Enviando…" : "Enviar convite"}</Button></Form></Panel>}
    {admin && <Panel title="Convites pendentes" className="p-6">{!query.data.invitations.length ? <p className="muted mt-3">Nenhum convite pendente.</p> : <ul className="mt-4 divide-y divide-[#e9ecf2]">{query.data.invitations.map((invitation) => <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="break-all font-semibold">{invitation.email}</p><p className="muted text-sm">{roleLabels[invitation.role]} · Validade até {new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(invitation.expires_at))}</p></div><Button variant="secondary" isDisabled={revoke.isPending} onPress={() => { void revokeInvite(invitation.id); }}>Revogar convite</Button></li>)}</ul>}</Panel>}
    <section className="grid gap-4 sm:grid-cols-2"><div><h3>Leitura e edição</h3><p className="muted mt-2">Leitura acompanha os conteúdos. Edição pode criar e alterar rascunhos.</p></div><div><h3>Aprovação e administração</h3><p className="muted mt-2">Aprovação revisa a programação. Administração também gerencia a equipe.</p></div></section>
    {target && <ConfirmDialog title="Remover acesso à Piersec?" description={`${target.email} deixará de acessar o espaço de trabalho.`} pending={removeMember.isPending} onConfirm={remove} onClose={() => setTarget(null)}/>}
  </div>;
}
