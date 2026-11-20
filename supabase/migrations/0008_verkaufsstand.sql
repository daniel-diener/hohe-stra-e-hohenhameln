-- Verkaufsstand aus den Leads: Wird ein Lead mit Wohnung auf „reserviert“,
-- „notartermin“ oder „verkauft“ gesetzt, zeigt die Website die Wohnung als
-- reserviert bzw. verkauft. Der Grundstand steht weiter in src/lib/objekte.ts
-- (Verkäufe ohne Lead im System); die Website nimmt den stärkeren von beiden.
--
-- security definer, weil anonym keine Policy auf `leads` greift. Heraus kommen
-- nur Wohnung und Stand — beides steht ohnehin öffentlich auf der Seite.
create function public.verkaufsstand()
returns table (objekt_slug text, status text)
language sql stable security definer set search_path = public as $$
  select objekt_slug,
         case when bool_or(status = 'verkauft') then 'verkauft' else 'reserviert' end
  from public.leads
  where objekt_slug is not null and status in ('reserviert', 'notartermin', 'verkauft')
  group by objekt_slug;
$$;

revoke execute on function public.verkaufsstand() from public;
grant execute on function public.verkaufsstand() to anon, authenticated, service_role;
