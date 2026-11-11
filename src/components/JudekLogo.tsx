/**
 * Logo des Bauherrn, Judek Projekt GmbH — Originaldatei aus public/logo/.
 */
export function JudekLogo({ className = "judek-logo" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src="/logo/judek-projekt.jpg" width={1586} height={700} alt="Judek Projekt GmbH" />
  );
}
