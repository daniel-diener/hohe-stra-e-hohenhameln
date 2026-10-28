import { AnfrageFormular } from "@/components/AnfrageFormular";
import Image from "next/image";
import { Bild } from "@/components/Bild";
import { ObjektKarte } from "@/components/ObjektKarte";
import { objekte, projekt } from "@/lib/objekte";

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
            <a href="#objekte" className="knopf">{frei === 1 ? "1 Objekt verfügbar" : `${frei} Objekte verfügbar`}</a>
          </p>
        </div>
      </section>

      <section id="objekte" className="abschnitt">
        <div className="breite">
          <h2>Die Objekte</h2>
          <div className="raster">
            {objekte.map((o) => <ObjektKarte key={o.slug} objekt={o} />)}
          </div>
        </div>
      </section>

      <section className="abschnitt hell">
        <div className="breite">
          <h2>Das Haus</h2>
          <ul className="liste">
            {projekt.haus.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>
          <div className="haus-galerie">
            {projekt.bilder.slice(1).map((b) => <Bild key={b.src} bild={b} titel={b.alt} />)}
          </div>
          <p className="klein bildhinweis">Visualisierungen, unverbindlich. Abweichungen in Ausführung und Bepflanzung möglich.</p>
        </div>
      </section>

      <section id="lage" className="abschnitt">
        <div className="breite">
          <h2>Die Lage</h2>
          <ul className="liste">
            {projekt.lage.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>
        </div>
      </section>

      <section id="kontakt" className="abschnitt hell">
        <div className="breite zwei-spalten">
          <div>
            <h2>Exposé und Besichtigung</h2>
            <p>Schreiben Sie uns — wir senden Ihnen das Exposé und vereinbaren einen Besichtigungstermin.</p>
            <p className="kontakt">
              {p.name}<br />
              <a href={`tel:${p.telefon.replace(/\s/g, "")}`}>{p.telefon}</a><br />
              <a href={`mailto:${p.email}`}>{p.email}</a>
            </p>
          </div>
          <AnfrageFormular />
        </div>
      </section>
    </main>
  );
}
