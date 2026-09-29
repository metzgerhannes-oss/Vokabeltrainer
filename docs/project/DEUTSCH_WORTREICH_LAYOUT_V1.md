# Deutsch / Das Wortreich – freigegebenes Startlayout v1

Stand: 29.09.2026  
Status: **VERBINDLICH FREIGEGEBEN**  
Decision: **D-20260929-001**

## 1. Zielbild

Die Deutsch-Startseite verbindet einen ruhigen Lernstart mit der sichtbaren Entwicklung im
Wortreich. Die freigegebene Bildsprache ist warm, hochwertig und märchenhaft-mittelalterlich,
aber nicht kindisch.

Verbindliche Merkmale:

- heller Landschaftsraum mit Burg, Wald, Bergen und Weg
- Fuchs als konsistente Leitfigur
- Pergament-/Holzflächen als UI-Rahmen
- Violett + Gold als Wortreich-Akzentfarben
- klare, große Typografie und große Touch-Ziele
- Lernen bleibt die dominante Hauptaktion
- Spielbereich bleibt getrennt von fachlicher Bewertung

## 2. Fuchs-Entwicklung

Die sechs Entwicklungsstufen sind verbindlich:

1. **Grundausrüstung** – roter Schal, Holzschwert
2. **Lederzeug** – Lederzeug, kleiner Schild
3. **Ritterlehrling** – blaue Tunika, erster Ritterschild, echtes Schwert
4. **Ritter** – direkte Aufwertung aus Stufe 3, vollständigeres Rüstungsbild
5. **Kronritter** – direkte Aufwertung aus Stufe 4, roter Umhang, Goldakzente, Kronenwappen
6. **König** – royale Weiterentwicklung aus Stufe 5, Krone und Königsmantel

### Konsistenzregel

- gleiche Grundfigur auf allen Stufen
- jede Stufe ergänzt sichtbar Ausrüstung statt die Figur neu zu erfinden
- Ritterlehrling → Ritter → Kronritter → König muss als zusammenhängende Laufbahn lesbar sein
- Stufe 5 trägt **keine volle Königskrone**; die Krone ist dem König vorbehalten

## 3. Startscreen

Die Startseite enthält für Deutsch:

- Wortreich-Landschaft mit Burgkulisse
- Fuchs groß als aktueller Entwicklungsstand
- Name + „Stufe X/6“
- sechs Stufen als sichtbare Entwicklungskette
- „Heute / Was steht heute an?“
- aktuelle Lernaufgabe als dominante Karte
- „Lernwörter üben“
- „Das Wortreich betreten“
- Bottom-Navigation bleibt appweit grundsätzlich gleich

## 4. Vorlesefunktion

Für Klasse 1 gilt: **Navigation und Anweisungen müssen ohne Lesekompetenz nutzbar sein.**

Daher werden sichtbare Vorlese-Buttons produktweit dort angeboten, wo Audio die zu prüfende
Leistung nicht verfälscht.

Vorlesen ist insbesondere vorgesehen für:

- Überschriften und Bereichsnamen
- Navigations- und Aktionskarten
- Aufgabenanweisungen
- Hilfetexte
- geeignete deutsche Wörter und Sätze

### Evidenzschutz

Audio darf **nicht** vor der Antwort angeboten werden, wenn es die fachlich erwartete Lösung
oder die zu messende Lesekompetenz verrät. Beispiele:

- Lesen eines Wortes und Bild zuordnen: Wort-Audio erst nach der Antwort
- Satzlesen und Satzverständnis: Satz nicht automatisch vor der Antwort vorlesen
- Diktat / Hören-Schreiben: Audio ist Teil der Aufgabe und ausdrücklich erlaubt

Diese Regel konkretisiert DEUTSCH_WORTREICH_V1.md und PRODUCT_DNA.md; Vorlesehilfe darf
keinen unassistierten Abruf vortäuschen.

## 5. Technische Umsetzung

- js/wordrealm-ui.js: konsistente SVG-Fuchsserie und Wortreich-Szenerie
- js/read-aloud-ui.js: zentrale, sichere Vorleseschicht
- js/menu-ui.js: Startscreen-Verknüpfung und Wortreich-Aktionen
- css/menu.css: Wortreich-Startlayout
- css/app.css: gemeinsame Vorlese-Controls
- js/german-foundation.js: Vorlesen für sichere Klasse-1-Anweisungen
- js/model.js: verbindliche Stufenbezeichnungen und konsistente Rangableitung

## 6. Abnahme

Ein Deutsch-Startscreen ist nur freigabefähig, wenn:

- alle sechs Stufen korrekt benannt sind
- Stufe 3–6 visuell aufeinander aufbauen
- König eindeutig die Endstufe ist
- auf iPhone-Breite kein horizontaler Seitenüberlauf entsteht
- Startaufgabe und zwei Wortreich-Zusatzkarten bedienbar sind
- sichtbare Vorleseoptionen vorhanden sind
- aktive Lernaufgaben nicht durch Audio fachlich verraten werden
