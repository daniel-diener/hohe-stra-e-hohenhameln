import { NextResponse } from "next/server";
import type { Lead } from "@/lib/leads";
import { sendeEinladung } from "@/lib/mail";
import { supabaseDienst } from "@/lib/supabase-server";

/**
 * Automatische Einladung zum Termin: Wer nur eine E-Mail-Adresse hinterlassen
 * hat, bekommt einen Tag nach der Anfrage den Buchungslink. Leads mit
 * Telefonnummer ruft das Team an und lädt von Hand ein.
 *
 * Läuft stündlich über Vercel Cron (vercel.json). Mehrfaches Aufrufen schadet
 * nicht: Wer eine Einladung hat (`einladung_at`), bekommt keine zweite.
 * Ist `CRON_SECRET` gesetzt, schickt Vercel es mit, und nur dann wird gearbeitet.
 */
export const dynamic = "force-dynamic";

const WARTEZEIT_STUNDEN = 24;
/** Ältere Anfragen nicht mehr anschreiben — nach einer Woche wirkt die Mail wie ein Versehen. */
const HOECHSTALTER_TAGE = 7;

export async function GET(req: Request) {
  const geheim = process.env.CRON_SECRET;
  if (geheim && req.headers.get("authorization") !== `Bearer ${geheim}`) {
    return NextResponse.json({ fehler: "Nicht erlaubt" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SECRET_KEY) return NextResponse.json({ versendet: 0, hinweis: "keine Datenbank" });

  const supabase = supabaseDienst();
  const jetzt = Date.now();
  const { data: faellig, error } = await supabase
    .from("leads").select("*")
    .eq("status", "neu").is("telefon", null).is("einladung_at", null)
    .lte("created_at", new Date(jetzt - WARTEZEIT_STUNDEN * 3_600_000).toISOString())
    .gte("created_at", new Date(jetzt - HOECHSTALTER_TAGE * 86_400_000).toISOString())
    .order("created_at").limit(20)
    .returns<(Lead & { termin_token: string })[]>();
  if (error) {
    console.error("Einladungen: Abfrage gescheitert", error);
    return NextResponse.json({ fehler: "Abfrage gescheitert" }, { status: 500 });
  }

  let versendet = 0;
  for (const lead of faellig ?? []) {
    if (!(await sendeEinladung(lead, lead.termin_token))) continue;
    // Erst nach erfolgreichem Versand markieren — scheitert die Mail, versucht es der nächste Lauf.
    await supabase.from("leads").update({ einladung_at: new Date().toISOString(), status: "kontaktiert" }).eq("id", lead.id);
    await supabase.from("lead_aktivitaeten").insert({
      lead_id: lead.id, art: "email", text: "Einladung zum Termin mit Buchungslink versendet (automatisch, einen Tag nach der Anfrage).",
    });
    versendet++;
  }
  return NextResponse.json({ versendet });
}
