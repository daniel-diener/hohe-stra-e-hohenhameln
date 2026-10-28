import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnfrageFormular } from "@/components/AnfrageFormular";
import { Bild } from "@/components/Bild";
import { formatEuro, formatFlaeche, formatZahl } from "@/lib/format";
import { objektStatusLabel } from "@/lib/labels";
import { objektNach, objekte } from "@/lib/objekte";

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
    description: `${o.art}, ${o.zimmer} Zimmer, ${formatFlaeche(o.wohnflaeche)}, ${formatEuro(o.kaufpreis)}. ${o.kurz}`,
    openGraph: o.bilder[0] ? { images: [o.bilder[0].src] } : undefined,
  };
}

export default async function ObjektSeite({ params }: Props) {
  const o = objektNach((await params).slug);
  if (!o) notFound();

  const eckdaten: [string, string][] = [
    ["Kaufpreis", o.status === "verkauft" ? "Verkauft" : formatEuro(o.kaufpreis)],
    ["Wohnfläche", formatFlaeche(o.wohnflaeche)],
    ["Zimmer", formatZahl(o.zimmer)],
    ...(o.lage ? [["Lage", o.lage] as [string, string]] : []),
    ...(o.grundstueck ? [["Grundstück", formatFlaeche(o.grundstueck)] as [string, string]] : []),
    ...(o.baujahr ? [["Baujahr", String(o.baujahr)] as [string, string]] : []),
    ["Käuferprovision", o.provision],
  ];

  return (
    <main className="abschnitt">
      <div className="breite">
        <Bild bild={o.bilder[0]} titel={o.titel} gross />
        {o.bilder.length > 1 && (
          <div className="galerie">
            {o.bilder.slice(1).map((b) => <Bild key={b.src} bild={b} titel={o.titel} />)}
          </div>
        )}

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
