"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { sendeAnfrage, type AnfrageStand } from "@/app/aktionen";
import { FINANZIERUNG, ZWECK, finanzierungLabel, zweckLabel } from "@/lib/labels";
import { objekte } from "@/lib/objekte";

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function AnfrageFormular({ objektSlug }: { objektSlug?: string }) {
  const [stand, absenden, sendet] = useActionState<AnfrageStand, FormData>(sendeAnfrage, { stand: "offen" });
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Ladezeit, Herkunft und Kampagne werden erst im Browser gesetzt. Die Seite
   * ist statisch gebaut — ein Zeitstempel aus dem Server wäre der Zeitpunkt
   * des Builds, und die Mindest-Ausfüllzeit würde nie greifen.
   */
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const setze = (name: string, wert: string) => {
      const feld = form.elements.namedItem(name);
      if (feld instanceof HTMLInputElement) feld.value = wert;
    };
    setze("geladen", String(Date.now()));
    setze("referrer", document.referrer);
    const params = new URLSearchParams(window.location.search);
    for (const k of UTM) setze(k, params.get(k) ?? "");
  }, []);

  if (stand.stand === "gesendet") {
    return (
      <div className="karte erfolg" role="status">
        <h3>Vielen Dank!</h3>
        <p>Ihre Anfrage ist bei uns angekommen. Wir melden uns in Kürze bei Ihnen.</p>
      </div>
    );
  }

  const fehler = stand.stand === "fehler" ? stand.fehler : {};

  return (
    <form
      ref={formRef}
      className="formular"
      noValidate
      // Bewusst kein `action={absenden}`: React leert ein Formular nach einer
      // Action — bei einem Prüffehler wären alle Eingaben weg, und mit ihnen
      // der Ladezeitstempel, ohne den die Anfrage als Bot gälte.
      onSubmit={(e) => {
        e.preventDefault();
        const daten = new FormData(e.currentTarget);
        startTransition(() => absenden(daten));
      }}
    >
      <input type="hidden" name="geladen" />
      <input type="hidden" name="referrer" />
      {UTM.map((k) => <input key={k} type="hidden" name={k} />)}
      {/* Honigtopf — für Menschen unsichtbar, siehe lib/anfrage.ts */}
      <div className="honig" aria-hidden="true">
        <label>Firma <input name="firma" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {objektSlug ? (
        <input type="hidden" name="objekt" value={objektSlug} />
      ) : (
        <label>
          Interesse an
          <select name="objekt" defaultValue="">
            <option value="">Allgemein / noch offen</option>
            {objekte.filter((o) => o.status !== "verkauft").map((o) => (
              <option key={o.slug} value={o.slug}>{o.titel}</option>
            ))}
          </select>
        </label>
      )}

      <Feld name="name" label="Name *" fehler={fehler.name} autoComplete="name" />
      <div className="zwei">
        <Feld name="email" label="E-Mail *" type="email" fehler={fehler.email} autoComplete="email" />
        <Feld name="telefon" label="Telefon" type="tel" fehler={fehler.telefon} autoComplete="tel" />
      </div>

      <div className="zwei">
        <label>
          Kaufen als
          <select name="zweck" defaultValue="offen">
            {ZWECK.map((z) => <option key={z} value={z}>{zweckLabel[z]}</option>)}
          </select>
        </label>
        <label>
          Finanzierung
          <select name="finanzierung" defaultValue="in_klaerung">
            {FINANZIERUNG.map((f) => <option key={f} value={f}>{finanzierungLabel[f]}</option>)}
          </select>
        </label>
      </div>

      <label>
        Nachricht
        <textarea name="nachricht" rows={4} placeholder="Fragen, Besichtigungswunsch, Wunschtermin …" />
      </label>

      <label className="haken">
        <input type="checkbox" name="rueckruf" /> Bitte rufen Sie mich zurück
      </label>

      <label className="haken">
        <input type="checkbox" name="einwilligung" aria-invalid={!!fehler.einwilligung} />
        <span>
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert werden.
          Details in der <Link href="/datenschutz">Datenschutzerklärung</Link>. *
        </span>
      </label>
      {fehler.einwilligung && <p className="fehler">{fehler.einwilligung}</p>}

      {stand.stand === "fehler" && stand.meldung && <p className="fehler" role="alert">{stand.meldung}</p>}

      <button type="submit" className="knopf" disabled={sendet}>
        {sendet ? "Wird gesendet …" : "Anfrage senden"}
      </button>
    </form>
  );
}

function Feld({
  name, label, fehler, type = "text", autoComplete,
}: { name: string; label: string; fehler?: string; type?: string; autoComplete?: string }) {
  return (
    <label>
      {label}
      <input name={name} type={type} autoComplete={autoComplete} aria-invalid={!!fehler} />
      {fehler && <span className="fehler">{fehler}</span>}
    </label>
  );
}
