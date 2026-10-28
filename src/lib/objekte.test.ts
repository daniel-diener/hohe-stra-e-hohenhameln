import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { objekte } from "./objekte";

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
