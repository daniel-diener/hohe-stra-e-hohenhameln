"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Meldet jeden Seitenaufruf an /api/besuch. Keine Cookies, kein Speicher im
 * Browser. Wer „Do Not Track" oder Global Privacy Control eingeschaltet hat,
 * wird gar nicht gezählt.
 *
 * Herkunft und Kampagne gelten für den ganzen Besuch: Beim Weiterklicken
 * innerhalb der Seite verschwinden die utm-Parameter aus der Adresse, darum
 * merkt sich das Modul die vom Einstieg.
 */
let einstieg: { referrer: string; utm: Record<string, string> } | null = null;

export function Besuchszaehler() {
  const pfad = usePathname();

  useEffect(() => {
    if (!pfad || pfad.startsWith("/admin")) return;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;

    if (!einstieg) {
      const p = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
        const v = p.get(k);
        if (v) utm[k] = v;
      }
      einstieg = { referrer: document.referrer, utm };
    }

    const daten = JSON.stringify({ pfad, referrer: einstieg.referrer, ...einstieg.utm });
    try {
      if (!navigator.sendBeacon?.("/api/besuch", new Blob([daten], { type: "application/json" }))) {
        fetch("/api/besuch", { method: "POST", body: daten, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [pfad]);

  return null;
}
