/**
 * Hilfen für die Besucherstatistik, ohne Server- oder Browser-Abhängigkeit
 * (darum testbar). Was gespeichert wird, steht in supabase/migrations/0003.
 */

export type Geraet = "mobil" | "tablet" | "desktop";

/** Bots, Vorschau-Crawler und Monitoring zählen nicht als Besucher. */
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|lighthouse|headless|pingdom|uptime|curl|wget|python|node-fetch|axios/i;
export const istBot = (ua: string) => !ua || BOT.test(ua);

export function geraetAus(ua: string): Geraet {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobil";
  return "desktop";
}

/** Nur öffentliche Seiten zählen; Vertrieb, Schnittstellen und Dateien nicht. */
export function zaehlbarerPfad(pfad: unknown): string | null {
  if (typeof pfad !== "string" || !pfad.startsWith("/")) return null;
  const ohneQuery = pfad.split(/[?#]/)[0].slice(0, 300);
  if (/^\/(admin|api|_next)(\/|$)/.test(ohneQuery)) return null;
  return ohneQuery || "/";
}

/**
 * Herkunft als Hostname der verweisenden Seite, ohne Pfad (der könnte
 * Suchbegriffe oder Kennungen enthalten). Eigene Seite zählt nicht als Herkunft.
 */
export function herkunftAus(referrer: unknown, eigenerHost: string | null): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || (eigenerHost && host === eigenerHost.replace(/^www\./, "").toLowerCase().split(":")[0])) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

/** Kampagnenkennung säubern: kurz, klein, nur harmlose Zeichen. */
export function kennung(wert: unknown): string | null {
  if (typeof wert !== "string") return null;
  const s = wert.trim().toLowerCase().replace(/[^a-z0-9äöüß._ -]/g, "").slice(0, 100);
  return s || null;
}

/** Heutiges Datum in Berlin, YYYY-MM-DD — das Salz wechselt um Mitternacht deutscher Zeit. */
export const heuteBerlin = (jetzt = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(jetzt);
