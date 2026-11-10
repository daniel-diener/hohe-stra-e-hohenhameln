import { projekt } from "./objekte";

/**
 * Anbieterin der Website (Impressum) und Verantwortliche im Datenschutz.
 * Eine Stelle für beide Seiten, damit nichts auseinanderläuft.
 *
 * Felder mit `null` fehlen noch: Die Seiten zeigen dort sichtbar
 * „wird ergänzt", statt etwas zu erfinden. Vor dem Livegang füllen.
 */
export const anbieter = {
  firma: "Judek Projekt GmbH",
  strasse: "Hahnendamm 6",
  plzOrt: "31249 Hohenhameln",
  /** Vertretungsberechtigte Geschäftsführung (Pflicht nach § 5 DDG). */
  geschaeftsfuehrer: null as string | null,
  /** z. B. „Amtsgericht Hildesheim, HRB 12345" (Pflicht, wenn eingetragen). */
  register: null as string | null,
  /** USt-IdNr. nach § 27a UStG, falls vorhanden. */
  ustId: null as string | null,
  /**
   * Erlaubnis nach § 34c GewO (Bauträger) und zuständige Behörde, z. B.
   * „Landkreis Peine, Burgstraße 1, 31224 Peine". Pflicht, wenn erteilt.
   */
  erlaubnis34c: null as string | null,
  /** Kontakt für Impressum und Datenschutz. Vorerst die Vermarktung (Lena Mylin). */
  telefon: projekt.ansprechpartner.telefon,
  email: projekt.ansprechpartner.email,
};

/** Vermarktung und Projektmanagement, im Impressum genannt. */
export const vermarktung = {
  namen: projekt.team.namen,
  kontakt: projekt.ansprechpartner,
};

/** Stand der Datenschutzerklärung, bei jeder inhaltlichen Änderung anpassen. */
export const datenschutzStand = "November 2026";
