import Link from "next/link";
import { objekte } from "@/lib/objekte";

export type Statistik = {
  tage: number;
  besucher: number;
  aufrufe: number;
  anfragen: number;
  pro_tag: { tag: string; besucher: number; aufrufe: number; anfragen: number }[];
  seiten: { pfad: string; aufrufe: number; besucher: number }[];
  herkunft: { quelle: string; besucher: number }[];
  kampagnen: { kampagne: string; besucher: number }[];
  anfragen_herkunft: { quelle: string; anfragen: number }[];
  geraete: { geraet: string; besucher: number }[];
  laender: { land: string; besucher: number }[];
};

export const ZEITRAEUME = [7, 30, 90, 365];
const zahl = new Intl.NumberFormat("de-DE");
const prozent = new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 });
const tagKurz = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", timeZone: "UTC" });
const tagLang = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" });
const laenderNamen = new Intl.DisplayNames(["de"], { type: "region" });

/** Pfade in Worte fassen: „/objekte/wohnung-3" → „WE 3 · 3 Zimmer mit Garten". */
function seitenName(pfad: string) {
  if (pfad === "/") return "Startseite";
  if (pfad === "/expose") return "Exposé";
  if (pfad === "/impressum") return "Impressum";
  if (pfad === "/datenschutz") return "Datenschutz";
  const o = objekte.find((x) => pfad === `/objekte/${x.slug}`);
  return o ? o.titel : pfad;
}

const GERAET: Record<string, string> = { mobil: "Smartphone", tablet: "Tablet", desktop: "Computer" };

/** Die Statistik-Ansicht; Daten kommen von der Seite (RPC besuchsstatistik). */
export function StatistikAnsicht({ s, tage }: { s: Statistik; tage: number }) {
  const quote = s.besucher > 0 ? s.anfragen / s.besucher : 0;
  const maxBesucher = Math.max(1, ...s.pro_tag.map((t) => t.besucher));
  const leer = s.aufrufe === 0;

  return (
    <main className="abschnitt">
      <div className="breite">
        <div className="statistik-kopf">
          <div>
            <h1>Statistik</h1>
            <p className="leise klein">Ohne Cookies und ohne IP-Adressen gezählt. Besucher werden je Tag gezählt.</p>
          </div>
          <nav className="reiter" aria-label="Zeitraum">
            {ZEITRAEUME.map((z) => (
              <Link key={z} href={`/admin/statistik?tage=${z}`} className={z === tage ? "aktiv" : ""}>
                {z === 365 ? "12 Monate" : `${z} Tage`}
              </Link>
            ))}
          </nav>
        </div>

        <dl className="eckdaten-tabelle statistik-zahlen">
          <div><dt>Besucher</dt><dd>{zahl.format(s.besucher)}</dd></div>
          <div><dt>Seitenaufrufe</dt><dd>{zahl.format(s.aufrufe)}</dd></div>
          <div><dt>Anfragen</dt><dd>{zahl.format(s.anfragen)}</dd></div>
          <div><dt>Anfragequote</dt><dd>{s.besucher > 0 ? prozent.format(quote) : "–"}</dd></div>
        </dl>

        {leer && (
          <p className="hinweis-karte klein">
            Noch keine Besuche in diesem Zeitraum. Die Zählung läuft seit der Einrichtung; die ersten Zahlen erscheinen,
            sobald jemand die Seite öffnet.
          </p>
        )}

        <section className="statistik-block">
          <h2>Besucher pro Tag</h2>
          <div className="saeulen" role="img" aria-label={`Besucher pro Tag, letzte ${s.tage} Tage`}>
            {s.pro_tag.map((t) => {
              const d = new Date(`${t.tag}T00:00:00Z`);
              return (
                <div key={t.tag} className="saeule" tabIndex={0}>
                  <span className="saeule-balken" style={{ height: `${(t.besucher / maxBesucher) * 100}%` }} />
                  {t.anfragen > 0 && <span className="saeule-anfrage" aria-hidden="true" />}
                  <span className="saeule-tipp" role="tooltip">
                    <strong>{tagLang.format(d)}</strong>
                    {zahl.format(t.besucher)} Besucher · {zahl.format(t.aufrufe)} Aufrufe
                    {t.anfragen > 0 && <> · {t.anfragen} {t.anfragen === 1 ? "Anfrage" : "Anfragen"}</>}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="saeulen-achse klein leise">
            <span>{tagKurz.format(new Date(`${s.pro_tag[0]?.tag}T00:00:00Z`))}</span>
            <span>max. {zahl.format(maxBesucher)} Besucher/Tag · ● Tag mit Anfrage</span>
            <span>heute</span>
          </div>
        </section>

        <div className="statistik-raster">
          <Rangliste
            titel="Meistgesehene Seiten" spalte="Aufrufe"
            zeilen={s.seiten.map((z) => ({ name: seitenName(z.pfad), wert: z.aufrufe, neben: `${zahl.format(z.besucher)} Besucher` }))}
          />
          <Rangliste
            titel="Herkunft der Besucher" spalte="Besucher"
            zeilen={s.herkunft.map((z) => ({ name: z.quelle, wert: z.besucher }))}
            fuss="„Direkt“: Adresse eingetippt, Lesezeichen, QR-Code ohne Kennung oder App."
          />
          <Rangliste
            titel="Herkunft der Anfragen" spalte="Anfragen"
            zeilen={s.anfragen_herkunft.map((z) => ({ name: z.quelle, wert: z.anfragen }))}
          />
          <Rangliste
            titel="Kampagnen" spalte="Besucher"
            zeilen={s.kampagnen.map((z) => ({ name: z.kampagne, wert: z.besucher }))}
            fuss="Links mit ?utm_campaign=… (z. B. auf Plakat-QR-Codes oder in Anzeigen)."
          />
          <Rangliste
            titel="Geräte" spalte="Besucher"
            zeilen={s.geraete.map((z) => ({ name: GERAET[z.geraet] ?? z.geraet, wert: z.besucher }))}
          />
          <Rangliste
            titel="Länder" spalte="Besucher"
            zeilen={s.laender.map((z) => ({ name: z.land === "?" ? "Unbekannt" : laenderNamen.of(z.land) ?? z.land, wert: z.besucher }))}
          />
        </div>
      </div>
    </main>
  );
}

function Rangliste({ titel, spalte, zeilen, fuss }: {
  titel: string; spalte: string; zeilen: { name: string; wert: number; neben?: string }[]; fuss?: string;
}) {
  const max = Math.max(1, ...zeilen.map((z) => z.wert));
  return (
    <section className="statistik-block">
      <h2>{titel}</h2>
      {zeilen.length === 0 ? (
        <p className="leer klein">Noch keine Daten.</p>
      ) : (
        <table className="rangliste">
          <thead><tr><th>{titel.split(" ")[0] === "Meistgesehene" ? "Seite" : "Name"}</th><th>{spalte}</th></tr></thead>
          <tbody>
            {zeilen.map((z) => (
              <tr key={z.name}>
                <td>
                  <span className="rang-balken" style={{ width: `${(z.wert / max) * 100}%` }} aria-hidden="true" />
                  <span className="rang-name">{z.name}</span>
                  {z.neben && <span className="rang-neben">{z.neben}</span>}
                </td>
                <td className="mono">{zahl.format(z.wert)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {fuss && <p className="leise klein statistik-fuss">{fuss}</p>}
    </section>
  );
}
