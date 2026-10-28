import { NextResponse } from "next/server";
import { alsCsv } from "@/lib/csv";
import { finanzierungLabel, leadStatusLabel, zweckLabel } from "@/lib/labels";
import type { Lead } from "@/lib/leads";
import { objektNach } from "@/lib/objekte";
import { teamMitglied } from "@/lib/supabase-server";

export async function GET() {
  const mitglied = await teamMitglied();
  if (!mitglied) return new NextResponse("Kein Zugang", { status: 403 });

  const { data, error } = await mitglied.supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Lead[]>();
  if (error) return new NextResponse("Export fehlgeschlagen", { status: 500 });

  const csv = alsCsv(
    ["Eingang", "Name", "E-Mail", "Telefon", "Rückruf", "Objekt", "Zweck", "Finanzierung", "Status", "Nachricht"],
    data.map((l) => [
      l.created_at,
      l.name,
      l.email,
      l.telefon,
      l.rueckruf ? "ja" : "nein",
      objektNach(l.objekt_slug)?.titel ?? "Allgemein",
      zweckLabel[l.zweck],
      finanzierungLabel[l.finanzierung],
      leadStatusLabel[l.status],
      l.nachricht,
    ]),
  );

  const datum = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${datum}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
