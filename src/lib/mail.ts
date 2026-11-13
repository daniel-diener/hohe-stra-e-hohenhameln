import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Anfrage } from "./anfrage";
import { finanzierungLabel, zweckLabel } from "./labels";
import { objektNach, projekt } from "./objekte";

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
  const passwort = process.env.SMTP_PASSWORT;
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

async function senden(an: string | string[], betreff: string, text: string, antwortAn?: string) {
  const t = verbindung();
  if (!t) return;
  try {
    await t.sendMail({
      from: { name: `${projekt.name} ${projekt.ort}`, address: SMTP_BENUTZER },
      to: an,
      subject: betreff,
      text,
      replyTo: antwortAn,
    });
  } catch (e) {
    console.error("Mail an", an, "gescheitert:", e);
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
  const aufgaben: Promise<void>[] = [];

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
    const p = projekt.ansprechpartner;
    aufgaben.push(
      senden(
        a.email,
        `Ihre Anfrage: ${projekt.name}, ${projekt.ort}`,
        [
          `Guten Tag ${a.name},`,
          "",
          `vielen Dank für Ihr Interesse an ${objekt ? objekt.titel : `unserem Projekt ${projekt.name}`}.`,
          `${p.name} meldet sich in Kürze persönlich bei Ihnen.`,
          "",
          "Viele Grüße",
          p.name,
          p.telefon,
        ].join("\n"),
        p.email,
      ),
    );
  }

  await Promise.all(aufgaben);
}
