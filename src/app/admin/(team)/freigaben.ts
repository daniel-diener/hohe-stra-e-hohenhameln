"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { dokumentNach } from "@/lib/dokumente";
import {
  BUCKET, type Freigabe, type FreigabeDatei, GUELTIGKEIT_TAGE, neuerCode, neuerToken, speicherPfad,
} from "@/lib/freigabe";
import type { Lead } from "@/lib/leads";
import { pdfsErzeugen } from "@/lib/pdf";
import { seitenUrl } from "@/lib/seite";
import { teamMitglied } from "@/lib/supabase-server";

/**
 * Unterlagen für einen Kunden online freigeben. Alles läuft mit der Sitzung der
 * angemeldeten Person (RLS auf Tabelle und Bucket); die öffentliche Seite unter
 * /unterlagen/<token> liest später mit dem geheimen Schlüssel.
 */

export type FreigabeStand =
  | { stand: "offen" }
  | { stand: "fertig"; link: string; code: string; hinweis?: string }
  | { stand: "fehler"; meldung: string };

const TAG = 24 * 60 * 60 * 1000;

async function team() {
  const m = await teamMitglied();
  if (!m) throw new Error("Kein Zugang");
  return m;
}

const linkZu = (token: string) => new URL(`/unterlagen/${token}`, seitenUrl).href;
const datumKurz = (iso: string) => new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });

export async function erstelleFreigabe(_vorher: FreigabeStand, form: FormData): Promise<FreigabeStand> {
  const { supabase, user } = await team();
  const leadId = String(form.get("id"));
  const liste = [...new Set(form.getAll("datei").map(String))].map(dokumentNach).filter((d) => d !== undefined);
  const tage = Number(form.get("tage"));
  if (!liste.length) return { stand: "fehler", meldung: "Bitte mindestens ein Dokument auswählen." };
  if (!GUELTIGKEIT_TAGE.includes(tage as (typeof GUELTIGKEIT_TAGE)[number])) return { stand: "fehler", meldung: "Ungültige Laufzeit." };

  const { data: lead } = await supabase.from("leads").select("id").eq("id", leadId).maybeSingle<Pick<Lead, "id">>();
  if (!lead) return { stand: "fehler", meldung: "Lead nicht gefunden." };

  // Die Exposés einmal drucken — mit den Cookies dieser Person, wie im Reiter „Dokumente“.
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  let pdfs: Uint8Array[];
  try {
    pdfs = await pdfsErzeugen(origin, (await cookies()).getAll(), liste);
  } catch (e) {
    console.error("Freigabe: PDFs fehlgeschlagen", e);
    return { stand: "fehler", meldung: "Die PDFs konnten nicht erstellt werden. Bitte noch einmal versuchen." };
  }

  const id = randomUUID();
  const ablage = supabase.storage.from(BUCKET);
  const pfade = liste.map((d) => speicherPfad(id, d.datei));
  const hochgeladen = await Promise.all(
    liste.map((_, i) => ablage.upload(pfade[i], Buffer.from(pdfs[i]), { contentType: "application/pdf", upsert: false })),
  );
  const fehler = hochgeladen.find((r) => r.error)?.error;
  if (fehler) {
    console.error("Freigabe: Ablage fehlgeschlagen", fehler);
    await ablage.remove(pfade);
    return { stand: "fehler", meldung: "Die Dateien konnten nicht abgelegt werden. Ist die Migration 0009 eingespielt?" };
  }

  const token = neuerToken();
  const code = neuerCode();
  const dateien: FreigabeDatei[] = liste.map((d) => ({ datei: d.datei, titel: d.titel }));
  const gueltigBis = new Date(Date.now() + tage * TAG).toISOString();
  const { error } = await supabase.from("freigaben").insert({
    id, lead_id: lead.id, token, code, dateien, gueltig_bis: gueltigBis, created_by: user.id,
  });
  if (error) {
    console.error("Freigabe: Speichern fehlgeschlagen", error);
    await ablage.remove(pfade);
    return { stand: "fehler", meldung: "Die Freigabe konnte nicht gespeichert werden." };
  }

  // Bewusst keine Mail: Das Team schickt Link und Code selbst an den Kunden.
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: lead.id,
    art: "notiz",
    text: `Unterlagen online freigegeben (bis ${datumKurz(gueltigBis)}): ${dateien.map((d) => d.titel).join(", ")}.`,
    created_by: user.id,
  });
  revalidatePath(`/admin/leads/${lead.id}`);
  return { stand: "fertig", link: linkZu(token), code };
}

/** Neuer Zugangscode, etwa wenn der alte verloren ging oder der Link nach Fehlversuchen gesperrt ist. */
export async function erneuereCode(_vorher: FreigabeStand, form: FormData): Promise<FreigabeStand> {
  const { supabase } = await team();
  const id = String(form.get("freigabe"));
  const code = neuerCode();
  const { data } = await supabase
    .from("freigaben").update({ code, fehlversuche: 0 }).eq("id", id).is("widerrufen_at", null)
    .select("token, lead_id").maybeSingle<Pick<Freigabe, "token" | "lead_id">>();
  if (!data) return { stand: "fehler", meldung: "Freigabe nicht gefunden oder widerrufen." };
  revalidatePath(`/admin/leads/${data.lead_id}`);
  return { stand: "fertig", link: linkZu(data.token), code, hinweis: "Der alte Code gilt ab sofort nicht mehr." };
}

/** Link sofort abschalten und die abgelegten PDFs löschen. */
export async function widerrufeFreigabe(form: FormData) {
  const { supabase, user } = await team();
  const id = String(form.get("freigabe"));
  const { data } = await supabase
    .from("freigaben").update({ widerrufen_at: new Date().toISOString() }).eq("id", id).is("widerrufen_at", null)
    .select("lead_id, dateien").maybeSingle<Pick<Freigabe, "lead_id" | "dateien">>();
  if (!data) return;
  await supabase.storage.from(BUCKET).remove(data.dateien.map((d) => speicherPfad(id, d.datei)));
  await supabase.from("lead_aktivitaeten").insert({
    lead_id: data.lead_id, art: "notiz", text: "Online-Freigabe der Unterlagen widerrufen.", created_by: user.id,
  });
  revalidatePath(`/admin/leads/${data.lead_id}`);
}
