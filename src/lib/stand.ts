import type { Objekt, ObjektStatus } from "./objekte";

const RANG: Record<ObjektStatus, number> = { verfuegbar: 0, reserviert: 1, verkauft: 2 };

/**
 * Grundstand aus objekte.ts und Stand aus den Leads zusammenführen: Es gilt
 * der stärkere. So bleiben Verkäufe ohne Lead im System stehen, und ein Lead
 * auf „reserviert“ macht eine freie Wohnung zur reservierten.
 */
export function mitStand(basis: Objekt[], stand: Map<string, ObjektStatus>): Objekt[] {
  return basis.map((o) => {
    const lead = stand.get(o.slug);
    return lead && RANG[lead] > RANG[o.status] ? { ...o, status: lead } : o;
  });
}
