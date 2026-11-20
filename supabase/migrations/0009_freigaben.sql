-- Freigaben: Unterlagen (Exposés, Vorlagen) für einen Kunden online bereitstellen.
--
--   * Das Team stellt im Lead die Dokumente zusammen. Die PDFs werden dabei
--     einmal gedruckt und im privaten Bucket `freigaben` abgelegt — der Kunde
--     bekommt also den Stand vom Tag der Freigabe, auch wenn sich Preise ändern.
--   * Der Kunde erreicht sie über /unterlagen/<token> (zufällig, 192 Bit) und
--     braucht zusätzlich einen Zugangscode. Vom Code steht hier nur der
--     scrypt-Hash; ihn selbst sieht das Team genau einmal beim Anlegen.
--   * Die öffentliche Seite liest über den Server mit dem geheimen Schlüssel.
--     Anonym gibt es weder auf die Tabelle noch auf den Bucket eine Policy.

create table public.freigaben (
  id                    uuid primary key default gen_random_uuid(),
  lead_id               uuid not null references public.leads (id) on delete cascade,
  token                 text not null unique check (length(token) >= 32),
  code_hash             text not null,
  -- [{ "datei": "expose-wohnung-5.pdf", "titel": "Exposé WE 5" }, …]
  dateien               jsonb not null check (jsonb_typeof(dateien) = 'array' and jsonb_array_length(dateien) > 0),
  gueltig_bis           timestamptz not null,
  widerrufen_at         timestamptz,
  -- Falsche Codes in Folge; ab 10 ist der Link gesperrt, bis das Team einen neuen Code erzeugt.
  fehlversuche          int not null default 0,
  abrufe                int not null default 0,
  zuletzt_abgerufen_at  timestamptz,
  created_by            uuid references public.team (user_id) on delete set null,
  created_at            timestamptz not null default now()
);

create index freigaben_lead on public.freigaben (lead_id, created_at desc);

alter table public.freigaben enable row level security;

create policy freigaben_lesen on public.freigaben
  for select to authenticated using (public.ist_team());
create policy freigaben_anlegen on public.freigaben
  for insert to authenticated with check (public.ist_team() and created_by = auth.uid());
create policy freigaben_aendern on public.freigaben
  for update to authenticated using (public.ist_team()) with check (public.ist_team());

-- Privater Bucket, nur PDFs, höchstens 25 MB je Datei.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('freigaben', 'freigaben', false, 26214400, array['application/pdf'])
on conflict (id) do nothing;

create policy freigaben_dateien_lesen on storage.objects
  for select to authenticated using (bucket_id = 'freigaben' and public.ist_team());
create policy freigaben_dateien_anlegen on storage.objects
  for insert to authenticated with check (bucket_id = 'freigaben' and public.ist_team());
create policy freigaben_dateien_loeschen on storage.objects
  for delete to authenticated using (bucket_id = 'freigaben' and public.ist_team());
