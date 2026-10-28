import Link from "next/link";
import { formatFlaeche, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import type { Objekt } from "@/lib/objekte";
import { Plan } from "./Bild";

export function ObjektKarte({ objekt: o }: { objekt: Objekt }) {
  return (
    <Link href={`/objekte/${o.slug}`} className={`objekt-karte status-${o.status}`}>
      <Plan
        src={o.grundriss.src}
        alt={`Grundriss ${o.titel}`}
        breite={o.grundriss.breite}
        hoehe={o.grundriss.hoehe}
        sizes="(max-width: 700px) 100vw, 360px"
      />
      <div className="objekt-text">
        <span className={`marke ${o.status}`}>{objektStatusLabel[o.status]}</span>
        <h3>{o.titel}</h3>
        <p className="eckdaten">
          {o.zimmer} Zi. · {formatFlaeche(o.wohnflaeche)} · {o.freisitz.art} {o.freisitz.seite}
          {o.garten ? " · Garten" : ""}
        </p>
        <p className="preis">{preisText(o)}</p>
      </div>
    </Link>
  );
}
