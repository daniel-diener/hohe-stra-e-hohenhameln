import { objekte, projekt } from "./objekte";

/** Ein Exposé, das der Vertrieb als PDF herunterladen kann. */
export type Dokument = {
  /** Dateiname des PDFs, zugleich Adresse unter /admin/dokumente/pdf/. */
  datei: string;
  titel: string;
  beschreibung: string;
  /** Seite, aus der das PDF gedruckt wird. */
  pfad: string;
  seiten: number;
};

/** Das Gesamt-Exposé und je Wohnung eines, nach Wohnungsnummer. */
export function dokumente(): Dokument[] {
  const sortiert = [...objekte].sort((a, b) => a.we - b.we);
  return [
    {
      datei: "expose-hohe-strasse.pdf",
      titel: `Exposé ${projekt.name}`,
      beschreibung: `Gesamt-Exposé, alle ${sortiert.length} Wohnungen`,
      pfad: "/expose",
      seiten: sortiert.length + 6,
    },
    ...sortiert.map((o) => ({
      datei: `expose-wohnung-${o.we}.pdf`,
      titel: `Exposé ${o.titel}`,
      beschreibung: `${o.zimmer} Zimmer, ${o.wohnflaeche.toLocaleString("de-DE")} m²`,
      pfad: `/admin/expose/${o.slug}`,
      seiten: 7,
    })),
  ];
}

export function dokumentNach(datei: string): Dokument | undefined {
  return dokumente().find((d) => d.datei === datei);
}
