import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Chromium für die Exposé-PDFs (lib/pdf.ts): nicht bündeln, und das komprimierte
  // Binary ausdrücklich mitnehmen — die Dateiverfolgung findet es nicht von selbst.
  // Ebenso die Vorlagen (Reservierungsvereinbarung), die nur das Team herunterladen darf.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/admin/dokumente/**": ["./node_modules/@sparticuz/chromium/bin/**", "./vorlagen/**"],
    // Freigaben im Lead drucken dieselben PDFs.
    "/admin/leads/**": ["./node_modules/@sparticuz/chromium/bin/**", "./vorlagen/**"],
  },
  // Kunden-Downloads: nie in Suchmaschinen, den geheimen Link nie als Referrer weitergeben.
  async headers() {
    return [{
      source: "/unterlagen/:pfad*",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }];
  },
  images: {
    // AVIF ist bei den Visualisierungen rund ein Drittel kleiner als WebP —
    // das Titelbild ist das größte Element der Startseite (LCP).
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
