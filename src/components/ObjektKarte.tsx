import Link from "next/link";
import { formatFlaeche, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { bilderVon, type Objekt } from "@/lib/objekte";
import { Bild } from "./Bild";

export function ObjektKarte({ objekt }: { objekt: Objekt }) {
  return (
    <Link href={`/objekte/${objekt.slug}`} className={`objekt-karte status-${objekt.status}`}>
      <Bild bild={bilderVon(objekt)[0]} titel={objekt.titel} />
      <div className="objekt-text">
        <span className={`marke ${objekt.status}`}>{objektStatusLabel[objekt.status]}</span>
        <h3>{objekt.titel}</h3>
        <p className="eckdaten">
          {objekt.zimmer} Zi. · {formatFlaeche(objekt.wohnflaeche)} · {objekt.lage}
          {objekt.freisitz ? ` · ${objekt.freisitz.art}` : ""}
        </p>
        <p className="preis">{preisText(objekt)}</p>
      </div>
    </Link>
  );
}
