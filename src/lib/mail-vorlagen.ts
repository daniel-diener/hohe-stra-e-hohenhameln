import type { Anfrage } from "./anfrage";
import { formatFlaeche } from "./format";
import { finanzierungLabel, zweckLabel } from "./labels";
import type { Lead } from "./leads";
import { geschossName, type Objekt, projekt } from "./objekte";
import { TERMIN, terminTag, terminText, terminUhr } from "./termine";
import { anbieter } from "./rechtliches";

/**
 * Eingangsbestätigung an Interessent:innen — als HTML und als reiner Text.
 * Rein (kein Netz, keine Umgebung außer der übergebenen Basis-URL), damit sie
 * sich testen und als Vorschau rendern lässt.
 *
 * HTML-Mails: Tabellen und Inline-Styles, weil Outlook & Co. kaum CSS können.
 */

export type Mail = { betreff: string; text: string; html: string };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FARBE = { text: "#18181b", leise: "#52525b", linie: "#e4e4e7", flaeche: "#f4f4f5", blau: "#1d4ed8" };
const SCHRIFT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function bestaetigung(a: Anfrage, objekt: Objekt | undefined, basis: URL): Mail {
  const p = projekt.ansprechpartner;
  const url = (pfad: string) => new URL(pfad, basis).href;
  const reserviert = objekt && objekt.status !== "verfuegbar";
  const telefonisch = a.rueckruf && a.telefon;

  const betreff = objekt
    ? `Ihre Anfrage zu WE ${objekt.we} · ${projekt.name} ${projekt.ort}`
    : `Ihre Anfrage · ${projekt.name} ${projekt.ort}`;

  const einleitung = objekt
    ? `vielen Dank für Ihr Interesse an unserer Wohnung ${objekt.titel}. Ihre Anfrage ist bei uns eingegangen.`
    : `vielen Dank für Ihr Interesse an unseren Eigentumswohnungen an der ${projekt.name} in ${projekt.ort}. Ihre Anfrage ist bei uns eingegangen.`;

  const hinweisReserviert = reserviert
    ? objekt.status === "verkauft"
      ? "Diese Wohnung ist bereits verkauft. Gern stellen wir Ihnen vergleichbare Wohnungen im Haus vor."
      : "Diese Wohnung ist derzeit reserviert. Wir setzen Sie gern auf die Warteliste und stellen Ihnen auf Wunsch vergleichbare Wohnungen im Haus vor."
    : null;

  const schritte = [
    telefonisch
      ? `${p.name} ruft Sie zeitnah unter ${a.telefon} zurück.`
      : `${p.name} meldet sich zeitnah persönlich bei Ihnen.`,
    "Sie erhalten das ausführliche Exposé mit allen Grundrissen und Details zur Ausstattung.",
    "Gern vereinbaren wir einen Termin zur Beratung, auch zu Finanzierung und KfW-Förderung.",
  ];

  const eckdaten: [string, string][] = objekt
    ? [
        ["Geschoss", geschossName[objekt.geschoss]],
        ["Zimmer", String(objekt.zimmer)],
        ["Wohnfläche", formatFlaeche(objekt.wohnflaeche)],
        [objekt.freisitz.art, `${formatFlaeche(objekt.freisitz.flaeche)}, ${objekt.freisitz.seite}`],
      ]
    : [];

  const vorteile = ["Effizienzhaus QNG 40", "KfW-Kredit bis 150.000 € je Wohnung", `Fertigstellung ${projekt.fertigstellung}`, projekt.provision === "provisionsfrei" ? "Provisionsfrei" : projekt.provision];

  const pflicht = [
    anbieter.firma,
    `${anbieter.strasse}, ${anbieter.plzOrt}`,
    anbieter.geschaeftsfuehrer ? `Geschäftsführer: ${anbieter.geschaeftsfuehrer}` : null,
    anbieter.register,
  ].filter(Boolean) as string[];

  // ── Text ───────────────────────────────────────────────────────────
  const text = [
    `Guten Tag ${a.name},`,
    "",
    einleitung,
    ...(hinweisReserviert ? ["", hinweisReserviert] : []),
    ...(objekt
      ? ["", `Ihre Wohnung: ${objekt.titel}`, ...eckdaten.map(([k, v]) => `  ${k}: ${v}`), `  ${url(`/objekte/${objekt.slug}`)}`]
      : []),
    "",
    "So geht es weiter:",
    ...schritte.map((s, i) => `${i + 1}. ${s}`),
    "",
    `Exposé ansehen: ${url("/expose")}`,
    `Alle Wohnungen: ${url("/#objekte")}`,
    "",
    "Viele Grüße",
    p.name,
    `Projektmanagement ${projekt.name} ${projekt.ort}`,
    `Telefon ${p.telefon}`,
    p.email,
    "",
    "—",
    ...pflicht,
    `Impressum: ${url("/impressum")} · Datenschutz: ${url("/datenschutz")}`,
  ].join("\n");

  // ── HTML ───────────────────────────────────────────────────────────
  const zeile = (inhalt: string, stil = "") =>
    `<tr><td style="padding:0 32px;${stil}">${inhalt}</td></tr>`;
  const absatz = (t: string, stil = "") =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:${FARBE.text};${stil}">${t}</p>`;
  const knopf = (href: string, label: string, haupt: boolean) =>
    `<a href="${esc(href)}" style="display:inline-block;padding:12px 20px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;${
      haupt ? `background:${FARBE.text};color:#ffffff;` : `background:#ffffff;color:${FARBE.text};border:1px solid ${FARBE.linie};`
    }">${esc(label)}</a>`;

  const wohnungsBox = objekt
    ? zeile(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${FARBE.linie};border-radius:10px;margin:8px 0 24px;">
        <tr><td style="padding:18px 20px 6px;">
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${FARBE.leise};">Ihre Wohnung</div>
          <div style="font-size:18px;font-weight:600;color:${FARBE.text};margin-top:4px;">${esc(objekt.titel)}</div>
        </td></tr>
        <tr><td style="padding:6px 20px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${eckdaten
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:5px 0;font-size:14px;color:${FARBE.leise};width:42%;">${esc(k)}</td><td style="padding:5px 0;font-size:14px;color:${FARBE.text};font-weight:500;">${esc(v)}</td></tr>`,
              )
              .join("")}
          </table>
        </td></tr>
        <tr><td style="padding:10px 20px 18px;">
          <a href="${esc(url(`/objekte/${objekt.slug}`))}" style="font-size:14px;font-weight:600;color:${FARBE.blau};text-decoration:none;">Grundriss und Details ansehen →</a>
        </td></tr>
      </table>`)
    : "";

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(betreff)}</title></head>
<body style="margin:0;padding:0;background:${FARBE.flaeche};font-family:${SCHRIFT};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(einleitung)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FARBE.flaeche};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="padding:24px 32px;">
    <div style="font-size:18px;font-weight:600;letter-spacing:-0.01em;color:${FARBE.text};">${esc(projekt.name)}</div>
    <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${FARBE.leise};margin-top:2px;">${esc(projekt.ort)}</div>
  </td></tr>
  <tr><td><img src="${esc(url(projekt.bilder[0].src))}" width="600" alt="${esc(projekt.bilder[0].alt)}" style="display:block;width:100%;height:auto;border:0;"></td></tr>
  <tr><td style="height:28px;"></td></tr>
  ${zeile(absatz(`Guten Tag ${esc(a.name)},`))}
  ${zeile(absatz(esc(einleitung)))}
  ${hinweisReserviert ? zeile(`<p style="margin:0 0 16px;padding:12px 16px;border-radius:8px;background:#fef9c3;font-size:15px;line-height:1.5;color:${FARBE.text};">${esc(hinweisReserviert)}</p>`) : ""}
  ${wohnungsBox}
  ${zeile(`<div style="font-size:16px;font-weight:600;color:${FARBE.text};margin:0 0 10px;">So geht es weiter</div>`)}
  ${zeile(`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${schritte
    .map(
      (s, i) =>
        `<tr><td valign="top" style="padding:0 12px 10px 0;"><div style="width:24px;height:24px;border-radius:12px;background:${FARBE.flaeche};text-align:center;line-height:24px;font-size:13px;font-weight:600;color:${FARBE.text};">${i + 1}</div></td><td style="padding:2px 0 10px;font-size:15px;line-height:1.5;color:${FARBE.text};">${esc(s)}</td></tr>`,
    )
    .join("")}</table>`)}
  ${zeile(`${knopf(url("/expose"), "Exposé ansehen", true)}&nbsp;&nbsp;${knopf(url("/#objekte"), "Alle Wohnungen", false)}`, "padding-bottom:28px;")}
  ${zeile(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FARBE.flaeche};border-radius:10px;"><tr><td style="padding:14px 18px;font-size:13px;line-height:1.7;color:${FARBE.text};">${vorteile
    .map((v) => `<span style="white-space:nowrap;">✓ ${esc(v)}</span>`)
    .join("&nbsp;&nbsp; ")}</td></tr></table>`, "padding-bottom:28px;")}
  ${zeile(absatz("Viele Grüße", "margin-bottom:4px;"))}
  ${zeile(`<div style="font-size:16px;font-weight:600;color:${FARBE.text};">${esc(p.name)}</div>
    <div style="font-size:14px;color:${FARBE.leise};margin-top:2px;">Projektmanagement ${esc(projekt.name)} ${esc(projekt.ort)}</div>
    <div style="font-size:14px;margin-top:10px;line-height:1.7;">
      <a href="tel:${esc(p.telefon.replace(/\s/g, ""))}" style="color:${FARBE.text};text-decoration:none;">${esc(p.telefon)}</a><br>
      <a href="mailto:${esc(p.email)}" style="color:${FARBE.blau};text-decoration:none;">${esc(p.email)}</a>
    </div>`, "padding-bottom:32px;")}
  <tr><td style="padding:20px 32px 24px;border-top:1px solid ${FARBE.linie};font-size:12px;line-height:1.6;color:${FARBE.leise};">
    ${pflicht.map(esc).join("<br>")}<br>
    <a href="${esc(url("/impressum"))}" style="color:${FARBE.leise};">Impressum</a> · <a href="${esc(url("/datenschutz"))}" style="color:${FARBE.leise};">Datenschutz</a><br>
    Sie erhalten diese E-Mail, weil Sie über unsere Website eine Anfrage gestellt haben.
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return { betreff, text, html };
}

// ── Termin: Einladung, Bestätigung, Info an den Gastgeber ───────────────

type Empfaenger = Pick<Lead, "name" | "email" | "telefon" | "zweck" | "finanzierung" | "nachricht">;

const pflichtZeilen = () =>
  [
    anbieter.firma,
    `${anbieter.strasse}, ${anbieter.plzOrt}`,
    anbieter.geschaeftsfuehrer ? `Geschäftsführer: ${anbieter.geschaeftsfuehrer}` : null,
    anbieter.register,
  ].filter(Boolean) as string[];

/** Gemeinsamer Rahmen der Termin-Mails: Kopf, Inhalt, Gruß, Pflichtangaben. */
function rahmen(o: { betreff: string; vorschau: string; inhalt: string; basis: URL; gruss?: boolean }): string {
  const p = projekt.ansprechpartner;
  const url = (pfad: string) => new URL(pfad, o.basis).href;
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.betreff)}</title></head>
<body style="margin:0;padding:0;background:${FARBE.flaeche};font-family:${SCHRIFT};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(o.vorschau)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FARBE.flaeche};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="padding:24px 32px 20px;border-bottom:1px solid ${FARBE.linie};">
    <div style="font-size:18px;font-weight:600;letter-spacing:-0.01em;color:${FARBE.text};">${esc(projekt.name)}</div>
    <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${FARBE.leise};margin-top:2px;">${esc(projekt.ort)}</div>
  </td></tr>
  <tr><td style="padding:28px 32px 8px;font-size:16px;line-height:1.55;color:${FARBE.text};">${o.inhalt}</td></tr>
  ${o.gruss === false ? "" : `<tr><td style="padding:8px 32px 32px;">
    <p style="margin:0 0 4px;font-size:16px;color:${FARBE.text};">Viele Grüße</p>
    <div style="font-size:16px;font-weight:600;color:${FARBE.text};">${esc(p.name)}</div>
    <div style="font-size:14px;color:${FARBE.leise};margin-top:2px;">Projektmanagement ${esc(projekt.name)} ${esc(projekt.ort)}</div>
    <div style="font-size:14px;margin-top:10px;line-height:1.7;">
      <a href="tel:${esc(p.telefon.replace(/\s/g, ""))}" style="color:${FARBE.text};text-decoration:none;">${esc(p.telefon)}</a><br>
      <a href="mailto:${esc(p.email)}" style="color:${FARBE.blau};text-decoration:none;">${esc(p.email)}</a>
    </div>
  </td></tr>`}
  <tr><td style="padding:20px 32px 24px;border-top:1px solid ${FARBE.linie};font-size:12px;line-height:1.6;color:${FARBE.leise};">
    ${pflichtZeilen().map(esc).join("<br>")}<br>
    <a href="${esc(url("/impressum"))}" style="color:${FARBE.leise};">Impressum</a> · <a href="${esc(url("/datenschutz"))}" style="color:${FARBE.leise};">Datenschutz</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const hAbsatz = (t: string) => `<p style="margin:0 0 16px;">${t}</p>`;
const hKnopf = (href: string, label: string) =>
  `<p style="margin:8px 0 24px;"><a href="${esc(href)}" style="display:inline-block;padding:14px 24px;border-radius:8px;background:${FARBE.text};color:#ffffff;font-weight:600;font-size:16px;text-decoration:none;">${esc(label)}</a></p>`;
const hKasten = (zeilen: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${FARBE.linie};border-radius:10px;margin:4px 0 24px;"><tr><td style="padding:12px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${zeilen
      .map(([k, v]) => `<tr><td valign="top" style="padding:6px 12px 6px 0;font-size:14px;color:${FARBE.leise};width:30%;">${esc(k)}</td><td style="padding:6px 0;font-size:15px;color:${FARBE.text};font-weight:500;">${v}</td></tr>`)
      .join("")}</table></td></tr></table>`;

const ortZeilen = `${TERMIN.ort.name}\n${TERMIN.ort.strasse}, ${TERMIN.ort.plzOrt}`;
const ortHtml = `${esc(TERMIN.ort.name)}<br>${esc(TERMIN.ort.strasse)}, ${esc(TERMIN.ort.plzOrt)}`;
const pflichtText = (basis: URL) => ["—", ...pflichtZeilen(), `Impressum: ${new URL("/impressum", basis).href} · Datenschutz: ${new URL("/datenschutz", basis).href}`];
const grussText = () => {
  const p = projekt.ansprechpartner;
  return ["Viele Grüße", p.name, `Projektmanagement ${projekt.name} ${projekt.ort}`, `Telefon ${p.telefon}`, p.email];
};

/** Einladung ins Büro mit persönlichem Buchungslink. */
export function einladung(l: Empfaenger, objekt: Objekt | undefined, basis: URL, token: string): Mail {
  const link = new URL(`/termin/${token}`, basis).href;
  const bezug = objekt ? `der Wohnung ${objekt.titel}` : `unseren Eigentumswohnungen an der ${projekt.name}`;
  const betreff = `Einladung zum persönlichen Termin · ${projekt.name} ${projekt.ort}`;
  const s1 = `vielen Dank für Ihr Interesse an ${bezug}. Gern stellen wir Ihnen das Projekt persönlich vor und beantworten Ihre Fragen zu Grundrissen, Ausstattung, Kaufpreis, Finanzierung und Förderung.`;
  const s2 = `Dazu laden wir Sie herzlich in das Büro von ${TERMIN.ort.name} ein. ${TERMIN.gastgeber} nimmt sich etwa eine Stunde Zeit für Sie.`;
  const s3 = "Passt keiner der Termine? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an, wir finden einen anderen.";
  const text = [
    `Guten Tag ${l.name},`, "", s1, "", s2, "",
    "Wann: Montag bis Freitag, 17:00 oder 18:00 Uhr",
    `Wo: ${TERMIN.ort.name}, ${TERMIN.ort.strasse}, ${TERMIN.ort.plzOrt}`,
    "Dauer: etwa eine Stunde", "",
    `Termin online buchen: ${link}`, "", s3, "",
    ...grussText(), "", ...pflichtText(basis),
  ].join("\n");
  const inhalt =
    hAbsatz(`Guten Tag ${esc(l.name)},`) + hAbsatz(esc(s1)) + hAbsatz(esc(s2)) +
    hKasten([["Wann", "Montag bis Freitag, 17:00 oder 18:00 Uhr"], ["Wo", ortHtml], ["Dauer", "etwa eine Stunde"]]) +
    hKnopf(link, "Termin online buchen") + hAbsatz(esc(s3));
  return { betreff, text, html: rahmen({ betreff, vorschau: s2, inhalt, basis }) };
}

/** Terminbestätigung an den Interessenten. Die Kalenderdatei hängt an. */
export function terminBestaetigung(l: Empfaenger, objekt: Objekt | undefined, beginn: Date | string, basis: URL, token: string): Mail {
  const link = new URL(`/termin/${token}`, basis).href;
  const wann = terminText(beginn);
  const betreff = `Ihr Termin am ${terminTag(beginn)}, ${terminUhr(beginn)} Uhr · ${projekt.name} ${projekt.ort}`;
  const s1 = `Ihr Termin ist bestätigt. ${TERMIN.gastgeber} freut sich auf das Gespräch mit Ihnen${objekt ? ` zur Wohnung ${objekt.titel}` : ""}.`;
  const s2 = "Die Kalenderdatei im Anhang können Sie mit einem Klick in Ihren Kalender übernehmen.";
  const s3 = "Bringen Sie gern Ihre Fragen mit. Wenn Sie schon mit Ihrer Bank gesprochen haben, helfen uns Ihre Eckdaten zur Finanzierung.";
  const s4 = "Sie möchten den Termin verschieben? Über den Link unten wählen Sie einen anderen. Zum Absagen antworten Sie bitte kurz auf diese E-Mail oder rufen uns an.";
  const text = [
    `Guten Tag ${l.name},`, "", s1, "",
    `Wann: ${wann}`, `Wo: ${TERMIN.ort.name}, ${TERMIN.ort.strasse}, ${TERMIN.ort.plzOrt}`, `Mit: ${TERMIN.gastgeber}`, "",
    s2, s3, "", s4, `Termin ändern: ${link}`, "",
    ...grussText(), "", ...pflichtText(basis),
  ].join("\n");
  const inhalt =
    hAbsatz(`Guten Tag ${esc(l.name)},`) + hAbsatz(esc(s1)) +
    hKasten([["Wann", `<strong>${esc(wann)}</strong>`], ["Wo", ortHtml], ["Mit", esc(TERMIN.gastgeber)]]) +
    hAbsatz(esc(s2)) + hAbsatz(esc(s3)) + hAbsatz(esc(s4)) +
    `<p style="margin:0 0 20px;"><a href="${esc(link)}" style="color:${FARBE.blau};font-weight:600;text-decoration:none;">Termin ändern →</a></p>`;
  return { betreff, text, html: rahmen({ betreff, vorschau: `${wann}, ${TERMIN.ort.name}`, inhalt, basis }) };
}

/** Terminbestätigung an den Gastgeber und das Team, mit allem, was über den Interessenten bekannt ist. */
export function terminInfo(l: Empfaenger & { id: string }, objekt: Objekt | undefined, beginn: Date | string, basis: URL, quelle: "online" | "team"): Mail {
  const wann = terminText(beginn);
  const betreff = `Neuer Termin: ${terminTag(beginn)}, ${terminUhr(beginn)} Uhr · ${l.name}`;
  const lead = new URL(`/admin/leads/${l.id}`, basis).href;
  const daten: [string, string][] = [
    ["Wann", wann],
    ["Wo", `${TERMIN.ort.name}, ${TERMIN.ort.strasse}`],
    ["Interessent", l.name],
    ["Telefon", l.telefon ?? "keine Angabe"],
    ["E-Mail", l.email],
    ["Wohnung", objekt?.titel ?? "Allgemeine Anfrage"],
    ["Zweck", zweckLabel[l.zweck]],
    ["Finanzierung", finanzierungLabel[l.finanzierung]],
    ["Gebucht", quelle === "online" ? "online durch den Interessenten" : "vom Team eingetragen"],
  ];
  const text = [
    "Ein neuer Termin wurde vereinbart.", "",
    ...daten.map(([k, v]) => `${k}: ${v}`), "",
    ...(l.nachricht ? ["Nachricht aus der Anfrage:", l.nachricht, ""] : []),
    `Lead im Vertriebsbereich: ${lead}`, "",
    "Die Kalenderdatei hängt an. Der Interessent hat eine Bestätigung mit demselben Termin bekommen.",
  ].join("\n");
  const inhalt =
    hAbsatz("Ein neuer Termin wurde vereinbart.") +
    hKasten(daten.map(([k, v]) => [k, k === "Wann" ? `<strong>${esc(v)}</strong>` : esc(v)])) +
    (l.nachricht ? hAbsatz(`<span style="color:${FARBE.leise};font-size:14px;">Nachricht aus der Anfrage</span><br>${esc(l.nachricht).replace(/\n/g, "<br>")}`) : "") +
    hAbsatz(`<a href="${esc(lead)}" style="color:${FARBE.blau};font-weight:600;text-decoration:none;">Lead im Vertriebsbereich öffnen →</a>`) +
    hAbsatz(`<span style="color:${FARBE.leise};font-size:14px;">Die Kalenderdatei hängt an. Der Interessent hat eine Bestätigung mit demselben Termin bekommen.</span>`);
  return { betreff, text, html: rahmen({ betreff, vorschau: `${wann} · ${l.name}`, inhalt, basis, gruss: false }) };
}
