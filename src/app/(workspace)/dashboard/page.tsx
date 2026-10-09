import { AppLink as Link, Notice, Panel, Badge } from "@/components/ui";
import { requirePageContext } from "@/lib/auth";
import { can } from "@/lib/permissions";

export default async function Dashboard() {
  const { supabase, workspace, member } = await requirePageContext();
  const result = await supabase.from("content_items").select("id,title,platform,updated_at").eq("workspace_id", workspace.id).order("updated_at", { ascending: false }).limit(5);
  if (result.error) throw result.error;
  const contents = result.data;
  return <><header className="page-heading"><div><p className="eyeline mb-2">Espaço Piersec</p><h1>Visão geral</h1><p className="muted mt-3">Organize os conteúdos e as pessoas que trabalham com você.</p></div>{can(member.role, "edit") && <Link variant="primary" className="" href="/content">Criar um rascunho</Link>}</header>
    <Panel className="p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><h2>Últimos conteúdos</h2><Link className="text-sm font-semibold underline underline-offset-4" href="/content">Ver conteúdos</Link></div>
      {contents.length ? <ul className="mt-5 divide-y divide-[#e9ecf2]">{contents.map((content) => <li key={content.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><Link href="/content" className="font-semibold underline decoration-[#dce0e8] underline-offset-4">{content.title}</Link><Badge>{content.platform === "linkedin" ? "LinkedIn" : "Instagram"}</Badge></li>)}</ul> : <div className="py-12"><h3>A primeira pauta começa aqui</h3><p className="muted mt-3 max-w-xl">{can(member.role, "edit") ? "Crie um rascunho para reunir o tema e o texto da próxima peça." : "Quando a equipe criar os primeiros rascunhos, eles aparecerão neste espaço."}</p></div>}
    </Panel>
    <section className="mt-8 grid gap-6 sm:grid-cols-2"><Panel className="p-6"><h2>Equipe Piersec</h2><p className="muted mt-3">Confira quem acompanha e prepara os conteúdos do espaço de trabalho.</p><Link variant="secondary" className=" mt-5" href="/team">Ver equipe e acessos</Link></Panel><Panel className="p-6"><h2>Padrões de conteúdo</h2><p className="muted mt-3">Consulte a voz da marca e a direção visual para LinkedIn e Instagram.</p><Link variant="secondary" className=" mt-5" href="/identity">Consultar padrões</Link></Panel></section>
    <Notice className="mt-8">Nesta primeira etapa, os rascunhos ficam salvos para a equipe. A geração com IA, o calendário e a publicação automática serão integrados nas próximas etapas.</Notice>
  </>;
}
