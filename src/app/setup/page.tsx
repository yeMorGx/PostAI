import { AppLink as Link, Panel } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SetupPage() {
  const configured = isSupabaseConfigured();
  return <div className="auth-layout">
    <aside className="auth-aside"><BrandLogo/><p className="mt-2 text-[#bcc6d8]">Conteúdo da Piersec</p>
      <div className="auth-message my-auto py-16"><div className="mb-6 h-1 w-12 bg-[#33c3ed]"/><h1 className="max-w-sm text-[46px]">Uma semana de conteúdo, organizada.</h1><p className="mt-6 max-w-sm text-[#bcc6d8]">O espaço de trabalho da equipe para preparar as peças de LinkedIn e Instagram.</p></div>
      <p className="text-sm text-[#bcc6d8]">Uso interno da Piersec</p></aside>
    <main className="auth-main"><div className="w-full max-w-xl"><p className="eyeline mb-3">Configuração inicial</p><h1>Conecte o espaço Piersec</h1><p className="muted mt-4">A interface está pronta para conectar ao banco. Os conteúdos e acessos serão carregados após a configuração.</p>
      <ol className="mt-8 space-y-6"><li><Panel className="p-5"><h2 className="text-xl">1. Conectar o Supabase</h2><p className="muted mt-2">Configure as variáveis locais com a URL do projeto e sua chave publicável.</p><code className="mt-3 block break-all text-sm">NEXT_PUBLIC_SUPABASE_URL<br/>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code></Panel></li>
      <li><Panel className="p-5"><h2 className="text-xl">2. Preparar o banco e o acesso</h2><p className="muted mt-2">Aplique as migrações e cadastre o primeiro administrador seguindo o README do projeto.</p></Panel></li>
      <li><Panel className="p-5"><h2 className="text-xl">3. Convidar a equipe</h2><p className="muted mt-2">Após entrar, a administração poderá convidar quem edita, aprova ou acompanha os conteúdos.</p></Panel></li></ol>
      <div className="mt-8 flex flex-wrap items-center gap-4"><Link variant="primary" className="" href="/login">Ver tela de entrada</Link><span className="muted text-sm">{configured ? "Conexão configurada" : "Aguardando conexão com o banco"}</span></div>
    </div></main>
  </div>;
}
