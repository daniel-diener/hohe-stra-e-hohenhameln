-- Follow-up (Wiedervorlage) je Lead: ein Datum und ein kurzer Hinweis, worum es geht.
-- Steht im Lead oben und in der Leadliste; ab dem Tag selbst ist es als fällig markiert.
-- Zeilensicherheit gilt unverändert über die Policies auf `leads`.

alter table public.leads
  add column wiedervorlage_am   date,
  add column wiedervorlage_text text check (length(wiedervorlage_text) <= 500);

create index leads_wiedervorlage on public.leads (wiedervorlage_am) where wiedervorlage_am is not null;
