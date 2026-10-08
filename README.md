# Mautklar (Arbeitstitel)

Maut-Rechner und Länderseiten für Wohnmobile. Reine statische Seite (HTML, CSS, JavaScript) ohne Build-Schritt, veröffentlicht über Netlify.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Startseite mit dem Maut-Rechner |
| `laender/` | Übersicht und je eine Seite pro Land (AT, CH, FR, IT) |
| `ratgeber/`, `ueber/`, `impressum/` | Weitere Seiten |
| `css/style.css` | Gestaltung aller Seiten |
| `js/maut-daten.js` | **Alle Preise und Sätze des Rechners** |
| `js/rechner.js` | Rechenlogik |

`/?land=at` öffnet den Rechner nur mit diesem Land (so verlinken die Länderseiten).

## Jährliche Datenpflege

1. Preise in `js/maut-daten.js` prüfen und anpassen.
2. Die gleichen Preise in den Tabellen unter `laender/*/index.html` anpassen.
3. Stand und Quelle auf den Länderseiten aktualisieren.

## Vor dem Livegang

- Daten prüfen (alle Werte sind noch grobe Beispielwerte).
- Entwurfs-Hinweis oben auf jeder Seite entfernen.
- `<meta name="robots" content="noindex">` aus allen Seiten entfernen, damit Google die Seite aufnimmt.
- Impressum und Datenschutzerklärung ausfüllen.

## Lokal ansehen

```
python3 -m http.server 8000
```
Dann http://localhost:8000 öffnen.
