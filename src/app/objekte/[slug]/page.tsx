import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnfrageFormular } from "@/components/AnfrageFormular";
import { Plan } from "@/components/Plan";
import { Icon, type IconName } from "@/components/Icon";
import { untertitel } from "@/components/ObjektKarte";
import { formatFlaeche, formatZahl, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { geschossName, objektNach, objekte, projekt } from "@/lib/objekte";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return objekte.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = objektNach((await params).slug);
  if (!o) return {};
  return {
    title: o.titel,
    description: `${o.zimmer}-Zimmer-Wohnung, ${formatFlaeche(o.wohnflaeche)}, ${geschossName[o.geschoss]}, ${preisText(o)}. ${o.kurz}`,
    openGraph: { images: [o.bilder[0]?.src ?? projekt.bilder[0].src] },
  };
}

export default async function ObjektSeite({ params }: Props) {
  const o = objektNach((await params).slug);
  if (!o) notFound();

  const kopfwerte: [string, string][] = [
    ["Kaufpreis", preisText(o)],
    ["Wohnfläche", formatFlaeche(o.wohnflaeche)],
    ["Zimmer", formatZahl(o.zimmer)],
    [o.freisitz.art, formatFlaeche(o.freisitz.flaeche)],
  ];
  const details: [string, string][] = [
    ["Geschoss", geschossName[o.geschoss]],
    ["Bäder", formatZahl(o.baeder)],
    [`${o.freisitz.art} Ausrichtung`, o.freisitz.seite],
    ["Garten", o.garten ? "Ja, Sondernutzung" : "—"],
    ["Abstellraum UG", formatFlaeche(o.keller)],
    ["Aufzug", "Ja, barrierefrei"],
    ...(o.provision ? [["Käuferprovision", o.provision] as [string, string]] : []),
  ];

  const i = objekte.indexOf(o);
  const [vorher, nachher] = [objekte[i - 1], objekte[i + 1]];
  const bilder = o.bilder.length > 0 ? o.bilder : projekt.bilder.slice(0, 3);

  return (
    <main className="abschnitt objekt-seite">
      <div className="breite">
        <nav className="kruemel mono" aria-label="Pfad">
          <Link href="/#objekte">Wohnungen</Link> <span>/</span> {geschossName[o.geschoss]} <span>/</span> WE {o.we}
        </nav>

        <header className="objekt-kopf">
          <p className="eyebrow">
            WE {o.we} · {geschossName[o.geschoss]} <span className={`status-punkt ${o.status}`}>{objektStatusLabel[o.status]}</span>
          </p>
          <h1>{untertitel(o)}</h1>
          <p className="leise gross-text">{o.kurz}</p>
        </header>

        <dl className="kennzahlen-raster karte-rahmen">
          {kopfwerte.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>

        <div className="zwei-spalten">
          <article>
            <figure className="grundriss">
              <Plan
                src={o.grundriss.src}
                alt={`Grundriss ${o.titel}`}
                breite={o.grundriss.breite}
                hoehe={o.grundriss.hoehe}
                sizes="(max-width: 860px) 100vw, 680px"
              />
              <figcaption className="klein leise">
                Grundriss{o.grundriss.baugleichMit ? ` baugleich mit WE ${o.grundriss.baugleichMit}, daher deren Nummer im Plan` : ""}.
                {" "}Möblierung beispielhaft, nicht maßstäblich.
              </figcaption>
            </figure>

            <h2>Details</h2>
            <dl className="details">
              {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>

            <h2>Räume</h2>
            <table className="raeume">
              <tbody>
                {o.raeume.map((r, n) => (
                  <tr key={n}><td>{r.name}</td><td className="mono">{formatFlaeche(r.flaeche)}</td></tr>
                ))}
                <tr>
                  <td>{o.freisitz.art} <span className="leise">({formatFlaeche(o.freisitz.flaeche)}, zur Hälfte)</span></td>
                  <td className="mono">{formatFlaeche(o.freisitz.flaeche / 2)}</td>
                </tr>
                <tr className="summe"><td>Wohnfläche</td><td className="mono">{formatFlaeche(o.wohnflaeche)}</td></tr>
              </tbody>
            </table>
            <p className="klein leise">
              Flächen laut Exposé (Stand 04/2026), {o.freisitz.art} mit Faktor 0,5 angerechnet. Zzgl. privater
              Abstellraum im UG mit {formatFlaeche(o.keller)}. Maßgeblich ist die Wohnflächenberechnung zum Kaufvertrag.
            </p>

            <h2>Besonderheiten</h2>
            <ul className="haken-liste">{o.merkmale.map((m) => <li key={m}>{m}</li>)}</ul>

            <h2>Im ganzen Haus</h2>
            <div className="merkmale kompakt">
              {projekt.haus.map((m) => (
                <div key={m.titel} className="merkmal">
                  <span className="merkmal-icon"><Icon name={m.icon as IconName} size={18} /></span>
                  <h3>{m.titel}</h3>
                  <p className="leise">{m.text}</p>
                </div>
              ))}
            </div>

            {o.energie && (
              <>
                <h2>Energie</h2>
                <p className="klein">
                  {o.energie.ausweis}sausweis · Endenergie{o.energie.ausweis === "Bedarf" ? "bedarf" : "verbrauch"}{" "}
                  {formatZahl(o.energie.kennwert)} kWh/(m²·a) · Klasse {o.energie.klasse} · {o.energie.traeger}
                </p>
              </>
            )}

            <div className="mosaik klein-mosaik">
              {bilder.map((b) => (
                <figure key={b.src}><Image src={b.src} alt={b.alt} fill sizes="(max-width: 860px) 100vw, 340px" /></figure>
              ))}
            </div>
            {o.bilder.length === 0 && <p className="klein leise">Visualisierungen des Hauses, unverbindlich.</p>}

            <nav className="blaettern">
              {vorher ? (
                <Link href={`/objekte/${vorher.slug}`}><span className="mono leise">← WE {vorher.we}</span>{untertitel(vorher)}</Link>
              ) : <span />}
              {nachher && (
                <Link href={`/objekte/${nachher.slug}`} className="rechts"><span className="mono leise">WE {nachher.we} →</span>{untertitel(nachher)}</Link>
              )}
            </nav>
          </article>

          <aside id="kontakt" className="seitenleiste">
            <h2>{o.status === "verfuegbar" ? "Exposé anfragen" : "Auf die Warteliste"}</h2>
            <p className="leise klein">Unverbindlich und kostenfrei.</p>
            <AnfrageFormular objektSlug={o.slug} />
          </aside>
        </div>
      </div>
    </main>
  );
}
