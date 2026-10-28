import type { Objekt } from "./objekte";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const zahl = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const datumZeit = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

export const formatEuro = (n: number) => euro.format(n);
const flaeche = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatFlaeche = (n: number) => `${flaeche.format(n)} m²`;
export const formatZahl = (n: number) => zahl.format(n);
export const formatDatum = (iso: string) => datumZeit.format(new Date(iso));

export function preisText(o: Pick<Objekt, "status" | "kaufpreis">) {
  if (o.status === "verkauft") return "Verkauft";
  return o.kaufpreis ? formatEuro(o.kaufpreis) : "Preis auf Anfrage";
}
