"use client";

import { useActionState } from "react";
import { bucheOnline, type BuchungsStand } from "../aktionen";

type Tag = { tag: string; zeiten: { iso: string; uhr: string }[] };

/** Auswahl eines freien Zeitfensters. Die Tage kommen fertig beschriftet vom Server. */
export function TerminWahl({ token, tage, aktuell }: { token: string; tage: Tag[]; aktuell: string | null }) {
  const [stand, absenden, sendet] = useActionState<BuchungsStand, FormData>(bucheOnline, { stand: "offen" });

  // Nach dem Buchen lädt die Seite neu und zeigt den Termin selbst an — hier
  // nur die kurze Zwischenmeldung, bis das passiert ist.
  if (stand.stand === "gebucht") {
    return <p className="leise" role="status">Ihr Termin ist gebucht. Die Bestätigung ist unterwegs.</p>;
  }

  const auswahl = (
    <form action={absenden} className="termin-wahl">
      <input type="hidden" name="token" value={token} />
      {tage.length === 0 && <p>Im Moment sind alle Termine vergeben. Bitte rufen Sie uns an, wir finden einen passenden.</p>}
      {tage.map((t) => (
        <fieldset key={t.tag} className="termin-tag">
          <legend>{t.tag}</legend>
          <div className="termin-zeiten">
            {t.zeiten.map((z) => (
              <label key={z.iso} className="termin-zeit">
                <input type="radio" name="beginn" value={z.iso} required />
                <span>{z.uhr} Uhr</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {stand.stand === "fehler" && <p className="fehler" role="alert">{stand.meldung}</p>}
      {tage.length > 0 && (
        <div className="termin-absenden">
          <button type="submit" className="knopf" disabled={sendet}>
            {sendet ? "Wird gebucht …" : aktuell ? "Termin verschieben" : "Termin verbindlich buchen"}
          </button>
        </div>
      )}
    </form>
  );

  // Wer schon einen Termin hat, sieht die Auswahl erst auf Wunsch.
  if (!aktuell) return auswahl;
  return (
    <details className="termin-verschieben" open={stand.stand === "fehler"}>
      <summary>Termin verschieben</summary>
      <p className="leise klein">Wählen Sie einen neuen Tag und eine Uhrzeit. Ihr bisheriger Termin wird dann frei.</p>
      {auswahl}
    </details>
  );
}
