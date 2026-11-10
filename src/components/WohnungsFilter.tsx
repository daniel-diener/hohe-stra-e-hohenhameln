"use client";

import { useState } from "react";

export type Filter = { id: string; label: string; anzahl: number };

/**
 * Nur die Chips laufen im Browser. Die Karten rendert der Server (siehe
 * `Wohnungen.tsx`) und schreibt an jede, zu welchen Filtern sie passt
 * (`data-treffer`). Hier wird nur ausgeblendet, was nicht passt — so landen
 * die Wohnungsdaten nicht im JavaScript, und ohne JavaScript ist alles sichtbar.
 */
export function WohnungsFilter({ filter, children }: { filter: Filter[]; children: React.ReactNode }) {
  const [aktiv, setAktiv] = useState("alle");

  return (
    <>
      <div className="chips" role="group" aria-label="Wohnungen filtern">
        {filter.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip ${f.id === aktiv ? "aktiv" : ""}`}
            aria-pressed={f.id === aktiv}
            onClick={() => setAktiv(f.id)}
          >
            {f.label} <span>{f.anzahl}</span>
          </button>
        ))}
      </div>
      {aktiv !== "alle" && (
        <style>{`.wohnungen [data-treffer]:not([data-treffer~="${aktiv}"]) { display: none; }`}</style>
      )}
      <div className="wohnungen">{children}</div>
    </>
  );
}
