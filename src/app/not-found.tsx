import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { projekt } from "@/lib/objekte";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false } };

/** 404 auf Deutsch, mit den Wegen, die Besucher eigentlich suchen. */
export default function NichtGefunden() {
  const p = projekt.ansprechpartner;
  return (
    <main className="abschnitt">
      <div className="breite text">
        <p className="eyebrow">Fehler 404</p>
        <h1>Diese Seite gibt es nicht.</h1>
        <p className="leise gross-text">
          Vielleicht hat sich die Adresse geändert, oder sie wurde falsch eingegeben. Alle Wohnungen finden Sie
          auf der Startseite.
        </p>
        <div className="aktionen">
          <Link href="/#objekte" className="knopf cta">Zu den Wohnungen <Icon name="pfeil" size={18} /></Link>
          <Link href="/#kontakt" className="knopf zweit">Exposé anfragen</Link>
        </div>
        <p className="leise">
          Oder rufen Sie uns an: <a href={`tel:${p.telefon.replace(/\s/g, "")}`}>{p.telefon}</a>
        </p>
      </div>
    </main>
  );
}
