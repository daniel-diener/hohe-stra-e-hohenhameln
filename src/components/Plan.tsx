import Image from "next/image";
import { JudekLogo } from "./JudekLogo";
import type { ObjektStatus } from "@/lib/objekte";

/** Ein Grundriss: ganz zeigen, nie beschneiden — ein halber Plan lügt. */
export function Plan({
  src, alt, breite, hoehe, sizes, status = "verfuegbar", schild = true,
}: { src: string; alt: string; breite: number; hoehe: number; sizes: string; status?: ObjektStatus; schild?: boolean }) {
  const vergeben = status !== "verfuegbar";
  return (
    <div className={`plan ${vergeben ? "plan-reserviert" : ""}`}>
      <Image src={src} alt={alt} width={breite} height={hoehe} sizes={sizes} />
      {vergeben && schild && <StatusSchild verkauft={status === "verkauft"} />}
    </div>
  );
}

/**
 * Das Schild über dem Grundriss reservierter oder verkaufter Wohnungen:
 * „Reserviert" bzw. „Verkauft" (grün) und darunter der Bauherr. Der Plan bleibt dahinter sichtbar.
 */
function StatusSchild({ verkauft }: { verkauft: boolean }) {
  return (
    <div className="schild" aria-hidden="true">
      <div className="schild-box">
        <p className={`schild-titel ${verkauft ? "schild-verkauft" : ""}`}>
          {verkauft ? "Verkauft" : "Reserviert"}
        </p>
        <JudekLogo />
      </div>
    </div>
  );
}
