import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Chromium für die Exposé-PDFs (lib/pdf.ts): nicht bündeln, und das komprimierte
  // Binary ausdrücklich mitnehmen — die Dateiverfolgung findet es nicht von selbst.
  // Ebenso die Vorlagen (Reservierungsvereinbarung), die nur das Team herunterladen darf.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/admin/dokumente/**": ["./node_modules/@sparticuz/chromium/bin/**", "./vorlagen/**"],
  },
  images: {
    // AVIF ist bei den Visualisierungen rund ein Drittel kleiner als WebP —
    // das Titelbild ist das größte Element der Startseite (LCP).
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
