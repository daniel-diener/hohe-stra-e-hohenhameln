import Link from "next/link";
import { formatEuro, formatFlaeche } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import type { Objekt } from "@/lib/objekte";
import { Bild } from "./Bild";

export function ObjektKarte({ objekt }: { objekt: Objekt }) {
  return (
    <Link href={`/objekte/${objekt.slug}`} className={`objekt-karte status-${objekt.status}`}>
      <Bild bild={objekt.bilder[0]} titel={objekt.titel} />
      <div className="objekt-text">
        <span className={`marke ${objekt.status}`}>{objektStatusLabel[objekt.status]}</span>
        <h3>{objekt.titel}</h3>
        <p className="eckdaten">
          {objekt.zimmer} Zi. · {formatFlaeche(objekt.wohnflaeche)}
          {objekt.lage ? ` · ${objekt.lage}` : ""}
        </p>
        <p className="preis">{objekt.status === "verkauft" ? "Verkauft" : formatEuro(objekt.kaufpreis)}</p>
      </div>
    </Link>
  );
}
