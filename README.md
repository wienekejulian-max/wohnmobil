# Mautklar (Arbeitstitel)

Maut-Rechner und Länderseiten für Wohnmobile. Reine statische Seite (HTML, CSS, JavaScript) ohne Build-Schritt, veröffentlicht über Netlify.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Startseite mit dem Maut-Rechner |
| `laender/` | Übersicht und je eine Seite pro Land (AT, CH, FR, IT) |
| `quellen/` | Alle Werte mit Herkunft und Prüfdatum |
| `ratgeber/`, `ueber/`, `impressum/` | Weitere Seiten |
| `css/style.css` | Gestaltung aller Seiten |
| `js/maut-daten.js` | **Alle Preise, Regeln und Quellen. Die einzige Stelle, an der Zahlen stehen.** |
| `js/maut-regeln.js` | Rechenregeln je Land und die Tabellen der Länderseiten |
| `js/rechner.js` | Formular und Ergebnis des Rechners |
| `js/laenderseite.js` | Füllt Länderseiten und die Quellen-Seite aus den Daten |

`/?land=at` öffnet den Rechner nur mit diesem Land (so verlinken die Länderseiten).

## Datenpflege

Jeder Wert in `js/maut-daten.js` hat eine Art (`amtlich`, `sekundaer`, `schaetzung`) und eine Quelle. Rechner, Länderseiten und die Quellen-Seite zeigen beides an. Wird ein Wert geändert, ändert er sich überall.

### Prüfkalender

Die Länder ändern ihre Preise zu festen Terminen. Danach richtet sich die Prüfung:

| Wann prüfen | Land | Was ändert sich |
| --- | --- | --- |
| Anfang Dezember | Österreich | Neue Vignette gilt ab 1. Dezember; GO-Maut und Streckenmaut ab 1. Januar |
| Anfang Januar | Italien | Mauttarife ab 1. Januar |
| Anfang Februar | Frankreich | Mauttarife ab 1. Februar |
| Herbst | Schweiz | Vignette (40 CHF) und PSVA ändern sich selten |
| 2029 | Österreich | Übergangsregel für abgelastete Wohnmobile endet am 31. Januar 2029 |

### So läuft eine Prüfung

1. Die Quellen des Landes öffnen (stehen in `js/maut-daten.js` und auf `/quellen/`).
2. Werte vergleichen und bei Abweichung ändern.
3. Wenn ein Wert amtlich bestätigt ist, `art` auf `"amtlich"` setzen und die amtliche Quelle eintragen.
4. `geprueft` des Landes und `stand` oben auf das Prüfdatum setzen, `naechstePruefung` bei Bedarf anpassen.

### Offene Punkte bei den Daten

- Österreich: Vignettenpreise und Streckenmaut amtlich bei ASFINAG bestätigen.
- Schweiz: PSVA-Sätze im Via-Portal bestätigen.
- Frankreich und Italien: Die km-Preise sind Durchschnitte. Genauer wird es erst mit Preisen pro Strecke.

## Vor dem Livegang

- Offene Punkte bei den Daten klären.
- Entwurfs-Hinweis oben auf jeder Seite entfernen.
- `<meta name="robots" content="noindex">` aus allen Seiten entfernen, damit Google die Seite aufnimmt.
- Impressum und Datenschutzerklärung ausfüllen.

## Lokal ansehen

```
python3 -m http.server 8000
```
Dann http://localhost:8000 öffnen.
