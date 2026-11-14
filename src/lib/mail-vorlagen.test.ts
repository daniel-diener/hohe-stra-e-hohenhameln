import { describe, expect, it } from "vitest";
import type { Anfrage } from "./anfrage";
import { bestaetigung } from "./mail-vorlagen";
import { objektNach } from "./objekte";

const basis = new URL("https://hohe-strasse.judek-projekt.de");
const anfrage: Anfrage = {
  objekt_slug: "wohnung-1", name: "Erika <b>Muster</b>", email: "e@example.de", telefon: "0151 123",
  nachricht: null, zweck: "eigennutzung", finanzierung: "in_klaerung", rueckruf: true, quelle: {},
};

describe("Eingangsbestätigung", () => {
  it("nennt Wohnung, Eckdaten, Links und Pflichtangaben", () => {
    const m = bestaetigung(anfrage, objektNach("wohnung-1"), basis);
    expect(m.betreff).toBe("Ihre Anfrage zu WE 1 · Hohe Straße Hohenhameln");
    expect(m.html).toContain("https://hohe-strasse.judek-projekt.de/objekte/wohnung-1");
    expect(m.html).toContain("https://hohe-strasse.judek-projekt.de/expose");
    expect(m.html).toContain("122,03 m²");
    expect(m.html).toContain("HRB 206991");
    expect(m.text).toContain("ruft Sie zeitnah unter 0151 123 zurück");
  });

  it("escaped Eingaben im HTML", () => {
    const m = bestaetigung(anfrage, undefined, basis);
    expect(m.html).toContain("Erika &lt;b&gt;Muster&lt;/b&gt;");
    expect(m.html).not.toContain("<b>Muster</b>");
  });

  it("weist auf Reservierung hin", () => {
    const m = bestaetigung({ ...anfrage, objekt_slug: "wohnung-3" }, objektNach("wohnung-3"), basis);
    expect(m.text).toContain("derzeit reserviert");
  });
});
