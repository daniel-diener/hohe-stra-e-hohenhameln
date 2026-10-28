import { describe, expect, it } from "vitest";
import { MIN_AUSFUELLZEIT_MS, pruefeAnfrage } from "./anfrage";

const JETZT = 1_800_000_000_000;

function formular(felder: Record<string, string>) {
  const f = new FormData();
  const basis = {
    geladen: String(JETZT - MIN_AUSFUELLZEIT_MS - 1),
    name: "Erika Mustermann",
    email: "Erika@Example.de",
    einwilligung: "on",
  };
  for (const [k, v] of Object.entries({ ...basis, ...felder })) f.set(k, v);
  return f;
}

describe("pruefeAnfrage", () => {
  it("nimmt eine vollständige Anfrage an", () => {
    const p = pruefeAnfrage(
      formular({ objekt: "wohnung-1", telefon: "0511 123456", rueckruf: "on", zweck: "kapitalanlage", utm_source: "immoscout" }),
      JETZT,
    );
    expect(p).toEqual({
      ok: true,
      anfrage: {
        objekt_slug: "wohnung-1",
        name: "Erika Mustermann",
        email: "erika@example.de",
        telefon: "0511 123456",
        nachricht: null,
        zweck: "kapitalanlage",
        finanzierung: "in_klaerung",
        rueckruf: true,
        quelle: { utm_source: "immoscout" },
      },
    });
  });

  it("verlangt die Einwilligung", () => {
    const p = pruefeAnfrage(formular({ einwilligung: "" }), JETZT);
    expect(p.ok === false && !p.spam && p.fehler.einwilligung).toBeTruthy();
  });

  it("verlangt für einen Rückruf eine Telefonnummer", () => {
    const p = pruefeAnfrage(formular({ rueckruf: "on" }), JETZT);
    expect(p.ok === false && !p.spam && p.fehler.telefon).toBeTruthy();
  });

  it("macht aus einem unbekannten Objekt eine allgemeine Anfrage", () => {
    const p = pruefeAnfrage(formular({ objekt: "gibt-es-nicht" }), JETZT);
    expect(p.ok && p.anfrage.objekt_slug).toBe(null);
  });

  it("erkennt den Honigtopf", () => {
    expect(pruefeAnfrage(formular({ firma: "Spam GmbH" }), JETZT)).toEqual({ ok: false, spam: true });
  });

  it("erkennt zu schnelles und fehlendes Ausfüllen", () => {
    expect(pruefeAnfrage(formular({ geladen: String(JETZT - 500) }), JETZT)).toEqual({ ok: false, spam: true });
    expect(pruefeAnfrage(formular({ geladen: "" }), JETZT)).toEqual({ ok: false, spam: true });
  });

  it("zeigt Feldfehler auch bei schnellem Absenden", () => {
    const p = pruefeAnfrage(formular({ geladen: String(JETZT - 500), name: "" }), JETZT);
    expect(p.ok === false && !p.spam && p.fehler.name).toBeTruthy();
  });

  it("ersetzt unbekannte Auswahlwerte durch den Standard", () => {
    const p = pruefeAnfrage(formular({ zweck: "x", finanzierung: "y" }), JETZT);
    expect(p.ok && [p.anfrage.zweck, p.anfrage.finanzierung]).toEqual(["offen", "in_klaerung"]);
  });
});
