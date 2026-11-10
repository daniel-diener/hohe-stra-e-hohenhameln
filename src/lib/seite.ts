/**
 * Öffentliche Adresse der Seite. Ohne `SITE_URL` (Vorschau) die Adresse, die
 * Vercel dem Projekt gibt — damit Vorschaubilder in Messengern trotzdem laden.
 */
export const seitenUrl = new URL(
  process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);

/**
 * Erst mit eigener Domain in die Suchmaschinen — eine Vorschau mit
 * „Preis auf Anfrage" und TODO-Impressum soll niemand bei Google finden.
 */
export const indexierbar = Boolean(process.env.SITE_URL);
