import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "./leads";
import { sendeTerminMails } from "./mail";
import { istTermin, terminText } from "./termine";

export type Termin = { id: string; lead_id: string; beginn: string; status: "gebucht" | "abgesagt"; quelle: "online" | "team" };

export type Buchung =
  | { ok: true; termin: Termin }
  | { ok: false; grund: "belegt" | "ungueltig" | "fehler" };

type LeadMitToken = Lead & { termin_token: string };

/**
 * Bucht ein Zeitfenster für einen Lead, sagt einen früheren Termin desselben
 * Leads ab (Verschieben) und verschickt die Bestätigungen.
 *
 * `supabase` entscheidet über die Rechte: Die Buchungsseite kommt mit dem
 * Dienstschlüssel, der Vertriebsbereich mit der Sitzung der angemeldeten Person.
 * Dass ein Fenster nur einmal vergeben wird, sichert der Index `termine_slot`.
 */
export async function bucheTermin(
  supabase: SupabaseClient, lead: LeadMitToken, beginn: Date, quelle: "online" | "team", userId?: string,
): Promise<Buchung> {
  if (!istTermin(beginn, new Date())) return { ok: false, grund: "ungueltig" };

  const { data: termin, error } = await supabase
    .from("termine")
    .insert({ lead_id: lead.id, beginn: beginn.toISOString(), quelle, created_by: userId ?? null })
    .select("id, lead_id, beginn, status, quelle")
    .single<Termin>();
  if (error || !termin) {
    // 23505 = unique_violation: Jemand anderes war schneller.
    if (error?.code === "23505") return { ok: false, grund: "belegt" };
    console.error("Termin nicht gespeichert:", error);
    return { ok: false, grund: "fehler" };
  }

  const { data: alte } = await supabase
    .from("termine").update({ status: "abgesagt" })
    .eq("lead_id", lead.id).eq("status", "gebucht").neq("id", termin.id)
    .select("id");
  const verschoben = (alte?.length ?? 0) > 0;

  // Ein Termin macht aus „neu" oder „kontaktiert" die nächste Stufe; spätere Stufen bleiben.
  await supabase.from("leads").update({ status: "besichtigung" }).eq("id", lead.id).in("status", ["neu", "kontaktiert"]);
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: lead.id,
    art: "besichtigung",
    text: `Termin ${verschoben ? "verschoben auf" : "vereinbart"}: ${terminText(termin.beginn)} (${quelle === "online" ? "online gebucht" : "vom Team eingetragen"})`,
    created_by: userId ?? null,
  });

  await sendeTerminMails(lead, termin, lead.termin_token);
  return { ok: true, termin };
}
