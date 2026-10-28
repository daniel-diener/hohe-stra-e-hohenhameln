export const metadata = { title: "Datenschutz" };

// TODO: Entwurf — vor dem Livegang prüfen lassen und Verantwortliche eintragen.
// Was hier steht, muss zu dem passen, was die Seite tatsächlich tut.
export default function Datenschutz() {
  return (
    <main className="abschnitt">
      <div className="breite text">
        <h1>Datenschutzerklärung</h1>

        <h2>Verantwortlich</h2>
        <p>TODO: Name, Anschrift, E-Mail.</p>

        <h2>Anfrageformular</h2>
        <p>
          Wenn Sie uns über das Formular schreiben, speichern wir Ihren Namen, Ihre E-Mail-Adresse,
          optional Ihre Telefonnummer, Ihre Angaben zu Kaufzweck und Finanzierung, Ihre Nachricht,
          den Zeitpunkt Ihrer Einwilligung sowie die Seite, über die Sie zu uns gekommen sind.
          Wir verwenden diese Angaben, um Ihre Anfrage zu beantworten und Sie zum angefragten Objekt
          zu beraten (Art. 6 Abs. 1 lit. b DSGVO).
        </p>
        <p>
          Die Daten werden bei Supabase (Supabase Inc., Rechenzentrum in der EU) gespeichert; die
          Website wird bei Vercel Inc. betrieben. Benachrichtigungs-E-Mails versenden wir über
          Resend. Mit allen Anbietern bestehen Verträge zur Auftragsverarbeitung. TODO: prüfen,
          Standardvertragsklauseln für US-Anbieter nennen.
        </p>
        <p>
          Wir löschen Ihre Angaben, sobald sie für die Vermarktung nicht mehr erforderlich sind,
          spätestens TODO Monate nach Abschluss des Verkaufs, sofern keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>

        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer
          Aufsichtsbehörde. Schreiben Sie uns dazu an TODO.
        </p>

        <h2>Server-Protokolle</h2>
        <p>
          Beim Aufruf der Seite verarbeitet unser Hoster technisch notwendige Daten (IP-Adresse,
          Zeitpunkt, aufgerufene Seite) zur Auslieferung und Absicherung der Website
          (Art. 6 Abs. 1 lit. f DSGVO). Wir setzen keine Tracking-Cookies.
        </p>
      </div>
    </main>
  );
}
