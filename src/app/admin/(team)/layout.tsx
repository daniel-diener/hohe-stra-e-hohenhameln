import Link from "next/link";
import { teamMitglied } from "@/lib/supabase-server";

export const metadata = { title: "Vertrieb", robots: { index: false, follow: false } };

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const mitglied = await teamMitglied();

  if (!mitglied) {
    return (
      <main className="abschnitt">
        <div className="breite schmal">
          <h1>Kein Zugang</h1>
          <p>Dieses Konto ist angemeldet, gehört aber nicht zum Vertriebsteam.</p>
          <form action="/admin/abmelden" method="post"><button className="knopf">Abmelden</button></form>
        </div>
      </main>
    );
  }

  return (
    <div className="admin">
      <div className="admin-leiste">
        <div className="breite">
          <nav>
            <Link href="/admin">Leads</Link>
            <a href="/admin/export">CSV-Export</a>
          </nav>
          <form action="/admin/abmelden" method="post">
            <span className="klein">{mitglied.name}</span>{" "}
            <button className="knopf-link">Abmelden</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
