import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF ist bei den Visualisierungen rund ein Drittel kleiner als WebP —
    // das Titelbild ist das größte Element der Startseite (LCP).
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
