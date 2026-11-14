import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JudekLogo } from "@/components/JudekLogo";
import { Hauszeichen } from "@/components/Logo";
import { untertitel } from "@/components/ObjektKarte";
import { formatEuro, formatFlaeche, preisText } from "@/lib/format";
import { geschossName, geschosse, objektNach, objekte, projekt, type Objekt } from "@/lib/objekte";
import { DruckKnopf } from "../DruckKnopf";
import { Blatt, HausBlatt, KontaktBlatt, LageBlatt, WohnungsBlatt } from "../teile";

/**
 * Exposé zu einer einzelnen Wohnung: die Objektunterlage für Käufer und Bank.
 * Alles aus `lib/objekte.ts`. Was dort noch fehlt (Preis, Zahlungsplan, Miete),
 * erscheint als markiertes „folgt“ und füllt sich, sobald die Werte eingetragen sind.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return objekte.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = objektNach((await params).slug);
  return { title: o ? `Exposé ${o.titel}` : "Exposé", robots: { index: false, follow: false } };
}

/** Grunderwerbsteuer Niedersachsen und übliche Notar- und Grundbuchkosten. */
const GREST = 0.05;
const NOTAR = 0.02;
/** § 7b EStG: Bemessungsgrundlage höchstens 4.000 € je m² Wohnfläche, 4 Jahre je 5 %. */
const AFA_7B_DECKEL = 4000;

/** Raten nach § 3 Abs. 2 MaBV (Höchstsätze). Der Kaufvertrag fasst sie zu höchstens sieben Raten zusammen. */
const MABV: [string, number][] = [
  ["Nach Beginn der Erdarbeiten", 30],
  ["Nach Rohbaufertigstellung einschließlich Zimmererarbeiten", 28],
  ["Herstellung der Dachflächen und Dachrinnen", 5.6],
  ["Rohinstallation der Heizungsanlagen", 2.1],
  ["Rohinstallation der Sanitäranlagen", 2.1],
  ["Rohinstallation der Elektroanlagen", 2.1],
  ["Fenstereinbau einschließlich Verglasung", 7],
  ["Innenputz, ausgenommen Beiputzarbeiten", 4.2],
  ["Estrich", 2.1],
  ["Fliesenarbeiten im Sanitärbereich", 2.8],
  ["Bezugsfertigkeit, Zug um Zug gegen Besitzübergabe", 8.4],
  ["Fassadenarbeiten", 2.1],
  ["Vollständige Fertigstellung", 3.5],
];

function Folgt({ text = "folgt" }: { text?: string }) {
  return <span className="ex-offen">{text}</span>;
}

export default async function WohnungsExpose({ params }: Props) {
  const o = objektNach((await params).slug);
  if (!o) notFound();
  const [eingang] = projekt.bilder;

  return (
    <div className="expose">
      <div className="expose-leiste">
        <p>Exposé {o.titel} · 7 Seiten im A4-Format</p>
        <DruckKnopf />
      </div>

      {/* ── Titel ─────────────────────────────────────────────── */}
      <section className="blatt titelblatt">
        <Image src={eingang.src} alt={eingang.alt} fill sizes="210mm" loading="eager" className="titel-bild" />
        <div className="titel-inhalt">
          <p className="titel-marke"><Hauszeichen size={40} /> Exposé · Wohnung {o.we}</p>
          <div>
            <h1>{untertitel(o)}<br /><span>{projekt.name}, {projekt.ort}</span></h1>
            <dl className="titel-daten">
              <div><dt>Wohnfläche</dt><dd>{formatFlaeche(o.wohnflaeche)}</dd></div>
              <div><dt>Zimmer</dt><dd>{o.zimmer}</dd></div>
              <div><dt>Geschoss</dt><dd>{geschossName[o.geschoss]}</dd></div>
              <div><dt>{o.freisitz.art}</dt><dd>{formatFlaeche(o.freisitz.flaeche)}, {o.freisitz.seite}</dd></div>
            </dl>
            <ul className="titel-vorteile">
              <li>Effizienzhaus QNG 40</li>
              <li>KfW-Kredit bis 150.000 €</li>
              <li>Provisionsfrei</li>
              <li>Fertigstellung {projekt.fertigstellung}</li>
            </ul>
          </div>
          <div className="titel-fuss">
            <span>{projekt.adresse}</span>
            <span className="titel-judek"><JudekLogo /></span>
          </div>
        </div>
      </section>

      <WohnungsBlatt o={o} />
      <LageImHaus nr="02" o={o} />
      <KostenBlatt nr="03" o={o} />
      <FoerderBlatt nr="04" o={o} />
      <HausBlatt nr="05" />
      <LageBlatt nr="06" />
      <KontaktBlatt nr="07" />
    </div>
  );
}

/** Schnitt durch das Haus: vier Ebenen, die Ebene der Wohnung hervorgehoben. */
function LageImHaus({ nr, o }: { nr: string; o: Objekt }) {
  const nachbarn = objekte.filter((x) => x.geschoss === o.geschoss && x.we !== o.we);
  return (
    <Blatt nr={nr} titel="Lage im Haus">
      <p className="ex-einleitung">
        Wohnung {o.we} liegt im {geschossName[o.geschoss]}. {o.freisitz.art} mit Ausrichtung {o.freisitz.seite}
        {o.garten ? ", dazu ein eigener Garten als Sondernutzung" : ""}. Alle Ebenen sind über den Aufzug
        stufenlos erreichbar, vom Gartengeschoss bis zum Staffelgeschoss.
      </p>
      <div className="ex-haus-schnitt">
        {geschosse.map((g) => {
          const hier = g === o.geschoss;
          const wohnungen = objekte.filter((x) => x.geschoss === g).map((x) => x.we);
          return (
            <div key={g} className={`ex-ebene ex-ebene-${g.toLowerCase()} ${hier ? "ex-ebene-hier" : ""}`}>
              <span className="ex-ebene-name">{geschossName[g]}</span>
              <span className="ex-ebene-we">
                {wohnungen.map((we) => (
                  <span key={we} className={we === o.we ? "ex-we-hier" : undefined}>WE {we}</span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <dl className="ex-kennzahlen">
        <div><dt>Ebene</dt><dd>{geschossName[o.geschoss]}</dd></div>
        <div><dt>Wohnungen auf der Ebene</dt><dd>{nachbarn.length + 1}</dd></div>
        <div><dt>Abstellraum im UG</dt><dd>{formatFlaeche(o.keller)}</dd></div>
      </dl>
      <figure className="ex-bild ex-bild-gross">
        <Image src={projekt.bilder[1].src} alt={projekt.bilder[1].alt} fill sizes="182mm" loading="eager" />
      </figure>
      <div className="ex-kasten">
        <p>
          <strong>Stellplatz.</strong> {projekt.stellplaetze}
        </p>
      </div>
    </Blatt>
  );
}

function KostenBlatt({ nr, o }: { nr: string; o: Objekt }) {
  const preis = o.status === "verkauft" ? undefined : o.kaufpreis;
  const zeile = (anteil: number) => (preis ? formatEuro(preis * anteil) : <Folgt />);
  return (
    <Blatt nr={nr} titel="Kaufpreis und Zahlung">
      <div className="ex-spalten">
        <div>
          <h3>Kaufpreis</h3>
          <table className="ex-raeume">
            <tbody>
              <tr><td>Wohnung {o.we}</td><td className="mono">{preis ? formatEuro(preis) : o.status === "verkauft" ? preisText(o) : <Folgt />}</td></tr>
              <tr><td>Stellplatz bzw. Carport (optional)</td><td className="mono"><Folgt /></td></tr>
              <tr><td>Ladestation (optional)</td><td className="mono"><Folgt text="gegen Aufpreis" /></td></tr>
              <tr><td>Käuferprovision</td><td className="mono">0 €</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3>Kaufnebenkosten (Richtwerte)</h3>
          <table className="ex-raeume">
            <tbody>
              <tr><td>Grunderwerbsteuer Niedersachsen (5 %)</td><td className="mono">{zeile(GREST)}</td></tr>
              <tr><td>Notar und Grundbuch (rund 2 %)</td><td className="mono">{zeile(NOTAR)}</td></tr>
              <tr><td>Maklerprovision</td><td className="mono">entfällt</td></tr>
              <tr className="summe"><td>Nebenkosten gesamt (rund 7 %)</td><td className="mono">{zeile(GREST + NOTAR)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3>Zahlung nach Baufortschritt</h3>
        <p className="ex-klein ex-absatz">
          Sie zahlen nicht vorab, sondern in Raten nach dem tatsächlichen Baufortschritt, wie es die
          Makler- und Bauträgerverordnung (MaBV) vorschreibt. Die Tabelle zeigt die gesetzlichen Höchstsätze;
          der Kaufvertrag fasst sie zu höchstens sieben Raten zusammen.
        </p>
        <table className="ex-raeume ex-mabv">
          <tbody>
            {MABV.map(([schritt, prozent]) => (
              <tr key={schritt}>
                <td>{schritt}</td>
                <td className="mono">{prozent.toLocaleString("de-DE")} %</td>
                <td className="mono">{zeile(prozent / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ex-spalten">
        <div className="ex-kasten"><p><strong>Hausgeld.</strong> Voraussichtliches monatliches Hausgeld: <Folgt /></p></div>
        <div className="ex-kasten"><p><strong>Sicherheit.</strong> Zusätzlich 5 % Sicherheit für die rechtzeitige Fertigstellung ohne wesentliche Mängel.</p></div>
      </div>
      <p className="ex-klein">
        Richtwerte ohne Gewähr. Maßgeblich sind der notarielle Kaufvertrag und der darin vereinbarte Zahlungsplan.
      </p>
    </Blatt>
  );
}

function FoerderBlatt({ nr, o }: { nr: string; o: Objekt }) {
  const deckel = AFA_7B_DECKEL * o.wohnflaeche;
  return (
    <Blatt nr={nr} titel="Förderung und Steuervorteil">
      <p className="ex-einleitung">
        Das Haus entsteht als Effizienzhaus 40 mit Qualitätssiegel Nachhaltiges Gebäude (QNG), der höchsten
        Förderstufe für Neubauten. Davon profitieren Eigennutzer und Kapitalanleger.
      </p>

      <div className="ex-spalten">
        <div className="ex-foerder">
          <p className="eyebrow">Eigennutzer und Vermieter</p>
          <h3>KfW-Kredit bis 150.000 €</h3>
          <p>
            Zinsgünstiger Kredit aus dem KfW-Programm „Klimafreundlicher Neubau“ für diese Wohnung. Mit
            QNG-Siegel gilt der höchste Kreditbetrag.
          </p>
          <p className="ex-wichtig">
            Wichtig: Den Kredit vor Unterschrift des Kaufvertrags über Ihre Bank beantragen. Die nötige
            Bestätigung zum Antrag stellen wir Ihnen bereit.
          </p>
        </div>
        <div className="ex-foerder">
          <p className="eyebrow">Kapitalanleger</p>
          <h3>Sonderabschreibung nach §&nbsp;7b EStG</h3>
          <p>
            Zusätzlich zur regulären Abschreibung vier Jahre lang je 5 % der Herstellungs- bzw.
            Anschaffungskosten des Gebäudes, bei Vermietung für mindestens zehn Jahre.
          </p>
          <table className="ex-raeume">
            <tbody>
              <tr><td>Wohnfläche</td><td className="mono">{formatFlaeche(o.wohnflaeche)}</td></tr>
              <tr><td>Bemessungsgrundlage höchstens (4.000 € je m²)</td><td className="mono">{formatEuro(deckel)}</td></tr>
              <tr className="summe"><td>Sonderabschreibung höchstens je Jahr</td><td className="mono">{formatEuro(deckel * 0.05)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3>Rechenbeispiel für Kapitalanleger</h3>
        <table className="ex-raeume ex-mabv">
          <tbody>
            <tr><td>Kaufpreis Wohnung</td><td className="mono">{o.kaufpreis ? formatEuro(o.kaufpreis) : <Folgt />}</td></tr>
            <tr><td>Erwartete Kaltmiete je m²</td><td className="mono"><Folgt /></td></tr>
            <tr><td>Jahreskaltmiete ({formatFlaeche(o.wohnflaeche)})</td><td className="mono"><Folgt /></td></tr>
            <tr><td>Bruttomietrendite</td><td className="mono"><Folgt /></td></tr>
            <tr><td>Abschreibung im 1. Jahr (degressiv 5 % plus § 7b 5 %)</td><td className="mono"><Folgt /></td></tr>
          </tbody>
        </table>
      </div>

      <p className="ex-klein">
        Förderung und Steuervorteile hängen von den jeweils gültigen Programmbedingungen und Ihrer persönlichen
        Situation ab; die Sonderabschreibung setzt unter anderem Baukosten von höchstens 5.200 € je m² voraus.
        Keine Steuer- oder Finanzierungsberatung. Bitte sprechen Sie mit Ihrer Bank und Ihrem Steuerberater.
      </p>
    </Blatt>
  );
}
