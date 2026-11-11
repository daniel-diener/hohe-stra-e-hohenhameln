import type { Metadata } from "next";
import Link from "next/link";
import { projekt } from "@/lib/objekte";
import { anbieter as v, datenschutzStand } from "@/lib/rechtliches";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" } };

/**
 * Datenschutzerklärung. Beschreibt genau, was diese Seite tut — wer am Code
 * etwas ändert (neuer Dienst, Analyse, Karte, Video), muss hier nachziehen:
 *
 *   Hosting           Vercel, Region Frankfurt (vercel.json)
 *   Anfragen          Supabase, Region Frankfurt (README)
 *   E-Mails           Resend (lib/mail.ts), nur wenn RESEND_API_KEY gesetzt
 *   Schriften         Geist, mit dem Build ausgeliefert — kein Google Fonts
 *   Cookies           öffentlich keine; im Vertriebsbereich nur Anmeldung
 *   Statistik         eigene, ohne Cookies (api/besuch, Migration 0003)
 *   Web Analytics     Vercel, ohne Cookies (components/WebAnalytics.tsx)
 *   Fremd-Tracking    keins
 */
export default function Datenschutz() {
  return (
    <main className="abschnitt">
      <div className="breite text">
        <p className="eyebrow">Stand: {datenschutzStand}</p>
        <h1>Datenschutzerklärung</h1>
        <p className="leise gross-text">
          Wir verarbeiten Ihre Daten nur, soweit es für diese Website und Ihre Anfrage zu den Wohnungen
          {" "}{projekt.name}, {projekt.ort} nötig ist. Wir setzen keine Werbe- oder Analyse-Cookies ein und
          verfolgen Ihr Verhalten nicht über andere Websites hinweg.
        </p>

        <h2>1. Verantwortliche Stelle</h2>
        <p>
          <strong>{v.firma}</strong><br />
          {v.strasse}<br />
          {v.plzOrt}<br />
          {v.geschaeftsfuehrer && <>Geschäftsführung: {v.geschaeftsfuehrer}<br /></>}
          Telefon: <a href={`tel:${v.telefon.replace(/\s/g, "")}`}>{v.telefon}</a><br />
          E-Mail: <a href={`mailto:${v.email}`}>{v.email}</a>
        </p>
        <p>
          Bei allen Fragen zum Datenschutz und zur Ausübung Ihrer Rechte erreichen Sie uns unter dieser
          Adresse. Eine Pflicht zur Benennung eines Datenschutzbeauftragten besteht für uns nicht.
        </p>

        <h2>2. Aufruf der Website und Hosting</h2>
        <p>
          Die Website wird bei der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA,
          betrieben und aus einem Rechenzentrum in Frankfurt am Main ausgeliefert. Bei jedem Aufruf
          verarbeitet der Hoster technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene
          Seite, übertragene Datenmenge, Referrer-URL sowie Browser und Betriebssystem. Diese Daten
          werden benötigt, um die Seite auszuliefern, ihre Stabilität und Sicherheit zu gewährleisten
          und Angriffe abzuwehren. Sie werden nicht mit anderen Daten zusammengeführt und nach kurzer
          Zeit automatisch gelöscht.
        </p>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und funktionsfähigen
          Website (Art. 6 Abs. 1 lit. f DSGVO). Mit Vercel besteht ein Vertrag zur
          Auftragsverarbeitung (Art. 28 DSGVO). Vercel ist nach dem EU-US Data Privacy Framework
          zertifiziert; damit besteht für eine etwaige Übermittlung in die USA ein
          Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO), ergänzend gelten
          EU-Standardvertragsklauseln.
        </p>
        <p>
          Bilder werden über die Bildoptimierung von Vercel in passender Größe ausgeliefert. Die
          verwendeten Schriften sind Teil der Website und werden von unserem Server geladen. Es findet
          keine Verbindung zu Google Fonts oder anderen Schriftanbietern statt.
        </p>

        <h2>3. Cookies und lokale Speicherung</h2>
        <p>
          Auf den öffentlichen Seiten setzen wir <strong>keine Cookies</strong> und speichern nichts in
          Ihrem Browser. Wir verwenden keine Analyse-, Tracking- oder Werbedienste Dritter, keine Social-Media-Plugins
          und keine eingebetteten Karten oder Videos Dritter. Unsere eigene, cookielose Besucherstatistik
          beschreibt Abschnitt 4.
        </p>
        <p>
          Nur im geschützten Vertriebsbereich (<code>/admin</code>), der unserem Team vorbehalten ist,
          werden technisch notwendige Cookies für die Anmeldung gesetzt (§ 25 Abs. 2 Nr. 2 TDDDG,
          Art. 6 Abs. 1 lit. f DSGVO). Besucherinnen und Besucher der Website sind davon nicht betroffen.
        </p>

        <h2>4. Besucherstatistik</h2>
        <p>
          Um zu verstehen, wie die Website genutzt wird (welche Wohnungen gefragt sind und ob Besucher etwa über
          ein Bauschild, eine Anzeige oder eine Suchmaschine kommen), zählen wir Seitenaufrufe mit einer eigenen
          Statistik. Sie läuft vollständig auf unseren Systemen; es werden <strong>keine Cookies</strong> gesetzt,
          nichts in Ihrem Browser gespeichert und keine Daten an Dritte gegeben.
        </p>
        <p>
          Gespeichert werden je Aufruf: die aufgerufene Seite, Datum und Uhrzeit, der Name der Website, von der
          Sie gekommen sind (nur der Domainname, z. B. „google.com“), gegebenenfalls eine Kampagnenkennung aus dem
          Link, der Gerätetyp (Smartphone, Tablet oder Computer) und das Land, das sich aus der IP-Adresse ergibt.
          Ihre IP-Adresse selbst wird nicht gespeichert. Um Besucher zählen zu können, bildet der Server aus
          IP-Adresse, Browserkennung und einem zufälligen Wert, der jeden Tag neu erzeugt und am Folgetag gelöscht
          wird, eine verkürzte Prüfsumme. Danach lässt sich daraus niemand mehr ermitteln; dieselbe Person zählt
          an jedem Tag neu. Die Statistik wird nur zusammengefasst ausgewertet, Rückschlüsse auf einzelne Personen
          ziehen wir nicht.
        </p>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse an einer bedarfsgerechten Gestaltung der Website und
          an der Erfolgsmessung unserer Werbung (Art. 6 Abs. 1 lit. f DSGVO). Da nichts auf Ihrem Gerät gespeichert
          oder ausgelesen wird, ist keine Einwilligung nach § 25 TDDDG erforderlich. Die Daten liegen bei Supabase
          in Frankfurt (siehe Abschnitt 5) und werden nach 13 Monaten gelöscht. Haben Sie in Ihrem Browser „Do Not
          Track“ oder „Global Privacy Control“ eingeschaltet, zählen wir Ihre Aufrufe nicht. Im Übrigen können Sie
          der Verarbeitung jederzeit widersprechen (Abschnitt 9).
        </p>
        <p>
          Zusätzlich nutzen wir Vercel Web Analytics unseres Hosters (Abschnitt 2). Dabei werden die aufgerufene
          Seite, die Herkunftsseite, Gerätetyp, Browser, Betriebssystem und das aus der IP-Adresse abgeleitete Land
          erfasst. Es werden keine Cookies gesetzt und keine Daten auf Ihrem Gerät gespeichert. Besucher werden über
          eine Prüfsumme aus der Anfrage gezählt, die nach 24 Stunden verworfen wird. Die IP-Adresse wird nicht
          gespeichert, ein seitenübergreifendes Profil entsteht nicht. Rechtsgrundlage, Widerspruch und die
          Ausnahme bei „Do Not Track“ oder „Global Privacy Control“ gelten wie oben; für Vercel gilt der unter
          Abschnitt 2 genannte Vertrag zur Auftragsverarbeitung.
        </p>

        <h2>5. Anfrageformular</h2>
        <p>Wenn Sie uns über das Formular schreiben, verarbeiten wir:</p>
        <ul>
          <li>Ihren Namen und Ihre E-Mail-Adresse (Pflichtangaben),</li>
          <li>freiwillig Ihre Telefonnummer, Ihre Nachricht und Ihren Rückrufwunsch,</li>
          <li>die Wohnung, für die Sie sich interessieren, sowie Ihre Angaben zu Kaufzweck und Finanzierungsstand,</li>
          <li>den Zeitpunkt Ihrer Anfrage und Ihrer Einwilligung,</li>
          <li>
            die Herkunft Ihrer Anfrage: die Seite, von der Sie zu uns gekommen sind (Referrer), und
            ggf. Kampagnenkennungen aus dem Link (sog. UTM-Parameter, z. B. „Anzeige Immobilienportal").
          </li>
        </ul>
        <p>
          Wir nutzen diese Angaben, um Ihre Anfrage zu beantworten, Ihnen das Exposé zu senden, Sie zu
          den Wohnungen zu beraten und Besichtigungen zu vereinbaren. Rechtsgrundlage ist die
          Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage (Art. 6 Abs. 1 lit. b DSGVO) sowie
          Ihre Einwilligung, die Sie mit dem Häkchen im Formular erteilen (Art. 6 Abs. 1 lit. a DSGVO).
          Ohne Name und E-Mail-Adresse können wir Ihre Anfrage nicht bearbeiten; alle weiteren Angaben
          sind freiwillig.
        </p>
        <p>
          Die Herkunftsangaben verwenden wir, um zu erkennen, welche Anzeigen und Kanäle Interessenten zu
          uns führen. Das ist unser berechtigtes Interesse an einer wirtschaftlichen Vermarktung
          (Art. 6 Abs. 1 lit. f DSGVO); ein Profil über Sie wird daraus nicht gebildet.
        </p>
        <p>
          Zum Schutz vor automatisierten Spam-Einsendungen prüft das Formular, wie lange das Ausfüllen
          gedauert hat, und enthält ein für Menschen unsichtbares Feld. Dafür wird nur der Zeitpunkt
          gespeichert, zu dem Sie die Seite geöffnet haben, keine weiteren Merkmale Ihres Geräts.
        </p>

        <h3>Speicherung der Anfragen</h3>
        <p>
          Anfragen speichern wir in einer Datenbank der Supabase Inc. (Singapur) in einem
          Rechenzentrum in Frankfurt am Main (AWS-Region eu-central-1). Zugriff haben ausschließlich
          angemeldete Mitglieder unseres Vertriebsteams; die Zugriffsrechte werden von der Datenbank
          selbst durchgesetzt. Mit Supabase besteht ein Vertrag zur Auftragsverarbeitung einschließlich
          EU-Standardvertragsklauseln (Art. 28, Art. 46 Abs. 2 lit. c DSGVO).
        </p>

        <h3>E-Mail-Benachrichtigungen</h3>
        <p>
          Über neue Anfragen informieren wir unser Team per E-Mail; auf Wunsch erhalten Sie eine
          Eingangsbestätigung. Für den Versand nutzen wir Resend (Plus Five Five, Inc., USA). Dabei werden
          Ihr Name, Ihre E-Mail-Adresse und der Inhalt der Anfrage übermittelt. Mit Resend besteht ein
          Vertrag zur Auftragsverarbeitung; die Übermittlung in die USA stützt sich auf
          EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
        </p>

        <h2>6. Kontakt per E-Mail oder Telefon</h2>
        <p>
          Wenn Sie uns direkt per E-Mail oder telefonisch kontaktieren, verarbeiten wir Ihre Angaben zur
          Bearbeitung Ihres Anliegens (Art. 6 Abs. 1 lit. b DSGVO, bei allgemeinen Anfragen
          Art. 6 Abs. 1 lit. f DSGVO). Für die Speicherdauer gilt Abschnitt 8.
        </p>

        <h2>7. Weitergabe an Dritte</h2>
        <p>
          Wir verkaufen Ihre Daten nicht und geben sie nicht zu Werbezwecken weiter. Ihre Anfrage bearbeitet
          in unserem Auftrag das Projektmanagement ({projekt.team.namen.join(" und ")}). Kommt es zu einer
          Reservierung oder einem Kauf, übermitteln wir die dafür erforderlichen Angaben an das
          beurkundende Notariat (Art. 6 Abs. 1 lit. b DSGVO). Eine
          Weitergabe an finanzierende Banken erfolgt nur auf Ihren ausdrücklichen Wunsch. Darüber hinaus
          erhalten nur die oben genannten technischen Dienstleister Zugriff, und nur soweit es für ihre
          Leistung erforderlich ist.
        </p>

        <h2>8. Speicherdauer</h2>
        <p>
          Wir speichern Ihre Anfrage, solange wir Sie zu den Wohnungen beraten, längstens jedoch
          24 Monate nach unserem letzten Kontakt mit Ihnen. Kommt es zum Kauf, bewahren wir die
          geschäftsrelevanten Unterlagen nach den handels- und steuerrechtlichen Vorschriften auf
          (§ 257 HGB, § 147 AO: sechs bzw. zehn Jahre). Widerrufen Sie Ihre Einwilligung oder
          widersprechen Sie der Verarbeitung, löschen wir Ihre Daten unverzüglich, soweit keine
          Aufbewahrungspflicht entgegensteht.
        </p>

        <h2>9. Ihre Rechte</h2>
        <p>Sie haben gegenüber uns jederzeit das Recht auf</p>
        <ul>
          <li>Auskunft über die zu Ihnen gespeicherten Daten (Art. 15 DSGVO),</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
        </ul>
        <p>
          <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Soweit wir Daten auf Grundlage unseres
          berechtigten Interesses verarbeiten (Art. 6 Abs. 1 lit. f DSGVO), können Sie dem aus Gründen,
          die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen. Eine formlose
          Nachricht an <a href={`mailto:${v.email}`}>{v.email}</a> genügt.
        </p>
        <p>
          Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren
          (Art. 77 DSGVO), etwa bei der Behörde Ihres Wohnorts oder bei der für das Projekt zuständigen
          Landesbeauftragten für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover.
        </p>

        <h2>10. Automatisierte Entscheidungen</h2>
        <p>
          Wir treffen keine ausschließlich automatisierten Entscheidungen einschließlich Profiling im
          Sinne von Art. 22 DSGVO.
        </p>

        <h2>11. Verschlüsselung</h2>
        <p>
          Die Verbindung zu dieser Website ist durchgehend per TLS verschlüsselt (erkennbar am Schloss
          in der Adresszeile). Ihre Angaben im Formular werden ausschließlich verschlüsselt übertragen.
        </p>

        <h2>12. Änderungen</h2>
        <p>
          Wir passen diese Datenschutzerklärung an, wenn sich die Website oder die Rechtslage ändert.
          Es gilt die jeweils hier veröffentlichte Fassung. Siehe auch das <Link href="/impressum">Impressum</Link>.
        </p>
      </div>
    </main>
  );
}
