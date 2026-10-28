/**
 * CSV für Excel in deutscher Einstellung: Semikolon als Trenner und ein BOM
 * vorne, sonst zeigt Excel Umlaute als Zeichensalat.
 */
export function alsCsv(kopf: string[], zeilen: (string | number | boolean | null | undefined)[][]): string {
  const zelle = (wert: string | number | boolean | null | undefined) => {
    let s = wert === null || wert === undefined ? "" : String(wert);
    // Eine Zelle, die mit = + - @ beginnt, führt Excel als Formel aus.
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const zeile = (werte: (string | number | boolean | null | undefined)[]) => werte.map(zelle).join(";");
  return "﻿" + [zeile(kopf), ...zeilen.map(zeile)].join("\r\n") + "\r\n";
}
