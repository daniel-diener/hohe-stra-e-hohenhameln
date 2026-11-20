import Link from "next/link";
import { dokumente } from "@/lib/dokumente";
import { Herunterladen } from "./Herunterladen";

export const metadata = { title: "Dokumente" };

/**
 * Alle Exposés zum Herunterladen. Die PDFs werden bei jedem Klick frisch aus den
 * Exposé-Seiten gedruckt (`lib/pdf.ts`) — Preise und Verkaufsstand sind also
 * immer aktuell, es gibt keine abgelegten Dateien, die veralten könnten.
 */
export default function Dokumente() {
  const liste = dokumente();
  const datum = new Date().toISOString().slice(0, 10);

  return (
    <main className="abschnitt">
      <div className="breite">
        <div className="dokumente-kopf">
          <div>
            <h1>Dokumente</h1>
            <p className="leise klein">
              Exposés als PDF, jedes Mal frisch mit den aktuellen Preisen erstellt. Einzeln dauert es ein paar
              Sekunden, alle zusammen bis zu einer Minute.
            </p>
          </div>
          <Herunterladen href="/admin/dokumente/alle" datei={`exposes-hohe-strasse-${datum}.zip`} className="knopf cta">
            Alle {liste.length} als ZIP herunterladen
          </Herunterladen>
        </div>

        <div className="tabelle-rahmen">
          <table className="tabelle">
            <thead>
              <tr><th>Dokument</th><th>Inhalt</th><th>Seiten</th><th></th></tr>
            </thead>
            <tbody>
              {liste.map((d) => (
                <tr key={d.datei}>
                  <td><strong>{d.titel}</strong><br /><span className="klein leise">{d.datei}</span></td>
                  <td className="klein">{d.beschreibung}</td>
                  <td className="klein">{d.seiten}</td>
                  <td className="dokumente-aktionen">
                    <Link href={d.pfad} target="_blank" className="klein">Ansehen</Link>
                    <Herunterladen href={`/admin/dokumente/pdf/${d.datei}`} datei={d.datei}>PDF</Herunterladen>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
