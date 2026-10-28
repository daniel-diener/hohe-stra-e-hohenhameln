const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const zahl = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const datumZeit = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

export const formatEuro = (n: number) => euro.format(n);
export const formatFlaeche = (n: number) => `${zahl.format(n)} m²`;
export const formatZahl = (n: number) => zahl.format(n);
export const formatDatum = (iso: string) => datumZeit.format(new Date(iso));
