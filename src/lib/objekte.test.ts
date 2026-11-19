import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hausMerkmale, objekte, projekt } from "./objekte";

describe("objekte", () => {
  it.each(objekte.map((o) => [o.titel, o] as const))("%s: Wohnfläche = Räume + halber Freisitz", (_, o) => {
    const summe = o.raeume.reduce((s, r) => s + r.flaeche, 0) + o.freisitz.flaeche / 2;
    // Das Exposé rundet je Zeile; mehr als ein paar Hundertstel sind ein Tippfehler.
    expect(Math.abs(summe - o.wohnflaeche)).toBeLessThan(0.03);
  });

  it("hat eindeutige Nummern und Slugs", () => {
    expect(new Set(objekte.map((o) => o.we)).size).toBe(objekte.length);
    expect(new Set(objekte.map((o) => o.slug)).size).toBe(objekte.length);
  });

  it("findet jeden Grundriss unter public/", () => {
    for (const o of objekte) expect(existsSync(join("public", o.grundriss.src)), o.grundriss.src).toBe(true);
  });
});

describe("hausMerkmale", () => {
  const titel = (we: number) => hausMerkmale(objekte.find((o) => o.we === we)).map((m) => m.titel);

  it("zeigt „Eigene Gärten“ nur bei Wohnungen mit Garten", () => {
    for (const o of objekte) {
      expect(hausMerkmale(o).some((m) => m.titel === "Eigene Gärten")).toBe(o.garten);
      expect(hausMerkmale(o)).toHaveLength(projekt.haus.length);
    }
  });

  it("ersetzt den Garten durch Dachterrasse oder Balkon", () => {
    expect(titel(14)).toContain("Eigene Dachterrasse");
    expect(hausMerkmale(objekte.find((o) => o.we === 14)).find((m) => m.titel === "Eigene Dachterrasse")?.text)
      .toBe("ca. 46 m² nach Süden und Osten, direkt an der Wohnung im Staffelgeschoss.");
    expect(titel(5)).toContain("Eigener Balkon");
  });

  it("lässt das Gesamt-Exposé unverändert", () => {
    expect(hausMerkmale()).toEqual(projekt.haus);
  });
});
