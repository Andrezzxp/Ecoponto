alter table public.reports
  add column if not exists location_source text not null default 'gps'
  check (location_source in ('gps', 'manual'));