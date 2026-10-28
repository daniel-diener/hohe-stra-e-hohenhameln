/**
 * Projekt und Objekte — die einzige Stelle, an der Inhalte gepflegt werden.
 *
 * Quelle der Flächen: Grundriss EG der Genehmigungsplanung (FINK + TEAM,
 * 19.01.2026, V3). Die Wohnfläche ist die Summe der Innenräume laut Plan;
 * Terrasse und Loggia stehen getrennt unter `freisitz`, weil sie nach WoFlV
 * nur anteilig zählen. Ändert sich die Planung, ändern sich die Zahlen hier.
 *
 * Was noch fehlt, ist mit TODO markiert (Preise, Energiewerte, Provision,
 * Texte). Was hier steht, landet in Anzeigen und im Exposé — eine Abweichung
 * ist ein Haftungsthema, kein Schönheitsfehler.
 *
 * Fotos und Visualisierungen: nach `public/objekte/<slug>/` legen und unter
 * `bilder` eintragen. Das erste Bild ist das Titelbild. Die Architektenpläne
 * nur mit Zustimmung von FINK + TEAM veröffentlichen — sie tragen einen
 * Urheberrechtsvermerk.
 */

export type ObjektStatus = "verfuegbar" | "reserviert" | "verkauft";

export type Objekt = {
  slug: string;
  /** Nummer der Wohneinheit wie im Plan (WE_4 …). */
  we: number;
  titel: string;
  art: "Wohnung" | "Haus" | "Grundstück" | "Gewerbe";
  status: ObjektStatus;
  /** Fehlt der Preis, zeigt die Seite „Preis auf Anfrage". */
  kaufpreis?: number;
  wohnflaeche: number;
  zimmer: number;
  baeder: number;
  /** z. B. "EG", "1. OG", "SG" */
  lage: string;
  freisitz?: { art: "Terrasse" | "Loggia" | "Balkon" | "Dachterrasse"; flaeche: number; seite: string };
  /** Pflichtangaben nach GEG für Anzeigen, sobald der Energieausweis vorliegt. */
  energie?: { ausweis: "Bedarf" | "Verbrauch"; kennwert: number; klasse: string; traeger: string };
  /** Käuferprovision, z. B. "3,57 % inkl. MwSt." oder "provisionsfrei". */
  provision?: string;
  kurz: string;
  beschreibung: string[];
  raeume: { name: string; flaeche: number }[];
  ausstattung: string[];
  bilder: { src: string; alt: string }[];
};

export const projekt = {
  name: "Hohe Straße 11",
  ort: "Hohenhameln",
  adresse: "Hohe Straße 11, 31249 Hohenhameln",
  claim: "Neubau-Eigentumswohnungen in Hohenhameln",
  einleitung:
    "In der Hohen Straße 11 entsteht ein Mehrfamilienhaus mit Aufzug, Photovoltaik auf dem Dach und " +
    "begrüntem Grundstück. Jede Wohnung hat eine eigene Terrasse oder Loggia und einen Hauswirtschaftsraum.",
  /** Visualisierungen des Hauses. Das erste ist das Titelbild der Startseite. */
  bilder: [
    { src: "/projekt/eingang.jpg", alt: "Visualisierung: Hauseingang mit Treppenhaus, Fahrradplätzen und Garten" },
    { src: "/projekt/luftbild.jpg", alt: "Visualisierung: Luftbild des Hauses mit Staffelgeschoss, Dachterrassen und Stellplätzen" },
    { src: "/projekt/garten.jpg", alt: "Visualisierung: Gartenseite mit Balkonen und Loggien" },
    { src: "/projekt/zufahrt-abend.jpg", alt: "Visualisierung: Zufahrt am Abend mit Stellplätzen" },
  ],
  // Aus der Genehmigungsplanung; Stand 19.01.2026.
  haus: [
    "Neubau eines Mehrfamilienhauses: Erdgeschoss, Obergeschoss und Staffelgeschoss",
    "Aufzug — alle Wohnungen stufenlos erreichbar",
    "Photovoltaikanlage auf rund der Hälfte der Dachfläche",
    "Stellplätze auf dem Grundstück, Fahrradplätze für rund 30 Räder",
    "Obstbäume und heimische Laubbäume im Außenbereich",
    "Der alte Walnussbaum auf dem Grundstück bleibt erhalten",
  ],
  lage: [
    // TODO: Entfernungen und Angebote vor Ort prüfen.
    "Ruhige Lage in zweiter Reihe, Zufahrt über die Hohe Straße",
    "Ortskern von Hohenhameln, Landkreis Peine",
    "Hildesheim, Peine und Sehnde in kurzer Fahrzeit",
    "Hannover und Braunschweig über A7 und A2 gut erreichbar",
  ],
  ansprechpartner: {
    // TODO: echte Kontaktdaten.
    name: "Daniel Diener",
    telefon: "+49 000 0000000",
    email: "anfrage@example.de",
  },
} as const;

const HAUS = ["Aufzug im Haus", "Hauswirtschaftsraum in der Wohnung", "Stellplatz auf dem Grundstück (TODO: Anzahl/Preis)"];

function flaeche(raeume: { flaeche: number }[]) {
  return Math.round(raeume.reduce((s, r) => s + r.flaeche, 0) * 100) / 100;
}

function wohnung(o: Omit<Objekt, "wohnflaeche" | "art" | "bilder" | "status"> & Partial<Pick<Objekt, "status" | "bilder">>): Objekt {
  return { art: "Wohnung", status: "verfuegbar", bilder: [], ...o, wohnflaeche: flaeche(o.raeume) };
}

export const objekte: Objekt[] = [
  wohnung({
    slug: "wohnung-4",
    we: 4,
    titel: "WE 4 — 3 Zimmer mit Terrasse",
    zimmer: 3,
    baeder: 1,
    lage: "EG",
    freisitz: { art: "Terrasse", flaeche: 9.53, seite: "Nord" },
    kurz: "Großzügiger Wohn- und Essbereich mit Terrasse, zwei Schlafzimmer und eigener Hauswirtschaftsraum.",
    beschreibung: [
      "Durch den Eingangsbereich gelangen Sie in einen offenen Wohn-, Ess- und Kochbereich von fast 34 m² mit Zugang zur Terrasse.",
      "Schlafzimmer und Kinderzimmer liegen getrennt voneinander an den beiden Enden der Wohnung.",
    ],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 33.84 },
      { name: "Schlafen", flaeche: 15.33 },
      { name: "Kind", flaeche: 13.57 },
      { name: "Entree", flaeche: 11.11 },
      { name: "Dusche / WC", flaeche: 6.74 },
      { name: "HWR", flaeche: 5.29 },
    ],
    ausstattung: ["Terrasse", ...HAUS],
  }),
  wohnung({
    slug: "wohnung-5",
    we: 5,
    titel: "WE 5 — 4 Zimmer, zwei Bäder, Loggia",
    zimmer: 4,
    baeder: 2,
    lage: "EG",
    freisitz: { art: "Loggia", flaeche: 9.48, seite: "Süd" },
    kurz: "Die Familienwohnung des Hauses: drei Schlafzimmer, zwei Duschbäder und eine Loggia nach Süden.",
    beschreibung: [
      "Mit knapp 107 m² die größte Wohnung im Erdgeschoss. Der Wohn-, Ess- und Kochbereich öffnet sich zur Loggia.",
      "Zwei fast gleich große Kinderzimmer am Flur, das Elternschlafzimmer am anderen Ende — mit einem zweiten Duschbad gleich nebenan.",
    ],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 34.95 },
      { name: "Schlafen", flaeche: 16.9 },
      { name: "Kind 1", flaeche: 13.6 },
      { name: "Kind 2", flaeche: 12.97 },
      { name: "Entree / Flur", flaeche: 16.7 },
      { name: "Dusche / WC", flaeche: 6.19 },
      { name: "Dusche / WC", flaeche: 3.99 },
      { name: "HWR", flaeche: 2.17 },
    ],
    ausstattung: ["Loggia nach Süden", "Zwei Duschbäder", ...HAUS],
  }),
  wohnung({
    slug: "wohnung-6",
    we: 6,
    titel: "WE 6 — 2 Zimmer mit Loggia",
    zimmer: 2,
    baeder: 1,
    lage: "EG",
    freisitz: { art: "Loggia", flaeche: 7.03, seite: "Süd" },
    kurz: "Kompakte Zweizimmerwohnung mit Loggia nach Süden — ideal für Singles, Paare oder als Kapitalanlage.",
    beschreibung: [
      "Ein offener Wohn-, Ess- und Kochbereich, ein Schlafzimmer mit knapp 17 m² und ein Duschbad.",
    ],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 26.03 },
      { name: "Schlafen", flaeche: 16.8 },
      { name: "Dusche / WC", flaeche: 6.15 },
      { name: "Entree", flaeche: 3.06 },
      { name: "HWR", flaeche: 2.97 },
    ],
    ausstattung: ["Loggia nach Süden", ...HAUS],
  }),
  wohnung({
    slug: "wohnung-7",
    we: 7,
    titel: "WE 7 — 3 Zimmer mit Loggia",
    zimmer: 3,
    baeder: 1,
    lage: "EG",
    freisitz: { art: "Loggia", flaeche: 9.48, seite: "Süd" },
    kurz: "Helle Eckwohnung mit Wohn- und Essbereich zur Loggia, Schlafzimmer und Kinderzimmer.",
    beschreibung: [
      "Der Wohn- und Essbereich mit über 32 m² liegt an der Loggia nach Süden.",
      "Schlafzimmer, Kinderzimmer und Duschbad liegen an der Giebelseite.",
    ],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 32.61 },
      { name: "Schlafen", flaeche: 14.84 },
      { name: "Kind", flaeche: 12.98 },
      { name: "Entree", flaeche: 8.34 },
      { name: "Dusche / WC", flaeche: 5.95 },
      { name: "HWR", flaeche: 4.07 },
    ],
    ausstattung: ["Loggia nach Süden", "Eckwohnung", ...HAUS],
  }),
  wohnung({
    slug: "wohnung-8",
    we: 8,
    titel: "WE 8 — 2 Zimmer, rollstuhlgerecht geplant",
    zimmer: 2,
    baeder: 1,
    lage: "EG",
    freisitz: { art: "Terrasse", flaeche: 10.66, seite: "Nord" },
    kurz: "Großzügig geschnittene Zweizimmerwohnung mit Terrasse und 8 m² Duschbad — mit Bewegungsflächen für den Rollstuhl geplant.",
    beschreibung: [
      "Der Wohn-, Ess- und Kochbereich mit über 34 m² führt auf die Terrasse.",
      "Schlafzimmer und Duschbad sind mit großzügigen Bewegungsflächen geplant. TODO: Ausführung nach DIN 18040-2 (R) bestätigen.",
    ],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 34.55 },
      { name: "Schlafen", flaeche: 17.21 },
      { name: "Dusche / WC", flaeche: 8.0 },
      { name: "Entree", flaeche: 6.47 },
      { name: "HWR", flaeche: 3.98 },
    ],
    ausstattung: ["Terrasse", "Rollstuhlgerecht geplant", ...HAUS],
  }),
];

/**
 * Bilder eines Objekts — oder, solange es keine eigenen gibt, die
 * Visualisierungen des Hauses, je Objekt um eins versetzt, damit die Karten
 * auf der Startseite nicht alle gleich aussehen.
 */
export function bilderVon(o: Objekt): Objekt["bilder"] {
  if (o.bilder.length > 0) return o.bilder;
  const i = objekte.indexOf(o) % projekt.bilder.length;
  return [...projekt.bilder.slice(i), ...projekt.bilder.slice(0, i)];
}

export function objektNach(slug: string | null | undefined): Objekt | undefined {
  return slug ? objekte.find((o) => o.slug === slug) : undefined;
}
