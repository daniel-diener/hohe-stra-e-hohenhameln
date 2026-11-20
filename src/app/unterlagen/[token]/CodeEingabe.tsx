"use client";

import { useActionState } from "react";
import { type CodeStand, entsperren } from "../aktionen";

export function CodeEingabe({ token }: { token: string }) {
  const [stand, aktion, laeuft] = useActionState(entsperren, { meldung: null } as CodeStand);
  return (
    <form action={aktion} className="formular unterlagen-code">
      <input type="hidden" name="token" value={token} />
      <label>
        Zugangscode
        <input
          name="code" required autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false}
          placeholder="XXXXX-XXXXX" aria-invalid={stand.meldung ? true : undefined}
        />
      </label>
      {stand.meldung && <p className="fehler" role="alert">{stand.meldung}</p>}
      <button className="knopf" disabled={laeuft}>{laeuft ? "Wird geprüft …" : "Unterlagen öffnen"}</button>
    </form>
  );
}
