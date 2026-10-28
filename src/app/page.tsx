import Image from "next/image";
import { AnfrageFormular } from "@/components/AnfrageFormular";
import { Icon, type IconName } from "@/components/Icon";
import { WohnungsFilter } from "@/components/WohnungsFilter";
import { objekte, projekt } from "@/lib/objekte";

export default function Start() {
  const frei = objekte.filter((o) => o.status === "verfuegbar").length;
  const flaechen = objekte.map((o) => o.wohnflaeche);
  const p = projekt.ansprechpartner;
  const [eingang, luftbild, garten, zufahrt] = projekt.bilder;

  return (
    <main>
      <section className="held">
        <Image src={eingang.src} alt={eingang.alt} fill priority sizes="100vw" className="held-bild" />
        <div className="breite held-inhalt">
          <p className="badge">
            <span className="punkt" /> Neubau · Fertigstellung 2026/2027
          </p>
          <h1>Wohnen an der<br />Hohen Straße.</h1>
          <p className="held-text">{projekt.einleitung}</p>
          <div className="aktionen">
            <a href="#objekte" className="knopf hell-knopf">
              {frei} Wohnungen ansehen <Icon name="pfeil" size={18} />
            </a>
            <a href="#kontakt" className="knopf rahmen-knopf">Exposé anfragen</a>
          </div>
        </div>
      </section>

      <section className="kennzahlen" aria-label="Das Projekt in Zahlen">
        <dl className="breite kennzahlen-raster">
          <div><dt>Eigentumswohnungen</dt><dd>{objekte.length}</dd></div>
          <div>
            <dt>Wohnfläche</dt>
            <dd>{Math.floor(Math.min(...flaechen))}–{Math.round(Math.max(...flaechen))} m²</dd>
          </div>
          <div><dt>Effizienzhaus</dt><dd>KfW 40</dd></div>
          <div><dt>Stellplätze</dt><dd>18</dd></div>
        </dl>
      </section>

      <section id="objekte" className="abschnitt">
        <div className="breite">
          <header className="abschnitt-kopf">
            <p className="eyebrow">01 — Wohnungen</p>
            <h2>Zwei bis vier Zimmer, auf vier Ebenen.</h2>
            <p className="leise gross-text">
              Gärten im Erdgeschoss, Balkone darüber, Dachterrassen bis 50 m² ganz oben. Alle Wohnungen
              barrierefrei über den Aufzug erreichbar.
            </p>
          </header>
          <WohnungsFilter />
        </div>
      </section>

      <section id="haus" className="abschnitt gedaempft">
        <div className="breite">
          <header className="abschnitt-kopf">
            <p className="eyebrow">02 — Das Haus</p>
            <h2>Effizient, barrierefrei, durchdacht.</h2>
          </header>
          <div className="merkmale">
            {projekt.haus.map((m) => (
              <div key={m.titel} className="merkmal">
                <span className="merkmal-icon"><Icon name={m.icon as IconName} /></span>
                <h3>{m.titel}</h3>
                <p className="leise">{m.text}</p>
              </div>
            ))}
          </div>

          <div className="mosaik">
            <figure className="mosaik-gross">
              <Image src={luftbild.src} alt={luftbild.alt} fill sizes="(max-width: 860px) 100vw, 740px" />
            </figure>
            <figure><Image src={garten.src} alt={garten.alt} fill sizes="(max-width: 860px) 100vw, 370px" /></figure>
            <figure><Image src={zufahrt.src} alt={zufahrt.alt} fill sizes="(max-width: 860px) 100vw, 370px" /></figure>
          </div>
          <p className="klein leise">Visualisierungen, unverbindlich. Abweichungen in Ausführung und Bepflanzung möglich.</p>

          <div className="hinweis-karte">
            <span className="merkmal-icon"><Icon name="auto" /></span>
            <p>{projekt.stellplaetze}</p>
          </div>
        </div>
      </section>

      <section id="lage" className="abschnitt dunkel-abschnitt">
        <div className="breite">
          <header className="abschnitt-kopf">
            <p className="eyebrow">03 — Lage</p>
            <h2>Ruhig im Ort. Schnell überall.</h2>
            <p className="leise gross-text">
              Hohenhameln, rund 3.400 Einwohner, im Landkreis Peine — zwischen Hannover, Hildesheim und Braunschweig.
            </p>
          </header>
          <div className="lage-raster">
            <ul className="lage-liste">
              {projekt.lage.map((l) => (
                <li key={l.ziel}><span className="mono">{l.wert}</span><span>{l.ziel}</span></li>
              ))}
            </ul>
            <figure className="lage-bild">
              <Image src={projekt.lageBild.src} alt={projekt.lageBild.alt} fill sizes="(max-width: 860px) 100vw, 640px" />
              <figcaption className="mono"><Icon name="ort" size={14} /> {projekt.adresse}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="kontakt" className="abschnitt">
        <div className="breite zwei-spalten">
          <div>
            <p className="eyebrow">04 — Kontakt</p>
            <h2>Exposé und Beratung.</h2>
            <p className="leise gross-text">
              Schreiben Sie uns, welche Wohnung Sie interessiert. Wir senden Ihnen das Exposé und vereinbaren
              einen Termin.
            </p>
            <div className="person">
              <p className="person-name">{p.name}</p>
              <a href={`tel:${p.telefon.replace(/\s/g, "")}`}><Icon name="telefon" size={16} /> {p.telefon}</a>
              <a href={`mailto:${p.email}`}><Icon name="mail" size={16} /> {p.email}</a>
            </div>
          </div>
          <AnfrageFormular />
        </div>
      </section>
    </main>
  );
}
