-- Termine im Büro (Judek Gebäudetechnik), online gebucht oder vom Team eingetragen.
--
--   * Interessenten buchen über einen persönlichen Link (`leads.termin_token`).
--     Die Seite schreibt über den Server mit dem geheimen Schlüssel; anonym
--     gibt es weiterhin keine Policy.
--   * Das Team liest, trägt ein und sagt ab über die Anmeldung.
--   * Pro Zeitfenster höchstens ein gebuchter Termin (Teilindex).

alter table public.leads
  add column termin_token uuid not null default gen_random_uuid(),
  -- Wann die Einladung mit Buchungslink rausging (automatisch oder vom Team).
  add column einladung_at timestamptz;

create unique index leads_termin_token on public.leads (termin_token);

create table public.termine (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  beginn      timestamptz not null,
  status      text not null default 'gebucht' check (status in ('gebucht', 'abgesagt')),
  -- 'online' = vom Interessenten gebucht, 'team' = im Vertriebsbereich eingetragen.
  quelle      text not null default 'online' check (quelle in ('online', 'team')),
  created_by  uuid references public.team (user_id) on delete set null,
  created_at  timestamptz not null default now()
);

create unique index termine_slot on public.termine (beginn) where status = 'gebucht';
create index termine_lead on public.termine (lead_id, beginn desc);

alter table public.termine enable row level security;

create policy termine_lesen on public.termine
  for select to authenticated using (public.ist_team());
create policy termine_anlegen on public.termine
  for insert to authenticated with check (public.ist_team());
create policy termine_aendern on public.termine
  for update to authenticated using (public.ist_team()) with check (public.ist_team());
