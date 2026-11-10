/**
 * Logo des Bauherrn, Judek Projekt GmbH — als SVG nachgezeichnet: Bogen aus
 * grünen Punkten, darunter der Schriftzug in Grau. Sobald die Originaldatei
 * vorliegt, durch diese ersetzen (public/logo/), die Schrift hier ist eine
 * Annäherung.
 */
const PUNKTE: [number, number, number, number][] = [
  [1018, 230, 73, 43], [1083, 128, 55, 29], [1178, 73, 43, 19], [1283, 53, 31, 11], [1373, 66, 22, 8],
  [1443, 100, 23, 9], [1490, 148, 31, 11], [1508, 224, 43, 19], [1481, 322, 55, 29], [1358, 426, 73, 43],
];

export function JudekLogo({ className = "judek-logo" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1580 680" role="img" aria-label="Judek Projekt GmbH">
      {PUNKTE.map(([cx, cy, rx, ry]) => <ellipse key={cx} cx={cx} cy={cy} rx={rx} ry={ry} fill="#bdd032" />)}
      <text
        x="25" y="530" textLength="1270" lengthAdjust="spacingAndGlyphs" fill="#939598"
        style={{ font: "800 280px var(--font-sans), Arial, sans-serif", letterSpacing: "-0.02em" }}
      >
        JUDEK
      </text>
      <text
        x="40" y="655" textLength="1250" lengthAdjust="spacing" fill="#939598"
        style={{ font: "400 118px var(--font-sans), Arial, sans-serif" }}
      >
        Projekt GmbH
      </text>
    </svg>
  );
}
