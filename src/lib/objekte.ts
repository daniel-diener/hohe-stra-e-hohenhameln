/**
 * Projekt und Objekte — die einzige Stelle, an der Inhalte gepflegt werden.
 *
 * Alles, was hier steht, ist ein PLATZHALTER, bis es durch die echten
 * Angaben ersetzt ist (markiert mit TODO). Preise, Flächen und Energiewerte
 * stehen später im Exposé und in der Anzeige; was hier abweicht, ist ein
 * Haftungsthema, kein Schönheitsfehler.
 *
 * Fotos: nach `public/objekte/<slug>/` legen und hier unter `bilder` mit
 * Pfad `/objekte/<slug>/datei.jpg` eintragen. Das erste Bild ist das Titelbild.
 */

export type ObjektStatus = "verfuegbar" | "reserviert" | "verkauft";

export type Objekt = {
  slug: string;
  titel: string;
  art: "Wohnung" | "Haus" | "Grundstück" | "Gewerbe";
  status: ObjektStatus;
  kaufpreis: number;
  wohnflaeche: number;
  zimmer: number;
  /** z. B. "EG", "1. OG", "DG" — bei Häusern leer lassen. */
  lage?: string;
  grundstueck?: number;
  baujahr?: number;
  /** Pflichtangaben nach GEG für die Anzeige. */
  energie?: { ausweis: "Bedarf" | "Verbrauch"; kennwert: number; klasse: string; traeger: string };
  /** Käuferprovision, z. B. "3,57 % inkl. MwSt." oder "provisionsfrei". */
  provision: string;
  kurz: string;
  beschreibung: string[];
  ausstattung: string[];
  bilder: { src: string; alt: string }[];
};

export const projekt = {
  name: "Hohe Straße",
  ort: "Hohenhameln",
  // TODO: Hausnummer ergänzen, PLZ prüfen.
  adresse: "Hohe Straße, 31249 Hohenhameln",
  claim: "Wohneigentum in Hohenhameln",
  einleitung:
    "TODO: Zwei, drei Sätze zum Projekt — was entsteht oder wird verkauft, für wen, und warum gerade hier.",
  lage: [
    // TODO: Entfernungen und Angebote vor Ort prüfen.
    "Ruhige Wohnlage im Ortskern von Hohenhameln, Landkreis Peine",
    "Hildesheim, Peine und Sehnde in kurzer Fahrzeit",
    "Hannover und Braunschweig über die A7 / A2 gut erreichbar",
    "Kita, Grundschule und Einkauf im Ort",
  ],
  ansprechpartner: {
    // TODO: echte Kontaktdaten.
    name: "Daniel Diener",
    telefon: "+49 000 0000000",
    email: "anfrage@example.de",
  },
} as const;

export const objekte: Objekt[] = [
  {
    slug: "wohnung-1",
    titel: "Wohnung 1 — Erdgeschoss mit Garten",
    art: "Wohnung",
    status: "verfuegbar",
    kaufpreis: 289000,
    wohnflaeche: 82,
    zimmer: 3,
    lage: "EG",
    baujahr: 2026,
    energie: { ausweis: "Bedarf", kennwert: 35, klasse: "A+", traeger: "Wärmepumpe" },
    provision: "provisionsfrei",
    kurz: "TODO: Ein Satz, der die Wohnung trägt.",
    beschreibung: [
      "TODO: Beschreibung der Wohnung — Schnitt, Licht, Garten.",
      "TODO: Was sie von den anderen unterscheidet.",
    ],
    ausstattung: ["Terrasse und Gartenanteil", "Fußbodenheizung", "Stellplatz", "Kellerraum"],
    bilder: [],
  },
  {
    slug: "wohnung-2",
    titel: "Wohnung 2 — Obergeschoss mit Balkon",
    art: "Wohnung",
    status: "verfuegbar",
    kaufpreis: 269000,
    wohnflaeche: 76,
    zimmer: 3,
    lage: "1. OG",
    baujahr: 2026,
    energie: { ausweis: "Bedarf", kennwert: 35, klasse: "A+", traeger: "Wärmepumpe" },
    provision: "provisionsfrei",
    kurz: "TODO: Ein Satz, der die Wohnung trägt.",
    beschreibung: ["TODO: Beschreibung der Wohnung."],
    ausstattung: ["Südbalkon", "Fußbodenheizung", "Stellplatz", "Aufzug"],
    bilder: [],
  },
  {
    slug: "wohnung-3",
    titel: "Wohnung 3 — Dachgeschoss",
    art: "Wohnung",
    status: "reserviert",
    kaufpreis: 249000,
    wohnflaeche: 68,
    zimmer: 2,
    lage: "DG",
    baujahr: 2026,
    energie: { ausweis: "Bedarf", kennwert: 35, klasse: "A+", traeger: "Wärmepumpe" },
    provision: "provisionsfrei",
    kurz: "TODO: Ein Satz, der die Wohnung trägt.",
    beschreibung: ["TODO: Beschreibung der Wohnung."],
    ausstattung: ["Dachterrasse", "Fußbodenheizung", "Stellplatz"],
    bilder: [],
  },
];

export function objektNach(slug: string | null | undefined): Objekt | undefined {
  return slug ? objekte.find((o) => o.slug === slug) : undefined;
}
