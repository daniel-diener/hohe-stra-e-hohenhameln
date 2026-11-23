import type { Aktivitaet, Finanzierung, LeadStatus, Zweck } from "./labels";

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  objekt_slug: string | null;
  name: string;
  email: string;
  telefon: string | null;
  nachricht: string | null;
  zweck: Zweck;
  finanzierung: Finanzierung;
  rueckruf: boolean;
  einwilligung_at: string;
  status: LeadStatus;
  quelle: Record<string, string>;
  /** Persönlicher Schlüssel für die Buchungsseite /termin/<token>. */
  termin_token: string;
  /** Wann das Team die Einladung zum Termin verschickt hat. Automatisch geht keine raus. */
  einladung_at: string | null;
  /** Follow-up (Wiedervorlage) als Kalendertag „JJJJ-MM-TT“, leer = keins. */
  wiedervorlage_am: string | null;
  wiedervorlage_text: string | null;
};

export type LeadAktivitaet = {
  id: string;
  lead_id: string;
  art: Aktivitaet;
  text: string;
  created_at: string;
  team: { name: string } | null;
};

/**
 * Suchbegriff für einen PostgREST-`or`-Filter. Komma, Klammern und Punkt
 * gliedern dort den Filter selbst — stehen sie im Begriff, wird aus der Suche
 * ein anderer Filter.
 */
export function suchbegriff(q: string | undefined): string | null {
  const s = (q ?? "").replace(/[,().*%\\]/g, " ").trim().slice(0, 100);
  return s.length >= 2 ? s : null;
}

/** Heute als „JJJJ-MM-TT“ in Berliner Zeit — zum Vergleich mit `wiedervorlage_am`. */
export function heuteBerlin(jetzt = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(jetzt);
}

/** „12.12.2026“ aus „2026-12-12“ — ohne Zeitzonenrechnung, es ist ein reiner Kalendertag. */
export function formatTag(tag: string): string {
  const [j, m, t] = tag.split("-");
  return `${t}.${m}.${j}`;
}
