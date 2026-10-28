-- Leads für die Vermarktung Hohe Straße, Hohenhameln.
--
-- Wer schreibt was:
--   * Das Anfrageformular schreibt über den Server mit dem geheimen Schlüssel.
--     Anonyme Zugriffe haben KEINE Policy — wer die öffentliche REST-API direkt
--     anspricht, kommt weder an Leads heran noch kann er welche anlegen.
--   * Das Vertriebsteam liest und bearbeitet über die Anmeldung. Wer zum Team
--     gehört, steht in `team`; ein Konto allein reicht nicht.

create table public.team (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- security definer: sonst bräuchte die Abfrage auf `team` selbst eine Policy,
-- die wieder `ist_team()` fragt — eine Schleife.
create function public.ist_team() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team where user_id = auth.uid());
$$;

create type public.lead_status as enum (
  'neu',
  'kontaktiert',
  'besichtigung',
  'finanzierung',
  'reserviert',
  'notartermin',
  'verkauft',
  'abgesagt'
);

create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Slug aus src/lib/objekte.ts; leer = allgemeine Anfrage zum Projekt.
  objekt_slug      text,
  name             text not null check (length(name) between 2 and 200),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefon          text,
  nachricht        text,
  zweck            text not null default 'offen'
                   check (zweck in ('eigennutzung', 'kapitalanlage', 'offen')),
  finanzierung     text not null default 'in_klaerung'
                   check (finanzierung in ('eigenkapital', 'zusage', 'in_klaerung')),
  rueckruf         boolean not null default false,
  -- Wann der Datenschutzhinweis bestätigt wurde. Ohne das kein Lead.
  einwilligung_at  timestamptz not null,
  status           public.lead_status not null default 'neu',
  zugewiesen_an    uuid references public.team (user_id) on delete set null,
  quelle           jsonb not null default '{}'::jsonb
);

create index leads_created_at on public.leads (created_at desc);
create index leads_status on public.leads (status);

create table public.lead_aktivitaeten (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  art         text not null check (art in ('notiz', 'anruf', 'email', 'besichtigung', 'status')),
  text        text not null,
  created_by  uuid references public.team (user_id) on delete set null,
  created_at  timestamptz not null default now()
);

create index lead_aktivitaeten_lead on public.lead_aktivitaeten (lead_id, created_at desc);

create function public.leads_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger leads_touch before update on public.leads
  for each row execute function public.leads_touch();

alter table public.team enable row level security;
alter table public.leads enable row level security;
alter table public.lead_aktivitaeten enable row level security;

create policy team_lesen on public.team
  for select to authenticated using (public.ist_team());

create policy leads_lesen on public.leads
  for select to authenticated using (public.ist_team());
create policy leads_aendern on public.leads
  for update to authenticated using (public.ist_team()) with check (public.ist_team());
-- Löschen gehört zum Team: Auskunfts- und Löschbegehren nach DSGVO.
create policy leads_loeschen on public.leads
  for delete to authenticated using (public.ist_team());

create policy aktivitaeten_lesen on public.lead_aktivitaeten
  for select to authenticated using (public.ist_team());
create policy aktivitaeten_anlegen on public.lead_aktivitaeten
  for insert to authenticated
  with check (public.ist_team() and created_by = auth.uid());
