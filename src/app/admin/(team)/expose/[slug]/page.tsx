import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JudekLogo } from "@/components/JudekLogo";
import { Hauszeichen } from "@/components/Logo";
import { untertitel } from "@/components/ObjektKarte";
import { formatEuro, formatFlaeche, preisText } from "@/lib/format";
import { geschossName, geschosse, objektNach, objekte, projekt, type Objekt } from "@/lib/objekte";
import { DruckKnopf } from "@/app/expose/DruckKnopf";
import { supabaseSitzung } from "@/lib/supabase-server";
import { Blatt, HausBlatt, KontaktBlatt, LageBlatt, WohnungsBlatt } from "@/app/expose/teile";

/**
 * Exposé zu einer einzelnen Wohnung: die Objektunterlage für Käufer und Bank.
 * Vorerst nur intern: liegt im Vertriebsbereich und ist nur angemeldet erreichbar.
 * Alles aus `lib/objekte.ts`, die Kaufpreise aus Supabase (`preise_wohnungen`,
 * `stellplaetze`, nur fürs Team lesbar). Was noch fehlt (Hausgeld, Miete),
 * erscheint als markiertes „folgt“ und füllt sich, sobald die Werte eingetragen sind.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = objektNach((await params).slug);
  return { title: o ? `Exposé ${o.titel}` : "Exposé", robots: { index: false, follow: false } };
}

/** Grunderwerbsteuer Niedersachsen und übliche Notar- und Grundbuchkosten. */
const GREST = 0.05;
const NOTAR = 0.02;
/** § 7b EStG: Bemessungsgrundlage höchstens 4.000 € je m² Wohnfläche, 4 Jahre je 5 %. */
const AFA_7B_DECKEL = 4000;

/**
 * Zahlung in zwei Teilbeträgen. Nach MaBV werden nach Rohbaufertigstellung 58 % fällig
 * (30 % Erdarbeiten plus 28 % Rohbau); davon behält der Käufer 5 % als Sicherheit ein
 * und zahlt sie mit der Schlussrate.
 */
const RATEN: [string, string, number][] = [
  ["1. Teilbetrag nach Fertigstellung des Rohbaus", "58 % nach MaBV, abzüglich 5 % Sicherheit, die Sie einbehalten", 53],
  ["2. Teilbetrag bei Fertigstellung (Schlussrate)", "die restlichen 42 % plus die einbehaltenen 5 %", 47],
];

type Preise = { wohnung?: number; stellplatz?: number; carport?: number };

/** Kaufpreis der Wohnung und Stellplatzpreise aus der Datenbank. */
async function preiseLaden(we: number): Promise<Preise> {
  const supabase = await supabaseSitzung();
  const [w, s] = await Promise.all([
    supabase.from("preise_wohnungen").select("kaufpreis").eq("we", we).maybeSingle<{ kaufpreis: number }>(),
    supabase.from("stellplaetze").select("carport, kaufpreis").returns<{ carport: boolean; kaufpreis: number }[]>(),
  ]);
  const plaetze = s.data ?? [];
  const ab = (carport: boolean) => {
    const liste = plaetze.filter((x) => x.carport === carport).map((x) => x.kaufpreis);
    return liste.length ? Math.min(...liste) : undefined;
  };
  return { wohnung: w.data?.kaufpreis, stellplatz: ab(false), carport: ab(true) };
}

function Folgt({ text = "folgt" }: { text?: string }) {
  return <span className="ex-offen">{text}</span>;
}

export default async function WohnungsExpose({ params }: Props) {
  const gefunden = objektNach((await params).slug);
  if (!gefunden) notFound();
  const preise = await preiseLaden(gefunden.we);
  const o: Objekt = { ...gefunden, kaufpreis: preise.wohnung ?? gefunden.kaufpreis };
  const [eingang] = projekt.bilder;

  return (
    <div className="expose">
      <div className="expose-leiste">
        <p>Exposé {o.titel} · 7 Seiten im A4-Format</p>
        <DruckKnopf />
      </div>

      {/* ── Titel ─────────────────────────────────────────────── */}
      {/* Titel oben im Himmel, Daten unten: die Fassade in der Mitte bleibt frei. */}
      <section className="blatt titelblatt titelblatt-himmel">
        <Image src={eingang.src} alt={eingang.alt} fill sizes="210mm" loading="eager" className="titel-bild" />
        <div className="titel-inhalt">
          <div className="titel-oben">
            <p className="titel-marke"><Hauszeichen size={40} /> Exposé · Wohnung {o.we}</p>
            <h1>{untertitel(o)}<br /><span>{projekt.name}, {projekt.ort}</span></h1>
          </div>
          <div className="titel-unten">
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
              <li>Eigene PV-Anlage</li>
              <li>Barrierefrei</li>
              <li>Aufzug</li>
            </ul>
            <div className="titel-fuss">
              <span>{projekt.adresse}</span>
              <span className="titel-judek"><JudekLogo /></span>
            </div>
          </div>
        </div>
      </section>

      <WohnungsBlatt o={o} />
      <LageImHaus nr="02" o={o} />
      <KostenBlatt nr="03" o={o} preise={preise} />
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

function KostenBlatt({ nr, o, preise }: { nr: string; o: Objekt; preise: Preise }) {
  const preis = o.status === "verkauft" ? undefined : o.kaufpreis;
  const zeile = (anteil: number) => (preis ? formatEuro(preis * anteil) : <Folgt />);
  return (
    <Blatt nr={nr} titel="Kaufpreis">
      <div className="ex-spalten">
        <div>
          <h3>Wohnung und Stellplatz</h3>
          <table className="ex-raeume">
            <tbody>
              <tr><td>Wohnung {o.we}</td><td className="mono">{preis ? formatEuro(preis) : o.status === "verkauft" ? preisText(o) : <Folgt />}</td></tr>
              <tr><td>Stellplatz (optional)</td><td className="mono">{preise.stellplatz ? formatEuro(preise.stellplatz) : <Folgt />}</td></tr>
              <tr><td>Stellplatz mit Carport (optional)</td><td className="mono">{preise.carport ? formatEuro(preise.carport) : <Folgt />}</td></tr>
              <tr><td>Ladestation (optional)</td><td className="mono"><Folgt text="gegen Aufpreis" /></td></tr>
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
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3>Zahlung in zwei Teilbeträgen</h3>
        <p className="ex-klein ex-absatz">
          Sie zahlen nicht vorab, sondern erst nach Baufortschritt, wie es die Makler- und Bauträgerverordnung
          (MaBV) vorsieht.
        </p>
        <table className="ex-raeume ex-raten">
          <tbody>
            {RATEN.map(([rate, erklaerung, prozent]) => (
              <tr key={rate}>
                <td><strong>{rate}</strong><br /><span className="ex-klein">{erklaerung}</span></td>
                <td className="mono">{prozent} %</td>
                <td className="mono">{zeile(prozent / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ex-spalten">
        <div className="ex-kasten"><p><strong>Hausgeld.</strong> Voraussichtliches monatliches Hausgeld: <Folgt /></p></div>
        <div className="ex-kasten"><p><strong>Sicherheit.</strong> Die einbehaltenen 5 % sichern die rechtzeitige Fertigstellung ohne wesentliche Mängel.</p></div>
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
        Förderstufe für Neubauten. Davon profitieren Eigennutzer und Vermieter.
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
          <p className="eyebrow">Vermieter</p>
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
        <h3>Rechenbeispiel für Vermieter</h3>
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
