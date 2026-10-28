import { NextResponse, type NextRequest } from "next/server";
import { supabaseSitzung } from "@/lib/supabase-server";

// POST, nicht GET: Ein Link-Vorschauer oder Prefetch soll niemanden abmelden.
export async function POST(req: NextRequest) {
  const supabase = await supabaseSitzung();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/anmelden", req.url), { status: 303 });
}
