import Link from "next/link";
import { dokumente, gruppen } from "@/lib/dokumente";
import { Herunterladen } from "./Herunterladen";

export const metadata = { title: "Dokumente" };

/**
 * Vorlagen und Exposés zum Herunterladen. Die Exposé-PDFs werden bei jedem Klick
 * frisch aus den Exposé-Seiten gedruckt (`lib/pdf.ts`) — Preise und Verkaufsstand
 * sind also immer aktuell. Vorlagen liegen fest in `vorlagen/`, nur fürs Team.
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
          <Herunterladen href="/admin/dokumente/alle" datei={`dokumente-hohe-strasse-${datum}.zip`} className="knopf cta">
            Alle {liste.length} als ZIP herunterladen
          </Herunterladen>
        </div>

        <div className="tabelle-rahmen">
          <table className="tabelle">
            <thead>
              <tr><th>Dokument</th><th>Inhalt</th><th>Seiten</th><th></th></tr>
            </thead>
            {gruppen.map((g) => (
              <tbody key={g}>
                <tr className="tabelle-gruppe"><th colSpan={4}>{g}</th></tr>
                {liste.filter((d) => d.gruppe === g).map((d) => {
                  const pdf = `/admin/dokumente/pdf/${d.datei}`;
                  return (
                    <tr key={d.datei}>
                      <td><strong>{d.titel}</strong><br /><span className="klein leise">{d.datei}</span></td>
                      <td className="klein">{d.beschreibung}</td>
                      <td className="klein">{d.seiten}</td>
                      <td className="dokumente-aktionen">
                        <Link href={d.quelle.art === "seite" ? d.quelle.pfad : `${pdf}?ansehen`} target="_blank" className="klein">Ansehen</Link>
                        <Herunterladen href={pdf} datei={d.datei}>PDF</Herunterladen>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </main>
  );
}
