# Hohe Straße, Hohenhameln

Vermarktungsseite für die Objekte in der Hohen Straße, mit einem kleinen
Vertriebs-Backend: Anfragen landen als Leads in Supabase, das Team ruft sie
unter `/admin` ab, führt Status und Verlauf und exportiert sie als CSV.

| | |
|---|---|
| Seite | Next.js 15 (App Router), statisch, wo es geht |
| Leads, Anmeldung | Supabase (eigenes Projekt, Region EU) |
| Hosting | Vercel, Region `fra1` (siehe `vercel.json`) |
| E-Mail (optional) | IONOS-Postfach per SMTP — Benachrichtigung ans Team, Eingangsbestätigung an Interessent:innen |

## Was wo steht

```
src/lib/objekte.ts        Projekt und Objekte — HIER werden Inhalte gepflegt
public/objekte/<slug>/    Fotos je Objekt
src/app/page.tsx          Startseite: Objekte, Lage, Anfrage
src/app/objekte/[slug]    Objektseite mit Anfrageformular
src/app/aktionen.ts       Speichert eine Anfrage (Server Action)
src/lib/anfrage.ts        Prüft das Formular, Spamschutz (Honigtopf + Mindestzeit)
src/app/admin/            Vertrieb: Anmeldung, Leads, Lead-Detail, CSV-Export
supabase/migrations/      Schema und Zeilensicherheit
```

## Objekte pflegen

Alles steht in `src/lib/objekte.ts` — 16 Wohnungen, Werte aus dem Exposé
(04/2026). `npm test` rechnet für jede Wohnung nach, ob Räume plus halber
Freisitz die angegebene Wohnfläche ergeben. Grundrisse liegen unter
`public/grundrisse/` (aus dem Exposé geschnitten), Visualisierungen unter
`public/projekt/`. Ändern, committen, pushen — Vercel
deployt `main` automatisch. Ein Objekt auf `status: "reserviert"` oder
`"verkauft"` setzen, statt es zu löschen: Leads verweisen über den `slug`
darauf, und der Link in alten Anzeigen soll weiter funktionieren.

Reservierte Wohnungen (`status: "reserviert"`) bekommen auf Karte und
Objektseite automatisch das Schild „Reserviert" über dem Grundriss.
Fertigstellung, Ab-Preis und Ansprechpartnerin (Lena Mylin) stehen oben in
`projekt` und erscheinen von dort überall auf der Seite und in den Mails.

Kaufpreise (Wohnungen und Stellplätze, ohne Verkaufsstand) liegen in Supabase in `preise_wohnungen`
und `stellplaetze` (nur fürs Team lesbar, Quelle: Kaufpreisliste vom 15.09.2026);
das Wohnungs-Exposé unter `/admin/expose/<slug>` liest sie von dort.

Im Admin unter **Dokumente** (`/admin/dokumente`) liegen die Reservierungsvereinbarung
(Vorlage, `vorlagen/` — bewusst nicht in `public/`) und alle Exposés als PDF,
einzeln oder zusammen als ZIP. Die Exposé-PDFs werden bei jedem Klick frisch
aus den Exposé-Seiten gedruckt (`src/lib/pdf.ts`, Chromium aus `@sparticuz/chromium`),
sind also immer auf dem aktuellen Stand. Lokal auf macOS/Windows dafür `CHROMIUM_PATH`
auf ein installiertes Chrome setzen, z. B.
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

### Unterlagen für einen Kunden online bereitstellen

Im Lead unter **Unterlagen online bereitstellen** Exposés (und ggf. die
Reservierungsvereinbarung) anhaken, Laufzeit wählen, *Freigabe erstellen*.
Die PDFs werden dabei einmal gedruckt und im privaten Supabase-Bucket
`freigaben` abgelegt (Stand vom Tag der Freigabe). Das Team bekommt einmalig:

- einen Link `/unterlagen/<token>` (192 Bit Zufall, nicht zu erraten) und
- einen Zugangscode (`XXXXX-XXXXX`). Gespeichert wird nur sein scrypt-Hash —
  geht er verloren, im Lead *Neuer Code*.

Link und Code auf getrennten Wegen weitergeben (Link per Mail — auf Wunsch direkt
aus dem Formular, ohne Code —, Code am Telefon/SMS). Nach 10 falschen Codes ist
der Link gesperrt, bis das Team einen neuen Code erzeugt. *Widerrufen* schaltet
den Link sofort ab und löscht die PDFs; beim Löschen eines Leads gehen sie mit.
Der erste Abruf erscheint im Verlauf des Leads.

Die Seiten sind nicht indexierbar: `noindex` als Meta-Tag und als
`X-Robots-Tag`-Header (`next.config.ts`), `Disallow: /unterlagen` in der
robots.txt, kein Referrer, `Cache-Control: private, no-store`. Voraussetzung:
Migration `0009_freigaben.sql` (Tabelle, Bucket, Policies).

Alles mit **TODO** fehlt noch — Energieausweis, Provision,
Kontaktdaten, Impressum und Datenschutz. Vor dem Livegang ersetzen.

## Einrichten

### 1. Supabase

> **Eingerichtet (11/2026):** Projekt `hohe-strasse-hohenhameln`, Ref
> `pkhsnivsksnjtzjkhica`, Region Frankfurt, Organisation „ld-projects".
> Migrationen 0001 und 0002 sind eingespielt, Selbstregistrierung ist aus,
> Lena Mylin und Daniel Diener stehen in `team`. Die drei Supabase-Variablen
> sind in Vercel (Production) gesetzt. Die Schritte unten gelten für ein neues Projekt.

1. Neues Projekt anlegen, Region **Frankfurt (eu-central-1)**.
2. SQL-Editor → Inhalt von `supabase/migrations/0001_leads.sql` ausführen
   (oder `supabase db push` mit der CLI).
3. Authentication → Sign In / Providers: **„Allow new users to sign up" ausschalten.**
   Konten gibt es nur auf Einladung.
4. Authentication → Users → *Add user*: Konto für jede Person im Vertrieb anlegen.
5. Diese Person ins Team eintragen — ohne den Eintrag sieht sie keine Leads:
   ```sql
   insert into team (user_id, name)
   select id, 'Daniel Diener' from auth.users where email = 'hello@daniel-diener.de';
   ```

### 2. Vercel

1. *Add New → Project* → dieses Repo importieren. Framework wird erkannt.
2. Umgebungsvariablen aus `.env.example` eintragen (Production und Preview).
   `SUPABASE_SECRET_KEY` **nie** mit `NEXT_PUBLIC_` beginnen lassen.
3. Deploy. Danach die eigene Domain unter *Settings → Domains* verbinden und
   `SITE_URL` darauf setzen.

### 3. E-Mail (optional)

Versand über das IONOS-Postfach `hohe-strasse@judek-projekt.de` (smtp.ionos.de, Port 587).
`SMTP_PASSWORT` und `LEAD_BENACHRICHTIGUNG_AN` setzen. Ohne Passwort wird jede
Anfrage trotzdem gespeichert, nur ohne Mail.

## Entwicklung

```bash
npm install
cp .env.example .env.local   # Werte eintragen
npm run dev                  # http://localhost:3000
npm test
npm run typecheck
```

## Sicherheit in einem Absatz

Öffentlich erreichbar ist nur das Schreiben einer Anfrage, und auch das nur
über den Server: Die Tabelle `leads` hat für anonyme Zugriffe keine einzige
Policy. Lesen, Ändern und Löschen darf nur, wer angemeldet ist **und** in
`team` steht — das prüft die Datenbank selbst (RLS), nicht nur die Seite.
