import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { email: { type: 'string' } } });
const email = values.email?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const appUrl = process.env.APP_URL;
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !url || !key || !appUrl) {
  throw new Error('Configure .env.local e execute: node --env-file=.env.local scripts/bootstrap-admin.mjs --email seu-email');
}
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { count, error: countError } = await client.from('workspace_members').select('*', { count: 'exact', head: true }).eq('role', 'admin');
if (countError) throw new Error('Não foi possível verificar o banco. Aplique as migrações antes de continuar.');
if (count) throw new Error('Já existe um administrador. Use a gestão de equipe para convidar outras pessoas.');
const { data: workspace, error: workspaceError } = await client.from('workspaces').select('id').eq('slug','piersec').single();
if (workspaceError) throw new Error('O espaço Piersec não foi encontrado.');
const { error: insertError } = await client.from('workspace_invitations').insert({ workspace_id: workspace.id, email, role: 'admin' });
if (insertError && insertError.code !== '23505') throw new Error('Não foi possível registrar o convite de administração.');
const { error: inviteError } = await client.auth.admin.inviteUserByEmail(email, { redirectTo: `${appUrl}/auth/confirm` });
if (inviteError) console.log('Convite registrado, mas o envio falhou. Se a conta já existir, use o link de entrada. Caso contrário, confira o serviço de e-mail.');
else console.log('Convite de administração enviado. Entre pelo link para ativar seu acesso.');
