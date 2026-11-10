import type { Metadata } from "next";
import Image from "next/image";
import { Icon, type IconName } from "@/components/Icon";
import { JudekLogo } from "@/components/JudekLogo";
import { Hauszeichen } from "@/components/Logo";
import { Plan } from "@/components/Plan";
import { untertitel } from "@/components/ObjektKarte";
import { formatFlaeche, formatZahl, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { geschossName, geschosse, objekte, projekt, type Objekt } from "@/lib/objekte";
import { DruckKnopf } from "./DruckKnopf";

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

const STAND = "November 2026";

export default function Expose() {
  const [eingang, luftbild, garten, zufahrt] = projekt.bilder;
  const flaechen = objekte.map((o) => o.wohnflaeche);
  const p = projekt.ansprechpartner;
  const t = projekt.team;
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
            <p className="titel-beiname">{projekt.beiname}</p>
            <h1>{projekt.name}<br /><span>{projekt.ort}</span></h1>
            <p className="titel-zeile">
              {objekte.length} Eigentumswohnungen · KfW-40-Effizienzhaus · Fertigstellung {projekt.fertigstellung}
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
          <div><dt>Zimmer</dt><dd>2 bis 4</dd></div>
          <div><dt>Effizienzhaus</dt><dd>KfW 40</dd></div>
          <div><dt>Stellplätze</dt><dd>18</dd></div>
          <div><dt>Fertigstellung</dt><dd>{projekt.fertigstellung}</dd></div>
        </dl>
        <figure className="ex-bild ex-bild-gross">
          <Image src={luftbild.src} alt={luftbild.alt} fill sizes="182mm" loading="eager" />
        </figure>
        <dl className="ex-fakten">
          <div><dt>Adresse</dt><dd>{projekt.adresse}</dd></div>
          <div><dt>Bauherr</dt><dd>{projekt.bauherr}</dd></div>
          <div><dt>Architektur</dt><dd>{projekt.architekt}</dd></div>
          <div><dt>Geschosse</dt><dd>Gartengeschoss, Erdgeschoss, Obergeschoss, Staffelgeschoss mit Dachterrassen</dd></div>
        </dl>
      </Blatt>

      {/* ── 3 Das Haus ────────────────────────────────────────── */}
      <Blatt nr="02" titel="Das Haus">
        <p className="ex-einleitung">Effizient, barrierefrei, durchdacht. Ein Haus, das heute schon die Standards von morgen erfüllt.</p>
        <div className="ex-merkmale">
          {projekt.haus.map((m) => (
            <div key={m.titel}>
              <span className="merkmal-icon"><Icon name={m.icon as IconName} size={18} /></span>
              <h3>{m.titel}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
        <div className="ex-bildpaar">
          <figure className="ex-bild"><Image src={garten.src} alt={garten.alt} fill sizes="90mm" loading="eager" /></figure>
          <figure className="ex-bild"><Image src={zufahrt.src} alt={zufahrt.alt} fill sizes="90mm" loading="eager" /></figure>
        </div>
        <div className="ex-kasten">
          <span className="merkmal-icon"><Icon name="auto" size={18} /></span>
          <p><strong>Stellplätze.</strong> {projekt.stellplaetze}</p>
        </div>
      </Blatt>

      {/* ── 4 Lage ────────────────────────────────────────────── */}
      <Blatt nr="03" titel="Die Lage">
        <p className="ex-einleitung">
          Ruhig im Ort, schnell überall. Hohenhameln, rund 3.400 Einwohner, liegt im Landkreis Peine,
          zwischen Hannover, Hildesheim und Braunschweig. Einkauf, Ärzte und Cafés sind zu Fuß erreichbar,
          die A2 in einer Viertelstunde.
        </p>
        <figure className="ex-bild ex-bild-lage">
          <Image src={projekt.lageBild.src} alt={projekt.lageBild.alt} fill sizes="182mm" loading="eager" />
        </figure>
        <ul className="ex-lage">
          {projekt.lage.map((l) => <li key={l.ziel}><span>{l.wert}</span>{l.ziel}</li>)}
        </ul>
      </Blatt>

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

      {/* ── Kontakt und Hinweise ──────────────────────────────── */}
      <Blatt nr="05" titel="Ihr Kontakt">
        <div className="ex-kontakt">
          <figure className="ex-team">
            <Image src={t.bild.src} alt={t.bild.alt} width={t.bild.breite} height={t.bild.hoehe} sizes="80mm" loading="eager" />
          </figure>
          <div>
            <p className="eyebrow">{t.titel}</p>
            <p className="ex-namen">{t.namen.join(" & ")}</p>
            <p>{t.text} Sprechen Sie uns an, wir vereinbaren gern einen persönlichen Termin.</p>
            <p className="ex-ansprechpartnerin">{p.rolle}</p>
            <p className="ex-namen klein-namen">{p.name}</p>
            <p className="ex-kontaktzeile"><Icon name="telefon" size={16} /> {p.telefon}</p>
            <p className="ex-kontaktzeile"><Icon name="mail" size={16} /> {p.email}</p>
          </div>
        </div>

        <div className="ex-bauherr">
          <div>
            <p className="eyebrow">Bauherr</p>
            <JudekLogo className="ex-judek" />
          </div>
          <div>
            <p className="eyebrow">Architektur</p>
            <p>{projekt.architekt}</p>
          </div>
        </div>

        <div className="ex-hinweise">
          <h3>Wichtige Hinweise</h3>
          <p>
            Dieses Exposé dient der Information und ist kein Angebot im Rechtssinne. Alle Angaben beruhen auf
            der Genehmigungsplanung und den Unterlagen des Bauherrn (Stand 04/2026) und wurden sorgfältig
            zusammengestellt; eine Gewähr für Vollständigkeit und Richtigkeit wird nicht übernommen.
            Maßgeblich sind allein der notarielle Kaufvertrag, die Baubeschreibung und die
            Wohnflächenberechnung zum Kaufvertrag.
          </p>
          <p>
            Visualisierungen und Grundrisse sind unverbindlich; Möblierung und Bepflanzung sind beispielhaft
            und nicht Bestandteil des Kaufgegenstands. Änderungen in Planung und Ausführung bleiben vorbehalten,
            soweit sie technisch oder behördlich bedingt sind und den Wert nicht mindern.
          </p>
          <p>
            Kaufpreise auf Anfrage. Der Energieausweis (Bedarfsausweis nach GEG) wird mit Fertigstellung der
            Planung nachgereicht. Angaben zu einer Käuferprovision erhalten Sie mit dem Angebot.
          </p>
          <p className="ex-klein">Stand: {STAND}</p>
        </div>
      </Blatt>
    </div>
  );
}

function Blatt({ nr, titel, children }: { nr: string; titel: string; children: React.ReactNode }) {
  return (
    <section className="blatt">
      <header className="blatt-kopf">
        <span className="blatt-marke"><Hauszeichen size={22} /> {projekt.name} {projekt.ort}</span>
        <span className="mono">{nr}</span>
      </header>
      <h2 className="blatt-titel">{titel}</h2>
      <div className="blatt-inhalt">{children}</div>
      <BlattFuss />
    </section>
  );
}

function BlattFuss() {
  return (
    <footer className="blatt-fuss">
      <span>{projekt.name} {projekt.ort} · {projekt.beiname}</span>
      <span>{projekt.ansprechpartner.name} · {projekt.ansprechpartner.telefon} · {projekt.ansprechpartner.email}</span>
    </footer>
  );
}

function WohnungsBlatt({ o }: { o: Objekt }) {
  const details: [string, string][] = [
    ["Geschoss", geschossName[o.geschoss]],
    ["Zimmer", formatZahl(o.zimmer)],
    ["Bäder", formatZahl(o.baeder)],
    [o.freisitz.art, `${formatFlaeche(o.freisitz.flaeche)}, ${o.freisitz.seite}`],
    ["Garten", o.garten ? "Ja, Sondernutzung" : "Nein"],
    ["Abstellraum UG", formatFlaeche(o.keller)],
    ["Aufzug", "Ja, barrierefrei"],
    ["Kaufpreis", preisText(o)],
  ];
  return (
    <section className="blatt">
      <header className="blatt-kopf">
        <span className="blatt-marke"><Hauszeichen size={22} /> {projekt.name} {projekt.ort}</span>
        <span className="mono">WE {o.we} · {o.geschoss}</span>
      </header>
      <div className="wohnung-kopf">
        <div>
          <p className="eyebrow">
            Wohnung {o.we} · {geschossName[o.geschoss]}{" "}
            <span className={`status-punkt ${o.status}`}>{objektStatusLabel[o.status]}</span>
          </p>
          <h2 className="blatt-titel">{untertitel(o)}</h2>
        </div>
        <p className="wohnung-flaeche"><span>{formatFlaeche(o.wohnflaeche)}</span>Wohnfläche</p>
      </div>
      <p className="ex-einleitung">{o.kurz}</p>
      <div className="ex-grundriss">
        <Plan
          src={o.grundriss.src} alt={`Grundriss ${o.titel}`} breite={o.grundriss.breite} hoehe={o.grundriss.hoehe}
          sizes="182mm" reserviert={o.status === "reserviert"}
        />
      </div>
      <div className="wohnung-spalten">
        <div>
          <h3>Räume</h3>
          <table className="ex-raeume">
            <tbody>
              {o.raeume.map((r, n) => <tr key={n}><td>{r.name}</td><td className="mono">{formatFlaeche(r.flaeche)}</td></tr>)}
              <tr><td>{o.freisitz.art} (zur Hälfte)</td><td className="mono">{formatFlaeche(o.freisitz.flaeche / 2)}</td></tr>
              <tr className="summe"><td>Wohnfläche</td><td className="mono">{formatFlaeche(o.wohnflaeche)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3>Ausstattung und Daten</h3>
          <dl className="ex-details">{details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <ul className="haken-liste ex-haken">{o.merkmale.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      </div>
      <p className="ex-klein">
        {o.grundriss.baugleichMit ? `Grundriss baugleich mit WE ${o.grundriss.baugleichMit}, daher deren Nummer im Plan. ` : ""}
        Möblierung beispielhaft, nicht maßstäblich.
      </p>
      <BlattFuss />
    </section>
  );
}
