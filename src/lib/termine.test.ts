import { describe, expect, it } from "vitest";
import { berlinZeit, freieTermine, istTermin, kalenderDatei, terminText } from "./termine";

// Samstag, 14.11.2026, 10 Uhr in Berlin.
const jetzt = new Date("2026-11-14T09:00:00Z");

describe("Zeitfenster", () => {
  it("rechnet Winter- und Sommerzeit", () => {
    expect(berlinZeit(2026, 11, 16, 17).toISOString()).toBe("2026-11-16T16:00:00.000Z");
    expect(berlinZeit(2026, 7, 6, 17).toISOString()).toBe("2026-07-06T15:00:00.000Z");
  });

  it("bietet nur Montag bis Freitag, 17 und 18 Uhr, ab morgen", () => {
    const frei = freieTermine(jetzt);
    expect(frei[0].toISOString()).toBe("2026-11-16T16:00:00.000Z"); // Montag 17 Uhr
    expect(frei[1].toISOString()).toBe("2026-11-16T17:00:00.000Z");
    expect(frei).toHaveLength(15 * 2); // 21 Tage = 15 Werktage
    expect(frei.every((t) => ![0, 6].includes(t.getUTCDay()))).toBe(true);
  });

  it("lässt belegte Fenster weg", () => {
    const frei = freieTermine(jetzt, ["2026-11-16T16:00:00Z"]);
    expect(frei[0].toISOString()).toBe("2026-11-16T17:00:00.000Z");
  });

  it("nimmt keine erfundenen Zeiten an", () => {
    expect(istTermin(new Date("2026-11-16T16:00:00Z"), jetzt)).toBe(true);
    expect(istTermin(new Date("2026-11-16T10:00:00Z"), jetzt)).toBe(false);
    expect(istTermin(new Date("2026-11-15T16:00:00Z"), jetzt)).toBe(false); // Sonntag
    expect(istTermin(new Date("2026-11-13T16:00:00Z"), jetzt)).toBe(false); // vorbei
  });

  it("schreibt den Termin aus", () => {
    expect(terminText("2026-11-16T16:00:00Z")).toBe("Montag, 16. November 2026, 17:00 bis 18:00 Uhr");
  });
});

describe("Kalenderdatei", () => {
  it("enthält Zeit, Ort und maskierte Sonderzeichen", () => {
    const ics = kalenderDatei({ id: "abc", beginn: "2026-11-16T16:00:00Z", titel: "Beratung; Hohe Straße", beschreibung: "Zeile 1\nZeile 2" });
    expect(ics).toContain("DTSTART:20261116T160000Z");
    expect(ics).toContain("DTEND:20261116T170000Z");
    expect(ics).toContain("SUMMARY:Beratung\; Hohe Straße");
    expect(ics).toContain("LOCATION:Judek Gebäudetechnik\\, Hahnendamm 6\\, 31249 Hohenhameln");
    expect(ics).toContain("DESCRIPTION:Zeile 1\\nZeile 2");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
