import { AppLink as Link, Notice } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/features/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const configured = isSupabaseConfigured();
  return <main className="auth-main login-main"><div className="w-full max-w-md">
      <h1 className="login-heading" aria-label="Entrar no PostAI"><span>Entrar no</span><BrandLogo inline/></h1>
      <p className="muted mt-5">Você recebe um link no e-mail para acessar o espaço de trabalho.</p>
      {!configured && <Notice className="mt-6">A conexão com o banco ainda precisa ser configurada. <Link href="/setup" className="font-semibold underline">Ver configuração</Link></Notice>}
      {reason && <Notice status="danger" className="mt-6">{reason === "expired" ? "Este link expirou ou já foi usado. Peça um novo link de entrada." : "Esta conta ainda não tem acesso. Confira se seu convite está ativo com a administração."}</Notice>}
      <LoginForm configured={configured}/>
    </div></main>;
}
