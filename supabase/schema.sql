-- ============================================================
--  Wanted & Got It — database schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
--  Safe to re-run.
--
--  Privacy model:
--    * public.cards       — board data, contains NO contact info.
--    * public.card_private — contact + a secret manage token; anon can
--                            never read this table directly.
--  Anon can only SELECT approved, non-expired cards, and can only write
--  through the SECURITY DEFINER functions below.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tables ----------

create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('wanted', 'got_it')),
  title        text not null check (char_length(title) between 1 and 80),
  description  text not null check (char_length(description) between 1 and 400),
  tags         text[] not null default '{}',
  author_name  text not null check (char_length(author_name) between 1 and 60),
  author_major text,
  author_year  text,
  is_paid      boolean not null default false,
  deadline     date,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'claimed', 'hidden')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '30 days'
);

create table if not exists public.card_private (
  card_id      uuid primary key references public.cards(id) on delete cascade,
  contact      text not null,
  manage_token uuid not null default gen_random_uuid()
);

create index if not exists cards_public_idx
  on public.cards (status, expires_at);
create index if not exists card_private_token_idx
  on public.card_private (manage_token);

-- ---------- Row-level security ----------

alter table public.cards enable row level security;
alter table public.card_private enable row level security;

-- Public board: approved AND claimed cards are readable (claimed ones render
-- dimmed on the board). Pending/hidden cards stay invisible. Expired cards drop off.
drop policy if exists "read approved cards" on public.cards;
drop policy if exists "read visible cards" on public.cards;
create policy "read visible cards" on public.cards
  for select using (status in ('approved', 'claimed') and expires_at > now());

-- card_private has RLS enabled and NO policies -> anon/authenticated are
-- fully denied. It is reachable only via the SECURITY DEFINER functions.

-- ---------- Functions (all run as definer, bypassing RLS) ----------

-- Submit a new card. Returns the poster's secret manage token.
create or replace function public.submit_card(
  p_type text, p_title text, p_description text, p_tags text[],
  p_author_name text, p_author_major text, p_author_year text,
  p_is_paid boolean, p_deadline date, p_contact text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_token uuid;
begin
  insert into public.cards (
    type, title, description, tags, author_name, author_major,
    author_year, is_paid, deadline, status
  ) values (
    p_type, p_title, p_description, coalesce(p_tags, '{}'),
    p_author_name, nullif(p_author_major, ''), nullif(p_author_year, ''),
    coalesce(p_is_paid, false), p_deadline, 'pending'
  ) returning id into v_id;

  insert into public.card_private (card_id, contact)
  values (v_id, p_contact)
  returning manage_token into v_token;

  return v_token;
end; $$;

-- Reveal a poster's contact — ONLY for approved, non-expired cards.
create or replace function public.reveal_contact(p_card_id uuid)
returns text
language sql security definer set search_path = public as $$
  select cp.contact
  from public.card_private cp
  join public.cards c on c.id = cp.card_id
  where cp.card_id = p_card_id
    and c.status = 'approved'
    and c.expires_at > now();
$$;

-- Manage page: fetch a card by its secret token (poster only).
create or replace function public.manage_get(p_token uuid)
returns public.cards
language sql security definer set search_path = public as $$
  select c.*
  from public.cards c
  join public.card_private cp on cp.card_id = c.id
  where cp.manage_token = p_token;
$$;

-- Manage page: poster marks their own card claimed (or un-claims it).
create or replace function public.manage_set_status(p_token uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('approved', 'claimed') then
    raise exception 'invalid status %', p_status;
  end if;
  update public.cards c
    set status = p_status
  from public.card_private cp
  where cp.card_id = c.id
    and cp.manage_token = p_token
    and c.status in ('approved', 'claimed'); -- can't self-approve a pending card
end; $$;

-- ---------- Grants ----------

grant execute on function
  public.submit_card(text, text, text, text[], text, text, text, boolean, date, text)
  to anon;
grant execute on function public.reveal_contact(uuid) to anon;
grant execute on function public.manage_get(uuid) to anon;
grant execute on function public.manage_set_status(uuid, text) to anon;

-- ---------- Realtime ----------
-- Add the public cards table to the realtime publication (guarded so re-runs
-- don't error if it's already a member).
do $$
begin
  begin
    alter publication supabase_realtime add table public.cards;
  exception
    when duplicate_object then null;
    when undefined_object then
      -- publication doesn't exist yet (fresh project); create it.
      create publication supabase_realtime for table public.cards;
  end;
end $$;

-- ============================================================
--  Admin: shared-password moderation (rotatable)
--  The password is stored ONLY as a bcrypt hash. Every admin action runs
--  through a SECURITY DEFINER function that verifies the password first, so
--  no privileged key ever lives in the frontend.
-- ============================================================

-- Single-row config table holding the bcrypt password hash.
create table if not exists public.admin_config (
  id            integer primary key default 1,
  password_hash text not null,
  constraint admin_config_singleton check (id = 1)
);

alter table public.admin_config enable row level security;
-- No policies -> anon/authenticated fully denied. Only definer functions touch it.

-- Seed a default password ('changeme') ONCE. Re-running this file will NOT
-- reset it (on conflict do nothing). Change it immediately in the admin UI.
insert into public.admin_config (id, password_hash)
values (1, crypt('changeme', gen_salt('bf')))
on conflict (id) do nothing;

-- Verify a password (used for login).
create or replace function public.admin_verify(p_password text)
returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_config
    where id = 1 and password_hash = crypt(p_password, password_hash)
  );
$$;

-- Internal guard: raise if the password is wrong. NOT granted to anon; it only
-- runs inside the definer functions below (as the function owner).
create or replace function public.admin_check(p_password text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.admin_verify(p_password) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
end; $$;

-- List every card for the moderation queue (pending first). No contact info.
create or replace function public.admin_list_cards(p_password text)
returns setof public.cards
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check(p_password);
  return query
    select * from public.cards
    order by case status when 'pending' then 0 else 1 end, created_at desc;
end; $$;

-- Set a card's status (approve / hide / claim / re-queue).
create or replace function public.admin_set_status(
  p_password text, p_card_id uuid, p_status text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check(p_password);
  if p_status not in ('pending', 'approved', 'claimed', 'hidden') then
    raise exception 'invalid status %', p_status;
  end if;
  update public.cards set status = p_status where id = p_card_id;
end; $$;

-- Delete a single card (hard delete; card_private cascades).
create or replace function public.admin_delete_card(p_password text, p_card_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check(p_password);
  delete from public.cards where id = p_card_id;
end; $$;

-- Clear the whole board (end-of-semester reset).
create or replace function public.admin_clear_board(p_password text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check(p_password);
  delete from public.cards;
end; $$;

-- Rotate the shared password (requires the current one).
create or replace function public.admin_change_password(
  p_password text, p_new_password text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_check(p_password);
  if char_length(p_new_password) < 6 then
    raise exception 'new password must be at least 6 characters';
  end if;
  update public.admin_config
    set password_hash = crypt(p_new_password, gen_salt('bf'))
    where id = 1;
end; $$;

grant execute on function public.admin_verify(text) to anon;
grant execute on function public.admin_list_cards(text) to anon;
grant execute on function public.admin_set_status(text, uuid, text) to anon;
grant execute on function public.admin_delete_card(text, uuid) to anon;
grant execute on function public.admin_clear_board(text) to anon;
grant execute on function public.admin_change_password(text, text) to anon;
