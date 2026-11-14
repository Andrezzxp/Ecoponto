create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.reports
  add column if not exists updated_at timestamptz not null default now();

grant update, delete on table public.reports to authenticated;

drop policy if exists "Admins read all reports" on public.reports;
create policy "Admins read all reports"
  on public.reports for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins update reports" on public.reports;
create policy "Admins update reports"
  on public.reports for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users delete own reports" on public.reports;
create policy "Users delete own reports"
  on public.reports for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins read all report photos" on storage.objects;
create policy "Admins read all report photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'report-photos' and public.is_admin());

drop policy if exists "Admins delete report photos" on storage.objects;
create policy "Admins delete report photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'report-photos' and public.is_admin());