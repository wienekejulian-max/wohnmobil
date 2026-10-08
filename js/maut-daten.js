// Mautdaten für den Rechner.
// Einmal im Jahr vor der Reisesaison prüfen und hier anpassen.
// ACHTUNG: Alle Werte sind noch grobe Beispielwerte und NICHT geprüft.
// Die gleichen Preise stehen auch in den Tabellen der Länderseiten (laender/*/index.html).

window.MAUT_DATEN = {
  stand: "Entwurf, ungeprüft",
  chfInEuro: 1.07, // grober Umrechnungskurs

  at: {
    name: "Österreich", code: "A",
    // bis 3,5 t: Vignette (Preis in €)
    vignette: { tag1: 9.0, tag10: 12.8, monat2: 32.0, jahr: 106.8 },
    // über 3,5 t: GO-Maut in € pro km, Euro 6
    goMaut: { achsen2: 0.26, achsen3: 0.36 },
    goBoxGebuehr: 5.0,
    hinweisSondermaut: "Sondermaut extra, z. B. Brenner (A13) ca. 11,50 € pro Fahrt."
  },

  ch: {
    name: "Schweiz", code: "CH",
    vignetteChf: 40, // bis 3,5 t, pro Jahr
    psva: { proTagChf: 3.25, mindestChf: 32.5 } // über 3,5 t
  },

  fr: {
    name: "Frankreich", code: "F",
    // € pro km je Mautklasse
    klassen: { 1: 0.10, 2: 0.15, 3: 0.22, 4: 0.30 }
  },

  it: {
    name: "Italien", code: "I",
    // € pro km je Mautklasse
    klassen: { A: 0.07, B: 0.08, 3: 0.10 }
  }
};
