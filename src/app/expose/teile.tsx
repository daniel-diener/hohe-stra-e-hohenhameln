import Image from "next/image";
import { Icon, type IconName } from "@/components/Icon";
import { JudekLogo } from "@/components/JudekLogo";
import { Hauszeichen } from "@/components/Logo";
import { Plan } from "@/components/Plan";
import { untertitel } from "@/components/ObjektKarte";
import { formatEuro, formatFlaeche, formatZahl, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { geschossName, projekt, type Objekt } from "@/lib/objekte";

/** Bausteine des Exposés, gemeinsam für das Gesamt-Exposé und die Wohnungs-Exposés. */

export const STAND = "November 2026";

export function HausBlatt({ nr }: { nr: string }) {
  const [, , garten, zufahrt] = projekt.bilder;
  return (
      <Blatt nr={nr} titel="Das Haus">
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
  );
}

export function LageBlatt({ nr }: { nr: string }) {
  return (
      <Blatt nr={nr} titel="Die Lage">
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
  );
}

export function KontaktBlatt({ nr }: { nr: string }) {
  const p = projekt.ansprechpartner;
  const t = projekt.team;
  return (
      <Blatt nr={nr} titel="Ihr Kontakt">
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
            Kaufpreise ab {formatEuro(projekt.abPreis)}, Einzelpreise auf Anfrage. Der Erwerb ist für Käufer
            provisionsfrei. Der Energieausweis (Bedarfsausweis nach GEG) wird nachgereicht.
          </p>
          <p className="ex-klein">Stand: {STAND}</p>
        </div>
      </Blatt>
  );
}

export function Blatt({ nr, titel, children }: { nr: string; titel: string; children: React.ReactNode }) {
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

export function BlattFuss() {
  return (
    <footer className="blatt-fuss">
      <span>{projekt.name} {projekt.ort} · Exposé</span>
      <span>{projekt.ansprechpartner.name} · {projekt.ansprechpartner.telefon} · {projekt.ansprechpartner.email}</span>
    </footer>
  );
}

export function WohnungsBlatt({ o }: { o: Objekt }) {
  const details: [string, string][] = [
    ["Geschoss", geschossName[o.geschoss]],
    ["Zimmer", formatZahl(o.zimmer)],
    ["Bäder", formatZahl(o.baeder)],
    [o.freisitz.art, `${formatFlaeche(o.freisitz.flaeche)}, ${o.freisitz.seite}`],
    ["Garten", o.garten ? "Ja, Sondernutzung" : "Nein"],
    ["Abstellraum UG", formatFlaeche(o.keller)],
    ["Aufzug", "Ja, barrierefrei"],
    ["Kaufpreis", preisText(o)],
    ["Provision", o.provision ?? "auf Anfrage"],
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
          sizes="182mm" status={o.status}
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
