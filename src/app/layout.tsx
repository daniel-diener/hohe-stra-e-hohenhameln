import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Besuchszaehler } from "@/components/Besuchszaehler";
import { Logo } from "@/components/Logo";
import { WebAnalytics } from "@/components/WebAnalytics";
import { objekte, projekt } from "@/lib/objekte";

const objekteAnzahl = objekte.length;
import { indexierbar, seitenUrl } from "@/lib/seite";
import "./globals.css";

const titel = `${projekt.name} ${projekt.ort} · ${objekteAnzahl} Eigentumswohnungen`;
const beschreibung = `${projekt.claim}: Neubau als Effizienzhaus QNG 40 ab 228.370 €, provisionsfrei, förderfähig, barrierefrei, mit Terrasse oder Balkon. ${projekt.adresse}, Fertigstellung ${projekt.fertigstellung}. Jetzt Exposé anfragen.`;

export const metadata: Metadata = {
  metadataBase: seitenUrl,
  title: { default: titel, template: `%s · ${projekt.name} ${projekt.ort}` },
  description: beschreibung,
  // Vorschau beim Teilen in WhatsApp, Mail, Facebook & Co.
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: `${projekt.name} ${projekt.ort}`,
    title: titel,
    description: beschreibung,
    images: [{ url: projekt.bilder[0].src, width: 2000, height: 1234, alt: projekt.bilder[0].alt }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: indexierbar ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <div className="kontaktleiste">
          <div className="breite kontaktleiste-innen">
            <span><span className="nur-breit leise">{projekt.ansprechpartner.rolle}: </span><strong>{projekt.ansprechpartner.name}</strong></span>
            <a href={`tel:${projekt.ansprechpartner.telefon.replace(/\s/g, "")}`}>
              <Icon name="telefon" size={14} /> {projekt.ansprechpartner.telefon}
            </a>
            <a href={`mailto:${projekt.ansprechpartner.email}`}>
              <Icon name="mail" size={14} /> {projekt.ansprechpartner.email}
            </a>
          </div>
        </div>
        <header className="kopf">
          <div className="breite kopf-innen">
            <Link href="/" className="marke-name" aria-label={`${projekt.name} ${projekt.ort} · Startseite`}>
              <Logo />
            </Link>
            <nav>
              <Link href="/#objekte" className="nur-breit">Wohnungen</Link>
              <Link href="/#haus" className="nur-breit">Haus</Link>
              <Link href="/#foerderung" className="nur-breit">Förderung</Link>
              <Link href="/#lage" className="nur-breit">Lage</Link>
              <Link href="/#kontakt" className="knopf klein">Exposé anfragen</Link>
            </nav>
          </div>
        </header>
        {children}
        <Besuchszaehler />
        <WebAnalytics />
        <footer className="fuss">
          <div className="breite fuss-innen">
            <div>
              <p className="marke-name"><Logo /></p>
              <p className="leise">{projekt.adresse}</p>
            </div>
            <div className="leise klein">
              <p>Bauherr: {projekt.bauherr}<br />Architektur: {projekt.architekt}</p>
              <p>Visualisierungen und Grundrisse unverbindlich.</p>
            </div>
            <nav>
              <Link href="/impressum">Impressum</Link>
              <Link href="/datenschutz">Datenschutz</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
