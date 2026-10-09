# Configuração do projeto PostAI

Atualizado em 9 de outubro de 2026.

- Projeto: `PostAI`, referência `ibngiqkihjzadsyiedbz`.
- Organização criada pelo usuário: `Piersec`, referência `oqaqufyksjhpwdvxkdlt`.
- URL: `https://ibngiqkihjzadsyiedbz.supabase.co`.
- Credenciais salvas em `.env.local`, ignorado pelo Git. A chave de servidor não está no código nem na documentação.
- Migração `20261009183822_piersec_access_and_drafts.sql` aplicada pelo SQL Editor; RLS confirmado nas cinco tabelas.
- Cadastro público desabilitado; contas anônimas desabilitadas; confirmação de e-mail habilitada.
- Site URL: `http://localhost:3000`. Redirecionamentos permitidos: `/auth/confirm` e `/auth/callback`, nessa mesma origem.
- Convite de administrador registrado para `gabriel.goes@piersec.com.br`. O envio foi tentado após configurar SMTP, mas o serviço de autenticação retornou erro. A ativação permanece pendente.

## Pendência de e-mail

O usuário confirmou que o remetente pertence ao Microsoft 365 da Piersec. SMTP habilitado com suas credenciais; host corrigido para `smtp.office365.com`, porta 587, e configuração persistida no painel. Modelos de convite e magic link aplicados com verificação de `TokenHash` no servidor. O painel confirmou a gravação do modelo de entrada.

O envio retornou HTTP 504. Os logs Auth registraram `context deadline exceeded`, código `request_timeout`, em `/invite`. Há também eventos tardios com status 200; eles não comprovam entrega: uma consulta posterior à API administrativa não encontrou a conta do destinatário. A ativação permanece pendente. O usuário confirmou que SMTP autenticado está habilitado na caixa. A causa específica do timeout não foi identificada; o próximo diagnóstico é consultar os logs de entrada do remetente no Microsoft Entra, incluindo entradas não interativas, no período de 16:59–17:01 (America/Sao_Paulo), em 9 de outubro de 2026. Uma política de autenticação pode impedir SMTP com usuário/senha mesmo com SMTP autenticado habilitado, mas isso não foi confirmado neste tenant. Não guardar a senha SMTP no repositório ou em mensagens.

Depois, enviar o convite com:

```powershell
node --env-file=.env.local scripts/bootstrap-admin.mjs --email gabriel.goes@piersec.com.br
```

O convite já registrado pode ser reutilizado pelo script. A associação com perfil de administração será criada após o e-mail ser confirmado pelo destinatário.

## Histórico da migração

A CLI local não estava autenticada, e o novo projeto não apareceu nas contas dos conectores disponíveis. A migração foi executada pelo painel, sem registro na tabela de histórico da CLI. **Não executar `db push` desta migração novamente.** Após autenticar a CLI e confirmar que está conectada ao projeto acima, registrar a versão aplicada:

```powershell
pnpm exec supabase migration repair 20261009183822 --status applied --project-ref ibngiqkihjzadsyiedbz
```

Esse comando só deve ser usado neste projeto, onde a migração foi aplicada e as tabelas foram verificadas. Depois disso, migrações futuras podem seguir o fluxo normal da CLI.
