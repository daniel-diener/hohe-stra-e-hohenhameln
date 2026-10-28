import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Hält die Sitzung im Admin frisch und schickt Unangemeldete zur Anmeldung.
 * Die öffentliche Seite läuft gar nicht erst hier durch (siehe `matcher`) —
 * sie braucht keine Sitzung und soll statisch ausgeliefert werden.
 *
 * Ob jemand zum Team gehört, prüft nicht die Middleware, sondern die Seite
 * und am Ende RLS: Ein Konto ohne Eintrag in `team` sieht hier nur „kein Zugang".
 */
export async function middleware(req: NextRequest) {
  // Ohne Supabase (Vorschau) gibt es keinen Vertrieb — zurück zur Startseite
  // statt eines Absturzes beim Anlegen des Clients.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.redirect(new URL("/", req.url));

  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !req.nextUrl.pathname.startsWith("/admin/anmelden")) {
    const ziel = req.nextUrl.clone();
    ziel.pathname = "/admin/anmelden";
    ziel.search = "";
    return NextResponse.redirect(ziel);
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
