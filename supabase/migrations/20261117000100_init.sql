-- Mary's Automotive: quote requests, admin allowlist, invoice audit log, rate limiting.
-- Security model:
--   * anon has no access to any table.
--   * authenticated users can read or change data only when listed in admin_users.
--   * public quote inserts and invoice audit inserts happen on the server with the service role key,
--     after validation, spam checks and rate limiting.

-- ───────────────────────── Admin allowlist ─────────────────────────
create table public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at   timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

create policy "Admins can read the admin list"
  on public.admin_users for select to authenticated
  using ((select public.is_admin()));

-- ───────────────────────── Quote requests ─────────────────────────
create type public.quote_status as enum ('new', 'contacted', 'scheduled', 'completed', 'closed');

create table public.quote_requests (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  status            public.quote_status not null default 'new',
  name              text not null check (char_length(name) between 1 and 120),
  phone             text not null check (char_length(phone) between 7 and 32),
  email             text check (email is null or char_length(email) <= 254),
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone', 'text', 'email')),
  vehicle_year      smallint check (vehicle_year between 1900 and 2100),
  vehicle_make      text check (char_length(vehicle_make) <= 60),
  vehicle_model     text check (char_length(vehicle_model) <= 60),
  mileage           integer check (mileage between 0 and 2000000),
  service           text check (char_length(service) <= 80),
  description       text not null check (char_length(description) between 1 and 4000),
  source_page       text check (char_length(source_page) <= 200),
  notified_at       timestamptz,
  search_text       text generated always as (
    lower(
      coalesce(name, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(email, '') || ' ' ||
      coalesce(vehicle_year::text, '') || ' ' || coalesce(vehicle_make, '') || ' ' ||
      coalesce(vehicle_model, '') || ' ' || coalesce(service, '') || ' ' || coalesce(description, '')
    )
  ) stored
);
create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index quote_requests_status_idx on public.quote_requests (status, created_at desc);
alter table public.quote_requests enable row level security;

create policy "Admins can read quote requests"
  on public.quote_requests for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can update quote requests"
  on public.quote_requests for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Least privilege: the dashboard may change status only. Customer details stay as submitted.
revoke all on public.quote_requests from anon, authenticated;
grant select on public.quote_requests to authenticated;
grant update (status) on public.quote_requests to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger quote_requests_touch before update on public.quote_requests
  for each row execute function public.touch_updated_at();

-- ───────────────────────── Internal notes ─────────────────────────
create table public.quote_notes (
  id         uuid primary key default gen_random_uuid(),
  quote_id   uuid not null references public.quote_requests (id) on delete cascade,
  author_id  uuid default auth.uid() references auth.users (id) on delete set null,
  body       text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index quote_notes_quote_idx on public.quote_notes (quote_id, created_at);
alter table public.quote_notes enable row level security;

create policy "Admins can read notes"
  on public.quote_notes for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can add their own notes"
  on public.quote_notes for insert to authenticated
  with check ((select public.is_admin()) and author_id = (select auth.uid()));

revoke all on public.quote_notes from anon, authenticated;
grant select, insert on public.quote_notes to authenticated;

-- ───────────────────────── Invoice audit log ─────────────────────────
create table public.invoice_sends (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  sent_by       uuid references auth.users (id) on delete set null,
  recipient     text not null,
  customer_name text not null,
  status        text not null check (status in ('sent', 'failed')),
  provider_id   text,
  error         text
);
create index invoice_sends_created_at_idx on public.invoice_sends (created_at desc);
alter table public.invoice_sends enable row level security;

create policy "Admins can read invoice log"
  on public.invoice_sends for select to authenticated
  using ((select public.is_admin()));

revoke all on public.invoice_sends from anon, authenticated;
grant select on public.invoice_sends to authenticated;

-- ───────────────────────── Rate limiting ─────────────────────────
create table public.rate_limits (
  bucket       text not null,
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);
alter table public.rate_limits enable row level security;
-- No policies: only the service role (which bypasses RLS) touches this table.
revoke all on public.rate_limits from anon, authenticated;

-- Fixed window counter. Returns true when the request is allowed.
create or replace function public.check_rate_limit(p_bucket text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits as r (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;

  -- Occasional cleanup of stale windows.
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_max;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
