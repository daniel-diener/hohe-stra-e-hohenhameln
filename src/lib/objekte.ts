/**
 * Projekt und Wohnungen — die einzige Stelle, an der Inhalte gepflegt werden.
 *
 * Quelle: Exposé „Hohe Straße" (Judek Projekt GmbH, 04/2026). Wohnflächen
 * nach Exposé: Innenräume plus Terrasse/Balkon zur Hälfte. `objekte.test.ts`
 * rechnet das für jede Wohnung nach — wer hier eine Zahl ändert, merkt dort,
 * wenn die Summe nicht mehr stimmt.
 *
 * Was noch fehlt, ist mit TODO markiert (Preise, Energieausweis, Provision).
 * Was hier steht, landet in Anzeigen und im Exposé — eine Abweichung ist ein
 * Haftungsthema, kein Schönheitsfehler.
 *
 * Grundrisse: aus den Exposé-Seiten 18–29 geschnitten, `public/grundrisse/`.
 * Baugleiche Wohnungen teilen sich einen Plan; er trägt die Nummer der ersten.
 */

export type ObjektStatus = "verfuegbar" | "reserviert" | "verkauft";

export type Geschoss = "UG" | "EG" | "OG" | "SG";

export type Objekt = {
  slug: string;
  /** Nummer der Wohneinheit wie im Exposé (WE 1 …). */
  we: number;
  titel: string;
  status: ObjektStatus;
  /** Fehlt der Preis, zeigt die Seite „Preis auf Anfrage". */
  kaufpreis?: number;
  /** Wohnfläche nach Exposé, Freisitz zur Hälfte angerechnet. */
  wohnflaeche: number;
  zimmer: number;
  baeder: number;
  geschoss: Geschoss;
  /** Fläche voll, nicht halbiert — so steht sie im Plan. */
  freisitz: { art: "Terrasse" | "Balkon" | "Dachterrasse"; flaeche: number; seite: string };
  /** Sondernutzungsrecht an der angrenzenden Gartenfläche. */
  garten: boolean;
  /** Privater Abstellraum im Untergeschoss. */
  keller: number;
  /** Pflichtangaben nach GEG für Anzeigen, sobald der Energieausweis vorliegt. */
  energie?: { ausweis: "Bedarf" | "Verbrauch"; kennwert: number; klasse: string; traeger: string };
  /** Käuferprovision, z. B. "3,57 % inkl. MwSt." oder "provisionsfrei". */
  provision?: string;
  kurz: string;
  merkmale: string[];
  raeume: { name: string; flaeche: number }[];
  grundriss: { src: string; breite: number; hoehe: number; baugleichMit?: number };
  /** Eigene Fotos der Wohnung, sobald es sie gibt. */
  bilder: { src: string; alt: string }[];
};

export const geschossName: Record<Geschoss, string> = {
  UG: "Gartengeschoss (UG)",
  EG: "Erdgeschoss",
  OG: "Obergeschoss",
  SG: "Staffelgeschoss",
};

export const projekt = {
  name: "Hohe Straße",
  ort: "Hohenhameln",
  adresse: "Hohe Straße 11, 31249 Hohenhameln",
  claim: "16 Eigentumswohnungen in Hohenhameln",
  einleitung:
    "Neubau eines Mehrfamilienhauses als KfW-40-Effizienzhaus: 16 barrierefreie Wohnungen " +
    "von 55 bis 122 m², jede mit Terrasse, Balkon oder Dachterrasse. Fertigstellung 2026/2027.",
  bauherr: "Judek Projekt GmbH",
  architekt: "FINK + TEAM architektur und planung, Hannover",
  /** Visualisierungen des Hauses. Das erste ist das Titelbild der Startseite. */
  bilder: [
    { src: "/projekt/eingang.jpg", alt: "Visualisierung: Hauseingang mit Treppenhaus, Fahrradplätzen und Garten" },
    { src: "/projekt/luftbild.jpg", alt: "Visualisierung: Luftbild des Hauses mit Staffelgeschoss, Dachterrassen und Stellplätzen" },
    { src: "/projekt/garten.jpg", alt: "Visualisierung: Gartenseite mit Balkonen und Terrassen" },
    { src: "/projekt/zufahrt-abend.jpg", alt: "Visualisierung: Zufahrt am Abend mit Stellplätzen" },
  ],
  lageBild: { src: "/projekt/hohenhameln.jpg", alt: "Luftbild von Hohenhameln mit Feldern am Ortsrand" },
  haus: [
    "KfW-40-Effizienzhaus — förderfähig über zinsgünstige KfW-Programme",
    "Wärmepumpe, Fußbodenheizung in allen Räumen, Photovoltaik auf dem Dach",
    "Personenaufzug — alle Geschosse barrierefrei erreichbar",
    "Bodentiefe Fenster, elektrische Außenjalousien, Video-Gegensprechanlage",
    "Tageslichtbäder mit ebenerdiger Dusche",
    "Parkett in den Wohnräumen, Feinsteinzeug in Bad und Küche",
    "Privater Abstellraum im Untergeschoss für jede Wohnung (ca. 4–9 m²)",
    "Gärten mit Sondernutzungsrecht für die Wohnungen im Garten- und Erdgeschoss",
  ],
  stellplaetze:
    "18 Pkw-Stellplätze direkt am Haus, davon acht mit Carport — zusätzlich zur Wohnung erwerbbar. " +
    "Auf Wunsch mit Ladestation für das Elektroauto (gegen Aufpreis). Fahrradplätze für rund 30 Räder.",
  lage: [
    "Ruhige, wenig befahrene Straße im Ort",
    "Einkauf, Ärzte, Apotheken, Cafés und Restaurants in wenigen Gehminuten",
    "Grundschule, Schulzentrum und mehrere Kitas im Ort",
    "Bushaltestelle in wenigen Gehminuten, Bahnhof Algermissen in rund 10 Autominuten",
    "A2 (Anschlussstelle Hämelerwald) in 15 Minuten, Hannover und Braunschweig in unter 40 Minuten",
    "Peine und Hildesheim jeweils in etwa 20 Minuten",
  ],
  ansprechpartner: {
    // TODO: echte Kontaktdaten.
    name: "Daniel Diener",
    telefon: "+49 000 0000000",
    email: "anfrage@example.de",
  },
} as const;

type Eingabe = Omit<Objekt, "slug" | "status" | "bilder" | "grundriss"> &
  Partial<Pick<Objekt, "status" | "bilder">> & { plan: string; baugleichMit?: number };

/** Abmessungen der Grundrissbilder — für next/image, damit nichts springt. */
const PLAN: Record<string, [number, number]> = {
  "we-1": [947, 590], "we-3": [774, 619], "we-5": [949, 590], "we-2-6": [679, 590],
  "we-7-12": [832, 681], "we-4-9": [951, 489], "we-10": [946, 594], "we-11": [744, 687],
  "we-8-13": [839, 695], "we-14": [922, 778], "we-15": [867, 815], "we-16": [703, 807],
};

function wohnung({ plan, baugleichMit, ...o }: Eingabe): Objekt {
  const [breite, hoehe] = PLAN[plan];
  return {
    status: "verfuegbar",
    bilder: [],
    ...o,
    slug: `wohnung-${o.we}`,
    grundriss: { src: `/grundrisse/${plan}.png`, breite, hoehe, baugleichMit },
  };
}

// Raumprogramme, die sich in baugleichen Wohnungen wiederholen.
const R_2ZI_SUED = [
  { name: "Wohnen / Essen / Kochen", flaeche: 26.03 },
  { name: "Schlafzimmer", flaeche: 16.8 },
  { name: "Dusche / WC", flaeche: 6.15 },
  { name: "HWR", flaeche: 3.09 },
  { name: "Entree", flaeche: 3.06 },
];
const R_3ZI_SUED = [
  { name: "Wohnen / Essen / Kochen", flaeche: 32.61 },
  { name: "Schlafzimmer", flaeche: 14.84 },
  { name: "Kinderzimmer", flaeche: 12.98 },
  { name: "Entree", flaeche: 8.34 },
  { name: "Dusche / WC", flaeche: 5.95 },
  { name: "HWR", flaeche: 4.07 },
];
const R_3ZI_NORD = [
  { name: "Wohnen / Essen / Kochen", flaeche: 34.18 },
  { name: "Schlafzimmer", flaeche: 15.33 },
  { name: "Kinderzimmer", flaeche: 13.58 },
  { name: "Entree", flaeche: 11.09 },
  { name: "Dusche / WC", flaeche: 6.74 },
  { name: "HWR", flaeche: 5.29 },
];
const R_2ZI_NORD = [
  { name: "Wohnen / Essen / Kochen", flaeche: 34.88 },
  { name: "Schlafzimmer", flaeche: 17.21 },
  { name: "Dusche / WC", flaeche: 8.0 },
  { name: "Entree", flaeche: 6.47 },
  { name: "HWR", flaeche: 4.29 },
];
const R_4ZI = (wohnen: number) => [
  { name: "Wohnen / Essen / Kochen", flaeche: wohnen },
  { name: "Schlafzimmer", flaeche: 16.9 },
  { name: "Kinderzimmer 1", flaeche: 13.6 },
  { name: "Kinderzimmer 2", flaeche: 12.97 },
  { name: "Entree / Flur", flaeche: 16.97 },
  { name: "Dusche / WC Eltern", flaeche: 6.19 },
  { name: "Dusche / WC Gäste/Kinder", flaeche: 3.99 },
  { name: "HWR", flaeche: 2.17 },
];

export const objekte: Objekt[] = [
  // ── Gartengeschoss ────────────────────────────────────────────────
  wohnung({
    we: 1, plan: "we-1", geschoss: "UG", zimmer: 4, baeder: 2, wohnflaeche: 122.03,
    titel: "WE 1 — 4 Zimmer mit Garten",
    freisitz: { art: "Terrasse", flaeche: 9.58, seite: "Süd" }, garten: true, keller: 8.52,
    kurz: "Die größte Wohnung des Hauses: über 40 m² Wohnen mit offener Küche, drei Schlafzimmer, zwei Bäder und ein eigener Garten nach Süden.",
    merkmale: ["Privater Garten (Sondernutzung)", "Terrasse nach Süden", "Zwei Duschbäder", "Abstellraum in der Wohnung"],
    raeume: [...R_4ZI(40.77), { name: "Abstellraum", flaeche: 3.68 }],
  }),
  wohnung({
    we: 2, plan: "we-2-6", geschoss: "UG", zimmer: 2, baeder: 1, wohnflaeche: 58.7,
    titel: "WE 2 — 2 Zimmer mit Garten",
    freisitz: { art: "Terrasse", flaeche: 7.13, seite: "Süd" }, garten: true, keller: 5.1,
    kurz: "Kompakte Zweizimmerwohnung mit Terrasse und eigenem Garten nach Süden.",
    merkmale: ["Privater Garten (Sondernutzung)", "Terrasse nach Süden"],
    raeume: R_2ZI_SUED,
  }),
  wohnung({
    we: 3, plan: "we-3", geschoss: "UG", zimmer: 3, baeder: 1, wohnflaeche: 89.14,
    titel: "WE 3 — 3 Zimmer mit Garten",
    freisitz: { art: "Terrasse", flaeche: 9.58, seite: "Süd" }, garten: true, keller: 5.12,
    kurz: "Drei Zimmer mit 38 m² Wohn- und Essbereich, Terrasse und eigenem Garten nach Süden.",
    merkmale: ["Privater Garten (Sondernutzung)", "Terrasse nach Süden"],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 38.2 },
      { name: "Schlafzimmer", flaeche: 14.84 },
      { name: "Kinderzimmer", flaeche: 12.98 },
      { name: "Entree", flaeche: 8.34 },
      { name: "Dusche / WC", flaeche: 5.95 },
      { name: "HWR", flaeche: 4.04 },
    ],
  }),

  // ── Erdgeschoss ───────────────────────────────────────────────────
  wohnung({
    we: 4, plan: "we-4-9", geschoss: "EG", zimmer: 3, baeder: 1, wohnflaeche: 90.98,
    titel: "WE 4 — 3 Zimmer mit Garten",
    freisitz: { art: "Terrasse", flaeche: 9.53, seite: "Nord" }, garten: true, keller: 5.39,
    kurz: "Großzügiger Wohnbereich mit Terrasse und Garten, Schlaf- und Kinderzimmer an den beiden Enden der Wohnung.",
    merkmale: ["Privater Garten (Sondernutzung)", "Terrasse"],
    raeume: R_3ZI_NORD,
  }),
  wohnung({
    we: 5, plan: "we-5", geschoss: "EG", zimmer: 4, baeder: 2, wohnflaeche: 112.53,
    titel: "WE 5 — 4 Zimmer, zwei Bäder",
    freisitz: { art: "Balkon", flaeche: 9.58, seite: "Süd" }, garten: false, keller: 7.49,
    kurz: "Die Familienwohnung im Erdgeschoss: drei Schlafzimmer, zwei Duschbäder und ein Balkon nach Süden.",
    merkmale: ["Balkon nach Süden", "Zwei Duschbäder"],
    raeume: R_4ZI(34.95),
  }),
  wohnung({
    we: 6, plan: "we-2-6", baugleichMit: 2, geschoss: "EG", zimmer: 2, baeder: 1, wohnflaeche: 58.7,
    titel: "WE 6 — 2 Zimmer mit Balkon",
    freisitz: { art: "Balkon", flaeche: 7.13, seite: "Süd" }, garten: false, keller: 4.91,
    kurz: "Kompakte Zweizimmerwohnung mit Balkon nach Süden — für Singles, Paare oder als Kapitalanlage.",
    merkmale: ["Balkon nach Süden"],
    raeume: R_2ZI_SUED,
  }),
  wohnung({
    we: 7, plan: "we-7-12", geschoss: "EG", zimmer: 3, baeder: 1, wohnflaeche: 83.58,
    titel: "WE 7 — 3 Zimmer mit Balkon",
    freisitz: { art: "Balkon", flaeche: 9.58, seite: "Süd" }, garten: false, keller: 4.83,
    kurz: "Eckwohnung mit Wohn- und Essbereich zum Südbalkon, Schlafzimmer und Kinderzimmer an der Giebelseite.",
    merkmale: ["Balkon nach Süden", "Eckwohnung"],
    raeume: R_3ZI_SUED,
  }),
  wohnung({
    we: 8, plan: "we-8-13", geschoss: "EG", zimmer: 2, baeder: 1, wohnflaeche: 76.18,
    titel: "WE 8 — 2 Zimmer mit Garten",
    freisitz: { art: "Terrasse", flaeche: 10.66, seite: "Nord" }, garten: true, keller: 6.24,
    kurz: "Großzügige Zweizimmerwohnung mit fast 35 m² Wohnbereich, 8 m² Duschbad, Terrasse und Garten.",
    // TODO: „rollstuhlgerecht" nur mit Bestätigung der Planung (DIN 18040-2 R) bewerben.
    merkmale: ["Privater Garten (Sondernutzung)", "Terrasse", "Großes Duschbad (8 m²)"],
    raeume: R_2ZI_NORD,
  }),

  // ── Obergeschoss ──────────────────────────────────────────────────
  wohnung({
    we: 9, plan: "we-4-9", baugleichMit: 4, geschoss: "OG", zimmer: 3, baeder: 1, wohnflaeche: 90.98,
    titel: "WE 9 — 3 Zimmer mit Balkon",
    freisitz: { art: "Balkon", flaeche: 9.53, seite: "Nord" }, garten: false, keller: 4.86,
    kurz: "Großzügiger Wohnbereich mit Balkon, Schlaf- und Kinderzimmer an den beiden Enden der Wohnung.",
    merkmale: ["Balkon"],
    raeume: R_3ZI_NORD,
  }),
  wohnung({
    we: 10, plan: "we-10", geschoss: "OG", zimmer: 3, baeder: 2, wohnflaeche: 98.93,
    titel: "WE 10 — 3 Zimmer, zwei Bäder",
    freisitz: { art: "Balkon", flaeche: 9.58, seite: "Süd" }, garten: false, keller: 5.48,
    kurz: "Drei Zimmer mit zwei Duschbädern, großem Entree und Balkon nach Süden.",
    merkmale: ["Balkon nach Süden", "Zwei Duschbäder"],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 34.95 },
      { name: "Schlafzimmer", flaeche: 16.9 },
      { name: "Kinderzimmer", flaeche: 12.97 },
      { name: "Entree / Flur", flaeche: 16.97 },
      { name: "Dusche / WC Eltern", flaeche: 6.19 },
      { name: "Dusche / WC Gäste/Kind", flaeche: 3.99 },
      { name: "HWR", flaeche: 2.17 },
    ],
  }),
  wohnung({
    we: 11, plan: "we-11", geschoss: "OG", zimmer: 2, baeder: 1, wohnflaeche: 55.08,
    titel: "WE 11 — 2 Zimmer mit Balkon",
    freisitz: { art: "Balkon", flaeche: 7.13, seite: "Süd" }, garten: false, keller: 4.85,
    kurz: "Die kompakteste Wohnung im Haus: zwei Zimmer mit Balkon nach Süden — ideal als Kapitalanlage.",
    merkmale: ["Balkon nach Süden"],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 26.03 },
      { name: "Schlafzimmer", flaeche: 13.19 },
      { name: "Dusche / WC", flaeche: 6.15 },
      { name: "HWR", flaeche: 3.09 },
      { name: "Entree", flaeche: 3.06 },
    ],
  }),
  wohnung({
    we: 12, plan: "we-7-12", baugleichMit: 7, geschoss: "OG", zimmer: 3, baeder: 1, wohnflaeche: 83.58,
    titel: "WE 12 — 3 Zimmer mit Balkon",
    freisitz: { art: "Balkon", flaeche: 9.58, seite: "Süd" }, garten: false, keller: 4.91,
    kurz: "Eckwohnung mit Wohn- und Essbereich zum Südbalkon, Schlafzimmer und Kinderzimmer an der Giebelseite.",
    merkmale: ["Balkon nach Süden", "Eckwohnung"],
    raeume: R_3ZI_SUED,
  }),
  wohnung({
    we: 13, plan: "we-8-13", baugleichMit: 8, geschoss: "OG", zimmer: 2, baeder: 1, wohnflaeche: 76.18,
    titel: "WE 13 — 2 Zimmer mit Balkon",
    freisitz: { art: "Balkon", flaeche: 10.66, seite: "Nord" }, garten: false, keller: 4.42,
    kurz: "Großzügige Zweizimmerwohnung mit fast 35 m² Wohnbereich, 8 m² Duschbad und Balkon.",
    merkmale: ["Balkon", "Großes Duschbad (8 m²)"],
    raeume: R_2ZI_NORD,
  }),

  // ── Staffelgeschoss ───────────────────────────────────────────────
  wohnung({
    we: 14, plan: "we-14", geschoss: "SG", zimmer: 3, baeder: 2, wohnflaeche: 113.12,
    titel: "WE 14 — Dachterrasse über Eck",
    freisitz: { art: "Dachterrasse", flaeche: 46.56, seite: "Süd/Ost" }, garten: false, keller: 6.09,
    kurz: "Penthouse-Wohnung mit über 46 m² Dachterrasse nach Süden und Osten und zwei Tageslichtbädern.",
    merkmale: ["Dachterrasse nach Süd/Ost (46,56 m²)", "Zwei Tageslichtbäder"],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 34.25 },
      { name: "Schlafzimmer", flaeche: 18.78 },
      { name: "Kinderzimmer", flaeche: 14.28 },
      { name: "Entree", flaeche: 11.14 },
      { name: "Dusche / WC Gäste/Kind", flaeche: 5.41 },
      { name: "Dusche / WC Eltern", flaeche: 3.96 },
      { name: "HWR", flaeche: 2.02 },
    ],
  }),
  wohnung({
    we: 15, plan: "we-15", geschoss: "SG", zimmer: 3, baeder: 1, wohnflaeche: 110.63,
    titel: "WE 15 — Maisonette mit 50 m² Dachterrasse",
    freisitz: { art: "Dachterrasse", flaeche: 50, seite: "Süd" }, garten: false, keller: 5.71,
    kurz: "Maisonette über zwei Ebenen: fast 39 m² Wohnen an der 50 m² großen Südterrasse, darunter ein Gäste- oder Arbeitszimmer.",
    merkmale: ["Dachterrasse nach Süden (50 m²)", "Maisonette über zwei Etagen"],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 38.82 },
      { name: "Gast / Büro (Obergeschoss)", flaeche: 16.9 },
      { name: "Schlafzimmer", flaeche: 14.84 },
      { name: "Dusche / WC", flaeche: 5.59 },
      { name: "HWR", flaeche: 5.51 },
      { name: "Entree", flaeche: 3.97 },
    ],
  }),
  wohnung({
    we: 16, plan: "we-16", geschoss: "SG", zimmer: 3, baeder: 1, wohnflaeche: 111.15,
    titel: "WE 16 — Dachterrasse über Eck",
    freisitz: { art: "Dachterrasse", flaeche: 46.33, seite: "Süd/West" }, garten: false, keller: 5.48,
    kurz: "Penthouse-Wohnung mit über 46 m² Dachterrasse nach Süden und Westen — Abendsonne inklusive.",
    merkmale: ["Dachterrasse nach Süd/West (46,33 m²)", "Ankleide am Schlafzimmer"],
    raeume: [
      { name: "Wohnen / Essen / Kochen", flaeche: 34.56 },
      { name: "Schlafzimmer", flaeche: 17.3 },
      { name: "Kinderzimmer", flaeche: 12.85 },
      { name: "Entree", flaeche: 11.13 },
      { name: "Dusche / WC", flaeche: 8.01 },
      { name: "HWR", flaeche: 4.14 },
    ],
  }),
];

/** Von oben nach unten — so liest man ein Haus. */
export const geschosse: Geschoss[] = ["SG", "OG", "EG", "UG"];

export function objektNach(slug: string | null | undefined): Objekt | undefined {
  return slug ? objekte.find((o) => o.slug === slug) : undefined;
}
