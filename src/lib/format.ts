import type { Objekt } from "./objekte";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const zahl = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const datumZeit = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

export const formatEuro = (n: number) => euro.format(n);
/** Flächen immer mit „ca.“ und auf volle m² abgerundet (Vorgabe Vertrieb) — nie größer, als sie sind. */
export const formatFlaeche = (n: number) => `ca.\u00a0${Math.floor(n + 1e-9)}\u00a0m²`;
const flaeche1 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Für Raumtabellen: „ca. 16,9 m²“, auf eine Nachkommastelle abgerundet, damit die Summe ungefähr aufgeht. */
export const formatRaumFlaeche = (n: number) => `ca.\u00a0${flaeche1.format(Math.floor(n * 10 + 1e-6) / 10)}\u00a0m²`;
/** Spanne, z. B. „ca. 55 bis 122 m²“. */
export const formatFlaechenSpanne = (werte: number[]) =>
  `ca.\u00a0${Math.floor(Math.min(...werte))} bis ${Math.floor(Math.max(...werte))}\u00a0m²`;
export const formatZahl = (n: number) => zahl.format(n);
export const formatDatum = (iso: string) => datumZeit.format(new Date(iso));

export function preisText(o: Pick<Objekt, "status" | "kaufpreis">) {
  if (o.status === "verkauft") return "Verkauft";
  return o.kaufpreis ? formatEuro(o.kaufpreis) : "Preis auf Anfrage";
}
