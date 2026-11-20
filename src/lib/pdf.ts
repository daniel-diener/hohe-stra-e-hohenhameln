import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import type { Dokument } from "./dokumente";

/**
 * Druckt Exposé-Seiten serverseitig als PDF, genau wie `scripts/expose-pdf.mjs`:
 * A4, mit Hintergründen, Druck-CSS. Die Seiten liegen im Vertriebsbereich, deshalb
 * gehen die Cookies der anfragenden Person mit — so sieht der Browser dieselben
 * Preise wie sie und nichts, was sie nicht sehen dürfte.
 *
 * Auf Vercel kommt Chromium aus `@sparticuz/chromium`. Lokal (macOS, Windows)
 * passt dieses Linux-Binary nicht: dann `CHROMIUM_PATH` auf ein installiertes
 * Chrome oder Chromium setzen.
 */

export type Cookie = { name: string; value: string };

async function browserStarten(): Promise<Browser> {
  const lokal = process.env.CHROMIUM_PATH;
  if (lokal) return puppeteer.launch({ executablePath: lokal, headless: true, args: ["--no-sandbox"] });
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
}

async function drucken(browser: Browser, url: string): Promise<Uint8Array> {
  const seite = await browser.newPage();
  try {
    await seite.setViewport({ width: 1200, height: 1700 });
    const antwort = await seite.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
    // Leitet die Middleware zur Anmeldung um, käme sonst die Anmeldeseite als PDF.
    if (!antwort?.ok() || new URL(seite.url()).pathname !== new URL(url).pathname) {
      throw new Error(`Seite nicht druckbar: ${url} (${antwort?.status() ?? "keine Antwort"})`);
    }
    // Bilder laden lassen, auch die weiter unten.
    await seite.evaluate(async () => {
      for (const img of Array.from(document.images)) {
        img.loading = "eager";
        if (!img.complete) await new Promise((fertig) => { img.onload = img.onerror = fertig; });
      }
    });
    await seite.emulateMediaType("print");
    return await seite.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  } finally {
    await seite.close();
  }
}

/**
 * Liefert die PDFs zu den Dokumenten, in derselben Reihenfolge: feste Dateien
 * direkt von der Platte, Seiten frisch gedruckt. Mehrere Seiten gleichzeitig,
 * aber nicht alle: Chromium braucht je Tab spürbar Speicher.
 */
export async function pdfsErzeugen(origin: string, cookies: Cookie[], liste: Dokument[], gleichzeitig = 3) {
  const ergebnis: Uint8Array[] = new Array(liste.length);
  const zuDrucken: number[] = [];
  for (const [i, d] of liste.entries()) {
    if (d.quelle.art === "datei") ergebnis[i] = await readFile(path.join(process.cwd(), d.quelle.pfad));
    else zuDrucken.push(i);
  }
  if (!zuDrucken.length) return ergebnis;

  const browser = await browserStarten();
  try {
    const { hostname } = new URL(origin);
    if (cookies.length) {
      await browser.setCookie(...cookies.map((c) => ({ name: c.name, value: c.value, domain: hostname, path: "/" })));
    }
    let naechstes = 0;
    const arbeiter = async () => {
      while (naechstes < zuDrucken.length) {
        const i = zuDrucken[naechstes++];
        ergebnis[i] = await drucken(browser, new URL(liste[i].quelle.pfad, origin).toString());
      }
    };
    await Promise.all(Array.from({ length: Math.min(gleichzeitig, zuDrucken.length) }, arbeiter));
    return ergebnis;
  } finally {
    await browser.close();
  }
}
