import "server-only";
import { cookies } from "next/headers";
import { type Freigabe, TOKEN, cookieName, sitzungPruefen } from "./freigabe";
import { supabaseDienst } from "./supabase-server";

/**
 * Die Freigabe zu einem Link — gelesen mit dem geheimen Schlüssel, denn der
 * Kunde ist nicht angemeldet. Nur nach dem Token, nie nach etwas, das sich raten ließe.
 */
export async function freigabeNachToken(token: string): Promise<Freigabe | null> {
  if (!TOKEN.test(token) || !process.env.SUPABASE_SECRET_KEY) return null;
  const { data } = await supabaseDienst().from("freigaben").select("*").eq("token", token).maybeSingle<Freigabe>();
  return data ?? null;
}

/** true, wenn dieser Browser den Code für diese Freigabe schon richtig eingegeben hat. */
export async function hatZugang(f: Freigabe) {
  return sitzungPruefen((await cookies()).get(cookieName(f))?.value, f);
}
