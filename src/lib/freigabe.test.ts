import { describe, expect, it } from "vitest";
import {
  MAX_FEHLVERSUCHE, TOKEN, codeHash, codeNormalisieren, codePruefen, neuerCode, neuerToken, sitzungPruefen, sitzungsWert, sperrgrund,
} from "./freigabe";

describe("Freigabe", () => {
  it("Token sind lang, zufällig und passen zum Muster der Route", () => {
    const a = neuerToken();
    expect(a).toMatch(TOKEN);
    expect(neuerToken()).not.toBe(a);
  });

  it("Codes ohne Verwechsler, mit Bindestrich in der Mitte", () => {
    for (let i = 0; i < 200; i++) expect(neuerCode()).toMatch(/^[A-HJKMNP-Z2-9]{5}-[A-HJKMNP-Z2-9]{5}$/);
  });

  it("Code wird beim Prüfen großzügig gelesen, aber nur der richtige passt", () => {
    const code = "K7MQ2-XR9PA";
    const hash = codeHash(code);
    expect(hash).not.toContain("K7MQ2");
    expect(codePruefen("k7mq2 xr9pa", hash)).toBe(true);
    expect(codePruefen("K7MQ2XR9PA", hash)).toBe(true);
    expect(codePruefen("K7MQ2-XR9PB", hash)).toBe(false);
    expect(codePruefen("", hash)).toBe(false);
    expect(codePruefen(code, "kaputt")).toBe(false);
  });

  it("Gleicher Code, anderer Hash (Salz)", () => {
    expect(codeHash("AAAAA-BBBBB")).not.toBe(codeHash("AAAAA-BBBBB"));
  });

  it("Cookie gilt nur für diese Freigabe und diesen Code", () => {
    const f = { id: "1b4e28ba-2fa1-11d2-883f-0016d3cca427", code_hash: codeHash("AAAAA-BBBBB") };
    const wert = sitzungsWert(f, "geheim");
    expect(sitzungPruefen(wert, f, "geheim")).toBe(true);
    expect(sitzungPruefen(wert, { ...f, code_hash: codeHash("AAAAA-BBBBB") }, "geheim")).toBe(false);
    expect(sitzungPruefen(wert, { ...f, id: "anders" }, "geheim")).toBe(false);
    expect(sitzungPruefen(wert, f, "anderes-geheimnis")).toBe(false);
    expect(sitzungPruefen(undefined, f, "geheim")).toBe(false);
    expect(sitzungPruefen("x", f, "geheim")).toBe(false);
  });

  it("Sperrgründe", () => {
    const jetzt = new Date("2026-11-20T12:00:00Z");
    const gut = { gueltig_bis: "2026-12-01T00:00:00Z", widerrufen_at: null, fehlversuche: 0 };
    expect(sperrgrund(gut, jetzt)).toBeNull();
    expect(sperrgrund({ ...gut, gueltig_bis: "2026-11-20T11:59:59Z" }, jetzt)).toBe("abgelaufen");
    expect(sperrgrund({ ...gut, widerrufen_at: "2026-11-19T00:00:00Z" }, jetzt)).toBe("widerrufen");
    expect(sperrgrund({ ...gut, fehlversuche: MAX_FEHLVERSUCHE }, jetzt)).toBe("gesperrt");
  });
});
