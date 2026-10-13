begin;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists editorial_cycles_created_by_idx
  on public.editorial_cycles(created_by);
create index if not exists editorial_posts_workspace_cycle_idx
  on public.editorial_posts(workspace_id,cycle_id);
create index if not exists editorial_posts_approved_by_idx
  on public.editorial_posts(approved_by);
create index if not exists editorial_posts_created_by_idx
  on public.editorial_posts(created_by);
create index if not exists editorial_posts_published_by_idx
  on public.editorial_posts(published_by);
create index if not exists editorial_posts_updated_by_idx
  on public.editorial_posts(updated_by);
create index if not exists editorial_assets_workspace_post_idx
  on public.editorial_assets(workspace_id,post_id);
create index if not exists editorial_assets_created_by_idx
  on public.editorial_assets(created_by);
create index if not exists brand_profiles_updated_by_idx
  on public.brand_profiles(updated_by);

commit;
