# Hohe Straße, Hohenhameln

Vermarktungsseite für die Objekte in der Hohen Straße, mit einem kleinen
Vertriebs-Backend: Anfragen landen als Leads in Supabase, das Team ruft sie
unter `/admin` ab, führt Status und Verlauf und exportiert sie als CSV.

| | |
|---|---|
| Seite | Next.js 15 (App Router), statisch, wo es geht |
| Leads, Anmeldung | Supabase (eigenes Projekt, Region EU) |
| Hosting | Vercel, Region `fra1` (siehe `vercel.json`) |
| E-Mail (optional) | Resend — Benachrichtigung ans Team, Eingangsbestätigung an Interessent:innen |

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

Alles steht in `src/lib/objekte.ts`. Ändern, committen, pushen — Vercel
deployt `main` automatisch. Ein Objekt auf `status: "reserviert"` oder
`"verkauft"` setzen, statt es zu löschen: Leads verweisen über den `slug`
darauf, und der Link in alten Anzeigen soll weiter funktionieren.

Alles mit **TODO** ist Platzhalter — Texte, Preise, Flächen, Energiewerte,
Kontaktdaten, Impressum und Datenschutz. Vor dem Livegang ersetzen.

## Einrichten

### 1. Supabase

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

Bei Resend die Absenderdomain verifizieren, `RESEND_API_KEY`, `MAIL_ABSENDER`
und `LEAD_BENACHRICHTIGUNG_AN` setzen. Ohne Schlüssel wird jede Anfrage
trotzdem gespeichert, nur ohne Mail.

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
