import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnfrageFormular } from "@/components/AnfrageFormular";
import { Bild, Plan } from "@/components/Bild";
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

  const eckdaten: [string, string][] = [
    ["Kaufpreis", preisText(o)],
    ["Wohnfläche", formatFlaeche(o.wohnflaeche)],
    ["Zimmer", formatZahl(o.zimmer)],
    ["Bäder", formatZahl(o.baeder)],
    ["Geschoss", geschossName[o.geschoss]],
    [o.freisitz.art, `${formatFlaeche(o.freisitz.flaeche)} · ${o.freisitz.seite}`],
    ["Garten", o.garten ? "Ja, Sondernutzung" : "—"],
    ["Abstellraum UG", formatFlaeche(o.keller)],
    ...(o.provision ? [["Käuferprovision", o.provision] as [string, string]] : []),
  ];

  const i = objekte.indexOf(o);
  const [vorher, nachher] = [objekte[i - 1], objekte[i + 1]];

  return (
    <main className="abschnitt">
      <div className="breite">
        <p><Link href="/#objekte">← Alle Wohnungen</Link></p>
        <div className="zwei-spalten">
          <article>
            <span className={`marke ${o.status}`}>{objektStatusLabel[o.status]}</span>
            <h1>{o.titel}</h1>
            <p className="einleitung dunkel">{o.kurz}</p>

            <dl className="eckdaten-tabelle">
              {eckdaten.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>

            <figure className="grundriss">
              <Plan
                src={o.grundriss.src}
                alt={`Grundriss ${o.titel}`}
                breite={o.grundriss.breite}
                hoehe={o.grundriss.hoehe}
                sizes="(max-width: 860px) 100vw, 640px"
              />
              <figcaption className="klein">
                Grundriss{o.grundriss.baugleichMit ? ` baugleich mit WE ${o.grundriss.baugleichMit}, daher deren Nummer im Plan` : ""}.
                {" "}Möblierung beispielhaft, nicht maßstäblich.
              </figcaption>
            </figure>

            <h2>Räume</h2>
            <table className="raeume">
              <tbody>
                {o.raeume.map((r, n) => (
                  <tr key={n}><td>{r.name}</td><td>{formatFlaeche(r.flaeche)}</td></tr>
                ))}
                <tr>
                  <td>{o.freisitz.art} ({formatFlaeche(o.freisitz.flaeche)}, zur Hälfte)</td>
                  <td>{formatFlaeche(o.freisitz.flaeche / 2)}</td>
                </tr>
                <tr><th>Wohnfläche</th><th>{formatFlaeche(o.wohnflaeche)}</th></tr>
              </tbody>
            </table>
            <p className="klein">
              Flächen laut Exposé (Stand 04/2026), {o.freisitz.art} mit Faktor 0,5 angerechnet. Zzgl. privater
              Abstellraum im UG mit {formatFlaeche(o.keller)}. Maßgeblich ist die Wohnflächenberechnung zum Kaufvertrag.
            </p>

            <h2>Besonderheiten</h2>
            <ul className="liste">{o.merkmale.map((m) => <li key={m}>{m}</li>)}</ul>

            <h2>Im ganzen Haus</h2>
            <ul className="liste">{projekt.haus.map((m) => <li key={m}>{m}</li>)}</ul>
            <p>{projekt.stellplaetze}</p>

            {o.energie && (
              <>
                <h2>Energie</h2>
                <p className="klein">
                  {o.energie.ausweis}sausweis · Endenergie{o.energie.ausweis === "Bedarf" ? "bedarf" : "verbrauch"}{" "}
                  {formatZahl(o.energie.kennwert)} kWh/(m²·a) · Klasse {o.energie.klasse} · {o.energie.traeger}
                </p>
              </>
            )}

            <div className="haus-galerie">
              {(o.bilder.length > 0 ? o.bilder : projekt.bilder).map((b) => <Bild key={b.src} bild={b} titel={b.alt} />)}
            </div>
            {o.bilder.length === 0 && <p className="klein bildhinweis">Visualisierungen des Hauses, unverbindlich.</p>}

            <nav className="blaettern">
              {vorher ? <Link href={`/objekte/${vorher.slug}`}>← {vorher.titel}</Link> : <span />}
              {nachher && <Link href={`/objekte/${nachher.slug}`}>{nachher.titel} →</Link>}
            </nav>
          </article>

          <aside id="kontakt" className="seitenleiste">
            <h2>{o.status === "verfuegbar" ? "Exposé anfragen" : "Auf die Warteliste"}</h2>
            <AnfrageFormular objektSlug={o.slug} />
          </aside>
        </div>
      </div>
    </main>
  );
}
