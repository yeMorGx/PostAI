begin;

create table public.editorial_cycles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  week_start date not null check (extract(isodow from week_start) = 1),
  theme text not null check (char_length(btrim(theme)) between 3 and 180),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (workspace_id, week_start), unique (workspace_id, id)
);

create table public.editorial_posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  cycle_id uuid not null,
  channel text not null check (channel in ('blog','lkart','lkpost','news','carrossel')),
  title text not null check (char_length(btrim(title)) between 3 and 180),
  body text not null default '' check (char_length(body) <= 16000),
  hashtags text not null default '' check (char_length(hashtags) <= 1000),
  slides jsonb not null default '[]'::jsonb check (jsonb_typeof(slides) = 'array' and jsonb_array_length(slides) <= 10),
  status text not null default 'draft' check (status in ('draft','review','approved','scheduled','published','cancelled')),
  revision integer not null default 1 check (revision > 0),
  calendar_sequence integer not null default 0 check (calendar_sequence >= 0),
  approved_revision integer, approved_by uuid references auth.users(id), approved_at timestamptz,
  planned_for timestamptz, published_at timestamptz, published_by uuid references auth.users(id),
  publication_url text check (publication_url is null or (publication_url ~ '^https://' and char_length(publication_url) <= 2000)),
  review_note text not null default '' check (char_length(review_note) <= 2000),
  created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (workspace_id, cycle_id) references public.editorial_cycles(workspace_id, id),
  unique (cycle_id, channel), unique (workspace_id, id),
  check ((status in ('approved','scheduled','published')) = (approved_revision is not null and approved_by is not null and approved_at is not null)),
  check (status not in ('approved','scheduled','published') or approved_revision = revision),
  check (status <> 'scheduled' or planned_for is not null),
  check ((status = 'published') = (published_at is not null and published_by is not null and publication_url is not null))
);
create index editorial_posts_workspace_schedule on public.editorial_posts(workspace_id, planned_for);
create index editorial_posts_cycle on public.editorial_posts(cycle_id);

create table public.editorial_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  post_id uuid not null,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 180),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  position integer not null check (position between 1 and 10),
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key (workspace_id, post_id) references public.editorial_posts(workspace_id, id),
  unique (post_id, position) deferrable initially deferred
);
create index editorial_assets_post on public.editorial_assets(post_id);

create table public.brand_profiles (
  workspace_id uuid primary key references public.workspaces(id),
  tone text not null default 'Maduro, institucional, consultivo e analítico.' check (char_length(tone) between 3 and 500),
  guidance text not null default 'Conecte segurança ao impacto no negócio. Use dados verificáveis e fontes identificadas. Evite promessas absolutas, alarmismo, hackers encapuzados, cadeados, escudos e código verde. LinkedIn: abertura direta e parágrafos curtos. Instagram: uma ideia por lâmina.' check (char_length(guidance) between 3 and 12000),
  forbidden_terms text not null default 'blindagem, solução definitiva, segurança total, proteção absoluta, urgência, hackear, mundo digital' check (char_length(forbidden_terms) <= 2000),
  primary_color text not null default '#0A0F1E' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  accent_color text not null default '#33C3ED' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  revision integer not null default 1,
  updated_by uuid references auth.users(id), updated_at timestamptz not null default now()
);

alter table public.editorial_cycles enable row level security;
alter table public.editorial_posts enable row level security;
alter table public.editorial_assets enable row level security;
alter table public.brand_profiles enable row level security;
create policy editorial_cycles_read on public.editorial_cycles for select to authenticated using (private.workspace_role(workspace_id) is not null);
create policy editorial_posts_read on public.editorial_posts for select to authenticated using (private.workspace_role(workspace_id) is not null);
create policy editorial_assets_read on public.editorial_assets for select to authenticated using (private.workspace_role(workspace_id) is not null);
create policy brand_profiles_read on public.brand_profiles for select to authenticated using (private.workspace_role(workspace_id) is not null);
revoke all on public.editorial_cycles, public.editorial_posts, public.editorial_assets, public.brand_profiles from anon, authenticated;
grant select on public.editorial_cycles, public.editorial_posts, public.editorial_assets, public.brand_profiles to authenticated;
grant all on public.editorial_cycles, public.editorial_posts, public.editorial_assets, public.brand_profiles to service_role;

insert into public.brand_profiles(workspace_id) select id from public.workspaces;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('editorial-media','editorial-media',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
create policy editorial_media_read on storage.objects for select to authenticated using (
  bucket_id = 'editorial-media' and exists (
    select 1 from public.editorial_assets a where a.storage_path = name and private.workspace_role(a.workspace_id) is not null
  )
);

create function private.editorial_validate(post public.editorial_posts, scheduling boolean default false) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if char_length(btrim(post.body)) < 20 then raise exception 'Escreva o conteúdo da peça antes de enviar para aprovação.' using errcode = '22023'; end if;
  if post.channel = 'carrossel' and (select count(*) from public.editorial_assets a where a.post_id = post.id) < 2 then
    raise exception 'Adicione ao menos duas lâminas de imagem ao carrossel.' using errcode = '22023';
  end if;
  if scheduling and (post.planned_for is null or post.planned_for <= now()) then
    raise exception 'Todas as peças precisam de um horário futuro para aprovar e agendar a semana.' using errcode = '22023';
  end if;
end; $$;
revoke all on function private.editorial_validate(public.editorial_posts,boolean) from public, anon, authenticated;

create function private.editorial_create_cycle(p_week date, p_theme text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; cycle uuid; channels text[] := array['blog','lkart','lkpost','news','carrossel']; channel text; slot integer := 0;
begin
  select m.workspace_id into workspace from public.workspace_members m where m.user_id = auth.uid();
  if auth.uid() is null or coalesce(private.workspace_role(workspace),'viewer') not in ('editor','admin') then raise exception 'Edição necessária.' using errcode = '42501'; end if;
  insert into public.editorial_cycles(workspace_id,week_start,theme,created_by)
  values (workspace,p_week,btrim(p_theme),auth.uid()) returning id into cycle;
  foreach channel in array channels loop
    insert into public.editorial_posts(workspace_id,cycle_id,channel,title,planned_for,created_by,updated_by)
    values (workspace,cycle,channel,btrim(p_theme),((p_week + slot) + time '10:00') at time zone 'America/Sao_Paulo',auth.uid(),auth.uid());
    slot := slot + 1;
  end loop;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (workspace,auth.uid(),cycle,'editorial.cycle_created');
  return cycle;
end; $$;
revoke all on function private.editorial_create_cycle(date,text) from public, anon;
grant execute on function private.editorial_create_cycle(date,text) to authenticated;
create function public.editorial_create_cycle(p_week date,p_theme text) returns uuid
language sql security invoker set search_path = '' as $$ select private.editorial_create_cycle(p_week,p_theme) $$;
revoke all on function public.editorial_create_cycle(date,text) from public, anon;
grant execute on function public.editorial_create_cycle(date,text) to authenticated;

create function private.editorial_submit_week(p_cycle uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; post public.editorial_posts; submitted integer:=0;
begin
  select workspace_id into workspace from public.editorial_cycles where id=p_cycle for update;
  if auth.uid() is null or workspace is null or coalesce(private.workspace_role(workspace),'viewer') not in ('editor','admin') then raise exception 'Edição necessária.' using errcode='42501'; end if;
  if (select count(*) from public.editorial_posts where cycle_id=p_cycle and status not in ('cancelled','published')) <> 5 then
    raise exception 'A semana precisa ter as cinco peças antes do envio.' using errcode='22023';
  end if;
  for post in select * from public.editorial_posts where cycle_id=p_cycle and status not in ('cancelled','published') order by id for update loop
    if post.status not in ('draft','review') then raise exception 'Ajuste a semana antes de enviá-la para aprovação.' using errcode='22023'; end if;
    perform private.editorial_validate(post,true);
    update public.editorial_posts set status='review',review_note='',calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where id=post.id;
    submitted:=submitted+1;
  end loop;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (workspace,auth.uid(),p_cycle,'editorial.week_submitted');
  return submitted;
end; $$;
revoke all on function private.editorial_submit_week(uuid) from public, anon;
grant execute on function private.editorial_submit_week(uuid) to authenticated;
create function public.editorial_submit_week(p_cycle uuid) returns integer
language sql security invoker set search_path = '' as $$ select private.editorial_submit_week(p_cycle) $$;
revoke all on function public.editorial_submit_week(uuid) from public, anon;
grant execute on function public.editorial_submit_week(uuid) to authenticated;

create function private.editorial_save_post(p_id uuid,p_revision integer,p_title text,p_body text,p_hashtags text,p_slides jsonb,p_planned timestamptz) returns public.editorial_posts
language plpgsql security definer set search_path = '' as $$
declare post public.editorial_posts; slide jsonb;
begin
  select * into post from public.editorial_posts where id = p_id for update;
  if auth.uid() is null or post.id is null or coalesce(private.workspace_role(post.workspace_id),'viewer') not in ('editor','admin') then raise exception 'Edição necessária.' using errcode = '42501'; end if;
  if p_revision is null or post.revision <> p_revision then raise exception 'Outra pessoa alterou esta peça. Atualize antes de salvar.' using errcode = '40001'; end if;
  if post.status = 'published' then raise exception 'Uma peça publicada não pode ser alterada.' using errcode = '22023'; end if;
  if jsonb_typeof(p_slides) <> 'array' or jsonb_array_length(p_slides) > 10 then raise exception 'Lâminas inválidas.' using errcode = '22023'; end if;
  for slide in select value from jsonb_array_elements(p_slides) loop
    if jsonb_typeof(slide) <> 'object' or jsonb_typeof(slide->'title') <> 'string' or jsonb_typeof(slide->'text') <> 'string'
      or char_length(slide->>'title') > 180 or char_length(slide->>'text') > 1200 then raise exception 'Texto das lâminas inválido.' using errcode = '22023'; end if;
  end loop;
  update public.editorial_posts set title=btrim(p_title), body=p_body, hashtags=p_hashtags, slides=p_slides, planned_for=p_planned,
    status=case when status='scheduled' then 'cancelled' else 'draft' end, revision=revision+1, approved_revision=null, approved_by=null, approved_at=null,
    calendar_sequence=calendar_sequence+1, review_note='', updated_by=auth.uid(),updated_at=clock_timestamp() where id=p_id returning * into post;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (post.workspace_id,auth.uid(),p_id,'editorial.post_edited');
  return post;
end; $$;
revoke all on function private.editorial_save_post(uuid,integer,text,text,text,jsonb,timestamptz) from public, anon;
grant execute on function private.editorial_save_post(uuid,integer,text,text,text,jsonb,timestamptz) to authenticated;
create function public.editorial_save_post(p_id uuid,p_revision integer,p_title text,p_body text,p_hashtags text,p_slides jsonb,p_planned timestamptz) returns public.editorial_posts
language sql security invoker set search_path = '' as $$ select private.editorial_save_post(p_id,p_revision,p_title,p_body,p_hashtags,p_slides,p_planned) $$;
revoke all on function public.editorial_save_post(uuid,integer,text,text,text,jsonb,timestamptz) from public, anon;
grant execute on function public.editorial_save_post(uuid,integer,text,text,text,jsonb,timestamptz) to authenticated;

create function private.editorial_transition(p_id uuid,p_revision integer,p_action text,p_note text default '',p_planned timestamptz default null,p_url text default null) returns public.editorial_posts
language plpgsql security definer set search_path = '' as $$
declare post public.editorial_posts; actor_role public.workspace_role;
begin
  select * into post from public.editorial_posts where id=p_id for update;
  actor_role := private.workspace_role(post.workspace_id);
  if auth.uid() is null or post.id is null or actor_role is null then raise exception 'Acesso necessário.' using errcode='42501'; end if;
  if p_revision is null or post.revision <> p_revision then raise exception 'Outra pessoa alterou esta peça. Atualize antes de continuar.' using errcode='40001'; end if;
  if post.status='published' then raise exception 'A publicação já foi registrada.' using errcode='22023'; end if;
  if p_action='review' then
    if actor_role not in ('editor','admin') then raise exception 'Edição necessária.' using errcode='42501'; end if;
    if post.status <> 'draft' then raise exception 'Apenas rascunhos podem ir para aprovação.' using errcode='22023'; end if;
    perform private.editorial_validate(post);
    post.status := 'review';
  elsif p_action in ('approve','reject','schedule','cancel','publish') then
    if actor_role not in ('approver','admin') then raise exception 'Aprovação necessária.' using errcode='42501'; end if;
    if p_action='approve' then
      if post.status <> 'review' then raise exception 'Envie a peça para aprovação primeiro.' using errcode='22023'; end if;
      perform private.editorial_validate(post);
      post.status:='approved'; post.approved_revision:=post.revision; post.approved_by:=auth.uid(); post.approved_at:=now(); post.review_note:='';
    elsif p_action='reject' then
      if post.status <> 'review' or char_length(btrim(p_note)) < 3 then raise exception 'Informe o ajuste solicitado à equipe.' using errcode='22023'; end if;
      post.status:='draft'; post.review_note:=btrim(p_note);
    elsif p_action='schedule' then
      if post.status not in ('approved','scheduled') or post.approved_revision <> post.revision then raise exception 'A peça precisa estar aprovada nesta versão.' using errcode='22023'; end if;
      post.planned_for:=p_planned;
      perform private.editorial_validate(post,true);
      post.status:='scheduled';
    elsif p_action='cancel' then
      post.status:='cancelled'; post.approved_revision:=null; post.approved_by:=null; post.approved_at:=null;
    else
      if post.status not in ('approved','scheduled') or post.approved_revision <> post.revision or p_url is null or p_url !~ '^https://' then raise exception 'Aprove a peça e informe o link HTTPS da publicação.' using errcode='22023'; end if;
      post.status:='published'; post.published_by:=auth.uid(); post.published_at:=now(); post.publication_url:=p_url;
    end if;
  else raise exception 'Ação inválida.' using errcode='22023';
  end if;
  update public.editorial_posts set status=post.status,approved_revision=post.approved_revision,approved_by=post.approved_by,approved_at=post.approved_at,
    planned_for=post.planned_for,review_note=post.review_note,published_at=post.published_at,published_by=post.published_by,publication_url=post.publication_url,
    calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where id=p_id returning * into post;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (post.workspace_id,auth.uid(),p_id,'editorial.'||p_action);
  return post;
end; $$;
revoke all on function private.editorial_transition(uuid,integer,text,text,timestamptz,text) from public, anon;
grant execute on function private.editorial_transition(uuid,integer,text,text,timestamptz,text) to authenticated;
create function public.editorial_transition(p_id uuid,p_revision integer,p_action text,p_note text default '',p_planned timestamptz default null,p_url text default null) returns public.editorial_posts
language sql security invoker set search_path = '' as $$ select private.editorial_transition(p_id,p_revision,p_action,p_note,p_planned,p_url) $$;
revoke all on function public.editorial_transition(uuid,integer,text,text,timestamptz,text) from public, anon;
grant execute on function public.editorial_transition(uuid,integer,text,text,timestamptz,text) to authenticated;

create function private.editorial_approve_week(p_cycle uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; post public.editorial_posts; approved integer:=0;
begin
  select workspace_id into workspace from public.editorial_cycles where id=p_cycle for update;
  if auth.uid() is null or workspace is null or coalesce(private.workspace_role(workspace),'viewer') not in ('approver','admin') then raise exception 'Aprovação necessária.' using errcode='42501'; end if;
  for post in select * from public.editorial_posts where cycle_id=p_cycle and status not in ('cancelled','published') order by id for update loop
    if post.status not in ('review','approved','scheduled') then raise exception 'Envie todas as peças da semana para aprovação.' using errcode='22023'; end if;
    perform private.editorial_validate(post,true);
    update public.editorial_posts set status='scheduled',approved_revision=revision,approved_by=auth.uid(),approved_at=now(),review_note='',calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where id=post.id;
    approved:=approved+1;
  end loop;
  if approved=0 then raise exception 'Nenhuma peça disponível para agendar.' using errcode='22023'; end if;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (workspace,auth.uid(),p_cycle,'editorial.week_approved_and_scheduled');
  return approved;
end; $$;
revoke all on function private.editorial_approve_week(uuid) from public, anon;
grant execute on function private.editorial_approve_week(uuid) to authenticated;
create function public.editorial_approve_week(p_cycle uuid) returns integer
language sql security invoker set search_path = '' as $$ select private.editorial_approve_week(p_cycle) $$;
revoke all on function public.editorial_approve_week(uuid) from public, anon;
grant execute on function public.editorial_approve_week(uuid) to authenticated;

create function private.editorial_attach_asset(p_post uuid,p_revision integer,p_path text,p_name text,p_mime text,p_size integer) returns uuid
language plpgsql security definer set search_path = '' as $$
declare post public.editorial_posts; asset uuid; next_position integer;
begin
  select * into post from public.editorial_posts where id=p_post for update;
  if auth.uid() is null or post.id is null or coalesce(private.workspace_role(post.workspace_id),'viewer') not in ('editor','admin') then raise exception 'Edição necessária.' using errcode='42501'; end if;
  if post.status='published' or p_revision is null or post.revision <> p_revision then raise exception 'A peça foi alterada ou já foi publicada. Atualize a tela.' using errcode='40001'; end if;
  if not starts_with(p_path,post.workspace_id::text||'/'||post.id::text||'/') or not exists (select 1 from storage.objects where bucket_id='editorial-media' and name=p_path) then raise exception 'Arquivo inválido.' using errcode='22023'; end if;
  select coalesce(max(position),0)+1 into next_position from public.editorial_assets where post_id=p_post;
  insert into public.editorial_assets(workspace_id,post_id,storage_path,file_name,mime_type,size_bytes,position,created_by)
  values (post.workspace_id,p_post,p_path,p_name,p_mime,p_size,next_position,auth.uid()) returning id into asset;
  update public.editorial_posts set revision=revision+1,status=case when status='scheduled' then 'cancelled' else 'draft' end,approved_revision=null,approved_by=null,approved_at=null,calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where id=p_post;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (post.workspace_id,auth.uid(),p_post,'editorial.asset_added');
  return asset;
end; $$;
revoke all on function private.editorial_attach_asset(uuid,integer,text,text,text,integer) from public, anon;
grant execute on function private.editorial_attach_asset(uuid,integer,text,text,text,integer) to authenticated;
create function public.editorial_attach_asset(p_post uuid,p_revision integer,p_path text,p_name text,p_mime text,p_size integer) returns uuid
language sql security invoker set search_path = '' as $$ select private.editorial_attach_asset(p_post,p_revision,p_path,p_name,p_mime,p_size) $$;
revoke all on function public.editorial_attach_asset(uuid,integer,text,text,text,integer) from public, anon;
grant execute on function public.editorial_attach_asset(uuid,integer,text,text,text,integer) to authenticated;

create function private.editorial_remove_asset(p_asset uuid,p_revision integer) returns text
language plpgsql security definer set search_path = '' as $$
declare asset public.editorial_assets; post public.editorial_posts;
begin
  select * into asset from public.editorial_assets where id=p_asset;
  select * into post from public.editorial_posts where id=asset.post_id for update;
  if auth.uid() is null or asset.id is null or coalesce(private.workspace_role(post.workspace_id),'viewer') not in ('editor','admin') then raise exception 'Edição necessária.' using errcode='42501'; end if;
  if post.status='published' or p_revision is null or post.revision<>p_revision then raise exception 'A peça foi alterada ou publicada. Atualize a tela.' using errcode='40001'; end if;
  delete from public.editorial_assets where id=p_asset;
  update public.editorial_assets set position=position-1 where post_id=post.id and position>asset.position;
  update public.editorial_posts set revision=revision+1,status=case when status='scheduled' then 'cancelled' else 'draft' end,approved_revision=null,approved_by=null,approved_at=null,calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where id=post.id;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (post.workspace_id,auth.uid(),post.id,'editorial.asset_removed');
  return asset.storage_path;
end; $$;
revoke all on function private.editorial_remove_asset(uuid,integer) from public, anon;
grant execute on function private.editorial_remove_asset(uuid,integer) to authenticated;
create function public.editorial_remove_asset(p_asset uuid,p_revision integer) returns text
language sql security invoker set search_path = '' as $$ select private.editorial_remove_asset(p_asset,p_revision) $$;
revoke all on function public.editorial_remove_asset(uuid,integer) from public, anon;
grant execute on function public.editorial_remove_asset(uuid,integer) to authenticated;

create function private.editorial_save_brand(p_tone text,p_guidance text,p_forbidden text,p_primary text,p_accent text,p_revision integer) returns void
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; current_revision integer;
begin
  select workspace_id into workspace from public.workspace_members where user_id=auth.uid();
  if auth.uid() is null or coalesce(private.workspace_role(workspace),'viewer') not in ('editor','admin') then raise exception 'Edição necessária.' using errcode='42501'; end if;
  select revision into current_revision from public.brand_profiles where workspace_id=workspace for update;
  if p_revision is null or current_revision<>p_revision then raise exception 'Os padrões foram alterados. Atualize a tela.' using errcode='40001'; end if;
  update public.brand_profiles set tone=p_tone,guidance=p_guidance,forbidden_terms=p_forbidden,primary_color=p_primary,accent_color=p_accent,revision=revision+1,updated_by=auth.uid(),updated_at=clock_timestamp() where workspace_id=workspace;
  update public.editorial_posts set status=case when status='scheduled' then 'cancelled' else 'draft' end,revision=revision+1,approved_revision=null,approved_by=null,approved_at=null,review_note='Padrões da marca atualizados. Revise a peça antes de aprovar novamente.',calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where workspace_id=workspace and status in ('review','approved','scheduled');
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (workspace,auth.uid(),workspace,'editorial.brand_updated');
end; $$;
revoke all on function private.editorial_save_brand(text,text,text,text,text,integer) from public, anon;
grant execute on function private.editorial_save_brand(text,text,text,text,text,integer) to authenticated;
create function public.editorial_save_brand(p_tone text,p_guidance text,p_forbidden text,p_primary text,p_accent text,p_revision integer) returns void
language sql security invoker set search_path = '' as $$ select private.editorial_save_brand(p_tone,p_guidance,p_forbidden,p_primary,p_accent,p_revision) $$;
revoke all on function public.editorial_save_brand(text,text,text,text,text,integer) from public, anon;
grant execute on function public.editorial_save_brand(text,text,text,text,text,integer) to authenticated;

notify pgrst, 'reload schema';
commit;
