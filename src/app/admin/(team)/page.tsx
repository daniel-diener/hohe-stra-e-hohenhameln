import Link from "next/link";
import { formatDatum } from "@/lib/format";
import { LEAD_STATUS, finanzierungLabel, istEines, leadStatusLabel, zweckLabel } from "@/lib/labels";
import { suchbegriff, type Lead } from "@/lib/leads";
import { objektNach, objekte } from "@/lib/objekte";
import { teamMitglied } from "@/lib/supabase-server";

type Props = { searchParams: Promise<{ status?: string; objekt?: string; q?: string }> };

export default async function Leads({ searchParams }: Props) {
  const filter = await searchParams;
  // Layout und Seite rendern parallel — das Layout zeigt „kein Zugang", die
  // Seite darf dann nur nichts tun.
  const mitglied = await teamMitglied();
  if (!mitglied) return null;
  const { supabase } = mitglied;

  let abfrage = supabase
    .from("leads")
    .select("id, created_at, name, email, telefon, objekt_slug, zweck, finanzierung, rueckruf, status")
    .order("created_at", { ascending: false })
    .limit(500);
  if (istEines(LEAD_STATUS, filter.status)) abfrage = abfrage.eq("status", filter.status);
  if (filter.objekt === "allgemein") abfrage = abfrage.is("objekt_slug", null);
  else if (objektNach(filter.objekt)) abfrage = abfrage.eq("objekt_slug", filter.objekt!);
  const q = suchbegriff(filter.q);
  if (q) abfrage = abfrage.or(`name.ilike.%${q}%,email.ilike.%${q}%,telefon.ilike.%${q}%`);

  const [{ data: leads, error }, { data: alle }] = await Promise.all([
    abfrage,
    supabase.from("leads").select("status"),
  ]);
  if (error) throw error;

  const anzahl = new Map<string, number>();
  for (const l of alle ?? []) anzahl.set(l.status, (anzahl.get(l.status) ?? 0) + 1);

  const link = (aenderung: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filter, ...aenderung })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <main className="abschnitt">
      <div className="breite">
        <h1>Leads</h1>

        <nav className="reiter">
          <Link href={link({ status: undefined })} className={!filter.status ? "aktiv" : ""}>
            Alle <span>{alle?.length ?? 0}</span>
          </Link>
          {LEAD_STATUS.map((s) => (
            <Link key={s} href={link({ status: s })} className={filter.status === s ? "aktiv" : ""}>
              {leadStatusLabel[s]} <span>{anzahl.get(s) ?? 0}</span>
            </Link>
          ))}
        </nav>

        <form className="filter" action="/admin">
          {filter.status && <input type="hidden" name="status" value={filter.status} />}
          <input name="q" defaultValue={filter.q} placeholder="Name, E-Mail oder Telefon" />
          <select name="objekt" defaultValue={filter.objekt ?? ""}>
            <option value="">Alle Objekte</option>
            <option value="allgemein">Allgemeine Anfragen</option>
            {objekte.map((o) => <option key={o.slug} value={o.slug}>{o.titel}</option>)}
          </select>
          <button className="knopf klein">Filtern</button>
        </form>

        {leads && leads.length > 0 ? (
          <div className="tabelle-rahmen">
            <table className="tabelle">
              <thead>
                <tr>
                  <th>Eingang</th><th>Name</th><th>Objekt</th><th>Kontakt</th>
                  <th>Zweck / Finanzierung</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(leads as Pick<Lead, "id" | "created_at" | "name" | "email" | "telefon" | "objekt_slug" | "zweck" | "finanzierung" | "rueckruf" | "status">[]).map((l) => (
                  <tr key={l.id}>
                    <td className="klein">{formatDatum(l.created_at)}</td>
                    <td><Link href={`/admin/leads/${l.id}`}><strong>{l.name}</strong></Link></td>
                    <td>{objektNach(l.objekt_slug)?.titel ?? "Allgemein"}</td>
                    <td className="klein">
                      <a href={`mailto:${l.email}`}>{l.email}</a>
                      {l.telefon && <><br /><a href={`tel:${l.telefon.replace(/[^+0-9]/g, "")}`}>{l.telefon}</a></>}
                      {l.rueckruf && <> <span className="marke reserviert">Rückruf</span></>}
                    </td>
                    <td className="klein">{zweckLabel[l.zweck]}<br />{finanzierungLabel[l.finanzierung]}</td>
                    <td><span className={`marke lead-${l.status}`}>{leadStatusLabel[l.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="leer">Keine Leads für diesen Filter.</p>
        )}
      </div>
    </main>
  );
}
