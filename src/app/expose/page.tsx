import type { Metadata } from "next";
import Image from "next/image";
import { JudekLogo } from "@/components/JudekLogo";
import { Hauszeichen } from "@/components/Logo";
import { untertitel } from "@/components/ObjektKarte";
import { formatEuro, formatFlaeche, formatZahl, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { geschossName, geschosse, objekte, projekt } from "@/lib/objekte";
import { DruckKnopf } from "./DruckKnopf";
import { Blatt, HausBlatt, KontaktBlatt, LageBlatt, WohnungsBlatt } from "./teile";

/**
 * Das Exposé als druckfertige A4-Seiten, aus denselben Daten wie die Website.
 * Ändert sich etwas in `lib/objekte.ts`, ist das Exposé sofort aktuell.
 * PDF: im Browser „Als PDF speichern" oder `npm run expose` (scripts/expose-pdf.mjs).
 *
 * Bewusst nicht verlinkt und nicht in Suchmaschinen: Das Exposé geht an
 * Interessenten, die angefragt haben.
 */
export const metadata: Metadata = {
  title: "Exposé",
  robots: { index: false, follow: false },
};

export default function Expose() {
  const [eingang, luftbild] = projekt.bilder;
  const flaechen = objekte.map((o) => o.wohnflaeche);
  const sortiert = [...objekte].sort((a, b) => a.we - b.we);

  return (
    <div className="expose">
      <div className="expose-leiste">
        <p>Exposé · {sortiert.length + 6} Seiten im A4-Format</p>
        <DruckKnopf />
      </div>

      {/* ── 1 Titel ───────────────────────────────────────────── */}
      <section className="blatt titelblatt">
        <Image src={eingang.src} alt={eingang.alt} fill sizes="210mm" loading="eager" className="titel-bild" />
        <div className="titel-inhalt">
          <p className="titel-marke"><Hauszeichen size={40} /> Exposé</p>
          <div>
            <h1>{projekt.name}<br /><span>{projekt.ort}</span></h1>
            <p className="titel-zeile">
              {objekte.length} Eigentumswohnungen · Effizienzhaus QNG 40 · Fertigstellung {projekt.fertigstellung}
            </p>
            <ul className="titel-vorteile">{projekt.vorteile.map((v) => <li key={v}>{v}</li>)}</ul>
          </div>
          <div className="titel-fuss">
            <span>{projekt.adresse}</span>
            <span className="titel-judek"><JudekLogo /></span>
          </div>
        </div>
      </section>

      {/* ── 2 Auf einen Blick ─────────────────────────────────── */}
      <Blatt nr="01" titel="Auf einen Blick">
        <p className="ex-einleitung">{projekt.einleitung}</p>
        <dl className="ex-kennzahlen">
          <div><dt>Wohnungen</dt><dd>{objekte.length}</dd></div>
          <div><dt>Wohnfläche</dt><dd>{Math.floor(Math.min(...flaechen))} bis {Math.round(Math.max(...flaechen))} m²</dd></div>
          <div><dt>Kaufpreise ab</dt><dd>{formatEuro(projekt.abPreis)}</dd></div>
          <div><dt>Effizienzhaus</dt><dd>QNG 40</dd></div>
          <div><dt>Provision</dt><dd>Provisionsfrei</dd></div>
          <div><dt>Fertigstellung</dt><dd>{projekt.fertigstellung}</dd></div>
        </dl>
        <figure className="ex-bild ex-bild-gross">
          <Image src={luftbild.src} alt={luftbild.alt} fill sizes="182mm" loading="eager" />
        </figure>
        <dl className="ex-fakten">
          <div><dt>Adresse</dt><dd>{projekt.adresse}</dd></div>
          <div><dt>Bauherr</dt><dd>{projekt.bauherr}</dd></div>
          <div><dt>Architektur</dt><dd>{projekt.architekt}</dd></div>
          <div><dt>Zimmer</dt><dd>2 bis 4, 18 Stellplätze am Haus</dd></div>
          <div><dt>Geschosse</dt><dd>Gartengeschoss, Erdgeschoss, Obergeschoss, Staffelgeschoss mit Dachterrassen</dd></div>
        </dl>
      </Blatt>

      <HausBlatt nr="02" />
      <LageBlatt nr="03" />
      {/* ── 5 Übersicht ───────────────────────────────────────── */}
      <Blatt nr="04" titel="Alle Wohnungen im Überblick">
        <table className="ex-tabelle">
          <thead>
            <tr><th>WE</th><th>Lage</th><th>Zimmer</th><th>Wohnfläche</th><th>Freisitz</th><th>Garten</th><th>Status</th><th>Kaufpreis</th></tr>
          </thead>
          {geschosse.map((g) => (
            <tbody key={g}>
              <tr className="ex-geschoss"><td colSpan={8}>{geschossName[g]}</td></tr>
              {objekte.filter((o) => o.geschoss === g).map((o) => (
                <tr key={o.slug} className={o.status !== "verfuegbar" ? "ex-belegt" : ""}>
                  <td className="mono">{o.we}</td>
                  <td>{untertitel(o)}</td>
                  <td>{o.zimmer}</td>
                  <td className="mono">{formatFlaeche(o.wohnflaeche)}</td>
                  <td>{o.freisitz.art} {formatZahl(o.freisitz.flaeche)} m², {o.freisitz.seite}</td>
                  <td>{o.garten ? "Ja" : "Nein"}</td>
                  <td><span className={`status-punkt ${o.status}`}>{objektStatusLabel[o.status]}</span></td>
                  <td>{o.kaufpreis || o.status === "verkauft" ? preisText(o) : "auf Anfrage"}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
        <p className="ex-klein">
          Wohnflächen laut Exposé (Stand 04/2026), Terrasse, Balkon und Dachterrasse zur Hälfte angerechnet.
          Zu jeder Wohnung gehört ein privater Abstellraum im Untergeschoss.
        </p>
      </Blatt>

      {/* ── 6 Wohnungen ───────────────────────────────────────── */}
      {sortiert.map((o) => <WohnungsBlatt key={o.slug} o={o} />)}

      <KontaktBlatt nr="05" />
    </div>
  );
}
