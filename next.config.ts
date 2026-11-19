import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Das Ausstattungs-PDF liegt außerhalb von public/ und wird nur über die Admin-Route ausgeliefert.
  outputFileTracingIncludes: { "/admin/ausstattung/pdf": ["./unterlagen/**"] },
  images: {
    // AVIF ist bei den Visualisierungen rund ein Drittel kleiner als WebP —
    // das Titelbild ist das größte Element der Startseite (LCP).
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
