import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDatum } from "@/lib/format";
import {
  AKTIVITAET, LEAD_STATUS, aktivitaetLabel, finanzierungLabel, leadStatusLabel, objektStatusLabel, zweckLabel,
} from "@/lib/labels";
import type { Lead, LeadAktivitaet } from "@/lib/leads";
import { projekt } from "@/lib/objekte";
import { objekteMitStand } from "@/lib/verkaufsstand";
import { teamMitglied } from "@/lib/supabase-server";
import { freieTermine, terminTag, terminText, terminUhr } from "@/lib/termine";
import { dokumente } from "@/lib/dokumente";
import { type Freigabe, GUELTIGKEIT_TAGE, sperrgrund } from "@/lib/freigabe";
import { ladeEin, loesche, notiere, sageTerminAb, setzeStatus, setzeWohnung, trageTerminEin } from "../../aktionen";
import { widerrufeFreigabe } from "../../freigaben";
import { seitenUrl } from "@/lib/seite";
import { CodeErneuern, LinkUndCode, NeueFreigabe } from "./Freigaben";

/** Eine Freigabe druckt die gewählten Exposés — das kann bei vielen bis zu einer Minute dauern. */
export const maxDuration = 300;

const sperrText = { widerrufen: "Widerrufen", abgelaufen: "Abgelaufen", gesperrt: "Gesperrt (zu viele falsche Codes)" } as const;

type Props = { params: Promise<{ id: string }> };

export default async function LeadSeite({ params }: Props) {
  const { id } = await params;
  const mitglied = await teamMitglied();
  if (!mitglied) return null;
  const { supabase } = mitglied;

  const [{ data: lead }, { data: verlauf }, { data: freigaben }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>(),
    supabase
      .from("lead_aktivitaeten")
      .select("id, lead_id, art, text, created_at, team(name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .returns<LeadAktivitaet[]>(),
    supabase
      .from("freigaben")
      .select("id, token, code, dateien, gueltig_bis, widerrufen_at, fehlversuche, abrufe, zuletzt_abgerufen_at, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .returns<Omit<Freigabe, "lead_id">[]>(),
  ]);
  if (!lead) notFound();

  const jetzt = new Date();
  const { data: gebucht } = await supabase
    .from("termine").select("id, lead_id, beginn").eq("status", "gebucht").gte("beginn", jetzt.toISOString()).order("beginn")
    .returns<{ id: string; lead_id: string; beginn: string }[]>();
  const termin = gebucht?.find((t) => t.lead_id === lead.id) ?? null;
  // Pro Tag nur ein Termin; am Tag des eigenen Termins bleibt die Uhrzeit änderbar.
  const frei = freieTermine(jetzt, (gebucht ?? []).filter((t) => t.lead_id !== lead.id).map((t) => t.beginn))
    .filter((t) => !termin || new Date(termin.beginn).getTime() !== t.getTime());

  const objekte = await objekteMitStand();
  const objekt = objekte.find((o) => o.slug === lead.objekt_slug);
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
            <h1>{lead.name}</h1>
            <p className="klein">Eingang {formatDatum(lead.created_at)}</p>

            <div className="lead-stand">
              <div>
                <p className="lead-stand-titel">Status</p>
                <p className="lead-stand-wert"><span className={`marke lead-${lead.status}`}>{leadStatusLabel[lead.status]}</span></p>
                <form action={setzeStatus} className="filter">
                  <input type="hidden" name="id" value={lead.id} />
                  <select name="status" defaultValue={lead.status} aria-label="Status ändern">
                    {LEAD_STATUS.map((s) => <option key={s} value={s}>{leadStatusLabel[s]}</option>)}
                  </select>
                  <button className="knopf klein">Speichern</button>
                </form>
              </div>
              <div>
                <p className="lead-stand-titel">Wohnung</p>
                <p className="lead-stand-wert">
                  {objekt ? (
                    <>
                      <strong>{objekt.titel}</strong>{" "}
                      <span className={`marke ${objekt.status}`}>
                        {objekt.status === "verfuegbar" ? "Frei" : objektStatusLabel[objekt.status]} auf der Website
                      </span>
                    </>
                  ) : (
                    <span className="leise">Keine bestimmte Wohnung</span>
                  )}
                </p>
                <form action={setzeWohnung} className="filter">
                  <input type="hidden" name="id" value={lead.id} />
                  <select name="objekt" defaultValue={objekt?.slug ?? ""} aria-label="Wohnung zuordnen">
                    <option value="">Keine bestimmte Wohnung</option>
                    {[...objekte].sort((a, b) => a.we - b.we).map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.titel}{o.status === "verfuegbar" ? "" : ` (${objektStatusLabel[o.status]})`}
                      </option>
                    ))}
                  </select>
                  <button className="knopf klein">Zuordnen</button>
                </form>
              </div>
            </div>

            <div className="aktionen">
              <a className="knopf" href={mailto}>E-Mail schreiben</a>
              {lead.telefon && (
                <a className="knopf zweit" href={`tel:${lead.telefon.replace(/[^+0-9]/g, "")}`}>Anrufen</a>
              )}
              {objekt && <Link className="knopf zweit" href={`/admin/expose/${objekt.slug}`}>Exposé (intern)</Link>}
            </div>

            <dl className="eckdaten-tabelle">
              <div><dt>E-Mail</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
              <div><dt>Telefon</dt><dd>{lead.telefon ?? "keine Angabe"}{lead.rueckruf ? " · Rückruf gewünscht" : ""}</dd></div>
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

            <h2>Termin im Büro</h2>
            {termin ? (
              <div className="karte erfolg termin-admin">
                <p><strong>{terminText(termin.beginn)}</strong></p>
                <p className="klein">Bestätigung mit Kalenderdatei ging an den Interessenten, René Judek und das Team.</p>
                <form action={sageTerminAb}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="termin" value={termin.id} />
                  <button className="knopf zweit klein">Termin absagen</button>
                </form>
              </div>
            ) : (
              <p className="klein leise">
                Noch kein Termin.
                {lead.einladung_at ? ` Einladung mit Buchungslink versendet am ${formatDatum(lead.einladung_at)}.` : ""}
              </p>
            )}
            <form action={trageTerminEin} className="filter">
              <input type="hidden" name="id" value={lead.id} />
              <select name="beginn" defaultValue="" required>
                <option value="" disabled>{termin ? "Auf anderen Termin verschieben …" : "Am Telefon vereinbarten Termin wählen …"}</option>
                {frei.map((t) => (
                  <option key={t.toISOString()} value={t.toISOString()}>{terminTag(t)}, {terminUhr(t)} Uhr</option>
                ))}
              </select>
              <button className="knopf klein">{termin ? "Verschieben" : "Termin eintragen"}</button>
            </form>
            {!termin && (
              <form action={ladeEin} className="termin-einladen">
                <input type="hidden" name="id" value={lead.id} />
                <button className="knopf zweit klein">
                  {lead.einladung_at ? "Einladung erneut senden" : "Einladung mit Buchungslink senden"}
                </button>
                <span className="klein leise">Der Interessent wählt den Termin dann selbst online.</span>
              </form>
            )}

            <h2>Unterlagen online bereitstellen</h2>
            <p className="klein leise">
              Die gewählten Dokumente werden einmal als PDF erstellt und unter einem persönlichen Link abgelegt.
              Zum Öffnen braucht der Kunde zusätzlich den Zugangscode. Link und Code stehen hier, solange die
              Freigabe gilt. Die Seite ist nicht in Suchmaschinen.
            </p>
            {(freigaben ?? []).length > 0 && (
              <ul className="freigaben">
                {(freigaben ?? []).map((f) => {
                  const grund = sperrgrund(f);
                  return (
                    <li key={f.id} className={grund ? "freigabe-aus" : undefined}>
                      <p className="klein">
                        <strong>{grund ? sperrText[grund] : `Gültig bis ${formatDatum(f.gueltig_bis)}`}</strong>
                        {" · "}angelegt {formatDatum(f.created_at)}
                        {" · "}{f.abrufe === 0 ? "noch nicht abgerufen" : `${f.abrufe}× abgerufen, zuletzt ${formatDatum(f.zuletzt_abgerufen_at!)}`}
                      </p>
                      <p className="klein leise">{f.dateien.map((d) => d.titel).join(" · ")}</p>
                      {(!grund || grund === "gesperrt") && (
                        <LinkUndCode link={new URL(`/unterlagen/${f.token}`, seitenUrl).href} code={f.code} />
                      )}
                      {!f.widerrufen_at && (
                        <div className="freigabe-knoepfe">
                          <CodeErneuern freigabeId={f.id} />
                          <form action={widerrufeFreigabe}>
                            <input type="hidden" name="freigabe" value={f.id} />
                            <button className="knopf zweit klein">Widerrufen</button>
                          </form>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <NeueFreigabe
              leadId={lead.id}
              email={lead.email}
              dokumente={dokumente().map(({ datei, titel, beschreibung, gruppe }) => ({ datei, titel, beschreibung, gruppe }))}
              vorausgewaehlt={objekt ? [`expose-wohnung-${objekt.we}.pdf`] : []}
              laufzeiten={GUELTIGKEIT_TAGE}
            />

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
