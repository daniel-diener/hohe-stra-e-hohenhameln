import { geschossName, geschosse, objekte, type Objekt } from "@/lib/objekte";
import { ObjektKarte } from "./ObjektKarte";
import { WohnungsFilter } from "./WohnungsFilter";

const FILTER: { id: string; label: string; passt: (o: Objekt) => boolean }[] = [
  { id: "alle", label: "Alle", passt: () => true },
  { id: "2", label: "2 Zimmer", passt: (o) => o.zimmer === 2 },
  { id: "3", label: "3 Zimmer", passt: (o) => o.zimmer === 3 },
  { id: "4", label: "4 Zimmer", passt: (o) => o.zimmer === 4 },
  { id: "garten", label: "Mit Garten", passt: (o) => o.garten },
  { id: "dach", label: "Dachterrasse", passt: (o) => o.freisitz.art === "Dachterrasse" },
];

/** Filter-IDs, zu denen alle übergebenen Wohnungen zusammen passen, als `data-treffer`. */
function treffer(liste: Objekt[]) {
  return FILTER.filter((f) => liste.some(f.passt)).map((f) => f.id).join(" ");
}

export function Wohnungen() {
  return (
    <WohnungsFilter filter={FILTER.map((f) => ({ id: f.id, label: f.label, anzahl: objekte.filter(f.passt).length }))}>
      {geschosse.map((g) => {
        const liste = objekte.filter((o) => o.geschoss === g);
        if (liste.length === 0) return null;
        return (
          <div key={g} className="geschoss" data-treffer={treffer(liste)}>
            <h3 className="geschoss-titel">
              <span className="mono">{g}</span> {geschossName[g]}
            </h3>
            <div className="raster">
              {liste.map((o) => (
                <div key={o.slug} className="raster-zelle" data-treffer={treffer([o])}>
                  <ObjektKarte objekt={o} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </WohnungsFilter>
  );
}
