import type { Metadata } from "next";
import Image from "next/image";
import { Icon, type IconName } from "@/components/Icon";
import { JudekLogo } from "@/components/JudekLogo";
import { Hauszeichen } from "@/components/Logo";
import { objekte, projekt } from "@/lib/objekte";
import { anbieter } from "@/lib/rechtliches";
import { seitenUrl } from "@/lib/seite";
import { STAND } from "@/app/expose/teile";

/**
 * „Materialien & Ausstattung" als druckfertige A4-Seiten im Layout des Exposés:
 * Böden, Fliesen, Bad, Beschläge, Elektro und Haustechnik laut Baubeschreibung.
 * Nur intern: liegt im Vertriebsbereich und ist nur angemeldet erreichbar.
 * Der Vertrieb lädt das fertige PDF über „PDF herunterladen" (Route ./pdf) und
 * schickt es von Hand an Interessenten; die automatischen Mails verlinken es nicht.
 * Nach jeder Änderung hier: `npm run ausstattung-pdf` und das PDF mit committen.
 */
export const metadata: Metadata = {
  title: "Materialien & Ausstattung",
  robots: { index: false, follow: false },
};

const BILD = "/ausstattung";
const BEISPIEL = "Abbildungen beispielhaft · Ausführung gemäß Baubeschreibung oder gleichwertig";

const palette = [
  { name: "Eiche", bild: "parkett-eiche.jpg" },
  { name: "Beige", bild: "fliese-beige-boden.jpg" },
  { name: "Anthrazit", bild: "fliese-anthrazit-boden.jpg" },
  { name: "Weiß", bild: null },
] as const;

const ueberblick: { icon: IconName; titel: string; text: string }[] = [
  { icon: "schichten", titel: "Echtholzparkett", text: "Eichenparkett in allen Wohn-, Schlaf- und Flurbereichen." },
  { icon: "waerme", titel: "Fußbodenheizung", text: "In jedem Raum einzeln regelbar, gespeist von einer effizienten Wärmepumpe." },
  { icon: "sonne", titel: "3-fach-Verglasung", text: "Mit elektrischen Außenjalousien an allen Wohnungsfenstern." },
  { icon: "tropfen", titel: "Bodenebene Dusche", text: "Geberit CleanFloor30 und Thermostat-Brausegarnitur." },
  { icon: "kiste", titel: "Markenprodukte", text: "Geberit, Hoppe, Gira und Vigour: bewährte Hersteller." },
  { icon: "blatt", titel: "PV-Anlage", text: "Für jede Wohnung, inklusive Stromspeicher." },
];

const fliesen = [
  { farbe: "Beige", wand: "fliese-beige-wand.jpg", boden: "fliese-beige-boden.jpg" },
  { farbe: "Anthrazit", wand: "fliese-anthrazit-wand.jpg", boden: "fliese-anthrazit-boden.jpg" },
];

const elektro: [raum: string, steckdosen: string, cat7: string, extras: string][] = [
  ["Wohnzimmer", "3 doppelt", "2", "–"],
  ["Küche", "1 einfach, 3 doppelt + 4 Geräte", "–", "Herd 400 V, 1 Dose schaltbar"],
  ["Schlafzimmer", "2 einfach, 3 doppelt", "1", "Licht an Tür + beiden Bettseiten"],
  ["Kinder-/Arbeitszimmer", "2 einfach, 2 doppelt", "1", "–"],
  ["Flur", "1 einfach, 1 doppelt", "1", "Video-Türsprechanlage"],
  ["Bad / Gäste-WC", "1 einfach, 1 doppelt", "–", "Decken- + Wandleuchtenauslass"],
  ["Hauswirtschaftsraum", "1 doppelt + 2 Waschen/Trocknen", "–", "–"],
  ["Balkon / Terrasse", "1 Außensteckdose (IP44)", "–", "LED-Wandleuchte inklusive"],
];

const komfort = [
  ["Fenster", "Kunststoff, innen weiß, außen anthrazit, mit 3-fach-Isolierverglasung."],
  ["Jalousien", "Außenliegend und elektrisch, bequem per Schalter bedient."],
  ["Wärme", "Fußbodenheizung mit Regler in jedem Raum, Handtuchheizkörper im Bad."],
  ["Lüftung", "Abluftsystem für innenliegende Räume, Zuluft über die Fensterprofile."],
];

const haus = [
  ["Fassade", "Wärmedämmverbundsystem mit Verblender in Klinkeroptik und Mineralputz."],
  ["Dach", "Walmdach mit Holzdachstuhl und Tonziegel-Eindeckung."],
  ["Treppenhaus", "Keramik oder Betonwerkstein, Stahlgeländer und Licht per Bewegungsmelder."],
  ["Aufzug", "Für Barrierefreiheit: hält auf jedem Geschoss im Treppenhaus."],
  ["Abstellraum", "Ein eigener Abstellraum je Wohnung im Untergeschoss."],
  ["Effizienzhaus QNG 40", "Wärmepumpe, zertifiziert und mit extrem geringen Nebenkosten."],
];

export default function Ausstattung() {
  const p = projekt.ansprechpartner;
  return (
    <div className="expose ausstattung">
      <div className="expose-leiste">
        <p>Materialien &amp; Ausstattung · 8 Seiten im A4-Format</p>
        <a className="knopf cta" href="/admin/ausstattung/pdf" download>PDF herunterladen</a>
      </div>

      {/* ── Titel ─────────────────────────────────────────────── */}
      <section className="blatt titelblatt">
        <Image
          src={`${BILD}/wohnraum-parkett.jpg`} alt="Wohnraum mit Echtholzparkett in Eiche"
          fill sizes="210mm" loading="eager" unoptimized className="titel-bild"
        />
        <div className="titel-inhalt">
          <p className="titel-marke"><Hauszeichen size={40} /> Ausstattung</p>
          <div>
            <h1>Materialien &amp;<br />Ausstattung<br /><span>{projekt.name} {projekt.ort}</span></h1>
            <p className="titel-zeile au-titel-zeile">
              Was Sie in Ihrer neuen Wohnung sehen, berühren und jeden Tag nutzen: Böden, Fliesen, Bad,
              Beschläge und Technik.
            </p>
            <ul className="au-palette">
              {palette.map((f) => (
                <li key={f.name}>
                  <span className="au-muster">
                    {f.bild && <Image src={`${BILD}/${f.bild}`} alt="" fill sizes="40mm" loading="eager" unoptimized />}
                  </span>
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="titel-fuss">
            <span>{objekte.length} Eigentumswohnungen · Effizienzhaus QNG 40<br />{projekt.adresse}</span>
            <span className="titel-judek"><JudekLogo /></span>
          </div>
        </div>
      </section>

      {/* ── 01 Überblick und Böden ────────────────────────────── */}
      <Seite nr="01" kapitel="Auf einen Blick" titel="Was in jeder Wohnung steckt">
        <div className="ex-merkmale au-ueberblick">
          {ueberblick.map((m) => (
            <div key={m.titel}>
              <span className="merkmal-icon"><Icon name={m.icon} size={18} /></span>
              <h3>{m.titel}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>

        <div className="au-boeden">
          <Bild datei="wohnraum-parkett.jpg" alt="Wohnraum mit Echtholzparkett in Eiche" sizes="84mm" />
          <div>
            <p className="eyebrow">Böden</p>
            <h2 className="au-zwischentitel">Echtes Holz unter den Füßen</h2>
            <dl className="au-liste">
              <div>
                <dt>Echtholzparkett Eiche</dt>
                <dd>Wohnen, Schlafen, Kochen, Flur</dd>
              </div>
              <div>
                <dt>Fliesen 60 × 30 cm</dt>
                <dd>Bad, Gäste-WC und Hauswirtschaftsraum, in Beige oder Anthrazit.</dd>
              </div>
            </dl>
            <p className="ex-klein">Abbildung beispielhaft</p>
          </div>
        </div>
      </Seite>

      {/* ── 02 Fliesen ────────────────────────────────────────── */}
      <Seite nr="02" kapitel="Bad · Gäste-WC · Hauswirtschaftsraum" titel="Fliesen: Sie wählen Beige oder Anthrazit" hinweis={BEISPIEL}>
        <div className="au-fliesen">
          {fliesen.map((f) => (
            <div key={f.farbe}>
              <h3>{f.farbe}</h3>
              <div className="au-fliesenpaar">
                <figure>
                  <Bild datei={f.wand} alt={`Wandfliese ${f.farbe}`} sizes="44mm" />
                  <figcaption>Wand</figcaption>
                </figure>
                <figure>
                  <Bild datei={f.boden} alt={`Bodenfliese ${f.farbe}`} sizes="44mm" />
                  <figcaption>Boden</figcaption>
                </figure>
              </div>
            </div>
          ))}
        </div>
        <dl className="ex-kennzahlen au-kennzahlen">
          <div><dt>Format</dt><dd>ca. 60 × 30 cm</dd></div>
          <div><dt>Fuge</dt><dd>farblich passend</dd></div>
          <div><dt>Dusche</dt><dd>ca. 210 cm hoch gefliest</dd></div>
          <div><dt>Waschtisch &amp; WC</dt><dd>ca. 125 cm</dd></div>
        </dl>
      </Seite>

      {/* ── 03 Bad: Waschplatz und WC ─────────────────────────── */}
      <Seite nr="03" kapitel="Bad · Waschplatz und WC" titel="Klare Formen, weiße Keramik" hinweis={BEISPIEL}>
        <div className="au-produkte">
          <Produkt datei="waschtisch.jpg" marke="Geberit" name="Renova Plan Waschtisch 60 cm">
            Weiße Keramik in gerader Form, mit Überlauf und verchromtem Geruchverschluss.
          </Produkt>
          <Produkt datei="waschtischbatterie.jpg" marke="Vigour" name="Clivia Waschtischbatterie">
            Einhebelmischer in Chrom, mit Zugstangen-Ablaufgarnitur.
          </Produkt>
        </div>
        <h2 className="au-zwischentitel au-abstand">Wandhängend und leicht zu reinigen</h2>
        <div className="au-produkte">
          <Produkt datei="wand-wc.jpg" marke="Geberit" name="Renova Plan Wand-WC">
            Tiefspüler mit WC-Sitz mit Absenkautomatik. Der Spülkasten liegt unsichtbar in der Wand.
          </Produkt>
          <Produkt datei="betaetigungsplatte.jpg" marke="Geberit" name="Sigma01 Betätigungsplatte">
            Weiß, mit 2-Mengen-Spülung für einen sparsamen Wasserverbrauch.
          </Produkt>
        </div>
      </Seite>

      {/* ── 04 Dusche und Badewanne ───────────────────────────── */}
      <Seite nr="04" kapitel="Bad · Dusche" titel="Bodeneben duschen" hinweis={BEISPIEL}>
        <div className="au-dusche">
          <Bild datei="dusche.jpg" alt="Bodenebene Duschfläche Geberit CleanFloor30" sizes="120mm" />
          <div className="au-dusche-text">
            <Bild datei="brausegarnitur.jpg" alt="Vigour Clivia Brausegarnitur" sizes="20mm" einpassen />
            <dl className="au-liste">
              <div>
                <dt><span>Geberit</span>CleanFloor30</dt>
                <dd>Weiße Duschfläche, bodeneben eingebaut, ohne Stufe.</dd>
              </div>
              <div>
                <dt><span>Vigour</span>Clivia Thermostat</dt>
                <dd>Konstante Temperatur, Handbrause 3-fach verstellbar mit Anti-Kalk, Stange 90 cm.</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="au-option">
          <p className="eyebrow">Option · falls technisch möglich</p>
          <h2 className="au-zwischentitel">Lieber baden? Badewanne statt Dusche</h2>
          <div className="au-produkte au-produkte-3">
            <Produkt datei="badewanne.jpg" marke="Vigour" name="One Stahlbadewanne">
              Einbauwanne 170 × 75 cm, weiß, Ab- und Überlauf am Fußende.
            </Produkt>
            <Produkt datei="wannenbatterie.jpg" marke="Vigour" name="Clivia Wannenbatterie">
              Einhebel-Aufputzbatterie in Chrom mit Brausegarnitur.
            </Produkt>
            <Produkt datei="wannenset.jpg" marke="Vigour" name="Wannenset">
              Wandhalter, Schlauch 125 cm und 3-fach verstellbare Handbrause.
            </Produkt>
          </div>
        </div>
      </Seite>

      {/* ── 05 Türen, Schalter ────────────────────────────────── */}
      <Seite nr="05" kapitel="Türen &amp; Beschläge" titel="Was Sie jeden Tag in der Hand haben" hinweis={BEISPIEL}>
        <div className="au-tueren">
          <Produkt datei="tuerdruecker.jpg" marke="Hoppe" name="Türdrücker „Amsterdam“, Edelstahl" dunkel>
            An allen Zimmertüren: schlicht, robust und zeitlos.
          </Produkt>
          <dl className="au-liste">
            <div>
              <dt>Zimmertüren</dt>
              <dd>Weiß lackiert, in Holz- oder Stahlzarge.</dd>
            </div>
            <div>
              <dt>Wohnungseingangstür</dt>
              <dd>Mindestens Dreifachverriegelung, Sicherheitsbeschlag und Profilzylinder mit Ausziehschutz.</dd>
            </div>
          </dl>
        </div>

        <div className="au-abschnitt">
          <p className="eyebrow">Schalter &amp; Technik</p>
          <h2 className="au-zwischentitel">Ein Design für jeden Schalter</h2>
          <div className="au-schalter">
            <div className="au-schalterpaar">
              <Bild datei="schalter.jpg" alt="Gira E2 Lichtschalter reinweiß" sizes="40mm" einpassen />
              <Bild datei="steckdose.jpg" alt="Gira E2 Steckdose reinweiß" sizes="40mm" einpassen />
            </div>
            <dl className="au-liste">
              <div>
                <dt><span>Gira</span>E2, reinweiß glänzend</dt>
                <dd>Ein einheitliches Programm für Lichtschalter, Steckdosen, TV- und Datendosen.</dd>
              </div>
              <div>
                <dt>Cat7-Netzwerk</dt>
                <dd>Sternförmig verkabelt ab der Multimediaverteilung jeder Wohnung.</dd>
              </div>
              <div>
                <dt>Video-Gegensprechanlage</dt>
                <dd>Farbmonitor neben der Wohnungstür.</dd>
              </div>
            </dl>
          </div>
        </div>
      </Seite>

      {/* ── 06 Elektro ────────────────────────────────────────── */}
      <Seite nr="06" kapitel="Elektro-Ausstattung" titel="Durchdacht bis in jeden Raum">
        <table className="ex-tabelle au-elektro">
          <thead>
            <tr><th>Raum</th><th>Steckdosen</th><th>Cat7</th><th>Extras</th></tr>
          </thead>
          <tbody>
            {elektro.map(([raum, dosen, cat, extras]) => (
              <tr key={raum}>
                <td>{raum}</td><td>{dosen}</td><td className="mono">{cat}</td><td>{extras}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ex-klein">Leuchten nicht enthalten (außer Balkon/Terrasse).</p>

        <div className="au-komfort">
          <Bild datei="haus-fenster.jpg" alt="Visualisierung: Gartenseite mit Fenstern, Außenjalousien und Balkonen" sizes="62mm" />
          <div>
            <p className="eyebrow">Komfort &amp; Energie</p>
            <h2 className="au-zwischentitel">Komfort, den man spürt</h2>
            <ol className="au-nummern">
              {komfort.map(([name, text], n) => (
                <li key={name}>
                  <span className="mono">0{n + 1}</span>
                  <div><h3>{name}</h3><p>{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Seite>

      {/* ── 07 Haus, Enthaltenes, Kontakt ─────────────────────── */}
      <Seite nr="07" kapitel="Haus &amp; Gemeinschaft" titel="Solide gebaut, von außen bis innen">
        <dl className="au-haus">
          {haus.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}
        </dl>
        <p className="ex-kasten au-qng">
          Ein Wohnhaus im Standard KfW-Effizienzhaus QNG 40 kombiniert extrem niedrigen Energiebedarf mit
          strengen Nachhaltigkeitskriterien, um die höchste Stufe der staatlichen Neubauförderung zu erreichen.
        </p>

        <div className="au-abschnitt">
          <p className="eyebrow">Gut zu wissen</p>
          <h2 className="au-zwischentitel">Was enthalten ist und was Sie ergänzen können</h2>
          <div className="ex-spalten">
            <div className="au-box">
              <h3>Nicht im Kaufpreis</h3>
              <ul>
                <li>Küche</li>
                <li>Leuchten und Leuchtmittel</li>
                <li>Router, Modem</li>
              </ul>
            </div>
            <div className="au-box au-box-plus">
              <h3>Auf Wunsch möglich</h3>
              <ul>
                <li>Badewanne statt Dusche</li>
                <li>Zusätzliche Elektro-Ausstattung</li>
                <li>Carport für den Stellplatz</li>
                <li>Wallbox oder Vorverkabelung für E-Autos</li>
              </ul>
            </div>
          </div>
          <p className="ex-klein">
            Markenprodukte können durch gleichwertige ersetzt werden. Sonderwünsche nach Absprache, Mehrkosten
            werden gesondert berechnet.
          </p>
        </div>

        <div className="au-kontakt">
          <div>
            <p className="eyebrow">Fragen zur Ausstattung?</p>
            <p className="ex-namen">Wir beraten Sie gern zu Ausführung, Farben und Sonderwünschen.</p>
            <p className="ex-anschrift">{anbieter.firma} · {anbieter.strasse} · {anbieter.plzOrt}</p>
          </div>
          <div>
            <p className="ex-namen klein-namen">{p.name}</p>
            <p className="ex-kontaktzeile"><Icon name="telefon" size={16} /> {p.telefon}</p>
            <p className="ex-kontaktzeile"><Icon name="mail" size={16} /> {p.email}</p>
            <p className="ex-kontaktzeile"><Icon name="ort" size={16} /> {seitenUrl.host}</p>
          </div>
        </div>
        <p className="ex-klein">
          Diese Übersicht dient der Information und ist kein Angebot im Rechtssinne. Maßgeblich sind allein der
          notarielle Kaufvertrag und die Baubeschreibung. Abbildungen sind beispielhaft. Stand: {STAND}
        </p>
      </Seite>
    </div>
  );
}

function Seite({ nr, kapitel, titel, hinweis, children }: {
  nr: string; kapitel: string; titel: string; hinweis?: string; children: React.ReactNode;
}) {
  const p = projekt.ansprechpartner;
  return (
    <section className="blatt">
      <header className="blatt-kopf">
        <span className="blatt-marke"><Hauszeichen size={22} /> {projekt.name} {projekt.ort}</span>
        <span className="mono">{nr}</span>
      </header>
      <p className="eyebrow au-kapitel">{kapitel}</p>
      <h2 className="blatt-titel">{titel}</h2>
      <div className="blatt-inhalt">{children}</div>
      {hinweis && <p className="ex-klein au-hinweis">{hinweis}</p>}
      <footer className="blatt-fuss">
        <span>{projekt.name} {projekt.ort} · Materialien &amp; Ausstattung</span>
        <span>{anbieter.firma} · {p.telefon} · {p.email}</span>
      </footer>
    </section>
  );
}

function Bild({ datei, alt, sizes, einpassen }: { datei: string; alt: string; sizes: string; einpassen?: boolean }) {
  return (
    <span className={`au-bild${einpassen ? " au-einpassen" : ""}`}>
      <Image src={`${BILD}/${datei}`} alt={alt} fill sizes={sizes} loading="eager" unoptimized />
    </span>
  );
}

function Produkt({ datei, marke, name, dunkel, children }: {
  datei: string; marke: string; name: string; dunkel?: boolean; children: React.ReactNode;
}) {
  return (
    <figure className={`au-produkt${dunkel ? " au-dunkel" : ""}`}>
      <Bild datei={datei} alt={`${marke} ${name}`} sizes="80mm" einpassen />
      <figcaption>
        <span className="au-marke">{marke}</span>
        <h3>{name}</h3>
        <p>{children}</p>
      </figcaption>
    </figure>
  );
}
