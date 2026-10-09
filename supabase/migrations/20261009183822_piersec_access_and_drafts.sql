begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create type public.workspace_role as enum ('viewer', 'editor', 'approver', 'admin');
create type public.social_platform as enum ('linkedin', 'instagram');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default 'piersec' check (slug = 'piersec'),
  name text not null default 'Piersec' check (char_length(name) between 1 and 100),
  timezone text not null default 'America/Sao_Paulo' check (timezone = 'America/Sao_Paulo'),
  singleton boolean not null default true unique check (singleton),
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null check (email = lower(btrim(email))),
  display_name text not null default '' check (char_length(display_name) <= 100),
  role public.workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  unique (workspace_id, email)
);
create index workspace_members_user_id_idx on public.workspace_members(user_id);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and char_length(email) <= 254),
  role public.workspace_role not null,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  check (expires_at > created_at)
);
create unique index invitations_pending_email_idx on public.workspace_invitations(workspace_id, email)
  where accepted_at is null and revoked_at is null;

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 180),
  platform public.social_platform not null,
  body text not null default '' check (char_length(body) <= 12000),
  planned_for timestamptz,
  revision integer not null default 1,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id)
);
create index content_workspace_updated_idx on public.content_items(workspace_id, updated_at desc);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  resource_id uuid,
  action text not null,
  created_at timestamptz not null default now()
);
create index activity_workspace_created_idx on public.activity_log(workspace_id, created_at desc);

-- RLS checks membership through this private function to avoid recursive member policies.
create function private.workspace_role(workspace uuid)
returns public.workspace_role language sql stable security definer set search_path = ''
as $$
  select m.role from public.workspace_members m
  where m.workspace_id = workspace and m.user_id = (select auth.uid())
$$;
revoke all on function private.workspace_role(uuid) from public, anon;
grant execute on function private.workspace_role(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.content_items enable row level security;
alter table public.activity_log enable row level security;

create policy workspace_read on public.workspaces for select to authenticated
using (private.workspace_role(id) is not null);
create policy members_read on public.workspace_members for select to authenticated
using (private.workspace_role(workspace_id) is not null);
create policy invitations_read on public.workspace_invitations for select to authenticated
using (private.workspace_role(workspace_id) = 'admin');
create policy invitations_insert on public.workspace_invitations for insert to authenticated
with check (
  private.workspace_role(workspace_id) = 'admin'
  and invited_by = (select auth.uid())
  and not exists (select 1 from public.workspace_members m where m.workspace_id = workspace_invitations.workspace_id and m.email = workspace_invitations.email)
);
create policy content_read on public.content_items for select to authenticated
using (private.workspace_role(workspace_id) is not null);
create policy content_insert on public.content_items for insert to authenticated
with check (private.workspace_role(workspace_id) in ('editor', 'admin') and created_by = (select auth.uid()));
create policy content_update on public.content_items for update to authenticated
using (private.workspace_role(workspace_id) in ('editor', 'admin'))
with check (private.workspace_role(workspace_id) in ('editor', 'admin') and updated_by = (select auth.uid()));
create policy content_delete on public.content_items for delete to authenticated
using (private.workspace_role(workspace_id) in ('editor', 'admin'));
create policy activity_read on public.activity_log for select to authenticated
using (private.workspace_role(workspace_id) is not null);

revoke all on public.workspaces, public.workspace_members, public.workspace_invitations, public.content_items, public.activity_log from anon, authenticated;
grant select on public.workspaces, public.workspace_members, public.workspace_invitations, public.content_items, public.activity_log to authenticated;
grant insert (workspace_id, email, role) on public.workspace_invitations to authenticated;
grant insert (workspace_id, title, platform, body, planned_for) on public.content_items to authenticated;
grant update (title, platform, body, planned_for) on public.content_items to authenticated;
grant delete on public.content_items to authenticated;
grant all on public.workspaces, public.workspace_members, public.workspace_invitations, public.content_items, public.activity_log to service_role;

create function private.prepare_invitation() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.email := lower(btrim(new.email));
  new.invited_by := auth.uid();
  return new;
end;
$$;
revoke all on function private.prepare_invitation() from public, anon, authenticated;
create trigger prepare_invitation before insert on public.workspace_invitations
for each row execute function private.prepare_invitation();

create function private.prepare_content() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.title := btrim(new.title);
  if tg_op = 'INSERT' then
    new.created_by := auth.uid(); new.created_at := now(); new.revision := 1;
  else
    if new.workspace_id <> old.workspace_id or new.id <> old.id or new.created_by <> old.created_by then
      raise exception 'Immutable content identity' using errcode = '42501';
    end if;
    new.created_at := old.created_at; new.revision := old.revision + 1;
  end if;
  new.updated_by := auth.uid(); new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function private.prepare_content() from public, anon, authenticated;
create trigger prepare_content before insert or update on public.content_items
for each row execute function private.prepare_content();

create function private.audit_content() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authenticated actor required' using errcode = '42501'; end if;
  if tg_op = 'DELETE' then
    insert into public.activity_log(workspace_id, actor_id, resource_id, action)
    values (old.workspace_id, auth.uid(), old.id, 'content.deleted'); return old;
  else
    insert into public.activity_log(workspace_id, actor_id, resource_id, action)
    values (new.workspace_id, auth.uid(), new.id, case when tg_op = 'INSERT' then 'content.created' else 'content.updated' end);
    return new;
  end if;
end;
$$;
revoke all on function private.audit_content() from public, anon, authenticated;
create trigger audit_content after insert or update or delete on public.content_items
for each row execute function private.audit_content();

-- Only an unexpired invitation matching the verified Auth email can create membership.
create function private.accept_piersec_invitation() returns uuid
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); verified_email text; invite public.workspace_invitations%rowtype; workspace uuid;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select lower(u.email) into verified_email from auth.users u where u.id = actor and u.email_confirmed_at is not null;
  if verified_email is null then raise exception 'Verified email required' using errcode = '42501'; end if;
  select m.workspace_id into workspace from public.workspace_members m where m.user_id = actor;
  if workspace is not null then return workspace; end if;
  select * into invite from public.workspace_invitations i where i.email = verified_email
    and i.accepted_at is null and i.revoked_at is null and i.expires_at > now() for update;
  if invite.id is null then raise exception 'Active invitation required' using errcode = '42501'; end if;
  insert into public.workspace_members(workspace_id, user_id, email, role)
  values (invite.workspace_id, actor, verified_email, invite.role) on conflict (workspace_id, user_id) do nothing;
  update public.workspace_invitations set accepted_at = now(), accepted_by = actor where id = invite.id;
  insert into public.activity_log(workspace_id, actor_id, resource_id, action) values (invite.workspace_id, actor, invite.id, 'team.invitation_accepted');
  return invite.workspace_id;
end;
$$;
revoke all on function private.accept_piersec_invitation() from public, anon;
grant execute on function private.accept_piersec_invitation() to authenticated;

create function public.accept_piersec_invitation() returns uuid
language sql security invoker set search_path = '' as $$ select private.accept_piersec_invitation() $$;
revoke all on function public.accept_piersec_invitation() from public, anon;
grant execute on function public.accept_piersec_invitation() to authenticated;

create function private.change_member_role(target uuid, next_role public.workspace_role) returns void
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; previous_role public.workspace_role;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select w.id into workspace from public.workspaces w where w.slug = 'piersec' for update;
  if private.workspace_role(workspace) <> 'admin' or private.workspace_role(workspace) is null then raise exception 'Admin required' using errcode = '42501'; end if;
  select m.role into previous_role from public.workspace_members m where m.workspace_id = workspace and m.user_id = target;
  if previous_role is null then raise exception 'Member not found' using errcode = '42501'; end if;
  if previous_role = 'admin' and next_role <> 'admin' and (select count(*) from public.workspace_members m where m.workspace_id = workspace and m.role = 'admin') <= 1 then
    raise exception 'Keep at least one administrator';
  end if;
  update public.workspace_members set role = next_role where workspace_id = workspace and user_id = target;
  insert into public.activity_log(workspace_id, actor_id, resource_id, action) values (workspace, auth.uid(), target, 'team.role_changed');
end;
$$;
revoke all on function private.change_member_role(uuid, public.workspace_role) from public, anon;
grant execute on function private.change_member_role(uuid, public.workspace_role) to authenticated;
create function public.change_member_role(target_user_id uuid, next_role public.workspace_role) returns void
language sql security invoker set search_path = '' as $$ select private.change_member_role(target_user_id, next_role) $$;
revoke all on function public.change_member_role(uuid, public.workspace_role) from public, anon;
grant execute on function public.change_member_role(uuid, public.workspace_role) to authenticated;

create function private.remove_workspace_member(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; previous_role public.workspace_role;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select w.id into workspace from public.workspaces w where w.slug = 'piersec' for update;
  if private.workspace_role(workspace) <> 'admin' or private.workspace_role(workspace) is null then raise exception 'Admin required' using errcode = '42501'; end if;
  select m.role into previous_role from public.workspace_members m where m.workspace_id = workspace and m.user_id = target;
  if previous_role is null then raise exception 'Member not found' using errcode = '42501'; end if;
  if previous_role = 'admin' and (select count(*) from public.workspace_members m where m.workspace_id = workspace and m.role = 'admin') <= 1 then
    raise exception 'Keep at least one administrator';
  end if;
  delete from public.workspace_members where workspace_id = workspace and user_id = target;
  insert into public.activity_log(workspace_id, actor_id, resource_id, action) values (workspace, auth.uid(), target, 'team.member_removed');
end;
$$;
revoke all on function private.remove_workspace_member(uuid) from public, anon;
grant execute on function private.remove_workspace_member(uuid) to authenticated;
create function public.remove_workspace_member(target_user_id uuid) returns void
language sql security invoker set search_path = '' as $$ select private.remove_workspace_member(target_user_id) $$;
revoke all on function public.remove_workspace_member(uuid) from public, anon;
grant execute on function public.remove_workspace_member(uuid) to authenticated;

create function private.revoke_workspace_invitation(invite_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare workspace uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select i.workspace_id into workspace from public.workspace_invitations i where i.id = invite_id and i.accepted_at is null;
  if private.workspace_role(workspace) <> 'admin' or private.workspace_role(workspace) is null then raise exception 'Admin required' using errcode = '42501'; end if;
  update public.workspace_invitations set revoked_at = now() where id = invite_id;
  insert into public.activity_log(workspace_id, actor_id, resource_id, action) values (workspace, auth.uid(), invite_id, 'team.invitation_revoked');
end;
$$;
revoke all on function private.revoke_workspace_invitation(uuid) from public, anon;
grant execute on function private.revoke_workspace_invitation(uuid) to authenticated;
create function public.revoke_workspace_invitation(invitation_id uuid) returns void
language sql security invoker set search_path = '' as $$ select private.revoke_workspace_invitation(invitation_id) $$;
revoke all on function public.revoke_workspace_invitation(uuid) from public, anon;
grant execute on function public.revoke_workspace_invitation(uuid) to authenticated;

-- Clients may join only existing workspace/content topics they can access.
create function private.channel_workspace(topic text) returns uuid
language sql stable security definer set search_path = '' as $$
  select w.id from public.workspaces w where topic = 'workspace:' || w.id::text and private.workspace_role(w.id) is not null
  union all
  select c.workspace_id from public.content_items c where topic = 'content:' || c.id::text and private.workspace_role(c.workspace_id) is not null
  limit 1
$$;
revoke all on function private.channel_workspace(text) from public, anon;
grant execute on function private.channel_workspace(text) to authenticated;

create policy postai_realtime_read on realtime.messages for select to authenticated
using (private.workspace_role(private.channel_workspace(realtime.topic())) is not null);
create policy postai_realtime_write on realtime.messages for insert to authenticated
with check (
  (extension = 'presence' and private.workspace_role(private.channel_workspace(realtime.topic())) is not null)
  or (extension = 'broadcast' and private.workspace_role(private.channel_workspace(realtime.topic())) in ('editor', 'admin'))
);

insert into public.workspaces (slug, name) values ('piersec', 'Piersec');

commit;
