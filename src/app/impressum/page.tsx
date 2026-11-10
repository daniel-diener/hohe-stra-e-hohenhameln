import type { Metadata } from "next";
import Link from "next/link";
import { projekt } from "@/lib/objekte";
import { anbieter as a, vermarktung as m } from "@/lib/rechtliches";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

/** Fehlt eine Pflichtangabe, steht sie sichtbar als offen da, statt erfunden zu werden. */
function Wert({ wert }: { wert: string | null }) {
  return wert ? <>{wert}</> : <span className="hinweis-fehlt">wird ergänzt</span>;
}

export default function Impressum() {
  return (
    <main className="abschnitt">
      <div className="breite text">
        <h1>Impressum</h1>
        <p className="leise">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>

        <h2>Anbieter</h2>
        <p>
          <strong>{a.firma}</strong><br />
          {a.strasse}<br />
          {a.plzOrt}<br />
          Deutschland
        </p>
        <p>
          Vertreten durch die Geschäftsführung: <Wert wert={a.geschaeftsfuehrer} />
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href={`tel:${a.telefon.replace(/\s/g, "")}`}>{a.telefon}</a><br />
          E-Mail: <a href={`mailto:${a.email}`}>{a.email}</a>
        </p>

        <h2>Registereintrag</h2>
        <p><Wert wert={a.register} /></p>

        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>Gemäß § 27a Umsatzsteuergesetz: <Wert wert={a.ustId} /></p>

        <h2>Erlaubnis nach § 34c GewO</h2>
        <p>
          Tätigkeit als Bauträger. Erlaubnis und zuständige Aufsichtsbehörde: <Wert wert={a.erlaubnis34c} />
        </p>

        <h2>Vermarktung und Projektmanagement</h2>
        <p>
          {m.namen.join(" und ")}<br />
          Ansprechpartnerin: {m.kontakt.name}, {m.kontakt.telefon}, {m.kontakt.email}
        </p>

        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2>Haftung für Inhalte und Links</h2>
        <p>
          Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Angaben zu den Wohnungen, Visualisierungen
          und Grundrisse sind unverbindlich; maßgeblich sind allein der notarielle Kaufvertrag und die
          Baubeschreibung. Für Inhalte verlinkter Seiten Dritter sind ausschließlich deren Betreiber verantwortlich.
        </p>

        <h2>Bildnachweis</h2>
        <p>
          Visualisierungen und Grundrisse: {projekt.bauherr}, {projekt.architekt}.
        </p>

        <p className="leise klein">Siehe auch die <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
      </div>
    </main>
  );
}
