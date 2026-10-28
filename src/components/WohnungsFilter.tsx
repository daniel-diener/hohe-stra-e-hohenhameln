"use client";

import { useState } from "react";
import { geschossName, geschosse, objekte, type Objekt } from "@/lib/objekte";
import { ObjektKarte } from "./ObjektKarte";

const FILTER: { id: string; label: string; passt: (o: Objekt) => boolean }[] = [
  { id: "alle", label: "Alle", passt: () => true },
  { id: "2", label: "2 Zimmer", passt: (o) => o.zimmer === 2 },
  { id: "3", label: "3 Zimmer", passt: (o) => o.zimmer === 3 },
  { id: "4", label: "4 Zimmer", passt: (o) => o.zimmer === 4 },
  { id: "garten", label: "Mit Garten", passt: (o) => o.garten },
  { id: "dach", label: "Dachterrasse", passt: (o) => o.freisitz.art === "Dachterrasse" },
];

export function WohnungsFilter() {
  const [aktiv, setAktiv] = useState("alle");
  const filter = FILTER.find((f) => f.id === aktiv)!;
  const treffer = objekte.filter(filter.passt);

  return (
    <>
      <div className="chips" role="group" aria-label="Wohnungen filtern">
        {FILTER.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip ${f.id === aktiv ? "aktiv" : ""}`}
            aria-pressed={f.id === aktiv}
            onClick={() => setAktiv(f.id)}
          >
            {f.label} <span>{objekte.filter(f.passt).length}</span>
          </button>
        ))}
      </div>

      {geschosse.map((g) => {
        const liste = treffer.filter((o) => o.geschoss === g);
        if (liste.length === 0) return null;
        return (
          <div key={g} className="geschoss">
            <h3 className="geschoss-titel">
              <span className="mono">{g}</span> {geschossName[g]}
            </h3>
            <div className="raster">
              {liste.map((o) => <ObjektKarte key={o.slug} objekt={o} />)}
            </div>
          </div>
        );
      })}
    </>
  );
}
