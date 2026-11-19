// Erzeugt die Bildkacheln fürs Facebook-Posting (1080×1350, 4:5) aus den Visualisierungen.
// Wohnflächen immer mit „ca.“ und abgerundet (Vorgabe Vertrieb).
// Aufruf aus dem Repo-Stamm: node marketing/facebook-peine/render.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // global vorinstalliert oder aus node_modules
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const hier = path.dirname(fileURLToPath(import.meta.url));
const bild = (n) => "data:image/jpeg;base64," + readFileSync(path.join(hier, "../../public/projekt", n)).toString("base64");
const logo = "data:image/png;base64," + readFileSync(path.join(hier, "../../public/logo/judek-projekt.png")).toString("base64");

const haus = `<svg width="44" height="44" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 28h27"/><path d="M4.5 28V14h23v14"/><path d="M4.5 14V6h14v8"/><path d="M21.5 14v-3.5h6v3.5M24.5 10.5V14" opacity=".55"/><path d="M4.5 21h23" opacity=".4"/><path d="M14 28v-4h4v4"/></svg>`;

const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;font-family:Inter,sans-serif;color:#fff;overflow:hidden;background:#111}
.k{position:relative;width:1080px;height:1350px;overflow:hidden}
.bg{position:absolute;inset:0;background-size:cover;background-position:center}
.ov{position:absolute;inset:0}
.inhalt{position:absolute;left:72px;right:72px}
.marke{display:flex;align-items:center;gap:14px;font-weight:600;font-size:26px;letter-spacing:.02em}
.marke small{display:block;font-weight:400;font-size:20px;opacity:.85}
.tag{display:inline-block;background:#1a4fc4;color:#fff;font-weight:700;font-size:24px;letter-spacing:.08em;text-transform:uppercase;padding:12px 20px;border-radius:8px}
h1{font-family:"Inter Display",Inter,sans-serif;font-weight:800;font-size:92px;line-height:1.0;letter-spacing:-.02em}
h2{font-family:"Inter Display",Inter,sans-serif;font-weight:800;font-size:68px;line-height:1.05;letter-spacing:-.015em}
.unter{font-size:34px;line-height:1.35;font-weight:500;opacity:.95}
.chips{display:flex;flex-wrap:wrap;gap:12px}
.chip{background:rgba(255,255,255,.16);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);padding:12px 20px;border-radius:999px;font-size:26px;font-weight:600}
.preis{display:flex;align-items:baseline;gap:18px}
.preis b{font-family:"Inter Display";font-size:88px;font-weight:800;letter-spacing:-.02em}
.preis span{font-size:30px;font-weight:500}
.karte{background:rgba(255,255,255,.96);color:#111;border-radius:22px;padding:40px 44px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.liste{display:grid;gap:22px}
.zeile{display:grid;grid-template-columns:var(--sp,230px) 1fr;gap:24px;align-items:baseline;font-size:30px;line-height:1.3}
.zeile b{font-family:"Inter Display";font-size:40px;font-weight:800;color:#1a4fc4;white-space:nowrap}
.haken{display:grid;grid-template-columns:1fr 1fr;gap:20px 28px}
.haken div{font-size:28px;line-height:1.3;font-weight:500;padding-left:44px;position:relative}
.haken div::before{content:"";position:absolute;left:0;top:4px;width:28px;height:28px;border-radius:50%;background:#1a4fc4 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E") center/18px no-repeat}
.klein{font-size:20px;opacity:.75;line-height:1.4}
.fuss{position:absolute;left:0;right:0;bottom:0;height:96px;background:#fff;color:#111;display:flex;align-items:center;justify-content:space-between;padding:0 72px}
.fuss img{height:52px}
.fuss .web{font-weight:700;font-size:28px;color:#1a4fc4}
`;

const fuss = `<div class="fuss"><img src="${logo}"><span class="web">hohe-strasse.judek-projekt.de</span></div>`;
const marke = `<div class="marke">${haus}<div>Hohe Straße<small>Hohenhameln · Landkreis Peine</small></div></div>`;

const kacheln = {
  "01-titel": `
  <div class="k"><div class="bg" style="background-image:url(${bild("eingang.jpg")});background-position:58% 50%"></div>
  <div class="ov" style="background:linear-gradient(180deg,rgba(8,20,45,.78) 0%,rgba(8,20,45,.35) 34%,rgba(0,0,0,0) 50%,rgba(0,0,0,.15) 62%,rgba(0,0,0,.82) 92%)"></div>
  <div class="inhalt" style="top:64px">${marke}</div>
  <div class="inhalt" style="top:200px"><span class="tag">Neubau · Provisionsfrei</span>
    <h1 style="margin-top:26px">16 Eigentums&shy;wohnungen<br>in Hohenhameln</h1></div>
  <div class="inhalt" style="bottom:136px">
    <div class="chips" style="margin-bottom:30px"><span class="chip">Effizienzhaus 40 QNG</span><span class="chip">Barrierefrei mit Aufzug</span><span class="chip">ca. 55–122 m²</span></div>
    <div class="preis"><span>ab</span><b>228.370 €</b></div>
    <div class="unter" style="margin-top:6px">Fertigstellung Ende 2027</div></div>
  ${fuss}</div>`,

  "02-wohnungen": `
  <div class="k"><div class="bg" style="background-image:url(${bild("garten.jpg")});background-position:50% 40%"></div>
  <div class="ov" style="background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 40%,rgba(0,0,0,.25) 60%)"></div>
  <div class="inhalt" style="top:72px"><h2>Für jede Lebens&shy;phase<br>die passende Wohnung</h2></div>
  <div class="inhalt" style="bottom:136px"><div class="karte" style="--sp:250px"><div class="liste">
    <div class="zeile"><b>2 Zimmer</b><span>ca. 55–76 m² – ideal für Singles, Paare und Kapitalanleger</span></div>
    <div class="zeile"><b>3 Zimmer</b><span>ca. 83–98 m² – Platz für die kleine Familie</span></div>
    <div class="zeile"><b>4 Zimmer</b><span>bis ca. 122 m², zwei Bäder – mit Garten oder Balkon</span></div>
    <div class="zeile"><b>Penthouse</b><span>3 Zimmer, ca. 110–113 m², bis zu ca. 50 m² Dachterrasse</span></div>
  </div><p class="klein" style="margin-top:26px;color:#555;opacity:1">Jede Wohnung mit Terrasse, Balkon oder Dachterrasse und eigenem Abstellraum. Garten­wohnungen mit Sondernutzungsrecht.</p></div></div>
  ${fuss}</div>`,

  "03-ausstattung": `
  <div class="k"><div class="bg" style="background-image:url(${bild("luftbild.jpg")});background-size:auto 900px;background-position:50% 0;background-repeat:no-repeat;background-color:#f3f4f6"></div>
  <div class="ov" style="background:linear-gradient(180deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,.35) 14%,rgba(0,0,0,0) 26%)"></div>
  <div class="inhalt" style="top:64px"><h2>Wohnen auf Neubau-Niveau</h2></div>
  <div class="inhalt" style="top:860px;left:0;right:0;bottom:96px;background:#fff;color:#111;padding:52px 72px">
    <div class="haken">
      <div>Wärmepumpe &amp; Fußbodenheizung</div><div>Eigene PV-Anlage mit Stromspeicher je Wohnung</div>
      <div>Aufzug in alle Geschosse</div><div>Bodentiefe Fenster</div>
      <div>Elektrische Außenjalousien</div><div>Tageslichtbäder, ebenerdige Dusche</div>
      <div>Echtholzparkett in den Wohnräumen</div><div>Stellplatz oder Carport, Wallbox optional</div>
    </div></div>
  ${fuss}</div>`,

  "04-lage": `
  <div class="k"><div class="bg" style="background-image:url(${bild("zufahrt-abend.jpg")});background-position:40% 50%"></div>
  <div class="ov" style="background:linear-gradient(180deg,rgba(10,15,35,.75) 0%,rgba(10,15,35,.2) 30%,rgba(0,0,0,0) 45%,rgba(0,0,0,.2) 55%)"></div>
  <div class="inhalt" style="top:72px"><h2>Ruhig wohnen.<br>Schnell überall.</h2></div>
  <div class="inhalt" style="bottom:136px"><div class="karte"><div class="liste">
    <div class="zeile"><b>≈ 20 Min.</b><span>nach Peine und Hildesheim</span></div>
    <div class="zeile"><b>15 Min.</b><span>zur A2, Anschluss Hämelerwald</span></div>
    <div class="zeile"><b>&lt; 40 Min.</b><span>nach Hannover und Braunschweig</span></div>
    <div class="zeile"><b>zu Fuß</b><span>Einkauf, Ärzte, Cafés, Schule und Kitas</span></div>
  </div></div></div>
  ${fuss}</div>`,

  "05-foerderung": `
  <div class="k" style="background:#0d1f4a">
  <div class="bg" style="background-image:url(${bild("eingang.jpg")});opacity:.18;filter:grayscale(.3)"></div>
  <div class="inhalt" style="top:72px">${marke}</div>
  <div class="inhalt" style="top:210px"><span class="tag" style="background:#fff;color:#0d1f4a">Förderung</span>
    <h2 style="margin-top:24px">Effizienzhaus 40 mit QNG – das zahlt sich aus</h2></div>
  <div class="inhalt" style="top:600px"><div class="liste" style="gap:28px">
    <div class="karte" style="padding:30px 38px"><div style="font-size:22px;font-weight:600;color:#1a4fc4;text-transform:uppercase;letter-spacing:.06em">Eigennutzer &amp; Vermieter</div><div style="font-family:'Inter Display';font-size:40px;font-weight:800;margin-top:6px">KfW-Kredit bis 150.000 €</div><div style="font-size:24px;color:#444;margin-top:6px">je Wohnung, zinsgünstig („Klimafreundlicher Neubau“)</div></div>
    <div class="karte" style="padding:30px 38px"><div style="font-size:22px;font-weight:600;color:#1a4fc4;text-transform:uppercase;letter-spacing:.06em">Kapitalanleger</div><div style="font-family:'Inter Display';font-size:40px;font-weight:800;margin-top:6px">Sonder-AfA nach § 7b EStG</div><div style="font-size:24px;color:#444;margin-top:6px">4 Jahre je 5 % zusätzlich zur regulären Abschreibung</div></div>
  </div>
  <div style="margin-top:40px;font-size:30px;font-weight:600">Exposé &amp; Beratung: Lena Mylin · +49 155 10336973</div>
  <div class="klein" style="margin-top:10px">Förderbedingungen können sich ändern. Keine Steuer- oder Finanzierungsberatung.</div></div>
  ${fuss}</div>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
for (const [name, html] of Object.entries(kacheln)) {
  await page.setContent(`<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(hier, `${name}.jpg`), type: "jpeg", quality: 90 });
  console.log("✓", name);
}
await browser.close();
