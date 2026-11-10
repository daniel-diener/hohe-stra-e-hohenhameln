import { projekt } from "@/lib/objekte";

/**
 * Bildzeichen: das Haus selbst, in einer Linie — zwei Vollgeschosse, darauf das
 * zurückgesetzte Staffelgeschoss und daneben die Dachterrasse mit Geländer. Kein Kürzel, kein
 * Kasten; es zeigt, was verkauft wird.
 */
export function Hauszeichen({ size = 34 }: { size?: number }) {
  return (
    <svg className="hauszeichen" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M2.5 28h27" />
      <path d="M4.5 28V14h23v14" />
      <path d="M4.5 14V6h14v8" />
      <path d="M21.5 14v-3.5h6v3.5M24.5 10.5V14" opacity="0.55" />
      <path d="M4.5 21h23" opacity="0.4" />
      <path d="M14 28v-4h4v4" />
    </svg>
  );
}

/** Zeichen, Name und Ort. */
export function Logo() {
  return (
    <span className="logo">
      <Hauszeichen />
      <span className="logo-text">
        <span className="logo-name">{projekt.name}</span>
        <span className="logo-zusatz">
          {projekt.ort}
        </span>
      </span>
    </span>
  );
}
