import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDatum } from "@/lib/format";
import {
  AKTIVITAET, LEAD_STATUS, aktivitaetLabel, finanzierungLabel, leadStatusLabel, zweckLabel,
} from "@/lib/labels";
import type { Lead, LeadAktivitaet } from "@/lib/leads";
import { objektNach, projekt } from "@/lib/objekte";
import { teamMitglied } from "@/lib/supabase-server";
import { loesche, notiere, setzeStatus } from "../../aktionen";

type Props = { params: Promise<{ id: string }> };

export default async function LeadSeite({ params }: Props) {
  const { id } = await params;
  const mitglied = await teamMitglied();
  if (!mitglied) return null;
  const { supabase } = mitglied;

  const [{ data: lead }, { data: verlauf }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>(),
    supabase
      .from("lead_aktivitaeten")
      .select("id, lead_id, art, text, created_at, team(name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .returns<LeadAktivitaet[]>(),
  ]);
  if (!lead) notFound();

  const objekt = objektNach(lead.objekt_slug);
  const bezug = objekt?.titel ?? `${projekt.name}, ${projekt.ort}`;
  const mail = new URLSearchParams({
    subject: `Ihre Anfrage: ${bezug}`,
    body: `Guten Tag ${lead.name},\n\nvielen Dank für Ihr Interesse an ${bezug}.\n\n\n\nViele Grüße\n${projekt.ansprechpartner.name}\n${projekt.ansprechpartner.telefon}`,
  });
  // URLSearchParams kodiert Leerzeichen als „+" — Mailprogramme lesen in
  // mailto-Links nur %20.
  const mailto = `mailto:${lead.email}?${mail.toString().replace(/\+/g, "%20")}`;

  return (
    <main className="abschnitt">
      <div className="breite">
        <p><Link href="/admin">← Alle Leads</Link></p>
        <div className="zwei-spalten">
          <section>
            <span className={`marke lead-${lead.status}`}>{leadStatusLabel[lead.status]}</span>
            <h1>{lead.name}</h1>
            <p className="klein">Eingang {formatDatum(lead.created_at)} · {objekt?.titel ?? "Allgemeine Anfrage"}</p>

            <div className="aktionen">
              <a className="knopf" href={mailto}>E-Mail schreiben</a>
              {lead.telefon && (
                <a className="knopf zweit" href={`tel:${lead.telefon.replace(/[^+0-9]/g, "")}`}>Anrufen</a>
              )}
            </div>

            <dl className="eckdaten-tabelle">
              <div><dt>E-Mail</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
              <div><dt>Telefon</dt><dd>{lead.telefon ?? "—"}{lead.rueckruf ? " · Rückruf gewünscht" : ""}</dd></div>
              <div><dt>Zweck</dt><dd>{zweckLabel[lead.zweck]}</dd></div>
              <div><dt>Finanzierung</dt><dd>{finanzierungLabel[lead.finanzierung]}</dd></div>
              <div><dt>Einwilligung</dt><dd>{formatDatum(lead.einwilligung_at)}</dd></div>
              {Object.keys(lead.quelle).length > 0 && (
                <div><dt>Herkunft</dt><dd className="klein">{Object.entries(lead.quelle).map(([k, v]) => `${k}: ${v}`).join(" · ")}</dd></div>
              )}
            </dl>

            {lead.nachricht && (
              <>
                <h2>Nachricht</h2>
                <blockquote className="nachricht">{lead.nachricht}</blockquote>
              </>
            )}

            <h2>Status</h2>
            <form action={setzeStatus} className="filter">
              <input type="hidden" name="id" value={lead.id} />
              <select name="status" defaultValue={lead.status}>
                {LEAD_STATUS.map((s) => <option key={s} value={s}>{leadStatusLabel[s]}</option>)}
              </select>
              <button className="knopf klein">Speichern</button>
            </form>

            <details className="gefahr">
              <summary>Lead löschen</summary>
              <form action={loesche}>
                <input type="hidden" name="id" value={lead.id} />
                <label className="haken">
                  <input type="checkbox" name="bestaetigt" required /> Endgültig löschen, samt Verlauf (z. B. auf Löschbegehren)
                </label>
                <button className="knopf gefahr-knopf klein">Löschen</button>
              </form>
            </details>
          </section>

          <aside>
            <h2>Verlauf</h2>
            <form action={notiere} className="formular">
              <input type="hidden" name="id" value={lead.id} />
              <select name="art" defaultValue="anruf">
                {AKTIVITAET.filter((a) => a !== "status").map((a) => (
                  <option key={a} value={a}>{aktivitaetLabel[a]}</option>
                ))}
              </select>
              <textarea name="text" rows={3} placeholder="Was wurde besprochen? Nächster Schritt?" required />
              <button className="knopf klein">Eintragen</button>
            </form>

            <ol className="verlauf">
              {(verlauf ?? []).map((v) => (
                <li key={v.id} className={`art-${v.art}`}>
                  <p className="klein">
                    <strong>{aktivitaetLabel[v.art]}</strong> · {formatDatum(v.created_at)}
                    {v.team?.name ? ` · ${v.team.name}` : ""}
                  </p>
                  <p>{v.text}</p>
                </li>
              ))}
              {(!verlauf || verlauf.length === 0) && <li className="leer">Noch nichts eingetragen.</li>}
            </ol>
          </aside>
        </div>
      </div>
    </main>
  );
}
