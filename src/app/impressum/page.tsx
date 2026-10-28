export const metadata = { title: "Impressum" };

// TODO: Vor dem Livegang mit den echten Angaben füllen (§ 5 DDG). Bei einem
// Makler zusätzlich Erlaubnis nach § 34c GewO und die zuständige Behörde.
export default function Impressum() {
  return (
    <main className="abschnitt">
      <div className="breite text">
        <h1>Impressum</h1>
        <p>
          TODO: Name / Firma<br />
          TODO: Straße Hausnummer<br />
          TODO: PLZ Ort
        </p>
        <p>
          Telefon: TODO<br />
          E-Mail: TODO
        </p>
        <p>TODO: Vertretungsberechtigte, Registereintrag, USt-IdNr., ggf. § 34c GewO.</p>
      </div>
    </main>
  );
}
