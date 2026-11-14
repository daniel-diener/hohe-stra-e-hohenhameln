"use server";

import { revalidatePath } from "next/cache";
import type { Lead } from "@/lib/leads";
import { supabaseDienst } from "@/lib/supabase-server";
import { bucheTermin } from "@/lib/termin-buchen";

export type BuchungsStand =
  | { stand: "offen" }
  | { stand: "gebucht"; beginn: string }
  | { stand: "fehler"; meldung: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Bucht den gewählten Termin für den Lead, dem der Link gehört. */
export async function bucheOnline(_vorher: BuchungsStand, form: FormData): Promise<BuchungsStand> {
  const token = String(form.get("token") ?? "");
  const beginn = new Date(String(form.get("beginn") ?? ""));
  if (!UUID.test(token) || Number.isNaN(beginn.getTime())) {
    return { stand: "fehler", meldung: "Bitte wählen Sie einen Termin aus." };
  }

  const supabase = supabaseDienst();
  const { data: lead } = await supabase.from("leads").select("*").eq("termin_token", token).maybeSingle<Lead & { termin_token: string }>();
  if (!lead) return { stand: "fehler", meldung: "Dieser Link ist nicht mehr gültig. Bitte melden Sie sich bei uns." };

  const ergebnis = await bucheTermin(supabase, lead, beginn, "online");
  revalidatePath(`/termin/${token}`);
  if (ergebnis.ok) return { stand: "gebucht", beginn: ergebnis.termin.beginn };
  return {
    stand: "fehler",
    meldung:
      ergebnis.grund === "belegt"
        ? "Dieser Termin wurde gerade von jemand anderem gebucht. Bitte wählen Sie einen anderen."
        : ergebnis.grund === "ungueltig"
          ? "Dieser Termin ist nicht mehr verfügbar. Bitte wählen Sie einen anderen."
          : "Der Termin konnte gerade nicht gespeichert werden. Bitte versuchen Sie es gleich noch einmal oder rufen Sie uns an.",
  };
}
