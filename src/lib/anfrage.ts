import { FINANZIERUNG, ZWECK, istEines, type Finanzierung, type Zweck } from "./labels";
import { objektNach } from "./objekte";

/**
 * Prüft das Anfrageformular. Rein — kein Netz, keine Datenbank —, damit es
 * sich ohne Supabase testen lässt.
 */

export type Anfrage = {
  objekt_slug: string | null;
  name: string;
  email: string;
  telefon: string | null;
  nachricht: string | null;
  zweck: Zweck;
  finanzierung: Finanzierung;
  rueckruf: boolean;
  quelle: Record<string, string>;
};

export type Pruefung =
  | { ok: true; anfrage: Anfrage }
  | { ok: false; spam: true }
  | { ok: false; spam: false; fehler: Partial<Record<keyof Anfrage | "einwilligung", string>> };

/**
 * Unter dieser Zeit zwischen Seitenaufruf und Absenden tippt kein Mensch
 * Name, E-Mail und Haken. Bots füllen sofort aus.
 */
export const MIN_AUSFUELLZEIT_MS = 3000;

const QUELLE_FELDER = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "referrer"];

function text(form: FormData, feld: string, max: number): string {
  const wert = form.get(feld);
  return typeof wert === "string" ? wert.trim().slice(0, max) : "";
}

export function pruefeAnfrage(form: FormData, jetzt: number): Pruefung {
  // Honigtopf: Das Feld ist für Menschen unsichtbar. Wer es füllt, ist ein Bot.
  // Die Antwort ist trotzdem „danke" — ein Bot soll nicht lernen, was ihn verrät.
  if (text(form, "firma", 200) !== "") return { ok: false, spam: true };
  const fehler: Extract<Pruefung, { spam: false }>["fehler"] = {};

  const name = text(form, "name", 200);
  if (name.length < 2) fehler.name = "Bitte geben Sie Ihren Namen an.";

  const email = text(form, "email", 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fehler.email = "Bitte prüfen Sie die E-Mail-Adresse.";

  const telefon = text(form, "telefon", 40);
  if (telefon && !/^[+0-9 ()/\-]{6,40}$/.test(telefon)) fehler.telefon = "Bitte prüfen Sie die Telefonnummer.";

  const rueckruf = form.get("rueckruf") === "on";
  if (rueckruf && !telefon) fehler.telefon = "Für einen Rückruf brauchen wir Ihre Telefonnummer.";

  if (form.get("einwilligung") !== "on") {
    fehler.einwilligung = "Bitte bestätigen Sie den Datenschutzhinweis.";
  }

  const slug = text(form, "objekt", 100);
  // Ein unbekannter Slug wird zur allgemeinen Anfrage, statt sie abzuweisen:
  // Wer schreibt, soll nicht an einem veralteten Link scheitern.
  const objekt_slug = objektNach(slug)?.slug ?? null;

  const zweckRoh = text(form, "zweck", 30);
  const finanzierungRoh = text(form, "finanzierung", 30);

  if (Object.keys(fehler).length > 0) return { ok: false, spam: false, fehler };

  // Erst nach den Feldfehlern: Wer ein leeres Formular sofort abschickt, soll
  // sehen, was fehlt — und nicht für einen Bot gehalten und still bedankt werden.
  const geladenRoh = text(form, "geladen", 20);
  const geladen = Number(geladenRoh);
  if (!geladenRoh || !Number.isFinite(geladen) || jetzt - geladen < MIN_AUSFUELLZEIT_MS) return { ok: false, spam: true };

  const quelle: Record<string, string> = {};
  for (const feld of QUELLE_FELDER) {
    const wert = text(form, feld, 300);
    if (wert) quelle[feld] = wert;
  }

  return {
    ok: true,
    anfrage: {
      objekt_slug,
      name,
      email,
      telefon: telefon || null,
      nachricht: text(form, "nachricht", 4000) || null,
      zweck: istEines(ZWECK, zweckRoh) ? zweckRoh : "offen",
      finanzierung: istEines(FINANZIERUNG, finanzierungRoh) ? finanzierungRoh : "in_klaerung",
      rueckruf,
      quelle,
    },
  };
}
