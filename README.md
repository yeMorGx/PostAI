# PostAI · Piersec

Aplicação interna para preparar conteúdos de LinkedIn e Instagram. Next.js App Router, TypeScript, Tailwind CSS 4 e HeroUI 3. Todos os controles, formulários, tabelas, cartões, avisos e modais usam HeroUI. TanStack Query gerencia consultas e atualizações otimistas; Zod valida as entradas; Supabase fornece Auth, Postgres e as políticas de acesso.

## Etapa implementada

- Um espaço exclusivo da Piersec, com perfis de leitura, edição, aprovação e administração.
- Entrada por link enviado por e-mail, convites com prazo e revogação.
- Administração de pessoas e perfis, com proteção do último administrador.
- Criação, edição, consulta e remoção de rascunhos por rede social.
- Histórico de ações no banco, atribuição de autoria e revisão incremental dos rascunhos.
- Referência de conteúdo extraída dos materiais fornecidos. O HTML orienta cores, tipografia e composição. Os originais em Downloads não foram alterados.

O perfil de aprovação está reservado para o fluxo da próxima etapa. Esta entrega não gera imagens/textos com IA, não publica nas redes, nem implementa presença ou edição colaborativa. Sem configuração do Supabase, a aplicação apresenta a configuração inicial e a tela de entrada desabilitada. Não há dados fictícios nem autenticação simulada.

## Executar

Requer Node.js 22 ou superior e pnpm.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Abra http://localhost:3000. Preencha `.env.local` com a URL e a chave publicável de um projeto Supabase dedicado ao PostAI. `SUPABASE_SECRET_KEY` é uma chave de servidor usada exclusivamente para enviar convites; nunca acrescente o prefixo `NEXT_PUBLIC_`. Configure `APP_URL` com a origem real da aplicação, sem barra final.

### Preparar o Supabase

O PostAI foi conectado ao projeto criado pelo usuário. Consulte [o estado da configuração](docs/supabase-setup.md) antes de aplicar migrações neste ambiente; o SMTP permanece pendente. Os comandos abaixo descrevem a preparação de um banco novo.

```powershell
pnpm exec supabase login
pnpm exec supabase link --project-ref SEU_PROJECT_REF
pnpm exec supabase db push --dry-run
pnpm exec supabase db push
```

Para desenvolvimento local com Docker ativo, use `pnpm exec supabase start` e `pnpm exec supabase db reset`. O arquivo `supabase/config.toml` configura o ambiente local; a hospedagem exige aplicar as seguintes configurações no Dashboard do projeto remoto:

1. Desabilitar cadastro público e usuários anônimos. Convites são enviados pelo administrador.
2. Configurar Site URL para o valor de `APP_URL`. Permitir exatamente `/auth/confirm` e `/auth/callback` nessa origem; não usar curingas em produção.
3. Substituir os modelos Invite e Magic Link pelos arquivos de `supabase/templates`. Eles verificam o token no servidor e permitem abrir o link em outro navegador.
4. Configurar SMTP com remetente da empresa. Limitar envios e pedidos de entrada; expiração sugerida de links e JWT: 15 minutos.
5. Manter o schema `private` fora dos schemas expostos pela Data API. Manter RLS de `realtime.messages` e habilitar apenas canais privados quando a colaboração for implementada.

Depois de aplicar a migração, convide o primeiro administrador:

```powershell
node --env-file=.env.local scripts/bootstrap-admin.mjs --email EMAIL_DO_ADMIN
```

O script recusa execução se já existir um administrador. A pessoa recebe o convite e ativa a associação ao entrar pelo link. A partir daí, convites são gerenciados em **Equipe e acessos**.

## Estrutura

```text
src/app/                       Rotas, layouts e handlers de API
src/components/                Shell e componentes HeroUI compartilhados
src/features/auth/             Formulário de entrada
src/features/workspaces/       Administração de equipe
src/features/content/          Lista e formulário de rascunhos
src/hooks/                     TanStack Query e mutations
src/lib/supabase/               Clientes de navegador, servidor e administração
src/lib/                       Validação, permissões, tipos e controle de acesso
supabase/migrations/           Schema SQL, grants, triggers e RLS
supabase/templates/            E-mails de convite e entrada
scripts/                       Bootstrap e verificação local do banco
```

## Segurança e limites

Todas as tabelas da aplicação têm RLS. O acesso depende de associações atuais no banco, sem confiar em `user_metadata`. Roles não podem ser promovidas por atualização direta. As operações de administração validam o ator e usam funções com `search_path` vazio. O último administrador é protegido com bloqueio transacional.

As APIs validam origem nas mutações, tamanho do payload, formato e autorização. Campos como `workspace_id`, autoria e revisão são definidos no servidor/banco. Convites exigem correspondência com e-mail confirmado, prazo válido e ausência de revogação. A remoção de um membro impede novas operações mesmo com JWT ainda válido. Os canais Realtime já têm políticas por workspace/recurso; o transporte e a interface colaborativa serão implementados posteriormente.

Não há segredos no cliente, cadastro aberto ou renderização de HTML de usuários. Respostas autenticadas usam cache privado e `no-store`. A auditoria registra metadados das ações sem copiar textos de rascunhos. Adicionar a integração OpenAI exigirá limites de gasto/uso e armazenamento privado; a integração social exigirá OAuth, tokens protegidos, aprovação da revisão exata e publicação idempotente.

## Verificações disponíveis

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm db:check
```

`db:check` aplica as migrações em Postgres embarcado (PGlite), com representações locais das interfaces Auth e Realtime. Verifica papéis, grants, convites, auditoria, revogação e canais privados. Não substitui a verificação de e-mails, sessões e transporte Realtime em um projeto Supabase real.

## Próximas etapas

1. Presença, comentários em threads, menções e atribuições com Supabase Realtime e RLS.
2. Tiptap + Yjs, provider privado, snapshots, restauração e sugestões. Não incluir cursores multiplayer ou chat.
3. OpenAI no servidor: textos por rede social e imagens, regras Piersec versionadas, fontes revisáveis e controle de uso.
4. Planejamento semanal e calendário próprio em `America/Sao_Paulo`; aprovação do lote pelo marketing e invalidação da aprovação após alterações.
5. OAuth de LinkedIn/Instagram, fila de publicação com retentativas, idempotência e auditoria. Nenhuma publicação sem aprovação.
6. Compartilhamento com tokens aleatórios armazenados como hash, expiração, revogação e acesso limitado ao recurso; notificações/feed. Integração com calendário externo será definida posteriormente.

## Referências

[HeroUI](https://heroui.com/en/docs/react/components), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Realtime privado](https://supabase.com/docs/guides/realtime/authorization).
