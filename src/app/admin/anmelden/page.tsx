"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Anmeldung mit E-Mail und Passwort. Konten legt man im Supabase-Dashboard
 * an (Authentication → Users) und trägt sie in `team` ein — eine
 * Selbstregistrierung gibt es bewusst nicht.
 */
export default function Anmelden() {
  const router = useRouter();
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function anmelden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const daten = new FormData(e.currentTarget);
    setLaeuft(true);
    setFehler(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(daten.get("email")),
      password: String(daten.get("passwort")),
    });
    setLaeuft(false);
    if (error) {
      setFehler("E-Mail oder Passwort stimmen nicht.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="abschnitt">
      <div className="breite schmal">
        <h1>Vertrieb — Anmeldung</h1>
        <form onSubmit={anmelden} className="formular">
          <label>E-Mail<input name="email" type="email" autoComplete="username" required /></label>
          <label>Passwort<input name="passwort" type="password" autoComplete="current-password" required /></label>
          {fehler && <p className="fehler" role="alert">{fehler}</p>}
          <button className="knopf" disabled={laeuft}>{laeuft ? "Anmelden …" : "Anmelden"}</button>
        </form>
      </div>
    </main>
  );
}
