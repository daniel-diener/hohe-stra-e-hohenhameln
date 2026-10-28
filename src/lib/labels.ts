import type { ObjektStatus } from "./objekte";

export const LEAD_STATUS = [
  "neu",
  "kontaktiert",
  "besichtigung",
  "finanzierung",
  "reserviert",
  "notartermin",
  "verkauft",
  "abgesagt",
] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];

export const leadStatusLabel: Record<LeadStatus, string> = {
  neu: "Neu",
  kontaktiert: "Kontaktiert",
  besichtigung: "Besichtigung",
  finanzierung: "Finanzierung",
  reserviert: "Reserviert",
  notartermin: "Notartermin",
  verkauft: "Verkauft",
  abgesagt: "Abgesagt",
};

export const ZWECK = ["eigennutzung", "kapitalanlage", "offen"] as const;
export type Zweck = (typeof ZWECK)[number];
export const zweckLabel: Record<Zweck, string> = {
  eigennutzung: "Eigennutzung",
  kapitalanlage: "Kapitalanlage",
  offen: "Noch offen",
};

export const FINANZIERUNG = ["eigenkapital", "zusage", "in_klaerung"] as const;
export type Finanzierung = (typeof FINANZIERUNG)[number];
export const finanzierungLabel: Record<Finanzierung, string> = {
  eigenkapital: "Aus Eigenkapital",
  zusage: "Finanzierungszusage liegt vor",
  in_klaerung: "Noch in Klärung",
};

export const AKTIVITAET = ["notiz", "anruf", "email", "besichtigung", "status"] as const;
export type Aktivitaet = (typeof AKTIVITAET)[number];
export const aktivitaetLabel: Record<Aktivitaet, string> = {
  notiz: "Notiz",
  anruf: "Anruf",
  email: "E-Mail",
  besichtigung: "Besichtigung",
  status: "Status",
};

export const objektStatusLabel: Record<ObjektStatus, string> = {
  verfuegbar: "Verfügbar",
  reserviert: "Reserviert",
  verkauft: "Verkauft",
};

export function istEines<T extends string>(liste: readonly T[], wert: unknown): wert is T {
  return typeof wert === "string" && (liste as readonly string[]).includes(wert);
}
