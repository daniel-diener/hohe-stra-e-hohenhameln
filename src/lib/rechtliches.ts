import { projekt } from "./objekte";

/**
 * Verantwortliche Stelle für Datenschutz (und Impressum). Eine Stelle für
 * beide Seiten, damit nichts auseinanderläuft.
 *
 * TODO: Anschrift ergänzen — ohne ladungsfähige Anschrift ist die
 * Datenschutzerklärung nicht vollständig. Steht hier `null`, zeigt die Seite
 * einen sichtbaren Hinweis statt einer erfundenen Adresse.
 */
export const verantwortlich = {
  name: projekt.ansprechpartner.name,
  zusatz: "Immobilien · Projektmanagement Hohe Straße",
  anschrift: null as null | { strasse: string; plzOrt: string },
  telefon: projekt.ansprechpartner.telefon,
  email: projekt.ansprechpartner.email,
};

/** Stand der Datenschutzerklärung — bei jeder inhaltlichen Änderung anpassen. */
export const datenschutzStand = "November 2026";
