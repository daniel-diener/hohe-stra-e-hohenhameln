/**
 * Erzeugt unterlagen/ausstattung-hohe-strasse.pdf aus der Seite /admin/ausstattung.
 *
 *   npm run ausstattung-pdf
 *
 * Die Seite liegt hinter der Anmeldung. Damit kein Login nötig ist, spiegelt das
 * Skript sie für die Dauer des Laufs auf eine Vorschau-Route, startet `next dev`
 * auf einem freien Port, druckt das PDF und räumt danach wieder auf.
 * Nach Änderungen an der Ausstattungsseite ausführen und das PDF mit committen.
 */
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");

const PORT = 3123;
const ROUTE = "src/app/pdf-vorschau-ausstattung";
const ZIEL = "unterlagen/ausstattung-hohe-strasse.pdf";

await mkdir(ROUTE, { recursive: true });
await writeFile(`${ROUTE}/page.tsx`, 'export { default } from "@/app/admin/(team)/ausstattung/page";\n');

const server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
  stdio: "ignore",
  detached: true,
  // Die Web-Adresse im Kontaktblock soll die echte sein, nicht localhost.
  env: { ...process.env, SITE_URL: process.env.SITE_URL ?? "https://hohe-strasse.judek-projekt.de" },
});

try {
  const url = `http://localhost:${PORT}/pdf-vorschau-ausstattung`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(url)).ok) break; } catch {}
    if (i > 90) throw new Error("Dev-Server antwortet nicht");
    await new Promise((r) => setTimeout(r, 1000));
  }

  const browser = await chromium.launch();
  const seite = await browser.newPage({ viewport: { width: 1200, height: 1700 } });
  await seite.goto(url, { waitUntil: "networkidle" });
  await seite.evaluate(async () => {
    for (const img of document.images) {
      img.loading = "eager";
      if (!img.complete) await new Promise((fertig) => { img.onload = img.onerror = fertig; });
    }
  });
  await seite.emulateMedia({ media: "print" });
  await mkdir("unterlagen", { recursive: true });
  await seite.pdf({ path: ZIEL, format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(`PDF gespeichert: ${ZIEL}`);
} finally {
  try { process.kill(-server.pid); } catch {}
  await rm(ROUTE, { recursive: true, force: true });
  // Next legt für die Vorschau-Route Typen an; ohne Aufräumen meldet `npm run typecheck` sie als fehlend.
  await rm(".next/types", { recursive: true, force: true });
}
