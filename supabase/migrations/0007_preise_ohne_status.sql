-- Die Kaufpreisliste vom 15.09.2026 ist beim Verkaufsstand veraltet.
-- Status und Zuordnung Stellplatz → Wohnung fliegen raus; der Verkaufsstand
-- wird allein in src/lib/objekte.ts gepflegt. Übrig bleiben die Preise.
alter table public.preise_wohnungen drop column status;
alter table public.stellplaetze drop column status;
alter table public.stellplaetze drop column we;
