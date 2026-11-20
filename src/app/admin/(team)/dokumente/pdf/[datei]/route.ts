import { NextResponse, type NextRequest } from "next/server";
import { dokumentNach } from "@/lib/dokumente";
import { pdfsErzeugen } from "@/lib/pdf";
import { teamMitglied } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Ein Dokument als PDF: Exposés frisch aus der Seite gedruckt (also immer mit
 * aktuellen Preisen), Vorlagen aus `vorlagen/`. Mit `?ansehen` im Browser statt als Download.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ datei: string }> }) {
  if (!(await teamMitglied())) return new NextResponse("Kein Zugang", { status: 403 });
  const dokument = dokumentNach((await params).datei);
  if (!dokument) return new NextResponse("Nicht gefunden", { status: 404 });

  try {
    const [pdf] = await pdfsErzeugen(req.nextUrl.origin, req.cookies.getAll(), [dokument]);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${req.nextUrl.searchParams.has("ansehen") ? "inline" : "attachment"}; filename="${dokument.datei}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (fehler) {
    console.error("PDF fehlgeschlagen", dokument.datei, fehler);
    return new NextResponse("PDF konnte nicht erzeugt werden", { status: 500 });
  }
}
