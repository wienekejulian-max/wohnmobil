# Mein Wohnmobil-Urlaub

Werkzeuge und Ratgeber für den Wohnmobil-Urlaub, Domain geplant: mein-wohnmobil-urlaub.de. Reine statische Seite (HTML, CSS, JavaScript) ohne Build-Schritt, veröffentlicht über Netlify.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Startseite mit Einleitung und Länderübersicht |
| `werkzeuge/maut-rechner/` | Der Maut-Rechner |
| `maut/` | Übersicht und je eine Seite pro Land (AT, CH, FR, IT) |
| `quellen/` | Alle Mautwerte mit Herkunft und Prüfdatum |
| `ueber/`, `impressum/`, `datenschutz/` | Weitere Seiten |
| `fonts/`, `css/fonts.css` | Schriften lokal eingebunden, damit beim Aufruf keine Daten an Google gehen |
| `css/style.css` | Gestaltung aller Seiten |
| `js/maut-daten.js` | **Alle Preise, Regeln und Quellen. Die einzige Stelle, an der Zahlen stehen.** |
| `js/maut-regeln.js` | Rechenregeln je Land und die Tabellen der Länderseiten |
| `js/rechner.js` | Formular und Ergebnis des Rechners |
| `js/laenderseite.js` | Füllt Länderseiten und die Quellen-Seite aus den Daten |

`/werkzeuge/maut-rechner/?land=at` öffnet den Rechner nur mit diesem Land (so verlinken die Länderseiten). Alte Adressen unter `/laender/` und die noch leeren Bereiche (`/werkzeuge/`, `/ratgeber/`, `/reiseberichte/`) leitet `netlify.toml` um.

Was inhaltlich noch kommt, steht in [THEMENPLAN.md](THEMENPLAN.md). Auf der Seite steht nur, was fertig ist.

## Arbeitsweise und Netlify-Credits

Der kostenlose Netlify-Tarif hat 300 Credits im Monat, jede Veröffentlichung von `main` kostet 15 Credits. Deshalb:

- Änderungen kommen zuerst auf den Zweig `entwurf`. Netlify baut davon kostenlos eine Vorschau unter `entwurf--<seitenname>.netlify.app`.
- Nach `main` (die echte Seite) wird nur gebündelt übernommen, wenige Male im Monat.

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

### Regel für Werte ohne amtliche Quelle

- Feste Preise (Vignette, Streckenmaut, Tagespauschalen) gehen nur mit amtlicher Quelle live. Kommt die Seite der Behörde nicht direkt heran, reicht ein Screenshot der amtlichen Seite mit Datum.
- Schätzwerte (z. B. km-Sätze in Frankreich und Italien) sind erlaubt, wenn sie als Schätzung markiert sind und auf den amtlichen Rechner verlinken.
- Unter Rechner, Länderseiten und Quellen steht ein Hinweis „Fehler gefunden?“ mit der Kontaktadresse aus `js/maut-daten.js`.

### Offene Punkte bei den Daten

- Österreich und Schweiz sind seit 10.10.2026 vollständig amtlich bestätigt, bis auf die Übergangsregel für abgelastete Wohnmobile (Österreich).
- Frankreich und Italien: Die km-Preise sind Durchschnitte. Genauer wird es erst mit Preisen pro Strecke.

## Vor dem Livegang

- Offene Punkte bei den Daten klären.
- Entwurfs-Hinweis oben auf jeder Seite entfernen.
- `<meta name="robots" content="noindex">` aus allen Seiten entfernen, damit Google die Seite aufnimmt.
- Umami: Skript ist auf allen Seiten (eigenes kostenloses Umami-Cloud-Konto). Prüfen, dass der Auftragsverarbeitungsvertrag (DPA) für dieses Konto abgeschlossen ist. Gezählt wird nur auf mein-wohnmobil-urlaub.de, nicht in der Vorschau.
- Datenschutzerklärung prüfen, wenn neue Dienste dazukommen (z. B. Statistik, Werbung, Affiliate-Links).

## Lokal ansehen

```
python3 -m http.server 8000
```
Dann http://localhost:8000 öffnen.
