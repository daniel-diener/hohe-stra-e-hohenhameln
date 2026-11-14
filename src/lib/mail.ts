import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Anfrage } from "./anfrage";
import { finanzierungLabel, zweckLabel } from "./labels";
import type { Lead } from "./leads";
import { bestaetigung, einladung, terminBestaetigung, terminInfo } from "./mail-vorlagen";
import { objektNach, projekt } from "./objekte";
import { seitenUrl } from "./seite";
import { TERMIN, kalenderDatei, terminOrt, terminText } from "./termine";

/**
 * E-Mails über das IONOS-Postfach des Projekts (SMTP, STARTTLS auf Port 587).
 * Absender ist das Postfach selbst — IONOS lehnt fremde Absender ab.
 *
 * Ein Fehler hier darf keine Anfrage kosten: Der Lead steht zu diesem
 * Zeitpunkt schon in der Datenbank. Darum wird protokolliert, nicht geworfen.
 */
const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.ionos.de";
const SMTP_BENUTZER = process.env.SMTP_BENUTZER ?? projekt.ansprechpartner.email;

/** Wer bei jeder neuen Anfrage eine Mail bekommt, solange in Vercel nichts anderes steht. */
const TEAM_STANDARD = "immobilien@daniel-diener.de, immobilien@lena-mylin.de";

let transport: Transporter | null = null;
function verbindung() {
  // Leerzeichen am Rand rutschen beim Einfügen in Vercel leicht mit.
  const passwort = process.env.SMTP_PASSWORT?.trim();
  if (!passwort) return null;
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: SMTP_BENUTZER, pass: passwort },
  });
  return transport;
}

type Anhang = { filename: string; content: string; contentType: string };

/** true, wenn der Mailserver die Nachricht angenommen hat. */
async function senden(
  an: string | string[], betreff: string, text: string, antwortAn?: string, html?: string, anhaenge?: Anhang[],
): Promise<boolean> {
  const t = verbindung();
  if (!t) {
    console.warn("Mail nicht versendet: SMTP_PASSWORT ist nicht gesetzt (Vercel → Environment Variables, danach Redeploy).");
    return false;
  }
  try {
    await t.sendMail({
      from: { name: `${projekt.name} ${projekt.ort}`, address: SMTP_BENUTZER },
      to: an,
      subject: betreff,
      text,
      html,
      replyTo: antwortAn,
      attachments: anhaenge,
    });
    console.info("Mail versendet an", an, "·", betreff);
    return true;
  } catch (e) {
    console.error("Mail an", an, "gescheitert:", e);
    if ((e as { responseCode?: number }).responseCode === 535) {
      // Nur Prüfdaten, nie das Passwort selbst.
      const roh = process.env.SMTP_PASSWORT ?? "";
      console.error(
        `IONOS-Anmeldung abgelehnt. Benutzer: ${SMTP_BENUTZER} · Server: ${SMTP_HOST} · ` +
          `Passwortlänge: ${roh.trim().length} · Leerzeichen am Rand entfernt: ${roh !== roh.trim() ? "ja" : "nein"}`,
      );
    }
    return false;
  }
}

/** „flyer / print / postwurf-hohenhameln" oder die Seite, von der jemand kam. */
function herkunft(q: Record<string, string>) {
  const utm = [q.utm_source, q.utm_medium, q.utm_campaign].filter(Boolean).join(" / ");
  return utm || q.referrer || "direkt";
}

export async function meldeNeueAnfrage(id: string, a: Anfrage) {
  const objekt = objektNach(a.objekt_slug);
  const bezug = objekt?.titel ?? "Allgemeine Anfrage";
  const aufgaben: Promise<boolean>[] = [];

  // Mehrere Empfänger mit Komma trennen: "a@x.de, b@y.de". In Vercel überschreibbar.
  const team = (process.env.LEAD_BENACHRICHTIGUNG_AN || TEAM_STANDARD).split(",").map((s) => s.trim()).filter(Boolean);
  if (team.length > 0) {
    const link = process.env.SITE_URL ? `${process.env.SITE_URL}/admin/leads/${id}` : "";
    aufgaben.push(
      senden(
        team,
        `Neue Anfrage: ${bezug} · ${a.name}`,
        [
          `Objekt: ${bezug}`,
          `Name: ${a.name}`,
          `E-Mail: ${a.email}`,
          `Telefon: ${a.telefon ?? "keine Angabe"}${a.rueckruf ? " (Rückruf gewünscht)" : ""}`,
          `Zweck: ${zweckLabel[a.zweck]}`,
          `Finanzierung: ${finanzierungLabel[a.finanzierung]}`,
          `Herkunft: ${herkunft(a.quelle)}`,
          "",
          a.nachricht ?? "(keine Nachricht)",
          "",
          link,
        ].join("\n"),
        a.email,
      ),
    );
  }

  if (process.env.ANFRAGE_BESTAETIGUNG === "1") {
    const m = bestaetigung(a, objekt, seitenUrl);
    aufgaben.push(senden(a.email, m.betreff, m.text, projekt.ansprechpartner.email, m.html));
  }

  await Promise.all(aufgaben);
}

/** An wen die Terminbestätigung für den Gastgeber geht, solange in Vercel nichts anderes steht. */
const GASTGEBER_STANDARD = "r.judek@judek.de";

function teamAdressen() {
  return (process.env.LEAD_BENACHRICHTIGUNG_AN || TEAM_STANDARD).split(",").map((s) => s.trim()).filter(Boolean);
}

type LeadFuerMail = Pick<Lead, "id" | "name" | "email" | "telefon" | "zweck" | "finanzierung" | "nachricht" | "objekt_slug">;

/** Einladung ins Büro mit persönlichem Buchungslink. */
export async function sendeEinladung(lead: LeadFuerMail, token: string): Promise<boolean> {
  const m = einladung(lead, objektNach(lead.objekt_slug), seitenUrl, token);
  return senden(lead.email, m.betreff, m.text, projekt.ansprechpartner.email, m.html);
}

/**
 * Terminbestätigung an den Interessenten sowie an Gastgeber und Team — beide
 * mit derselben Kalenderdatei, nur die Beschreibung unterscheidet sich.
 */
export async function sendeTerminMails(
  lead: LeadFuerMail, termin: { id: string; beginn: string; quelle: "online" | "team" }, token: string,
) {
  const objekt = objektNach(lead.objekt_slug);
  const bezug = objekt?.titel ?? `${projekt.name} ${projekt.ort}`;
  const ics = (titel: string, beschreibung: string): Anhang[] => [{
    filename: "termin.ics",
    content: kalenderDatei({ id: termin.id, beginn: termin.beginn, titel, beschreibung }),
    contentType: "text/calendar; charset=utf-8; method=PUBLISH",
  }];
  const p = projekt.ansprechpartner;

  const kunde = terminBestaetigung(lead, objekt, termin.beginn, seitenUrl, token);
  const intern = terminInfo(lead, objekt, termin.beginn, seitenUrl, termin.quelle);
  const gastgeber = (process.env.TERMIN_BENACHRICHTIGUNG_AN || GASTGEBER_STANDARD).split(",").map((s) => s.trim()).filter(Boolean);

  await Promise.all([
    senden(
      lead.email, kunde.betreff, kunde.text, p.email, kunde.html,
      ics(`Beratung ${projekt.name} ${projekt.ort}`, `Persönlicher Termin mit ${TERMIN.gastgeber} zu ${bezug}.\n${terminOrt}\nRückfragen: ${p.telefon}, ${p.email}`),
    ),
    senden(
      [...new Set([...gastgeber, ...teamAdressen()])], intern.betreff, intern.text, lead.email, intern.html,
      ics(
        `Termin ${lead.name} · ${projekt.name}`,
        [`Interessent: ${lead.name}`, `Telefon: ${lead.telefon ?? "keine Angabe"}`, `E-Mail: ${lead.email}`, `Wohnung: ${bezug}`].join("\n"),
      ),
    ),
  ]);
}

/** Kurze Nachricht an Gastgeber und Team, wenn das Team einen Termin absagt. */
export async function sendeTerminAbsage(lead: Pick<Lead, "name" | "telefon" | "email">, beginn: string): Promise<boolean> {
  const gastgeber = (process.env.TERMIN_BENACHRICHTIGUNG_AN || GASTGEBER_STANDARD).split(",").map((s) => s.trim()).filter(Boolean);
  return senden(
    [...new Set([...gastgeber, ...teamAdressen()])],
    `Termin abgesagt: ${terminText(beginn)} · ${lead.name}`,
    [
      "Dieser Termin wurde im Vertriebsbereich abgesagt. Bitte aus dem Kalender entfernen.", "",
      `Wann: ${terminText(beginn)}`, `Interessent: ${lead.name}`, `Telefon: ${lead.telefon ?? "keine Angabe"}`, `E-Mail: ${lead.email}`,
    ].join("\n"),
  );
}
