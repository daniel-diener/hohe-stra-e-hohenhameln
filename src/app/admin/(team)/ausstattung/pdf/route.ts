import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { teamMitglied } from "@/lib/supabase-server";

/**
 * Die Ausstattungs-Unterlage als fertiges PDF zum Herunterladen, nur für das Team.
 * Die Datei liegt bewusst nicht in `public/`, sondern in `unterlagen/` und wird
 * mit `npm run ausstattung-pdf` aus der Seite /admin/ausstattung neu erzeugt.
 */
const DATEI = "unterlagen/ausstattung-hohe-strasse.pdf";

export async function GET() {
  const mitglied = await teamMitglied();
  if (!mitglied) return new NextResponse("Kein Zugang", { status: 403 });

  const pdf = await readFile(path.join(process.cwd(), DATEI));
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Hohe-Strasse-Hohenhameln-Materialien-und-Ausstattung.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
