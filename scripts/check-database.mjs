import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Emulate Supabase's platform schemas, then run the unmodified application migration.
const db = new PGlite();
await db.exec(`
  create role anon;
  create role authenticated;
  create role service_role bypassrls;
  create schema auth;
  create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema public, auth to authenticated, anon, service_role;
  grant execute on function auth.uid() to authenticated, anon, service_role;
  create schema realtime;
  create table realtime.messages(id uuid default gen_random_uuid(), extension text);
  alter table realtime.messages enable row level security;
  create function realtime.topic() returns text language sql stable as $$
    select current_setting('request.realtime.topic', true)
  $$;
  grant usage on schema realtime to authenticated;
  grant select, insert on realtime.messages to authenticated;
  grant execute on function realtime.topic() to authenticated;
`);
for (const file of (await readdir('supabase/migrations')).filter((f) => f.endsWith('.sql')).sort()) {
  await db.exec(await readFile(`supabase/migrations/${file}`, 'utf8'));
}
const workspace = (await db.query(`select id from public.workspaces`)).rows[0].id;
const users = {};
for (const role of ['admin', 'editor', 'approver', 'viewer', 'outsider', 'invitee', 'unverified']) {
  const id = crypto.randomUUID(); users[role] = id;
  await db.query(`insert into auth.users values ($1,$2,$3)`, [id, `${role}@piersec.test`, role === 'unverified' ? null : new Date().toISOString()]);
  if (['admin', 'editor', 'approver', 'viewer'].includes(role)) {
    await db.query(`insert into public.workspace_members(workspace_id,user_id,email,role) values ($1,$2,$3,$4)`, [workspace, id, `${role}@piersec.test`, role]);
  }
}

async function as(role, sql, values = [], topic = '') {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role === 'anon' ? 'anon' : 'authenticated'}`);
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.realtime.topic', $2, true)`, [users[role] ?? '', topic]);
    return tx.query(sql, values);
  });
}
let checks = 0;
async function check(name, action) { await action(); checks++; console.log(`PASS ${name}`); }
async function denied(action, code = '42501') {
  try { await action(); assert.fail('Expected access to be denied'); }
  catch (error) { assert.equal(error.code, code, error.message); }
}

try {
  await check('Anonymous users cannot read application tables', () => denied(() => as('anon', 'select * from public.workspaces')));
  await check('Authenticated outsiders cannot read members or workspaces', async () => {
    assert.equal((await as('outsider', 'select * from public.workspaces')).rows.length, 0);
    assert.equal((await as('outsider', 'select * from public.workspace_members')).rows.length, 0);
  });
  await check('Only the Piersec singleton workspace can exist', () => denied(() => db.query(`insert into public.workspaces(slug,name) values ('other','Other')`), '23514'));
  let content;
  await check('Editors can create drafts, with server-owned audit fields', async () => {
    content = (await as('editor', `insert into public.content_items(workspace_id,title,platform,body) values ($1,'Primeira pauta','linkedin','Texto') returning *`, [workspace])).rows[0];
    assert.equal(content.created_by, users.editor); assert.equal(content.revision, 1);
  });
  await check('Readers and approvers cannot insert drafts', async () => {
    for (const role of ['viewer','approver','outsider']) await denied(() => as(role, `insert into public.content_items(workspace_id,title,platform) values ($1,'Pauta proibida','instagram')`, [workspace]));
  });
  await check('Readers cannot update or delete drafts', async () => {
    assert.equal((await as('viewer', `update public.content_items set title='Alterado' where id=$1 returning id`, [content.id])).rows.length, 0);
    assert.equal((await as('approver', `delete from public.content_items where id=$1 returning id`, [content.id])).rows.length, 0);
  });
  await check('Editors cannot forge attribution or move content', () => denied(() => as('editor', `update public.content_items set created_by=$1 where id=$2`, [users.admin, content.id])));
  await check('Content changes advance revision and create immutable activity', async () => {
    const updated = (await as('editor', `update public.content_items set body='Versão nova' where id=$1 returning *`, [content.id])).rows[0];
    assert.equal(updated.revision, 2); assert.equal(updated.updated_by, users.editor);
    assert.equal((await as('viewer', `select * from public.activity_log where resource_id=$1`, [content.id])).rows.length, 2);
    await denied(() => as('admin', `delete from public.activity_log`));
  });
  await check('Members cannot promote themselves using direct table writes or RPC', async () => {
    await denied(() => as('editor', `update public.workspace_members set role='admin' where user_id=$1`, [users.editor]));
    await denied(() => as('editor', `select public.change_member_role($1,'admin')`, [users.editor]));
  });
  await check('Last administrator cannot be removed or demoted', async () => {
    await denied(() => as('admin', `select public.change_member_role($1,'viewer')`, [users.admin]), 'P0001');
    await denied(() => as('admin', `select public.remove_workspace_member($1)`, [users.admin]), 'P0001');
  });
  await check('Admin can grant and revoke a role', async () => {
    await as('admin', `select public.change_member_role($1,'admin')`, [users.editor]);
    await as('admin', `select public.change_member_role($1,'editor')`, [users.editor]);
  });
  await check('Only admin can create and inspect invitations', async () => {
    await denied(() => as('editor', `insert into public.workspace_invitations(workspace_id,email,role) values ($1,'extra@piersec.test','admin')`, [workspace]));
    await as('admin', `insert into public.workspace_invitations(workspace_id,email,role) values ($1,'invitee@piersec.test','viewer'),($1,'unverified@piersec.test','editor')`, [workspace]);
    assert.equal((await as('viewer', `select * from public.workspace_invitations`)).rows.length, 0);
  });
  await check('Confirmed email matching an invitation can join once', async () => {
    await denied(() => as('outsider', `select public.accept_piersec_invitation()`));
    await denied(() => as('unverified', `select public.accept_piersec_invitation()`));
    await as('invitee', `select public.accept_piersec_invitation()`);
    await as('invitee', `select public.accept_piersec_invitation()`);
    assert.equal((await as('invitee', `select role from public.workspace_members where user_id=$1`, [users.invitee])).rows[0].role, 'viewer');
  });
  await check('Removed members lose database access immediately with the same JWT identity', async () => {
    await as('admin', `select public.remove_workspace_member($1)`, [users.invitee]);
    assert.equal((await as('invitee', `select * from public.content_items`)).rows.length, 0);
    await denied(() => as('invitee', `select public.accept_piersec_invitation()`));
  });
  await check('Revoked and expired invitations cannot grant access', async () => {
    const invite = (await as('admin', `insert into public.workspace_invitations(workspace_id,email,role) values ($1,'outsider@piersec.test','viewer') returning id`, [workspace])).rows[0].id;
    await as('admin', `select public.revoke_workspace_invitation($1)`, [invite]);
    await denied(() => as('outsider', `select public.accept_piersec_invitation()`));
    await as('admin', `insert into public.workspace_invitations(workspace_id,email,role) values ($1,'outsider@piersec.test','viewer')`, [workspace]);
    await db.query(`update public.workspace_invitations set created_at=now()-interval '8 days', expires_at=now()-interval '1 day' where email='outsider@piersec.test' and revoked_at is null`);
    await denied(() => as('outsider', `select public.accept_piersec_invitation()`));
  });
  await check('Private realtime channels reject outsiders and viewer document writes', async () => {
    await as('viewer', `insert into realtime.messages(extension) values ('presence')`, [], `content:${content.id}`);
    await denied(() => as('viewer', `insert into realtime.messages(extension) values ('broadcast')`, [], `content:${content.id}`));
    await denied(() => as('outsider', `insert into realtime.messages(extension) values ('presence')`, [], `workspace:${workspace}`));
    await denied(() => as('editor', `insert into realtime.messages(extension) values ('broadcast')`, [], 'content:not-a-valid-id'));
    await as('editor', `insert into realtime.messages(extension) values ('broadcast')`, [], `content:${content.id}`);
  });
  const tables = (await db.query(`select tablename, rowsecurity from pg_tables where schemaname='public'`)).rows;
  await check('All application tables have RLS enabled', async () => assert.ok(tables.every((t) => t.rowsecurity)));
  console.log(`${checks} database security checks passed. Supabase Auth/Realtime transport needs separate integration validation.`);
} finally { await db.close(); }
