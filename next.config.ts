import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Chromium für die Exposé-PDFs (lib/pdf.ts): nicht bündeln, und das komprimierte
  // Binary ausdrücklich mitnehmen — die Dateiverfolgung findet es nicht von selbst.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/admin/dokumente/**": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  images: {
    // AVIF ist bei den Visualisierungen rund ein Drittel kleiner als WebP —
    // das Titelbild ist das größte Element der Startseite (LCP).
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
