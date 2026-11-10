"use client";

export function DruckKnopf() {
  return (
    <button type="button" className="knopf cta" onClick={() => window.print()}>
      Als PDF speichern
    </button>
  );
}
