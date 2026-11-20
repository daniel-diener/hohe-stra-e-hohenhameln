import { objekte, projekt } from "./objekte";

/** Ein Dokument, das der Vertrieb im Admin herunterladen kann. */
export type Dokument = {
  /** Dateiname des PDFs, zugleich Adresse unter /admin/dokumente/pdf/. */
  datei: string;
  titel: string;
  beschreibung: string;
  gruppe: "Vorlagen" | "Exposés";
  seiten: number;
  /**
   * Woher das PDF kommt: eine Seite, die bei jedem Abruf frisch gedruckt wird,
   * oder eine feste Datei aus `vorlagen/` (nicht `public/` — nur fürs Team).
   */
  quelle: { art: "seite"; pfad: string } | { art: "datei"; pfad: string };
};

export const gruppen = ["Vorlagen", "Exposés"] as const;

/** Vorlagen, dann das Gesamt-Exposé und je Wohnung eines, nach Wohnungsnummer. */
export function dokumente(): Dokument[] {
  const sortiert = [...objekte].sort((a, b) => a.we - b.we);
  return [
    {
      datei: "reservierungsvereinbarung-hohe-strasse.pdf",
      titel: "Reservierungsvereinbarung",
      beschreibung: "Vorlage zum Ausfüllen, für bis zu zwei Kaufinteressenten",
      gruppe: "Vorlagen",
      seiten: 3,
      quelle: { art: "datei", pfad: "vorlagen/reservierungsvereinbarung-hohe-strasse.pdf" },
    },
    {
      datei: "expose-hohe-strasse.pdf",
      titel: `Exposé ${projekt.name}`,
      beschreibung: `Gesamt-Exposé, alle ${sortiert.length} Wohnungen`,
      gruppe: "Exposés",
      seiten: sortiert.length + 6,
      quelle: { art: "seite", pfad: "/expose" },
    },
    ...sortiert.map((o): Dokument => ({
      datei: `expose-wohnung-${o.we}.pdf`,
      titel: `Exposé ${o.titel}`,
      beschreibung: `${o.zimmer} Zimmer, ${o.wohnflaeche.toLocaleString("de-DE")} m²`,
      gruppe: "Exposés",
      seiten: 7,
      quelle: { art: "seite", pfad: `/admin/expose/${o.slug}` },
    })),
  ];
}

export function dokumentNach(datei: string): Dokument | undefined {
  return dokumente().find((d) => d.datei === datei);
}
