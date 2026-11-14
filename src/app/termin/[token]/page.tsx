import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Lead } from "@/lib/leads";
import { objektNach, projekt } from "@/lib/objekte";
import { supabaseDienst } from "@/lib/supabase-server";
import { TERMIN, freieTermine, terminTag, terminText, terminUhr, terminZeiten } from "@/lib/termine";
import { TerminWahl } from "./TerminWahl";

/**
 * Buchungsseite für den Termin im Büro. Erreichbar nur über den persönlichen
 * Link aus der Einladung (`leads.termin_token`) — nicht verlinkt, nicht in Suchmaschinen.
 */
export const metadata: Metadata = { title: "Termin buchen", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function TerminSeite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID.test(token) || !process.env.SUPABASE_SECRET_KEY) notFound();

  const supabase = supabaseDienst();
  const { data: lead } = await supabase
    .from("leads").select("id, name, objekt_slug").eq("termin_token", token)
    .maybeSingle<Pick<Lead, "id" | "name" | "objekt_slug">>();
  if (!lead) notFound();

  const jetzt = new Date();
  const { data: gebucht } = await supabase
    .from("termine").select("lead_id, beginn").eq("status", "gebucht").gte("beginn", jetzt.toISOString())
    .returns<{ lead_id: string; beginn: string }[]>();
  const eigener = gebucht?.find((t) => t.lead_id === lead.id)?.beginn ?? null;

  const tage: { tag: string; zeiten: { iso: string; uhr: string }[] }[] = [];
  // Pro Tag nur ein Termin: Tage anderer Buchungen fallen ganz weg. Am eigenen
  // Tag bleiben die übrigen Startzeiten wählbar, damit sich die Uhrzeit ändern lässt.
  const fremde = (gebucht ?? []).filter((g) => g.lead_id !== lead.id).map((g) => g.beginn);
  for (const t of freieTermine(jetzt, fremde)) {
    if (eigener && new Date(eigener).getTime() === t.getTime()) continue;
    const tag = terminTag(t);
    const eintrag = tage.at(-1)?.tag === tag ? tage.at(-1)! : (tage.push({ tag, zeiten: [] }), tage.at(-1)!);
    eintrag.zeiten.push({ iso: t.toISOString(), uhr: terminUhr(t) });
  }

  const objekt = objektNach(lead.objekt_slug);
  const p = projekt.ansprechpartner;

  return (
    <main className="abschnitt">
      <div className="breite termin-seite">
        <p className="eyebrow">Persönlicher Termin</p>
        {eigener ? (
          <>
            <h1>Ihr Termin</h1>
            <div className="karte erfolg termin-gebucht">
              <p className="termin-gebucht-wann">{terminText(eigener)}</p>
              <p>{TERMIN.ort.name}, {TERMIN.ort.strasse}, {TERMIN.ort.plzOrt}</p>
              <p className="klein">
                Die Bestätigung mit Kalenderdatei haben Sie per E-Mail bekommen. Zum Absagen antworten Sie bitte
                auf diese E-Mail oder rufen uns an.
              </p>
            </div>
            {/* key: Nach dem Verschieben beginnt die Auswahl wieder eingeklappt und leer. */}
            <TerminWahl key={eigener} token={token} tage={tage} aktuell={eigener} />
          </>
        ) : (
          <>
            <h1>Termin buchen</h1>
            <p className="leise gross-text">
              Guten Tag {lead.name}, {TERMIN.gastgeber} stellt Ihnen {objekt ? `die Wohnung ${objekt.titel}` : "das Projekt"} gern
              persönlich vor und beantwortet Ihre Fragen zu Grundriss, Ausstattung, Kaufpreis und Finanzierung.
            </p>
            <dl className="termin-daten">
              <div><dt>Wo</dt><dd>{TERMIN.ort.name}<br />{TERMIN.ort.strasse}, {TERMIN.ort.plzOrt}</dd></div>
              <div><dt>Wann</dt><dd>{terminZeiten}</dd></div>
            </dl>
            <h2>Freie Tage</h2>
            <p className="leise klein">Wählen Sie einen Tag und die Uhrzeit, zu der Sie kommen möchten.</p>
            <TerminWahl token={token} tage={tage} aktuell={null} />
          </>
        )}

        <p className="leise klein termin-hinweis">
          {eigener ? "Fragen zum Termin?" : "Passt kein Termin? Wir finden einen anderen:"}{" "}
          <a href={`tel:${p.telefon.replace(/\s/g, "")}`} className="ohne-umbruch"><Icon name="telefon" size={14} /> {p.telefon}</a>{" "}
          oder <a href={`mailto:${p.email}`}>{p.email}</a>
        </p>
      </div>
    </main>
  );
}
