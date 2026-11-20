import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { objekte, type Objekt, type ObjektStatus } from "./objekte";
import { mitStand } from "./stand";

/**
 * Wohnungen mit dem Verkaufsstand aus den Leads (RPC `verkaufsstand`).
 * Fällt die Datenbank aus, zeigt die Seite den Grundstand aus objekte.ts —
 * lieber leicht veraltet als gar nicht.
 */
export const objekteMitStand = cache(async (): Promise<Objekt[]> => {
  const stand = new Map<string, ObjektStatus>();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const schluessel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && schluessel) {
    const supabase = createClient(url, schluessel, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.rpc("verkaufsstand");
    if (error) console.error("Verkaufsstand nicht geladen:", error.message);
    for (const z of (data ?? []) as { objekt_slug: string; status: ObjektStatus }[]) stand.set(z.objekt_slug, z.status);
  }
  return mitStand(objekte, stand);
});

export async function objektMitStand(slug: string | null | undefined): Promise<Objekt | undefined> {
  return slug ? (await objekteMitStand()).find((o) => o.slug === slug) : undefined;
}
