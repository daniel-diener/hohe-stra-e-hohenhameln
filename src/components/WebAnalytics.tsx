"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics — ohne Cookies. Wie der eigene Besuchszähler: kein
 * Vertriebsbereich, und wer „Do Not Track" oder Global Privacy Control
 * eingeschaltet hat, wird nicht erfasst (so steht es in der Datenschutzerklärung).
 */
export function WebAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (new URL(event.url).pathname.startsWith("/admin")) return null;
        const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
        if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return null;
        return event;
      }}
    />
  );
}
