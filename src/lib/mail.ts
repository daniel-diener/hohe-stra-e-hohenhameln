import "server-only";
import type { Anfrage } from "./anfrage";
import { finanzierungLabel, zweckLabel } from "./labels";
import { objektNach, projekt } from "./objekte";

/**
 * E-Mails über die REST-Schnittstelle von Resend — ohne SDK, ein fetch genügt.
 *
 * Ein Fehler hier darf keine Anfrage kosten: Der Lead steht zu diesem
 * Zeitpunkt schon in der Datenbank. Darum wird protokolliert, nicht geworfen.
 */
async function senden(an: string, betreff: string, text: string, antwortAn?: string) {
  const schluessel = process.env.RESEND_API_KEY;
  const absender = process.env.MAIL_ABSENDER;
  if (!schluessel || !absender) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${schluessel}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: absender, to: [an], subject: betreff, text, reply_to: antwortAn }),
    });
    if (!res.ok) console.error("Mail an", an, "abgelehnt:", res.status, await res.text());
  } catch (e) {
    console.error("Mail an", an, "gescheitert:", e);
  }
}

export async function meldeNeueAnfrage(id: string, a: Anfrage) {
  const objekt = objektNach(a.objekt_slug);
  const bezug = objekt?.titel ?? "Allgemeine Anfrage";
  const aufgaben: Promise<void>[] = [];

  const team = process.env.LEAD_BENACHRICHTIGUNG_AN;
  if (team) {
    const link = process.env.SITE_URL ? `${process.env.SITE_URL}/admin/leads/${id}` : "";
    aufgaben.push(
      senden(
        team,
        `Neue Anfrage: ${bezug} — ${a.name}`,
        [
          `Objekt: ${bezug}`,
          `Name: ${a.name}`,
          `E-Mail: ${a.email}`,
          `Telefon: ${a.telefon ?? "—"}${a.rueckruf ? " (Rückruf gewünscht)" : ""}`,
          `Zweck: ${zweckLabel[a.zweck]}`,
          `Finanzierung: ${finanzierungLabel[a.finanzierung]}`,
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
          "Wir melden uns in Kürze bei Ihnen.",
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
