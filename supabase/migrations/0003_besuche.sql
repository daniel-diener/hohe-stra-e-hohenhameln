-- Besucherstatistik, ohne Cookies und ohne IP-Adressen.
--
-- Jeder Seitenaufruf wird als Zeile gespeichert: Pfad, Herkunft (nur der
-- Hostname der verweisenden Seite oder die Kampagnenkennung), Gerätetyp,
-- Land. Um Besucher zählen zu können, ohne sie wiederzuerkennen, speichert der
-- Server nur einen Hash aus IP-Adresse, Browserkennung und einem Salz, das
-- jeden Tag neu gewürfelt und am nächsten Tag gelöscht wird. Danach lässt
-- sich aus dem Hash niemand mehr zurückrechnen, und derselbe Mensch zählt an
-- jedem Tag als neuer Besucher. (Verfahren wie bei Plausible Analytics.)
--
-- Schreiben: nur der Server mit dem geheimen Schlüssel (keine Policy für anon).
-- Lesen: nur das Team.

create table public.besuche (
  id           bigint generated always as identity primary key,
  zeit         timestamptz not null default now(),
  pfad         text not null check (length(pfad) <= 300),
  herkunft     text check (length(herkunft) <= 200),
  utm_source   text check (length(utm_source) <= 100),
  utm_medium   text check (length(utm_medium) <= 100),
  utm_campaign text check (length(utm_campaign) <= 100),
  geraet       text not null check (geraet in ('mobil', 'tablet', 'desktop')),
  land         text check (length(land) <= 2),
  besucher     text not null check (length(besucher) <= 32)
);

create index besuche_zeit on public.besuche (zeit desc);

alter table public.besuche enable row level security;
create policy besuche_lesen on public.besuche
  for select to authenticated using (public.ist_team());

-- Das Tagessalz. Keine Policy: nur der geheime Schlüssel kommt heran.
create table public.besuch_salz (
  tag  date primary key,
  salz text not null
);
alter table public.besuch_salz enable row level security;

-- Auswertung für die Statistik-Seite. security invoker: Es gelten die
-- Zeilenrechte der angemeldeten Person — wer nicht im Team ist, sieht Nullen.
create function public.besuchsstatistik(tage int default 30) returns jsonb
language sql stable security invoker set search_path = public as $$
  with
  grenze as (
    select ((now() at time zone 'Europe/Berlin')::date - (greatest(tage, 1) - 1)) as ab_tag
  ),
  ab as (
    select (ab_tag::timestamp at time zone 'Europe/Berlin') as zeit, ab_tag from grenze
  ),
  b as (select * from besuche where zeit >= (select zeit from ab)),
  l as (select * from leads where created_at >= (select zeit from ab)),
  tage_liste as (
    select d::date as tag
    from generate_series((select ab_tag from ab), (now() at time zone 'Europe/Berlin')::date, interval '1 day') d
  ),
  pro_tag as (
    select (zeit at time zone 'Europe/Berlin')::date as tag,
           count(distinct besucher) as besucher, count(*) as aufrufe
    from b group by 1
  ),
  anfragen_tag as (
    select (created_at at time zone 'Europe/Berlin')::date as tag, count(*) as anfragen
    from l group by 1
  )
  select jsonb_build_object(
    'tage', greatest(tage, 1),
    'besucher', (select count(distinct besucher) from b),
    'aufrufe', (select count(*) from b),
    'anfragen', (select count(*) from l),
    'pro_tag', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'tag', t.tag, 'besucher', coalesce(p.besucher, 0), 'aufrufe', coalesce(p.aufrufe, 0),
        'anfragen', coalesce(a.anfragen, 0)) order by t.tag), '[]'::jsonb)
      from tage_liste t
      left join pro_tag p on p.tag = t.tag
      left join anfragen_tag a on a.tag = t.tag
    ),
    'seiten', (
      select coalesce(jsonb_agg(s), '[]'::jsonb) from (
        select pfad, count(*) as aufrufe, count(distinct besucher) as besucher
        from b group by pfad order by aufrufe desc limit 25
      ) s
    ),
    'herkunft', (
      select coalesce(jsonb_agg(s), '[]'::jsonb) from (
        select coalesce(utm_source, herkunft, 'Direkt') as quelle, count(distinct besucher) as besucher
        from b group by 1 order by besucher desc limit 15
      ) s
    ),
    'kampagnen', (
      select coalesce(jsonb_agg(s), '[]'::jsonb) from (
        select utm_campaign as kampagne, count(distinct besucher) as besucher
        from b where utm_campaign is not null group by 1 order by besucher desc limit 10
      ) s
    ),
    'anfragen_herkunft', (
      select coalesce(jsonb_agg(s), '[]'::jsonb) from (
        select coalesce(
                 quelle->>'utm_source',
                 substring(quelle->>'referrer' from '^https?://(?:www\.)?([^/:]+)'),
                 'Direkt') as quelle,
               count(*) as anfragen
        from l group by 1 order by anfragen desc limit 15
      ) s
    ),
    'geraete', (
      select coalesce(jsonb_agg(s), '[]'::jsonb) from (
        select geraet, count(distinct besucher) as besucher from b group by 1 order by besucher desc
      ) s
    ),
    'laender', (
      select coalesce(jsonb_agg(s), '[]'::jsonb) from (
        select coalesce(land, '?') as land, count(distinct besucher) as besucher
        from b group by 1 order by besucher desc limit 8
      ) s
    )
  );
$$;

revoke execute on function public.besuchsstatistik(int) from public, anon;
grant execute on function public.besuchsstatistik(int) to authenticated;
