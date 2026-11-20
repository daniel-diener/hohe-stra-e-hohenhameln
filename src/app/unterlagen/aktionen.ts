"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MAX_FEHLVERSUCHE, codePruefen, cookieName, sitzungsWert, sperrgrund } from "@/lib/freigabe";
import { freigabeNachToken } from "@/lib/freigabe-server";
import { supabaseDienst } from "@/lib/supabase-server";

export type CodeStand = { meldung: string | null };

/** Prüft den Zugangscode. Richtig: Cookie für diesen Link setzen. Falsch: Fehlversuch zählen. */
export async function entsperren(_vorher: CodeStand, form: FormData): Promise<CodeStand> {
  const token = String(form.get("token") ?? "");
  const code = String(form.get("code") ?? "").slice(0, 40);
  const f = await freigabeNachToken(token);
  if (!f || sperrgrund(f)) return { meldung: "Dieser Link ist nicht mehr gültig. Bitte melden Sie sich bei uns." };

  if (!codePruefen(code, f.code_hash)) {
    const versuche = f.fehlversuche + 1;
    await supabaseDienst().from("freigaben").update({ fehlversuche: versuche }).eq("id", f.id);
    // Ein bisschen bremsen, damit sich nicht in Serie raten lässt.
    await new Promise((r) => setTimeout(r, 800));
    const rest = MAX_FEHLVERSUCHE - versuche;
    return {
      meldung: rest > 0
        ? `Der Code stimmt nicht. Noch ${rest} ${rest === 1 ? "Versuch" : "Versuche"}.`
        : "Der Code stimmt nicht. Der Link ist jetzt gesperrt — bitte melden Sie sich bei uns, wir schicken Ihnen einen neuen Code.",
    };
  }

  if (f.fehlversuche > 0) await supabaseDienst().from("freigaben").update({ fehlversuche: 0 }).eq("id", f.id);
  (await cookies()).set(cookieName(f), sitzungsWert(f), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/unterlagen/${token}`,
    expires: new Date(f.gueltig_bis),
  });
  redirect(`/unterlagen/${token}`);
}
