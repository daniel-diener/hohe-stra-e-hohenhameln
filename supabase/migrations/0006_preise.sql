-- Kaufpreise: Wohnungen und Stellplätze aus der Kaufpreisliste des Bauherrn.
--
-- Quelle: „Kaufpreisliste Hohe Straße“, Judek Projekt GmbH, Stand 15.09.2026.
-- Nur das Vertriebsteam liest und ändert (wie bei den Leads). Anonyme Zugriffe
-- haben keine Policy: Einzelpreise stehen nicht öffentlich auf der Seite.
--
-- Die Flächen hier sind die der Abgeschlossenheitsbescheinigung und
-- Teilungserklärung; sie weichen leicht von den Exposé-Flächen in
-- src/lib/objekte.ts ab.

create table public.preise_wohnungen (
  we            int primary key check (we between 1 and 16),
  lage          text not null check (lage in ('UG', 'EG', 'OG', 'SG')),
  zimmer        int not null check (zimmer > 0),
  flaeche_te    numeric(6, 2) not null check (flaeche_te > 0),
  kaufpreis     int not null check (kaufpreis > 0),
  status        text not null default 'verfuegbar'
                check (status in ('verfuegbar', 'angefragt', 'reserviert', 'verkauft')),
  stand         date not null,
  updated_at    timestamptz not null default now()
);

create table public.stellplaetze (
  nr            int primary key check (nr between 1 and 18),
  carport       boolean not null,
  -- Wohnung, die den Stellplatz nutzt (reserviert/angefragt), sonst leer.
  we            int references public.preise_wohnungen (we) on delete set null,
  notiz         text,
  kaufpreis     int not null check (kaufpreis > 0),
  status        text not null default 'verfuegbar'
                check (status in ('verfuegbar', 'angefragt', 'reserviert', 'verkauft')),
  stand         date not null,
  updated_at    timestamptz not null default now()
);

create index stellplaetze_we on public.stellplaetze (we);

create trigger preise_wohnungen_touch before update on public.preise_wohnungen
  for each row execute function public.leads_touch();
create trigger stellplaetze_touch before update on public.stellplaetze
  for each row execute function public.leads_touch();

alter table public.preise_wohnungen enable row level security;
alter table public.stellplaetze enable row level security;

create policy preise_wohnungen_lesen on public.preise_wohnungen
  for select to authenticated using (public.ist_team());
create policy preise_wohnungen_aendern on public.preise_wohnungen
  for update to authenticated using (public.ist_team()) with check (public.ist_team());
create policy stellplaetze_lesen on public.stellplaetze
  for select to authenticated using (public.ist_team());
create policy stellplaetze_aendern on public.stellplaetze
  for update to authenticated using (public.ist_team()) with check (public.ist_team());

insert into public.preise_wohnungen (we, lage, zimmer, flaeche_te, kaufpreis, status, stand) values
  ( 1, 'UG', 4, 121.46, 508130, 'verfuegbar', '2026-09-15'),
  ( 2, 'UG', 2,  58.32, 243900, 'reserviert', '2026-09-15'),
  ( 3, 'UG', 3,  87.94, 368550, 'verfuegbar', '2026-09-15'),
  ( 4, 'EG', 3,  90.64, 378110, 'verfuegbar', '2026-09-15'),
  ( 5, 'EG', 4, 112.21, 468950, 'verfuegbar', '2026-09-15'),
  ( 6, 'EG', 2,  58.53, 244850, 'verfuegbar', '2026-09-15'),
  ( 7, 'EG', 3,  83.53, 348350, 'reserviert', '2026-09-15'),
  ( 8, 'EG', 2,  75.54, 316920, 'verfuegbar', '2026-09-15'),
  ( 9, 'OG', 3,  90.61, 377970, 'verfuegbar', '2026-09-15'),
  (10, 'OG', 3,  98.27, 409370, 'verfuegbar', '2026-09-15'),
  (11, 'OG', 2,  53.99, 228370, 'verfuegbar', '2026-09-15'),
  (12, 'OG', 3,  83.13, 346730, 'reserviert', '2026-09-15'),
  (13, 'OG', 2,  75.54, 316920, 'angefragt',  '2026-09-15'),
  (14, 'SG', 3, 113.02, 478390, 'verfuegbar', '2026-09-15'),
  (15, 'SG', 3, 110.63, 467790, 'verfuegbar', '2026-09-15'),
  (16, 'SG', 3, 111.15, 471520, 'reserviert', '2026-09-15');

insert into public.stellplaetze (nr, carport, we, notiz, kaufpreis, status, stand) values
  ( 1, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 2, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 3, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 4, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 5, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 6, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 7, false, null, null,               12500, 'verfuegbar', '2026-09-15'),
  ( 8, false,    7, null,               12500, 'reserviert', '2026-09-15'),
  ( 9, false,    8, 'rollstuhlgerecht', 12500, 'verfuegbar', '2026-09-15'),
  (10, false,   13, 'rollstuhlgerecht', 12500, 'angefragt',  '2026-09-15'),
  (11, true,  null, null,               19800, 'verfuegbar', '2026-09-15'),
  (12, true,  null, null,               19800, 'verfuegbar', '2026-09-15'),
  (13, true,  null, null,               19800, 'verfuegbar', '2026-09-15'),
  (14, true,  null, null,               19800, 'verfuegbar', '2026-09-15'),
  (15, true,    16, null,               19800, 'reserviert', '2026-09-15'),
  (16, true,     2, null,               19800, 'reserviert', '2026-09-15'),
  (17, true,  null, null,               19800, 'verfuegbar', '2026-09-15'),
  (18, true,    12, null,               19800, 'reserviert', '2026-09-15');
