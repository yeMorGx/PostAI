import { AppLink as Link, Notice } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/features/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const configured = isSupabaseConfigured();
  return <div className="auth-layout">
    <aside className="auth-aside"><BrandLogo/><p className="mt-2 text-[#bcc6d8]">Conteúdo da Piersec</p><div className="auth-message my-auto py-16"><h1 className="max-w-sm text-[46px]">Da pauta à próxima publicação.</h1><p className="mt-6 max-w-sm text-[#bcc6d8]">Planeje com a equipe. Mantenha textos, imagens e decisões no mesmo espaço.</p></div><p className="text-sm text-[#bcc6d8]">Acesso exclusivo por convite</p></aside>
    <main className="auth-main"><div className="w-full max-w-md"><h1>Entrar no PostAI</h1><p className="muted mt-3">Você recebe um link no e-mail para acessar o espaço de trabalho.</p>
      {!configured && <Notice className="mt-6">A conexão com o banco ainda precisa ser configurada. <Link href="/setup" className="font-semibold underline">Ver configuração</Link></Notice>}
      {reason && <Notice status="danger" className="mt-6">{reason === "expired" ? "Este link expirou ou já foi usado. Peça um novo link de entrada." : "Esta conta ainda não tem acesso. Confira se seu convite está ativo com a administração."}</Notice>}
      <LoginForm configured={configured}/>
    </div></main>
  </div>;
}
