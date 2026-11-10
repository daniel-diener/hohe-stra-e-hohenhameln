import { describe, expect, it } from "vitest";
import { geraetAus, herkunftAus, heuteBerlin, istBot, kennung, zaehlbarerPfad } from "./besuch";

describe("Besucherstatistik", () => {
  it("zählt nur öffentliche Seiten, ohne Query", () => {
    expect(zaehlbarerPfad("/objekte/wohnung-3?utm_source=x")).toBe("/objekte/wohnung-3");
    expect(zaehlbarerPfad("/")).toBe("/");
    expect(zaehlbarerPfad("/admin")).toBeNull();
    expect(zaehlbarerPfad("/admin/leads/1")).toBeNull();
    expect(zaehlbarerPfad("/api/besuch")).toBeNull();
    expect(zaehlbarerPfad("https://fremd.de/")).toBeNull();
    expect(zaehlbarerPfad(42)).toBeNull();
  });

  it("speichert von der Herkunft nur den Host, und die eigene Seite gar nicht", () => {
    expect(herkunftAus("https://www.google.com/search?q=wohnung", "x.de")).toBe("google.com");
    expect(herkunftAus("https://hohe-strasse.de/objekte", "hohe-strasse.de")).toBeNull();
    expect(herkunftAus("https://www.hohe-strasse.de/", "hohe-strasse.de:443")).toBeNull();
    expect(herkunftAus("kein link", null)).toBeNull();
    expect(herkunftAus("", null)).toBeNull();
  });

  it("erkennt Geräte und Bots", () => {
    expect(geraetAus("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile")).toBe("mobil");
    expect(geraetAus("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(geraetAus("Mozilla/5.0 (Linux; Android 14; SM-X710)")).toBe("tablet");
    expect(geraetAus("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile")).toBe("mobil");
    expect(geraetAus("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("desktop");
    expect(istBot("Googlebot/2.1")).toBe(true);
    expect(istBot("WhatsApp/2.23")).toBe(true);
    expect(istBot("")).toBe(true);
    expect(istBot("Mozilla/5.0 (Macintosh)")).toBe(false);
  });

  it("säubert Kampagnenkennungen", () => {
    expect(kennung(" Plakat-Bauschild ")).toBe("plakat-bauschild");
    expect(kennung("<script>")).toBe("script");
    expect(kennung("")).toBeNull();
  });

  it("rechnet den Tag in Berliner Zeit", () => {
    expect(heuteBerlin(new Date("2026-11-10T23:30:00Z"))).toBe("2026-11-11");
    expect(heuteBerlin(new Date("2026-07-01T21:59:00Z"))).toBe("2026-07-01");
  });
});
