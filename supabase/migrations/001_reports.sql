create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  category text not null check (category in (
    'trash', 'construction_debris', 'discarded_furniture', 'full_bin', 'green_area', 'other'
  )),
  description text,
  photo_path text not null,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  accuracy_m double precision check (accuracy_m >= 0),
  utm_zone smallint check (utm_zone between 1 and 60),
  utm_hemisphere char(1) check (utm_hemisphere in ('N', 'S')),
  utm_easting double precision,
  utm_northing double precision,
  status text not null default 'submitted' check (status in (
    'submitted', 'received', 'under_review', 'resolved', 'rejected'
  )),
  created_at timestamptz not null default now(),
  constraint reports_utm_complete check (
    (utm_zone is null and utm_hemisphere is null and utm_easting is null and utm_northing is null)
    or
    (utm_zone is not null and utm_hemisphere is not null and utm_easting is not null and utm_northing is not null)
  )
);

alter table public.reports enable row level security;
grant select, insert on table public.reports to authenticated;

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports" on public.reports for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users create own reports" on public.reports;
create policy "Users create own reports" on public.reports for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'submitted'
    and split_part(photo_path, '/', 1) = (select auth.uid())::text
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Users upload own report photos" on storage.objects;
create policy "Users upload own report photos" on storage.objects for insert to authenticated
  with check (bucket_id='report-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Users read own report photos" on storage.objects;
create policy "Users read own report photos" on storage.objects for select to authenticated
  using (bucket_id='report-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);