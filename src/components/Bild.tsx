import Image from "next/image";

/** Foto oder, solange keines da ist, eine ruhige Fläche mit dem Titel. */
export function Bild({ bild, titel, gross = false }: { bild?: { src: string; alt: string }; titel: string; gross?: boolean }) {
  return (
    <div className={`bild ${gross ? "gross" : ""}`}>
      {bild ? (
        <Image src={bild.src} alt={bild.alt} fill sizes={gross ? "(max-width: 900px) 100vw, 900px" : "(max-width: 700px) 100vw, 400px"} />
      ) : (
        <span className="bild-platzhalter" aria-hidden="true">{titel}</span>
      )}
    </div>
  );
}

/** Ein Grundriss: ganz zeigen, nie beschneiden — ein halber Plan lügt. */
export function Plan({ src, alt, breite, hoehe, sizes }: { src: string; alt: string; breite: number; hoehe: number; sizes: string }) {
  return (
    <div className="plan">
      <Image src={src} alt={alt} width={breite} height={hoehe} sizes={sizes} />
    </div>
  );
}
