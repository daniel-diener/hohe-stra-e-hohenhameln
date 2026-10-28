import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnfrageFormular } from "@/components/AnfrageFormular";
import { Bild } from "@/components/Bild";
import { formatFlaeche, formatZahl, preisText } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { bilderVon, objektNach, objekte } from "@/lib/objekte";

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
    description: `${o.art}, ${o.zimmer} Zimmer, ${formatFlaeche(o.wohnflaeche)}, ${preisText(o)}. ${o.kurz}`,
    openGraph: { images: [bilderVon(o)[0].src] },
  };
}

export default async function ObjektSeite({ params }: Props) {
  const o = objektNach((await params).slug);
  if (!o) notFound();

  const bilder = bilderVon(o);
  const eckdaten: [string, string][] = [
    ["Kaufpreis", preisText(o)],
    ["Wohnfläche", formatFlaeche(o.wohnflaeche)],
    ["Zimmer", formatZahl(o.zimmer)],
    ["Bäder", formatZahl(o.baeder)],
    ["Geschoss", o.lage],
    ...(o.freisitz
      ? [[o.freisitz.art, `${formatFlaeche(o.freisitz.flaeche)} · ${o.freisitz.seite}`] as [string, string]]
      : []),
    ...(o.provision ? [["Käuferprovision", o.provision] as [string, string]] : []),
  ];

  return (
    <main className="abschnitt">
      <div className="breite">
        <Bild bild={bilder[0]} titel={o.titel} gross />
        {bilder.length > 1 && (
          <div className="galerie">
            {bilder.slice(1).map((b) => <Bild key={b.src} bild={b} titel={o.titel} />)}
          </div>
        )}
        {o.bilder.length === 0 && <p className="klein bildhinweis">Visualisierungen des Hauses, unverbindlich.</p>}

        <div className="zwei-spalten">
          <article>
            <span className={`marke ${o.status}`}>{objektStatusLabel[o.status]}</span>
            <h1>{o.titel}</h1>
            <p className="einleitung">{o.kurz}</p>

            <dl className="eckdaten-tabelle">
              {eckdaten.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>

            {o.beschreibung.map((absatz, i) => <p key={i}>{absatz}</p>)}

            <h2>Räume</h2>
            <table className="raeume">
              <tbody>
                {o.raeume.map((r, i) => (
                  <tr key={i}><td>{r.name}</td><td>{formatFlaeche(r.flaeche)}</td></tr>
                ))}
                <tr><th>Wohnfläche</th><th>{formatFlaeche(o.wohnflaeche)}</th></tr>
              </tbody>
            </table>
            <p className="klein">
              Flächen laut Genehmigungsplanung (Stand Januar 2026), ohne {o.freisitz?.art ?? "Freisitz"}.
              Maßgeblich ist die Wohnflächenberechnung im Kaufvertrag.
            </p>

            <h2>Ausstattung</h2>
            <ul className="liste">{o.ausstattung.map((a) => <li key={a}>{a}</li>)}</ul>

            {o.energie && (
              <>
                <h2>Energie</h2>
                <p className="klein">
                  {o.energie.ausweis}sausweis · Endenergie{o.energie.ausweis === "Bedarf" ? "bedarf" : "verbrauch"}{" "}
                  {formatZahl(o.energie.kennwert)} kWh/(m²·a) · Klasse {o.energie.klasse} · {o.energie.traeger}
                </p>
              </>
            )}
          </article>

          <aside id="kontakt">
            <h2>{o.status === "verfuegbar" ? "Exposé anfragen" : "Auf die Warteliste"}</h2>
            <AnfrageFormular objektSlug={o.slug} />
          </aside>
        </div>
      </div>
    </main>
  );
}
