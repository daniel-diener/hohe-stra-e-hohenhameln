"use client";

import { useActionState, useState } from "react";
import { type FreigabeStand, erneuereCode, erstelleFreigabe } from "../../freigaben";

type Dok = { datei: string; titel: string; beschreibung: string; gruppe: string };

/** Link und Code einmalig anzeigen — der Code steht danach nirgends mehr im Klartext. */
function Ergebnis({ stand }: { stand: FreigabeStand }) {
  const [kopiert, setKopiert] = useState<string | null>(null);
  if (stand.stand === "offen") return null;
  if (stand.stand === "fehler") return <p className="fehler">{stand.meldung}</p>;

  const kopieren = async (was: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(was);
    } catch {}
  };
  return (
    <div className="karte erfolg freigabe-ergebnis">
      <p className="klein"><strong>Jetzt notieren:</strong> Der Code wird nur dieses eine Mal angezeigt.</p>
      <dl>
        <div>
          <dt>Link</dt>
          <dd><code>{stand.link}</code> <button type="button" className="knopf-link klein" onClick={() => kopieren("link", stand.link)}>{kopiert === "link" ? "kopiert" : "kopieren"}</button></dd>
        </div>
        <div>
          <dt>Zugangscode</dt>
          <dd><code className="freigabe-code">{stand.code}</code> <button type="button" className="knopf-link klein" onClick={() => kopieren("code", stand.code)}>{kopiert === "code" ? "kopiert" : "kopieren"}</button></dd>
        </div>
      </dl>
      {stand.hinweis && <p className="klein">{stand.hinweis}</p>}
      <p className="klein leise">Link und Code am besten auf getrennten Wegen weitergeben, z. B. Link per E-Mail, Code am Telefon oder per SMS.</p>
    </div>
  );
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
