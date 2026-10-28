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
