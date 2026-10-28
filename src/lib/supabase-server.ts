import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Supabase mit der Sitzung der angemeldeten Person — RLS gilt. */
export async function supabaseSitzung() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          // In Server Components sind Cookies nur lesbar. Das Auffrischen
          // übernimmt dort die Middleware, hier darf der Versuch still scheitern.
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}

/**
 * Supabase mit dem geheimen Schlüssel — umgeht RLS. Nur für das Speichern
 * öffentlicher Anfragen, nie für etwas, das eine Person im Admin auslöst.
 */
export function supabaseDienst() {
  const schluessel = process.env.SUPABASE_SECRET_KEY;
  if (!schluessel) throw new Error("SUPABASE_SECRET_KEY fehlt");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, schluessel, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Die angemeldete Person, wenn sie zum Team gehört — sonst null. */
export async function teamMitglied() {
  const supabase = await supabaseSitzung();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("team").select("user_id, name").eq("user_id", user.id).maybeSingle();
  return data ? { supabase, user, name: data.name as string } : null;
}
