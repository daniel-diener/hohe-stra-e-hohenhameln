import Image from "next/image";
import { AnfrageFormular } from "@/components/AnfrageFormular";
import { Bild } from "@/components/Bild";
import { ObjektKarte } from "@/components/ObjektKarte";
import { geschossName, geschosse, objekte, projekt } from "@/lib/objekte";

export default function Start() {
  const frei = objekte.filter((o) => o.status === "verfuegbar").length;
  const p = projekt.ansprechpartner;

  return (
    <main>
      <section className="held">
        <Image src={projekt.bilder[0].src} alt={projekt.bilder[0].alt} fill priority sizes="100vw" className="held-bild" />
        <div className="breite">
          <p className="ueber">{projekt.adresse}</p>
          <h1>{projekt.claim}</h1>
          <p className="einleitung">{projekt.einleitung}</p>
          <p>
            <a href="#objekte" className="knopf">{frei === 1 ? "1 Wohnung verfügbar" : `${frei} Wohnungen verfügbar`}</a>
          </p>
        </div>
      </section>

      <section id="objekte" className="abschnitt">
        <div className="breite">
          <h2>Die Wohnungen</h2>
          <p className="einleitung dunkel">
            Zwei bis vier Zimmer, 55 bis 122 m². Alle Wohnungen sind über den Aufzug barrierefrei erreichbar.
          </p>
          {geschosse.map((g) => {
            const liste = objekte.filter((o) => o.geschoss === g);
            if (liste.length === 0) return null;
            return (
              <div key={g} className="geschoss">
                <h3>{geschossName[g]}</h3>
                <div className="raster">
                  {liste.map((o) => <ObjektKarte key={o.slug} objekt={o} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="abschnitt hell">
        <div className="breite">
          <h2>Das Haus</h2>
          <ul className="liste">
            {projekt.haus.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>
          <p>{projekt.stellplaetze}</p>
          <div className="haus-galerie">
            {projekt.bilder.slice(1).map((b) => <Bild key={b.src} bild={b} titel={b.alt} />)}
          </div>
          <p className="klein bildhinweis">Visualisierungen, unverbindlich. Abweichungen in Ausführung und Bepflanzung möglich.</p>
        </div>
      </section>

      <section id="lage" className="abschnitt">
        <div className="breite">
          <h2>Die Lage</h2>
          <p className="einleitung dunkel">
            Hohenhameln, rund 3.400 Einwohner, im Landkreis Peine — zwischen Hannover, Hildesheim und Braunschweig.
          </p>
          <ul className="liste">
            {projekt.lage.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>
          <div className="lage-bild">
            <Image src={projekt.lageBild.src} alt={projekt.lageBild.alt} fill sizes="(max-width: 1120px) 100vw, 1120px" />
          </div>
        </div>
      </section>

      <section id="kontakt" className="abschnitt hell">
        <div className="breite zwei-spalten">
          <div>
            <h2>Exposé und Besichtigung</h2>
            <p>Schreiben Sie uns — wir senden Ihnen das Exposé und vereinbaren einen Beratungstermin.</p>
            <p className="kontakt">
              {p.name}<br />
              <a href={`tel:${p.telefon.replace(/\s/g, "")}`}>{p.telefon}</a><br />
              <a href={`mailto:${p.email}`}>{p.email}</a>
            </p>
            <p className="klein">Bauherr: {projekt.bauherr} · Architektur: {projekt.architekt}</p>
          </div>
          <AnfrageFormular />
        </div>
      </section>
    </main>
  );
}
