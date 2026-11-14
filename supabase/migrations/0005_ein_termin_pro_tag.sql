-- Pro Tag nur ein Termin: Der Interessent wählt die Startzeit, danach ist der
-- ganze Tag vergeben. Ersetzt die Sperre je Zeitfenster aus 0004.
drop index public.termine_slot;
create unique index termine_tag on public.termine (((beginn at time zone 'Europe/Berlin')::date))
  where status = 'gebucht';
