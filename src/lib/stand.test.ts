import { describe, expect, it } from "vitest";
import { objekte, type ObjektStatus } from "./objekte";
import { mitStand } from "./stand";

const status = (liste: typeof objekte, slug: string) => liste.find((o) => o.slug === slug)!.status;

describe("mitStand", () => {
  it("macht eine freie Wohnung mit reserviertem Lead zur reservierten", () => {
    const frei = objekte.find((o) => o.status === "verfuegbar")!;
    const liste = mitStand(objekte, new Map<string, ObjektStatus>([[frei.slug, "reserviert"]]));
    expect(status(liste, frei.slug)).toBe("reserviert");
  });

  it("stuft nie herunter: verkauft bleibt verkauft", () => {
    const verkauft = objekte.find((o) => o.status === "verkauft")!;
    const liste = mitStand(objekte, new Map<string, ObjektStatus>([[verkauft.slug, "reserviert"]]));
    expect(status(liste, verkauft.slug)).toBe("verkauft");
  });

  it("lässt alles wie es ist ohne Leads", () => {
    expect(mitStand(objekte, new Map())).toEqual(objekte);
  });
});
