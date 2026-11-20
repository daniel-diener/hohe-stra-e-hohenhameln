"use client";

import { useActionState, useState } from "react";
import { type FreigabeStand, erneuereCode, erstelleFreigabe } from "../../freigaben";

type Dok = { datei: string; titel: string; beschreibung: string; gruppe: string };

function Kopieren({ text }: { text: string }) {
  const [kopiert, setKopiert] = useState(false);
  return (
    <button
      type="button" className="knopf-link klein"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setKopiert(true); } catch {} }}
    >
      {kopiert ? "kopiert" : "kopieren"}
    </button>
  );
}

/** Link und Code einer Freigabe — stehen dauerhaft im Lead, solange die Freigabe gilt. */
export function LinkUndCode({ link, code }: { link: string; code: string }) {
  return (
    <dl className="freigabe-daten">
      <div><dt>Link</dt><dd><code>{link}</code> <Kopieren text={link} /></dd></div>
      <div><dt>Zugangscode</dt><dd><code className="freigabe-code">{code}</code> <Kopieren text={code} /></dd></div>
    </dl>
  );
}

/** Nur Fehler und Hinweise — Link und Code erscheinen danach in der Liste darüber. */
function Ergebnis({ stand }: { stand: FreigabeStand }) {
  if (stand.stand === "fehler") return <p className="fehler">{stand.meldung}</p>;
  if (stand.stand === "fertig" && stand.hinweis) return <p className="klein">{stand.hinweis}</p>;
  return null;
}

export function NeueFreigabe({ leadId, email, dokumente, vorausgewaehlt, laufzeiten }: {
  leadId: string;
  email: string;
  dokumente: Dok[];
  vorausgewaehlt: string[];
  laufzeiten: readonly number[];
}) {
  const [stand, aktion, laeuft] = useActionState(erstelleFreigabe, { stand: "offen" } as FreigabeStand);
  const gruppen = [...new Set(dokumente.map((d) => d.gruppe))];

  return (
    <>
      <form action={aktion} className="freigabe-formular">
        <input type="hidden" name="id" value={leadId} />
        {gruppen.map((g) => (
          <fieldset key={g}>
            <legend className="klein leise">{g}</legend>
            <div className="freigabe-auswahl">
              {dokumente.filter((d) => d.gruppe === g).map((d) => (
                <label key={d.datei} className="haken klein">
                  <input type="checkbox" name="datei" value={d.datei} defaultChecked={vorausgewaehlt.includes(d.datei)} />
                  <span><span className="vorn">{d.titel}</span><br />{d.beschreibung}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="filter">
          <select name="tage" defaultValue={String(laufzeiten.includes(30) ? 30 : laufzeiten[0])} aria-label="Gültigkeit">
            {laufzeiten.map((t) => <option key={t} value={t}>{t} Tage gültig</option>)}
          </select>
          <label className="haken klein">
            <input type="checkbox" name="mail" /> Link per E-Mail an {email} senden (ohne Code)
          </label>
        </div>
        <button className="knopf klein" disabled={laeuft}>{laeuft ? "PDFs werden erstellt …" : "Freigabe erstellen"}</button>
      </form>
      <Ergebnis stand={stand} />
    </>
  );
}

export function CodeErneuern({ freigabeId }: { freigabeId: string }) {
  const [stand, aktion, laeuft] = useActionState(erneuereCode, { stand: "offen" } as FreigabeStand);
  return (
    <>
      <form action={aktion}>
        <input type="hidden" name="freigabe" value={freigabeId} />
        <button className="knopf zweit klein" disabled={laeuft}>Neuer Code</button>
      </form>
      <Ergebnis stand={stand} />
    </>
  );
}
