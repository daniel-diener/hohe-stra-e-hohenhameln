-- Nachgezogen nach dem Sicherheits-Check von Supabase (Database Linter):
--  * leads_touch mit festem search_path, wie ist_team schon.
--  * ist_team() nur für angemeldete Nutzer aufrufbar. Die Policies brauchen
--    sie für `authenticated`; anonym gibt es nichts zu prüfen.
alter function public.leads_touch() set search_path = public;
revoke execute on function public.ist_team() from public, anon;
grant execute on function public.ist_team() to authenticated;
