import Image from "next/image";
import { JudekLogo } from "./JudekLogo";

/** Ein Grundriss: ganz zeigen, nie beschneiden — ein halber Plan lügt. */
export function Plan({
  src, alt, breite, hoehe, sizes, reserviert = false,
}: { src: string; alt: string; breite: number; hoehe: number; sizes: string; reserviert?: boolean }) {
  return (
    <div className={`plan ${reserviert ? "plan-reserviert" : ""}`}>
      <Image src={src} alt={alt} width={breite} height={hoehe} sizes={sizes} />
      {reserviert && <ReserviertSchild />}
    </div>
  );
}

/**
 * Das Schild über dem Grundriss reservierter Wohnungen: „Reserviert" und
 * darunter der Bauherr. Der Plan bleibt dahinter sichtbar.
 */
function ReserviertSchild() {
  return (
    <div className="schild" aria-hidden="true">
      <div className="schild-box">
        <p className="schild-titel">Reserviert</p>
        <JudekLogo />
      </div>
    </div>
  );
}
