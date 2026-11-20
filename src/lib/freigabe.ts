import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Freigaben: Unterlagen für einen Kunden unter /unterlagen/<token>, zusätzlich
 * mit Zugangscode geschützt. Hier nur das Rechnen — kein Netz, keine Datenbank —,
 * damit es sich testen lässt.
 *
 *   * Token: 24 Zufallsbytes (192 Bit), base64url — nicht zu erraten, nicht aufzuzählen.
 *   * Code: 10 Zeichen ohne Verwechsler (0/O, 1/I/L), etwa 50 Bit. Mit der Sperre
 *     nach 10 Fehlversuchen reicht das weit; am Telefon lässt er sich gut diktieren.
 *   * In der Datenbank steht nur der scrypt-Hash des Codes.
 *   * Nach richtiger Eingabe merkt sich der Browser ein Cookie mit einem HMAC über
 *     Freigabe und Code-Hash. Ein neuer Code macht alte Cookies damit ungültig.
 */

export type FreigabeDatei = { datei: string; titel: string };

export type Freigabe = {
  id: string;
  lead_id: string;
  token: string;
  code_hash: string;
  dateien: FreigabeDatei[];
  gueltig_bis: string;
  widerrufen_at: string | null;
  fehlversuche: number;
  abrufe: number;
  zuletzt_abgerufen_at: string | null;
  created_at: string;
};

export const BUCKET = "freigaben";
export const MAX_FEHLVERSUCHE = 10;
export const GUELTIGKEIT_TAGE = [7, 14, 30, 60] as const;

export const TOKEN = /^[A-Za-z0-9_-]{32}$/;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function neuerToken() {
  return randomBytes(24).toString("base64url");
}

/** „K7MQ2-XR9PA“ — der Bindestrich dient nur dem Lesen. */
export function neuerCode() {
  const z = Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${z.slice(0, 5)}-${z.slice(5)}`;
}

/** Was jemand eintippt: Groß/klein, Leerzeichen und Bindestriche egal. */
export function codeNormalisieren(eingabe: string) {
  return eingabe.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function codeHash(code: string) {
  const salz = randomBytes(16);
  const hash = scryptSync(codeNormalisieren(code), salz, 32);
  return `scrypt$${salz.toString("base64url")}$${hash.toString("base64url")}`;
}

export function codePruefen(eingabe: string, gespeichert: string) {
  const [art, salz, hash] = gespeichert.split("$");
  if (art !== "scrypt" || !salz || !hash) return false;
  const soll = Buffer.from(hash, "base64url");
  const ist = scryptSync(codeNormalisieren(eingabe), Buffer.from(salz, "base64url"), soll.length);
  return timingSafeEqual(ist, soll);
}

function geheimnis() {
  const g = process.env.FREIGABE_GEHEIMNIS || process.env.SUPABASE_SECRET_KEY;
  if (!g) throw new Error("FREIGABE_GEHEIMNIS oder SUPABASE_SECRET_KEY fehlt");
  return g;
}

/** Wert des Cookies, das nach richtigem Code den Zugang hält. */
export function sitzungsWert(f: Pick<Freigabe, "id" | "code_hash">, schluessel = geheimnis()) {
  return createHmac("sha256", `freigabe:${schluessel}`).update(`${f.id}:${f.code_hash}`).digest("base64url");
}

export function sitzungPruefen(wert: string | undefined, f: Pick<Freigabe, "id" | "code_hash">, schluessel = geheimnis()) {
  if (!wert) return false;
  const soll = Buffer.from(sitzungsWert(f, schluessel));
  const ist = Buffer.from(wert);
  return ist.length === soll.length && timingSafeEqual(ist, soll);
}

export const cookieName = (f: Pick<Freigabe, "id">) => `unterlagen-${f.id.slice(0, 8)}`;

/** Warum ein Link nicht (mehr) geht — oder null, wenn er gilt. */
export function sperrgrund(f: Pick<Freigabe, "gueltig_bis" | "widerrufen_at" | "fehlversuche">, jetzt = new Date()) {
  if (f.widerrufen_at) return "widerrufen" as const;
  if (new Date(f.gueltig_bis) <= jetzt) return "abgelaufen" as const;
  if (f.fehlversuche >= MAX_FEHLVERSUCHE) return "gesperrt" as const;
  return null;
}

/** Ablageort im Bucket. */
export const speicherPfad = (freigabeId: string, datei: string) => `${freigabeId}/${datei}`;
