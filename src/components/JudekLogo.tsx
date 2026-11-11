/**
 * Logo des Bauherrn, Judek Projekt GmbH — Originaldatei aus public/logo/.
 */
export function JudekLogo({ className = "judek-logo" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src="/logo/judek-projekt.png" width={1529} height={641} alt="Judek Projekt GmbH" />
  );
}
