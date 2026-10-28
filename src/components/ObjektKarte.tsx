import Link from "next/link";
import { formatFlaeche, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import type { Objekt } from "@/lib/objekte";
import { Plan } from "./Plan";
import { Icon } from "./Icon";

/** „WE 14 — Dachterrasse über Eck" → „Dachterrasse über Eck"; die Nummer steht darüber. */
export function untertitel(o: Objekt) {
  return o.titel.split(" — ")[1] ?? o.titel;
}

export function ObjektKarte({ objekt: o }: { objekt: Objekt }) {
  return (
    <Link href={`/objekte/${o.slug}`} className={`objekt-karte status-${o.status}`}>
      <div className="karte-kopf">
        <span className="mono">WE {o.we} · {o.geschoss}</span>
        <span className={`status-punkt ${o.status}`}>{objektStatusLabel[o.status]}</span>
      </div>
      <Plan
        src={o.grundriss.src}
        alt={`Grundriss ${o.titel}`}
        breite={o.grundriss.breite}
        hoehe={o.grundriss.hoehe}
        sizes="(max-width: 700px) 100vw, 360px"
      />
      <div className="objekt-text">
        <h3>{untertitel(o)}</h3>
        <dl className="kennwerte">
          <div><dt>Zimmer</dt><dd>{o.zimmer}</dd></div>
          <div><dt>Fläche</dt><dd>{formatFlaeche(o.wohnflaeche)}</dd></div>
          <div><dt>{o.freisitz.art}</dt><dd>{o.freisitz.seite}</dd></div>
        </dl>
        <p className="preis">
          <span>{preisText(o)}</span>
          <Icon name="pfeil" size={18} />
        </p>
      </div>
    </Link>
  );
}
