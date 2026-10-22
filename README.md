# PostAI · Piersec

Aplicação interna para preparar conteúdos de LinkedIn e Instagram. Next.js App Router, TypeScript, Tailwind CSS 4 e HeroUI 3. Todos os controles, formulários, tabelas, cartões, avisos e modais usam HeroUI. TanStack Query gerencia consultas e atualizações otimistas; Zod valida as entradas; Supabase fornece Auth, Postgres e as políticas de acesso.

## Etapa implementada

- Um espaço exclusivo da Piersec, com perfis de leitura, edição, aprovação e administração.
- Entrada por link enviado por e-mail, convites com prazo e revogação.
- Administração de pessoas e perfis, com proteção do último administrador.
- Criação, edição, consulta e remoção de rascunhos por rede social.
- Geração OpenAI em etapas usando os documentos originais de `docs/piersec/baseline_piersec`: pesquisa e briefing com web search, artigo após aprovação do briefing e três derivados após aprovação do artigo.
- Saídas de newsletter em HTML Piersec, LinkedIn e carrossel. A direção visual vem do agente do manual; não se pede ao modelo que devolva prompts de imagem.
- Geração sob demanda de bases fotográficas em WebP para lâminas marcadas como foto, usando a API de imagens da OpenAI e o mesmo segredo `OPENAI_API_KEY`.
- Estimativa automática de custo em USD junto ao botão de geração, com texto, pesquisa e até nove fotos. Após a resposta, a tela soma o consumo informado pela API, incluindo uma eventual correção e fotos concluídas antes de falhas.
- Histórico de ações no banco, atribuição de autoria e revisão incremental dos rascunhos.
- Referência de conteúdo extraída dos materiais fornecidos. O HTML orienta cores, tipografia e composição. Os originais em Downloads não foram alterados.

Cada clique em gerar salva a etapa em rascunho para revisão humana; no carrossel, gera também as fotos indicadas pelo roteiro. A equipe aprova cada etapa e confirma as quatro peças antes do agendamento. O servidor consulta automaticamente a base Piersec pelo tema e lê a voz da marca e o agente correspondente em `docs/piersec/baseline_piersec`; esses arquivos são incluídos no pacote de cada rota pela configuração de rastreamento do Next.js. A imagem gerada é uma base fotográfica sem texto, armazenada no bucket privado `editorial-media` do Supabase e associada ao slide pelo nome do arquivo. Artigos LinkedIn legados podem permanecer nos ciclos antigos; novas semanas seguem os quatro canais do manual. Sem configuração do Supabase, a aplicação apresenta a configuração inicial e a tela de entrada desabilitada.

O cálculo de custo usa as tarifas Standard conferidas em 22/10/2026, em `src/lib/generation-cost.ts`. A previsão de tokens textuais é uma heurística pelo tamanho UTF-8, com margem para saída, uma correção automática e, no briefing, até quatro chamadas de busca. A previsão das fotos usa a fórmula da [calculadora oficial](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency) em 1088 × 1360, qualidade alta. A faixa é uma estimativa, não um teto de cobrança. O valor apurado usa `usage`, descontos de cache e pesquisas retornados pela API. Modelos ou consumos sem tarifa reconhecida aparecem como indisponíveis ou parciais. O total acompanha a geração enquanto a peça estiver aberta; não é um histórico financeiro persistente. Valores não incluem câmbio ou impostos. A consulta da estimativa não chama a OpenAI nem consome créditos. Se a saída falhar na validação do manual, o servidor tenta uma única correção automática; para descrição SEO fora de 150 a 160 caracteres, corrige apenas esse campo e preserva o artigo.

## Executar

Requer Node.js 22 ou superior e pnpm.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Abra http://localhost:3000. Preencha `.env.local` com a URL e a chave publicável de um projeto Supabase dedicado ao PostAI. `SUPABASE_SECRET_KEY` é uma chave de servidor usada exclusivamente para enviar convites; nunca acrescente o prefixo `NEXT_PUBLIC_`. Configure `APP_URL` com a origem real da aplicação, sem barra final.

Para gerar textos e imagens, configure a mesma `OPENAI_API_KEY` como variável de servidor no `.env.local` e na Vercel. Nunca use o prefixo `NEXT_PUBLIC_` nessa chave. `OPENAI_MODEL` é opcional e usa `gpt-6-luna` por padrão. `OPENAI_IMAGE_MODEL` é opcional e usa `gpt-image-2.5-flare` por padrão.

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

Não há segredos no cliente, cadastro aberto ou renderização de HTML de usuários. Respostas autenticadas usam cache privado e `no-store`. A chave OpenAI fica no servidor e ambas as gerações exigem permissão de edição. O texto só é gravado quando a equipe aplica a prévia e salva o rascunho; cada imagem gerada é anexada ao carrossel pelo servidor e invalida a aprovação da versão anterior. A auditoria registra metadados das ações sem copiar textos de rascunhos. A composição e exportação da lâmina final ainda exigem uma etapa própria; a integração social exigirá OAuth, tokens protegidos, aprovação da revisão exata e publicação idempotente.

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
3. Composição e exportação das lâminas finais a partir das bases fotográficas e do texto aprovado, com os elementos oficiais da marca.
4. OAuth de LinkedIn/Instagram, fila de publicação com retentativas, idempotência e auditoria. Nenhuma publicação sem aprovação.
5. Compartilhamento com tokens aleatórios armazenados como hash, expiração, revogação e acesso limitado ao recurso; notificações/feed. Integração com calendário externo será definida posteriormente.

## Referências

[HeroUI](https://heroui.com/en/docs/react/components), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Realtime privado](https://supabase.com/docs/guides/realtime/authorization).
