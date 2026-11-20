import { zipSync } from "fflate";
import { NextResponse, type NextRequest } from "next/server";
import { dokumente } from "@/lib/dokumente";
import { pdfsErzeugen } from "@/lib/pdf";
import { teamMitglied } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Alle Exposés als ZIP. PDFs sind schon komprimiert — im ZIP nur abgelegt (level 0). */
export async function GET(req: NextRequest) {
  if (!(await teamMitglied())) return new NextResponse("Kein Zugang", { status: 403 });
  const liste = dokumente();

  try {
    const pdfs = await pdfsErzeugen(req.nextUrl.origin, req.cookies.getAll(), liste);
    const zip = zipSync(Object.fromEntries(liste.map((d, i) => [d.datei, pdfs[i]])), { level: 0 });
    const datum = new Date().toISOString().slice(0, 10);
    return new NextResponse(Buffer.from(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="exposes-hohe-strasse-${datum}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (fehler) {
    console.error("ZIP fehlgeschlagen", fehler);
    return new NextResponse("Exposés konnten nicht erzeugt werden", { status: 500 });
  }
}
