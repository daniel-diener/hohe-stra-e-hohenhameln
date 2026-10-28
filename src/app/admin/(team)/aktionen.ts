"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AKTIVITAET, LEAD_STATUS, istEines, leadStatusLabel } from "@/lib/labels";
import { teamMitglied } from "@/lib/supabase-server";

/**
 * Alle Änderungen laufen mit der Sitzung der angemeldeten Person — RLS
 * entscheidet, nicht diese Datei. Der Test auf `teamMitglied` ist nur dafür
 * da, eine verständliche Meldung statt eines stillen Nichts zu geben.
 */
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
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  redirect("/admin");
}
