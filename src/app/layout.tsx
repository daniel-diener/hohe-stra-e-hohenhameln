import type { Metadata } from "next";
import Link from "next/link";
import { projekt } from "@/lib/objekte";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: `${projekt.name}, ${projekt.ort} — ${projekt.claim}`, template: `%s · ${projekt.name} ${projekt.ort}` },
  description: `${projekt.claim}: Wohnungen in der ${projekt.adresse}. Jetzt Exposé und Besichtigung anfragen.`,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="kopf">
          <div className="breite">
            <Link href="/" className="marke-name">{projekt.name} <span>{projekt.ort}</span></Link>
            <nav>
              <Link href="/#objekte">Objekte</Link>
              <Link href="/#lage">Lage</Link>
              <Link href="/#kontakt" className="knopf klein">Anfragen</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="fuss">
          <div className="breite">
            <span>{projekt.adresse}</span>
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
