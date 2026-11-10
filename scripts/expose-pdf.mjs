/**
 * Erzeugt das Exposé als PDF aus der Seite /expose.
 *
 *   npm run build && npm start         # in einem Terminal
 *   npm run expose                     # im zweiten → expose-hohe-strasse.pdf
 *   npm run expose -- https://…/expose ausgabe.pdf   # andere Quelle/Datei
 *
 * Braucht Playwright mit Chromium (`npx playwright install chromium`, falls nicht vorhanden).
 */
import { createRequire } from "node:module";

// Über require statt import: so findet Node auch ein global installiertes Playwright (NODE_PATH).
const { chromium } = createRequire(import.meta.url)("playwright");

const url = process.argv[2] ?? "http://localhost:3000/expose";
const datei = process.argv[3] ?? "expose-hohe-strasse.pdf";

const browser = await chromium.launch();
const seite = await browser.newPage({ viewport: { width: 1200, height: 1700 } });
await seite.goto(url, { waitUntil: "networkidle" });
// Bilder laden lassen, auch die weiter unten.
await seite.evaluate(async () => {
  for (const img of document.images) {
    img.loading = "eager";
    if (!img.complete) await new Promise((fertig) => { img.onload = img.onerror = fertig; });
  }
});
await seite.emulateMedia({ media: "print" });
await seite.pdf({ path: datei, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Exposé gespeichert: ${datei}`);
