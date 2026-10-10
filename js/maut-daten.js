// Mautdaten: die einzige Stelle, an der Preise und Regeln stehen.
// Rechner, Länderseiten und die Seite "Quellen und Stand" lesen alles von hier.
//
// Jeder Wert hat:
//   w       der Wert (Preise in € inkl. Steuer, CHF-Preise in CHF)
//   art     "amtlich"     = direkt beim Betreiber oder der Behörde abgelesen
//           "sekundaer"   = aus Automobilclub oder Fachpresse, amtlich noch gegenprüfen
//           "schaetzung"  = Durchschnitt, den wir selbst abgeleitet haben
//   q       Schlüssel der Quelle in "quellen" des Landes
//
// Pflege: siehe README.md, Abschnitt "Datenpflege".

(function () {
  const v = (w, art, q) => ({ w, art, q });

  window.MAUT_DATEN = {
    stand: "2026-10-10",
    chfInEuro: v(1.07, "schaetzung", null),

    laender: {
      at: {
        name: "Österreich", code: "A", slug: "oesterreich",
        geprueft: "2026-10-10",
        naechstePruefung: "Anfang Dezember: neue Vignette gilt ab 1. Dezember, GO-Maut und Streckenmaut ändern sich zum 1. Januar.",
        quellen: {
          asfinag: { titel: "ASFINAG: Vignettenpreise 2026, gültig ab 1.12.2025 (amtlich)", url: "https://www.asfinag.at/maut-vignette/vignette/" },
          goTarife: { titel: "GO-Maut-Tarife 2026 (go-maut.at)", url: "https://www.go-maut.at/en/paying-the-go-toll/go-toll-rates" },
          goWomo: { titel: "GO-Maut für schwere Wohnmobile (go-maut.at)", url: "https://www.go-maut.at/en/our-go-toll-system/go-toll-in-3-steps/go-toll-for-heavy-motorhomes" },
          tzgm: { titel: "ADAC: Mehr Wohnmobile brauchen die GO-Box", url: "https://www.adac.de/news/maut-oesterreich-wohnmobile/" },
          strecke: { titel: "auto motor und sport: Streckenmaut 2026", url: "https://www.auto-motor-und-sport.de/verkehr/brenner-und-tauern-autobahn-und-co-ab-2026-hoehere-streckenmaut/" }
        },
        vignette: {
          tag1: v(9.60, "amtlich", "asfinag"),
          tag10: v(12.80, "amtlich", "asfinag"),
          monat2: v(32.00, "amtlich", "asfinag"),
          jahr: v(106.80, "amtlich", "asfinag")
        },
        // € pro km inkl. 20 % USt, Euro 6, CO2-Klasse 1 (Nettotarif × 1,2)
        goMaut: {
          achsen2: v(0.333, "amtlich", "goTarife"),
          achsen3: v(0.463, "amtlich", "goTarife"),
          achsen4: v(0.687, "amtlich", "goTarife")
        },
        goBoxGebuehr: v(12.00, "amtlich", "goWomo"),
        // Maßgeblich ist die technisch zulässige Gesamtmasse (F.1), nicht F.2.
        // Übergang: vor dem Stichtag zugelassen und auf 3,5 t abgelastet (F.2) => noch Vignette.
        regelTzgm: {
          grenze: v(3.5, "amtlich", "goWomo"),
          stichtagErstzulassung: v("2023-12-01", "sekundaer", "tzgm"),
          uebergangBis: v("2029-01-31", "sekundaer", "tzgm")
        },
        streckenmaut: {
          brenner: v(12.50, "sekundaer", "strecke"),
          tauern: v(15.00, "sekundaer", "strecke")
        }
      },

      ch: {
        name: "Schweiz", code: "CH", slug: "schweiz",
        geprueft: "2026-10-10",
        naechstePruefung: "Einmal im Jahr im Herbst. Die Vignette kostet seit Jahren 40 CHF, die PSVA ändert sich selten.",
        quellen: {
          adac: { titel: "ADAC: Schwerverkehrsabgabe Schweiz", url: "https://www.adac.de/fahrzeugwelt/maut-vignette/schweiz/schwerverkehrsabgabe/" },
          bazg: { titel: "BAZG: Merkblatt PSVA 2026 (amtlich)", url: "https://www.bazg.admin.ch/dam/de/sd-web/OeCLGLxjWhTI/Form_1594_Merkblatt_PSVA_2026.pdf" },
          via: { titel: "Via-Portal (BAZG): E-Vignette 2026 für 40 CHF, PSVA bezahlen (amtlich)", url: "https://via.admin.ch" }
        },
        vignetteChf: v(40, "amtlich", "via"),
        // gilt für Wohnmobile über 3,5 t Gesamtgewicht laut Fahrzeugausweis
        psva: {
          tagChf: v(3.25, "amtlich", "via"),
          minChf: v(25, "amtlich", "bazg"),
          maxBis30TageChf: v(58.50, "sekundaer", "adac"),
          monatChf: v(58.50, "amtlich", "via"),
          jahrChf: v(650, "sekundaer", "adac")
        }
      },

      fr: {
        name: "Frankreich", code: "F", slug: "frankreich",
        geprueft: "2026-10-08",
        naechstePruefung: "Im Februar: die Betreiber erhöhen die Tarife jedes Jahr zum 1. Februar.",
        quellen: {
          klassen: { titel: "Le Permis Libre: Mautklassen in Frankreich", url: "https://www.lepermislibre.fr/code-route/peage-autoroute-differentes-classes-de-vehicules" },
          tarife: { titel: "Beispielstrecken und Klassenfaktoren, Tarife ab 1.2.2026", url: "https://macalculatriceenligne.com/outils/calcul-prix-autoroute/" },
          rechner: { titel: "autoroutes.fr: offizieller Mautrechner", url: "https://www.autoroutes.fr/" }
        },
        // Durchschnitt aus Paris–Lyon, –Lille, –Marseille, –Nice, –Bordeaux (Klasse 1 = 0,075 bis 0,105 €/km),
        // übrige Klassen mit den Faktoren 1,43 / 2,15 / 2,86
        klassen: {
          1: v(0.09, "schaetzung", "tarife"),
          2: v(0.13, "schaetzung", "tarife"),
          3: v(0.19, "schaetzung", "tarife"),
          4: v(0.26, "schaetzung", "tarife")
        }
      },

      it: {
        name: "Italien", code: "I", slug: "italien",
        geprueft: "2026-10-08",
        naechstePruefung: "Im Januar: die Tarife ändern sich jedes Jahr zum 1. Januar.",
        quellen: {
          klassen: { titel: "TollGuru: Mautklassen in Italien", url: "https://tollguru.com/italy-toll" },
          rechner: { titel: "autostrade.it: offizieller Mautrechner", url: "https://www.autostrade.it/" }
        },
        // Klasse A abgeleitet aus Mailand–Neapel (ca. 760 km, 58 bis 63 €); B und 3 über übliche Klassenabstände geschätzt
        klassen: {
          A: v(0.080, "schaetzung", "klassen"),
          B: v(0.082, "schaetzung", "klassen"),
          3: v(0.105, "schaetzung", "klassen")
        }
      }
    }
  };
})();
