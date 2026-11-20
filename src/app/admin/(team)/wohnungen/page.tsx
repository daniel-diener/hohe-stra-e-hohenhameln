import Link from "next/link";
import { formatFlaeche } from "@/lib/format";
import { leadStatusLabel, objektStatusLabel } from "@/lib/labels";
import type { Lead } from "@/lib/leads";
import { geschosse, geschossName, objekte, type ObjektStatus } from "@/lib/objekte";
import { teamMitglied } from "@/lib/supabase-server";

type Anfrage = Pick<Lead, "id" | "name" | "objekt_slug" | "status">;

/**
 * Verkaufsstand je Wohnung. Der Status kommt aus src/lib/objekte.ts (wie auf
 * der Website), die Anfragen aus den Leads — abgesagte zählen nicht.
 */
export default async function Wohnungen() {
  const mitglied = await teamMitglied();
  if (!mitglied) return null;

  const { data, error } = await mitglied.supabase
    .from("leads")
    .select("id, name, objekt_slug, status")
    .neq("status", "abgesagt")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const anfragen = (data ?? []) as Anfrage[];

  const proWohnung = new Map<string, Anfrage[]>();
  for (const a of anfragen) {
    if (!a.objekt_slug) continue;
    proWohnung.set(a.objekt_slug, [...(proWohnung.get(a.objekt_slug) ?? []), a]);
  }
  const allgemein = anfragen.filter((a) => !objekte.some((o) => o.slug === a.objekt_slug));

  const anzahl = (s: ObjektStatus) => objekte.filter((o) => o.status === s).length;

  const personen = (liste: Anfrage[]) => (
    <ul className="wohnung-anfragen">
      {liste.map((a) => (
        <li key={a.id}>
          <Link href={`/admin/leads/${a.id}`}>{a.name}</Link>{" "}
          <span className={`marke lead-${a.status}`}>{leadStatusLabel[a.status]}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <main className="abschnitt">
      <div className="breite">
        <h1>Wohnungen</h1>
        <p className="leise klein">Verkaufsstand wie auf der Website, dazu die offenen Anfragen je Wohnung.</p>

        <dl className="eckdaten-tabelle statistik-zahlen">
          <div><dt>Frei</dt><dd>{anzahl("verfuegbar")}</dd></div>
          <div><dt>Reserviert</dt><dd>{anzahl("reserviert")}</dd></div>
          <div><dt>Verkauft</dt><dd>{anzahl("verkauft")}</dd></div>
          <div><dt>Gesamt</dt><dd>{objekte.length}</dd></div>
        </dl>

        <div className="tabelle-rahmen">
          <table className="tabelle">
            <thead>
              <tr><th>Wohnung</th><th>Zimmer</th><th>Fläche</th><th>Stand</th><th>Anfragen</th></tr>
            </thead>
            {geschosse.map((g) => (
              <tbody key={g}>
                <tr className="tabelle-gruppe"><th colSpan={5}>{geschossName[g]}</th></tr>
                {objekte.filter((o) => o.geschoss === g).sort((a, b) => a.we - b.we).map((o) => {
                  const liste = proWohnung.get(o.slug) ?? [];
                  return (
                    <tr key={o.slug}>
                      <td><Link href={`/admin?objekt=${o.slug}`}><strong>{o.titel}</strong></Link></td>
                      <td>{o.zimmer}</td>
                      <td className="klein">{formatFlaeche(o.wohnflaeche)}</td>
                      <td><span className={`marke ${o.status}`}>{o.status === "verfuegbar" ? "Frei" : objektStatusLabel[o.status]}</span></td>
                      <td>{liste.length > 0 ? personen(liste) : <span className="leer klein">–</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>

        <h2 className="wohnung-allgemein">Anfragen ohne bestimmte Wohnung</h2>
        {allgemein.length > 0 ? personen(allgemein) : <p className="leer">Keine.</p>}
      </div>
    </main>
  );
}
