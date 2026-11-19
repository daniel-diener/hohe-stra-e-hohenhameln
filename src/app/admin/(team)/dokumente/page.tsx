import Link from "next/link";
import { untertitel } from "@/components/ObjektKarte";
import { objekte } from "@/lib/objekte";

export const metadata = { title: "Dokumente" };

/**
 * Alle Unterlagen für den Vertrieb an einer Stelle. Die Seite selbst holt keine
 * Daten; den Zugang prüft das Layout von `(team)`.
 */
export default function Dokumente() {
  const wohnungen = [...objekte].sort((a, b) => a.we - b.we);
  return (
    <main className="abschnitt">
      <div className="breite">
        <h1>Dokumente</h1>
        <p className="klein leer">Unterlagen zum Weitergeben an Interessenten und für den internen Gebrauch.</p>

        <div className="tabelle-rahmen dokumente">
          <table className="tabelle">
            <thead>
              <tr><th>Dokument</th><th>Inhalt</th><th>Weitergabe</th><th /></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Materialien &amp; Ausstattung</strong><br /><span className="klein leer">PDF, 8 Seiten A4</span></td>
                <td>Böden, Fliesen, Bad, Türen, Schalter, Elektro, Haustechnik</td>
                <td>Von Hand per E-Mail, als PDF-Anhang</td>
                <td><div className="dokument-aktionen">
                  <a className="knopf klein" href="/admin/ausstattung/pdf" download>PDF herunterladen</a>
                  <Link className="knopf klein zweit" href="/admin/ausstattung">Ansehen</Link>
                </div></td>
              </tr>
              <tr>
                <td><strong>Exposé</strong><br /><span className="klein leer">Webseite, druckbar als A4-PDF</span></td>
                <td>Haus, Lage, alle {objekte.length} Wohnungen mit Grundriss</td>
                <td>Link steht in der Eingangsbestätigung an Interessenten</td>
                <td><div className="dokument-aktionen">
                  <a className="knopf klein zweit" href="/expose" target="_blank" rel="noopener">Öffnen</a>
                </div></td>
              </tr>
              <tr>
                <td><strong>Wohnungs-Exposés</strong><br /><span className="klein leer">Webseite, druckbar als A4-PDF</span></td>
                <td>Eine Wohnung mit Kaufnebenkosten, Zahlungsplan und Förderung</td>
                <td>Vorerst nur intern</td>
                <td><div className="dokument-aktionen dokument-wohnungen">
                  {wohnungen.map((o) => (
                    <Link key={o.slug} className="knopf klein zweit" href={`/admin/expose/${o.slug}`} title={untertitel(o)}>
                      WE {o.we}
                    </Link>
                  ))}
                </div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="klein leer">
          PDFs aus Webseiten: Seite öffnen und oben auf „Als PDF speichern“ klicken.
        </p>
      </div>
    </main>
  );
}
