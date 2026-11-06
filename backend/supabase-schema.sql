-- CIVICLENS authenticated community reports; run in Supabase SQL editor.
create extension if not exists postgis with schema extensions;
create table if not exists public.civic_reports(
 id uuid primary key,type text not null,impact text not null default 'unknown',notes text not null,lat double precision not null,lon double precision not null,site_name text not null default '',created_at timestamptz not null default now(),verified boolean not null default false,image_data text,created_by uuid not null references auth.users(id) on delete cascade,location geography(point,4326),
 constraint civic_report_lat check(lat between -90 and 90),constraint civic_report_lon check(lon between -180 and 180)
);
create or replace function public.civic_report_location() returns trigger language plpgsql as $$
begin new.location:=st_setsrid(st_makepoint(new.lon,new.lat),4326)::geography;return new;end;$$;
drop trigger if exists civic_report_location_trigger on public.civic_reports;
create trigger civic_report_location_trigger before insert or update of lat,lon on public.civic_reports for each row execute function public.civic_report_location();
create index if not exists civic_reports_location_idx on public.civic_reports using gist(location);
create index if not exists civic_reports_type_created_idx on public.civic_reports(type,created_at desc);
alter table public.civic_reports enable row level security;
drop policy if exists civic_reports_signed_read on public.civic_reports;
create policy civic_reports_signed_read on public.civic_reports for select to authenticated using(true);
drop policy if exists civic_reports_signed_insert on public.civic_reports;
create policy civic_reports_signed_insert on public.civic_reports for insert to authenticated with check(auth.uid()=created_by and verified=false);
grant select,insert on public.civic_reports to authenticated;
-- Reports are not anonymously writable. Verification is a local review state.
