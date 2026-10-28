import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import { projekt } from "@/lib/objekte";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: `${projekt.name}, ${projekt.ort} — ${projekt.claim}`, template: `%s · ${projekt.name} ${projekt.ort}` },
  description: `${projekt.claim}: Neubauwohnungen mit Terrasse, Balkon oder Dachterrasse, ${projekt.adresse}. Jetzt Exposé anfragen.`,
  // Erst mit eigener Domain in die Suchmaschinen — eine Vorschau mit
  // „Preis auf Anfrage" und TODO-Impressum soll niemand bei Google finden.
  robots: process.env.SITE_URL ? undefined : { index: false, follow: false },
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
        <header className="kopf">
          <div className="breite kopf-innen">
            <Link href="/" className="marke-name">
              <span className="logo-zeichen" aria-hidden="true">HS</span>
              <span>{projekt.name} <span className="leise">{projekt.ort}</span></span>
            </Link>
            <nav>
              <Link href="/#objekte" className="nur-breit">Wohnungen</Link>
              <Link href="/#haus" className="nur-breit">Haus</Link>
              <Link href="/#lage" className="nur-breit">Lage</Link>
              <Link href="/#kontakt" className="knopf klein">Exposé anfragen</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="fuss">
          <div className="breite fuss-innen">
            <div>
              <p className="marke-name"><span className="logo-zeichen" aria-hidden="true">HS</span> {projekt.name}</p>
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
