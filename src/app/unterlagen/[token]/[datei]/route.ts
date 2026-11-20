import { zipSync } from "fflate";
import { NextResponse, type NextRequest } from "next/server";
import { BUCKET, type Freigabe, sperrgrund, speicherPfad } from "@/lib/freigabe";
import { freigabeNachToken, hatZugang } from "@/lib/freigabe-server";
import { supabaseDienst } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const KOPF = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

/** Zählt Abrufe; beim ersten erscheint im Lead-Verlauf, dass der Kunde die Unterlagen geholt hat. */
async function abrufMerken(f: Freigabe, was: string) {
  const supabase = supabaseDienst();
  await supabase.from("freigaben")
    .update({ abrufe: f.abrufe + 1, zuletzt_abgerufen_at: new Date().toISOString() }).eq("id", f.id);
  if (f.abrufe === 0) {
    await supabase.from("lead_aktivitaeten").insert({
      lead_id: f.lead_id, art: "notiz", text: `Kunde hat die freigegebenen Unterlagen erstmals abgerufen (${was}).`,
    });
  }
}

/** Eine freigegebene Datei, oder mit `alle.zip` alle zusammen. Nur mit gültigem Zugangs-Cookie. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string; datei: string }> }) {
  const { token, datei } = await params;
  const f = await freigabeNachToken(token);
  if (!f || sperrgrund(f) || !(await hatZugang(f))) return new NextResponse("Nicht gefunden", { status: 404, headers: KOPF });

  const liste = datei === "alle.zip" ? f.dateien : f.dateien.filter((d) => d.datei === datei);
  if (!liste.length) return new NextResponse("Nicht gefunden", { status: 404, headers: KOPF });

  const ablage = supabaseDienst().storage.from(BUCKET);
  const geladen = await Promise.all(liste.map((d) => ablage.download(speicherPfad(f.id, d.datei))));
  if (geladen.some((g) => g.error || !g.data)) {
    console.error("Freigabe: Datei fehlt", f.id, geladen.find((g) => g.error)?.error);
    return new NextResponse("Datei nicht verfügbar", { status: 500, headers: KOPF });
  }
  const inhalte = await Promise.all(geladen.map(async (g) => new Uint8Array(await g.data!.arrayBuffer())));
  await abrufMerken(f, datei === "alle.zip" ? "alle als ZIP" : liste[0].titel);

  if (datei === "alle.zip") {
    const zip = zipSync(Object.fromEntries(liste.map((d, i) => [d.datei, inhalte[i]])), { level: 0 });
    return new NextResponse(Buffer.from(zip), {
      headers: { ...KOPF, "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="unterlagen-hohe-strasse.zip"' },
    });
  }
  const art = req.nextUrl.searchParams.has("ansehen") ? "inline" : "attachment";
  return new NextResponse(Buffer.from(inhalte[0]), {
    headers: { ...KOPF, "Content-Type": "application/pdf", "Content-Disposition": `${art}; filename="${liste[0].datei}"` },
  });
}
