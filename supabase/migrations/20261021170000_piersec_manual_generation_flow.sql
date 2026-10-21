begin;

alter table public.editorial_posts drop constraint editorial_posts_body_check;
alter table public.editorial_posts add constraint editorial_posts_body_length_check check (char_length(body) <= 30000);

create or replace function private.editorial_create_cycle(p_week date, p_theme text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; cycle uuid; channels text[] := array['blog','news','lkpost','carrossel']; channel text; slot integer := 0;
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

create or replace function private.editorial_approve_week(p_cycle uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare workspace uuid; post public.editorial_posts; scheduled integer:=0;
begin
  select workspace_id into workspace from public.editorial_cycles where id=p_cycle for update;
  if auth.uid() is null or workspace is null or coalesce(private.workspace_role(workspace),'viewer') not in ('approver','admin') then raise exception 'Aprovação necessária.' using errcode='42501'; end if;
  if (select count(*) from public.editorial_posts where cycle_id=p_cycle and channel in ('blog','news','lkpost','carrossel')) <> 4 then
    raise exception 'O pacote Piersec precisa conter artigo, newsletter, post de LinkedIn e carrossel.' using errcode='22023';
  end if;
  if exists (select 1 from public.editorial_posts where cycle_id=p_cycle and channel in ('blog','news','lkpost','carrossel') and (status <> 'approved' or approved_revision <> revision)) then
    raise exception 'Aprove individualmente as quatro peças antes de confirmar o pacote.' using errcode='22023';
  end if;
  for post in select * from public.editorial_posts where cycle_id=p_cycle and channel in ('blog','news','lkpost','carrossel') order by id for update loop
    perform private.editorial_validate(post,true);
    update public.editorial_posts set status='scheduled',approved_revision=revision,approved_by=auth.uid(),approved_at=now(),review_note='',calendar_sequence=calendar_sequence+1,updated_by=auth.uid(),updated_at=clock_timestamp() where id=post.id;
    scheduled:=scheduled+1;
  end loop;
  insert into public.activity_log(workspace_id,actor_id,resource_id,action) values (workspace,auth.uid(),p_cycle,'editorial.week_approved_and_scheduled');
  return scheduled;
end; $$;

create or replace function private.editorial_transition(p_id uuid,p_revision integer,p_action text,p_note text default '',p_planned timestamptz default null,p_url text default null) returns public.editorial_posts
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
      raise exception 'Confirme o pacote das quatro peças aprovadas para agendar a semana.' using errcode='22023';
    elsif p_action='cancel' then
      post.status:='cancelled'; post.approved_revision:=null; post.approved_by:=null; post.approved_at:=null;
    else
      if post.status <> 'scheduled' or post.approved_revision <> post.revision or p_url is null or p_url !~ '^https://' then raise exception 'Confirme e agende o pacote antes de registrar a publicação manual.' using errcode='22023'; end if;
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

revoke execute on function private.editorial_submit_week(uuid) from public, anon, authenticated;
revoke execute on function public.editorial_submit_week(uuid) from public, anon, authenticated;

commit;
