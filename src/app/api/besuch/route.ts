import { createHash, randomBytes } from "node:crypto";
import { geraetAus, herkunftAus, heuteBerlin, istBot, kennung, zaehlbarerPfad } from "@/lib/besuch";
import { supabaseDienst } from "@/lib/supabase-server";

/**
 * Nimmt einen Seitenaufruf entgegen (navigator.sendBeacon aus Besuchszaehler).
 * Keine Cookies, keine IP-Adresse in der Datenbank: Besucher werden nur über
 * einen Hash mit täglich wechselndem Salz gezählt, das am Folgetag gelöscht
 * wird. Antwortet immer leer — ein Fehler hier darf niemanden stören.
 */
const LEER = new Response(null, { status: 204 });

/** Rohdaten werden nach dieser Zeit gelöscht (Datenschutzerklärung, Abschnitt 4). */
const AUFBEWAHRUNG_TAGE = 400;

let salzCache: { tag: string; salz: string } | null = null;

async function tagesSalz(db: ReturnType<typeof supabaseDienst>, tag: string) {
  if (salzCache?.tag === tag) return salzCache.salz;
  const { data } = await db.from("besuch_salz").select("salz").eq("tag", tag).maybeSingle();
  let salz = data?.salz as string | undefined;
  if (!salz) {
    // Neuer Tag: Salz anlegen (bei gleichzeitigen Aufrufen gewinnt das erste),
    // alte Salze und abgelaufene Rohdaten löschen.
    await db.from("besuch_salz").upsert({ tag, salz: randomBytes(32).toString("hex") }, { onConflict: "tag", ignoreDuplicates: true });
    const neu = await db.from("besuch_salz").select("salz").eq("tag", tag).single();
    salz = neu.data?.salz as string;
    await db.from("besuch_salz").delete().lt("tag", tag);
    const grenze = new Date(Date.now() - AUFBEWAHRUNG_TAGE * 86_400_000).toISOString();
    await db.from("besuche").delete().lt("zeit", grenze);
  }
  salzCache = { tag, salz };
  return salz;
}

export async function POST(req: Request) {
  if (!process.env.SUPABASE_SECRET_KEY) return LEER;
  const ua = req.headers.get("user-agent") ?? "";
  if (istBot(ua)) return LEER;

  let daten: Record<string, unknown>;
  try {
    daten = JSON.parse(await req.text());
  } catch {
    return LEER;
  }
  const pfad = zaehlbarerPfad(daten.pfad);
  if (!pfad) return LEER;

  try {
    const db = supabaseDienst();
    const tag = heuteBerlin();
    const salz = await tagesSalz(db, tag);
    const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "").split(",")[0].trim();
    const besucher = createHash("sha256").update(`${salz}|${ip}|${ua}`).digest("hex").slice(0, 16);
    const land = req.headers.get("x-vercel-ip-country");

    await db.from("besuche").insert({
      pfad,
      herkunft: herkunftAus(daten.referrer, req.headers.get("host")),
      utm_source: kennung(daten.utm_source),
      utm_medium: kennung(daten.utm_medium),
      utm_campaign: kennung(daten.utm_campaign),
      geraet: geraetAus(ua),
      land: land && /^[A-Z]{2}$/.test(land) ? land : null,
      besucher,
    });
  } catch (e) {
    console.error("Besuch nicht gezählt:", e);
  }
  return LEER;
}
