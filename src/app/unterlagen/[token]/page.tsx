import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { formatDatum } from "@/lib/format";
import { sperrgrund } from "@/lib/freigabe";
import { freigabeNachToken, hatZugang } from "@/lib/freigabe-server";
import { projekt } from "@/lib/objekte";
import { CodeEingabe } from "./CodeEingabe";

/**
 * Persönliche Download-Seite für freigegebene Unterlagen. Erreichbar nur über den
 * Link aus der Freigabe, geöffnet erst mit dem Zugangscode. Nicht verlinkt, nicht
 * in Suchmaschinen (Meta-Tag hier, X-Robots-Tag in next.config.ts, robots.txt).
 */
export const metadata: Metadata = {
  title: "Ihre Unterlagen",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";

export default async function Unterlagen({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const f = await freigabeNachToken(token);
  if (!f) notFound();

  const p = projekt.ansprechpartner;
  const kontakt = (
    <p className="leise klein termin-hinweis">
      Fragen oder Probleme beim Herunterladen?{" "}
      <a href={`tel:${p.telefon.replace(/\s/g, "")}`} className="ohne-umbruch"><Icon name="telefon" size={14} /> {p.telefon}</a>{" "}
      oder <a href={`mailto:${p.email}`}>{p.email}</a>
    </p>
  );

  const grund = sperrgrund(f);
  if (grund) {
    return (
      <main className="abschnitt">
        <div className="breite unterlagen-seite">
          <p className="eyebrow">Ihre Unterlagen</p>
          <h1>Link nicht mehr gültig</h1>
          <p className="leise">
            {grund === "gesperrt"
              ? "Der Zugangscode wurde zu oft falsch eingegeben. Melden Sie sich gern, wir schicken Ihnen einen neuen."
              : "Dieser Link ist abgelaufen. Melden Sie sich gern, wir stellen Ihnen die Unterlagen erneut bereit."}
          </p>
          {kontakt}
        </div>
      </main>
    );
  }

  if (!(await hatZugang(f))) {
    return (
      <main className="abschnitt">
        <div className="breite unterlagen-seite">
          <p className="eyebrow">Ihre Unterlagen · {projekt.name} {projekt.ort}</p>
          <h1>Zugangscode eingeben</h1>
          <p className="leise">
            Die Unterlagen sind nur für Sie bestimmt. Geben Sie bitte den Zugangscode ein, den Sie von uns bekommen haben.
          </p>
          <CodeEingabe token={token} />
          {kontakt}
        </div>
      </main>
    );
  }

  const basis = `/unterlagen/${token}`;
  return (
    <main className="abschnitt">
      <div className="breite unterlagen-seite">
        <p className="eyebrow">Ihre Unterlagen · {projekt.name} {projekt.ort}</p>
        <h1>Unterlagen herunterladen</h1>
        <p className="leise">Bereitgestellt bis {formatDatum(f.gueltig_bis)}. Bitte speichern Sie die Dateien bei sich.</p>
        <ul className="unterlagen-liste">
          {f.dateien.map((d) => (
            <li key={d.datei}>
              <span><strong>{d.titel}</strong><br /><span className="klein leise">PDF · {d.datei}</span></span>
              <span className="dokumente-aktionen">
                <a className="klein" href={`${basis}/${d.datei}?ansehen`} target="_blank" rel="noreferrer">Ansehen</a>
                <a className="knopf klein zweit" href={`${basis}/${d.datei}`} download>Herunterladen</a>
              </span>
            </li>
          ))}
        </ul>
        {f.dateien.length > 1 && (
          <p><a className="knopf cta" href={`${basis}/alle.zip`} download>Alle {f.dateien.length} als ZIP herunterladen</a></p>
        )}
        {kontakt}
      </div>
    </main>
  );
}
