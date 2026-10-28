import Image from "next/image";

/** Ein Grundriss: ganz zeigen, nie beschneiden — ein halber Plan lügt. */
export function Plan({ src, alt, breite, hoehe, sizes }: { src: string; alt: string; breite: number; hoehe: number; sizes: string }) {
  return (
    <div className="plan">
      <Image src={src} alt={alt} width={breite} height={hoehe} sizes={sizes} />
    </div>
  );
}
