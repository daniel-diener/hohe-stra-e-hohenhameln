"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BUCKET, type Freigabe, speicherPfad } from "@/lib/freigabe";
import { AKTIVITAET, LEAD_STATUS, istEines, leadStatusLabel } from "@/lib/labels";
import type { Lead } from "@/lib/leads";
import { sendeEinladung, sendeTerminAbsage } from "@/lib/mail";
import { objektNach } from "@/lib/objekte";
import { teamMitglied } from "@/lib/supabase-server";
import { bucheTermin } from "@/lib/termin-buchen";
import { terminText } from "@/lib/termine";

/**
 * Alle Änderungen laufen mit der Sitzung der angemeldeten Person — RLS
 * entscheidet, nicht diese Datei. Der Test auf `teamMitglied` ist nur dafür
 * da, eine verständliche Meldung statt eines stillen Nichts zu geben.
 */
/** Status und Wohnung eines Leads bestimmen den Stand auf der Website — dort sofort auffrischen. */
function standAuffrischen() {
  revalidatePath("/", "layout");
}

async function team() {
  const m = await teamMitglied();
  if (!m) throw new Error("Kein Zugang");
  return m;
}

export async function setzeStatus(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("id"));
  const status = form.get("status");
  if (!istEines(LEAD_STATUS, status)) throw new Error("Unbekannter Status");

  const { data: vorher } = await supabase.from("leads").select("status").eq("id", id).single();
  if (!vorher || vorher.status === status) return;

  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw error;
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: id,
    art: "status",
    text: `${leadStatusLabel[vorher.status as keyof typeof leadStatusLabel]} → ${leadStatusLabel[status]}`,
    created_by: user.id,
  });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  standAuffrischen();
}

/** Ordnet den Lead einer Wohnung zu (leer = allgemeine Anfrage). Erscheint so im Reiter „Wohnungen“. */
export async function setzeWohnung(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("id"));
  const wahl = String(form.get("objekt") ?? "");
  const neu = objektNach(wahl);
  if (wahl && !neu) throw new Error("Unbekannte Wohnung");

  const { data: vorher } = await supabase.from("leads").select("objekt_slug").eq("id", id).single();
  if (!vorher || (vorher.objekt_slug ?? "") === (neu?.slug ?? "")) return;

  const { error } = await supabase.from("leads").update({ objekt_slug: neu?.slug ?? null }).eq("id", id);
  if (error) throw error;
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: id,
    art: "status",
    text: `Wohnung: ${objektNach(vorher.objekt_slug)?.titel ?? "Allgemein"} → ${neu?.titel ?? "Allgemein"}`,
    created_by: user.id,
  });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/wohnungen");
  standAuffrischen();
}

export async function notiere(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("id"));
  const art = form.get("art");
  const text = String(form.get("text") ?? "").trim().slice(0, 4000);
  if (!istEines(AKTIVITAET, art) || art === "status" || !text) return;

  const { error } = await supabase.from("lead_aktivitaeten").insert({ lead_id: id, art, text, created_by: user.id });
  if (error) throw error;

  // Ein erster Anruf oder eine erste Mail macht aus „neu" „kontaktiert" —
  // sonst bleibt der Lead in der Liste rot, obwohl längst jemand dran ist.
  if (art === "anruf" || art === "email") {
    await supabase.from("leads").update({ status: "kontaktiert" }).eq("id", id).eq("status", "neu");
  }
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

export async function loesche(form: FormData) {
  const { supabase } = await team();
  const id = String(form.get("id"));
  if (form.get("bestaetigt") !== "on") return;
  // Die Zeilen in `freigaben` gehen per Kaskade mit, die abgelegten PDFs nicht von selbst.
  const { data: freigaben } = await supabase.from("freigaben").select("id, dateien").eq("lead_id", id)
    .returns<Pick<Freigabe, "id" | "dateien">[]>();
  const pfade = (freigaben ?? []).flatMap((f) => f.dateien.map((d) => speicherPfad(f.id, d.datei)));
  if (pfade.length) await supabase.storage.from(BUCKET).remove(pfade);
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  standAuffrischen();
  redirect("/admin");
}

/** Schickt dem Interessenten die Einladung mit Buchungslink — etwa nach einem Telefonat ohne festen Termin. */
export async function ladeEin(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("id"));
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>();
  if (!lead) return;

  const versendet = await sendeEinladung(lead, lead.termin_token);
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: id,
    art: "email",
    text: versendet
      ? "Einladung zum Termin mit Buchungslink versendet."
      : "Einladung zum Termin konnte nicht versendet werden (Mailversand prüfen).",
    created_by: user.id,
  });
  if (versendet) {
    await supabase.from("leads").update({ einladung_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("leads").update({ status: "kontaktiert" }).eq("id", id).eq("status", "neu");
  }
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

/** Trägt einen am Telefon vereinbarten Termin ein. Bestätigungen gehen raus wie bei der Online-Buchung. */
export async function trageTerminEin(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("id"));
  const beginn = new Date(String(form.get("beginn") ?? ""));
  if (Number.isNaN(beginn.getTime())) return;
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>();
  if (!lead) return;

  const ergebnis = await bucheTermin(supabase, lead, beginn, "team", user.id);
  if (!ergebnis.ok) {
    await supabase.from("lead_aktivitaeten").insert({
      lead_id: id,
      art: "notiz",
      text: `Termin ${terminText(beginn)} konnte nicht eingetragen werden: ${ergebnis.grund === "belegt" ? "An diesem Tag steht schon ein Termin." : "Bitte erneut versuchen."}`,
      created_by: user.id,
    });
  }
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

/** Sagt den gebuchten Termin ab und gibt das Zeitfenster frei. Gastgeber und Team bekommen eine kurze Mail. */
export async function sageTerminAb(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("id"));
  const terminId = String(form.get("termin"));
  const { data: termin } = await supabase
    .from("termine").update({ status: "abgesagt" }).eq("id", terminId).eq("lead_id", id).eq("status", "gebucht")
    .select("beginn").maybeSingle<{ beginn: string }>();
  if (!termin) return;

  const { data: lead } = await supabase.from("leads").select("name, telefon, email").eq("id", id).maybeSingle<Pick<Lead, "name" | "telefon" | "email">>();
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: id, art: "besichtigung", text: `Termin abgesagt: ${terminText(termin.beginn)}`, created_by: user.id,
  });
  if (lead) await sendeTerminAbsage(lead, termin.beginn);
  revalidatePath(`/admin/leads/${id}`);
}
