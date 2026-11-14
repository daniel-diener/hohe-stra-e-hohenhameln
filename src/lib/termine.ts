/**
 * Termine im Büro: welche Zeitfenster es gibt, wie sie heißen und wie die
 * Kalenderdatei aussieht. Rein — kein Netz, keine Datenbank —, damit es sich
 * testen lässt. Alle Zeiten sind Ortszeit Europe/Berlin, gespeichert als UTC.
 */

export const TERMIN = {
  /** Beginn der buchbaren Fenster, Montag bis Freitag. */
  stunden: [17, 18],
  dauerMinuten: 60,
  /** Frühestens am nächsten Tag, höchstens so viele Tage im Voraus. */
  horizontTage: 21,
  ort: { name: "Judek Gebäudetechnik", strasse: "Hahnendamm 6", plzOrt: "31249 Hohenhameln" },
  gastgeber: "René Judek",
} as const;

export const terminOrt = `${TERMIN.ort.name}, ${TERMIN.ort.strasse}, ${TERMIN.ort.plzOrt}`;

const ZONE = "Europe/Berlin";

/** Jahr, Monat, Tag, Stunde eines Zeitpunkts in Berliner Ortszeit. */
function berlinTeile(d: Date) {
  const t = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONE, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(d).map((p) => [p.type, Number(p.value)]),
  );
  return { jahr: t.year, monat: t.month, tag: t.day, stunde: t.hour, minute: t.minute };
}

/** Berliner Ortszeit → Zeitpunkt. Die Verschiebung (MEZ/MESZ) kommt aus dem Datum selbst. */
export function berlinZeit(jahr: number, monat: number, tag: number, stunde: number): Date {
  const grob = Date.UTC(jahr, monat - 1, tag, stunde);
  const b = berlinTeile(new Date(grob));
  const verschiebung = Date.UTC(b.jahr, b.monat - 1, b.tag, b.stunde, b.minute) - grob;
  return new Date(grob - verschiebung);
}

/** Alle Zeitfenster ab morgen, Montag bis Freitag — ohne die schon belegten. */
export function freieTermine(jetzt: Date, belegt: Iterable<string | Date> = []): Date[] {
  const vergeben = new Set([...belegt].map((b) => new Date(b).getTime()));
  const heute = berlinTeile(jetzt);
  const frei: Date[] = [];
  for (let n = 1; n <= TERMIN.horizontTage; n++) {
    // Mittag UTC: Tagesrechnung ohne Stolpern über die Zeitumstellung.
    const tag = new Date(Date.UTC(heute.jahr, heute.monat - 1, heute.tag + n, 12));
    const wochentag = tag.getUTCDay();
    if (wochentag === 0 || wochentag === 6) continue;
    for (const stunde of TERMIN.stunden) {
      const beginn = berlinZeit(tag.getUTCFullYear(), tag.getUTCMonth() + 1, tag.getUTCDate(), stunde);
      if (!vergeben.has(beginn.getTime())) frei.push(beginn);
    }
  }
  return frei;
}

/** Ist das ein Zeitfenster, das wir anbieten? Schützt vor gebastelten Formularwerten. */
export function istTermin(beginn: Date, jetzt: Date): boolean {
  return freieTermine(jetzt).some((t) => t.getTime() === beginn.getTime());
}

const lang = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const uhr = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });

/** „Dienstag, 17. November 2026" */
export const terminTag = (d: Date | string) => lang.format(new Date(d));
/** „17:00" */
export const terminUhr = (d: Date | string) => uhr.format(new Date(d));
/** „Dienstag, 17. November 2026, 17:00 bis 18:00 Uhr" */
export function terminText(d: Date | string) {
  const beginn = new Date(d);
  const ende = new Date(beginn.getTime() + TERMIN.dauerMinuten * 60_000);
  return `${terminTag(beginn)}, ${terminUhr(beginn)} bis ${terminUhr(ende)} Uhr`;
}

const icsZeit = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Kalenderdatei (iCalendar) für einen Termin. Zeiten in UTC, damit jede Kalender-App sie richtig umrechnet. */
export function kalenderDatei(t: { id: string; beginn: Date | string; titel: string; beschreibung: string; erstellt?: Date }): string {
  const beginn = new Date(t.beginn);
  const ende = new Date(beginn.getTime() + TERMIN.dauerMinuten * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hohe Strasse Hohenhameln//Termin//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:termin-${t.id}@hohe-strasse.judek-projekt.de`,
    `DTSTAMP:${icsZeit(t.erstellt ?? new Date())}`,
    `DTSTART:${icsZeit(beginn)}`,
    `DTEND:${icsZeit(ende)}`,
    `SUMMARY:${icsText(t.titel)}`,
    `LOCATION:${icsText(terminOrt)}`,
    `DESCRIPTION:${icsText(t.beschreibung)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(t.titel)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
