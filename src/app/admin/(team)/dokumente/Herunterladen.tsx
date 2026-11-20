"use client";

import { useState } from "react";

/**
 * Lädt ein Dokument per fetch, damit man sieht, dass es läuft: Das PDF wird
 * erst auf Anfrage gedruckt und braucht ein paar Sekunden, das ZIP länger.
 */
export function Herunterladen({ href, datei, children, className = "knopf klein zweit" }: {
  href: string;
  datei: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [stand, setStand] = useState<"bereit" | "laeuft" | "fehler">("bereit");

  async function laden() {
    setStand("laeuft");
    try {
      const antwort = await fetch(href);
      if (!antwort.ok) throw new Error(await antwort.text());
      const url = URL.createObjectURL(await antwort.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: datei });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setStand("bereit");
    } catch {
      setStand("fehler");
    }
  }

  return (
    <button type="button" className={className} onClick={laden} disabled={stand === "laeuft"}>
      {stand === "laeuft" ? "Wird erstellt …" : stand === "fehler" ? "Fehlgeschlagen – nochmal" : children}
    </button>
  );
}
