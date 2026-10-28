"use server";

import { pruefeAnfrage, type Pruefung } from "@/lib/anfrage";
import { meldeNeueAnfrage } from "@/lib/mail";
import { supabaseDienst } from "@/lib/supabase-server";

export type AnfrageStand =
  | { stand: "offen" }
  | { stand: "gesendet" }
  | { stand: "fehler"; fehler: Extract<Pruefung, { spam: false }>["fehler"]; meldung?: string };

export async function sendeAnfrage(_vorher: AnfrageStand, form: FormData): Promise<AnfrageStand> {
  const pruefung = pruefeAnfrage(form, Date.now());

  if (!pruefung.ok) {
    if (pruefung.spam) return { stand: "gesendet" };
    return { stand: "fehler", fehler: pruefung.fehler };
  }

  const a = pruefung.anfrage;
  const { data, error } = await supabaseDienst()
    .from("leads")
    .insert({ ...a, einwilligung_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Anfrage nicht gespeichert:", error);
    return {
      stand: "fehler",
      fehler: {},
      meldung: "Ihre Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es gleich noch einmal oder rufen Sie uns an.",
    };
  }

  // Abgewartet, nicht abgeschickt und vergessen: Auf Vercel endet die
  // Funktion mit der Antwort, eine offene Mail ginge dann verloren.
  await meldeNeueAnfrage(data.id, a);
  return { stand: "gesendet" };
}
