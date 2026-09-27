# Vokabeltrainer – Decision Register

Stand: 27.09.2026

Dieses Register macht Grundsatzentscheidungen referenzierbar. Es ersetzt die jeweiligen Fachquellen nicht. Bei inhaltlichen Details gilt immer die verlinkte kanonische Quelle.

## Statusbegriffe

- **LOCKED** – verbindliches Grundprinzip; Änderung nur bewusst und mit Aktualisierung der kanonischen Quelle
- **ACTIVE** – aktuell gültige Produkt-/Architekturentscheidung
- **REVIEWED** – fachlich geprüft, aber noch nicht als verbindliche Regel beschlossen
- **SUPERSEDED** – durch spätere Entscheidung ersetzt
- **REJECTED** – bewusst verworfen

## Entscheidungen

### D-0001 – Fachliche Korrektheit hat Vorrang
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) § „Oberstes Produktprinzip“

Eine falsche Sollantwort, falsche Wort↔Bedeutung-Zuordnung oder falsche Bewertung ist ein Release-Blocker. Komfort, OCR, Automatisierung, Bibliothek, Gamification und Featureumfang sind nachgeordnet.

### D-0002 – Lernen beginnt erst nach fachlicher Paarprüfung
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) § „Verbindliche Lernpipeline“

Reihenfolge: Erfassen → fachlich prüfen → aktiv abrufen → verteilt wiederholen → nachhaltig meistern. Abschreiben ist eine freiwillige zusätzliche Lerneinheit und keine Freigabesperre.

### D-0003 – Mastery bleibt mehrtägig und unabhängig von XP/Spiel
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P3, P5 und P9

Ein Wort wird nicht durch einen einzelnen erfolgreichen Tageskontakt nachhaltig gemeistert. XP, Kampagne und Belohnungen dürfen fachliche Mastery weder erzeugen noch verändern.

### D-0004 – Tagesplan ist testbezogen, begrenzt und adaptiv
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6

Richtgröße: 5–7 neue Vokabeln pro Tag, typischerweise ungefähr 10–12 Kontakte; bei Vorsprung geringere Last, bei Rückstand begrenzt höhere Last. Maximal 7 neue Wörter werden erzwungen. Der letzte Tag vor einem Test bleibt bei ausreichendem Vorlauf für Wiederholung reserviert; am Testtag selbst keine neuen Wörter.

Hinweis: Diese Entscheidung regelt die **tägliche Berechnung**, aber noch nicht ausdrücklich das dynamische Nachrücken innerhalb einer bereits laufenden Tageslektion.

### D-0005 – Lernen und Spiel werden klar getrennt
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P9; [../../VISUAL_DNA.md](../../VISUAL_DNA.md)

Während des aktiven Abrufs wird Ablenkung minimiert. Die vollständige Spielinszenierung gehört in den eigenen Spiel-/Armeebereich. Der Start bleibt lernzentriert.

### D-0006 – Fachwelten bleiben fachlich und visuell eigenständig
**Status:** ACTIVE  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P11; [../../VISUAL_DNA.md](../../VISUAL_DNA.md)

Englisch, Latein, Französisch und Deutsch dürfen gemeinsame technische Grundlagen nutzen, werden aber nicht in ein fachlich oder visuell unpassendes Einheitsschema gezwängt.

### D-0007 – Kritische Kinderwege müssen ohne Erklärung bedienbar sein
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P13

Wenn ein Erwachsener den nächsten Klick im kritischen Kind-Pfad erklären muss, ist das ein UX-Release-Blocker und kein Fall für zusätzliche Hilfetexte.

### D-0008 – Evidenzbasierte Gegenprüfung bei größeren Produktentscheidungen
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P12

Größere Produktentscheidungen werden gegen aktuelle Lern-, UX-/Cognitive-Load- und Barrierefreiheitsevidenz geprüft. Konflikte zwischen Produktwunsch und Evidenz werden transparent gemacht.

### D-20260927-001 – Project Control Center als Referenzsystem
**Status:** ACTIVE  
**Quelle:** [../../PROJECT_CONTROL.md](../../PROJECT_CONTROL.md)

Das Repository ist für verbindliche Projektentscheidungen maßgeblich. Chatkontext bleibt Hilfsmittel, darf aber nicht unmarkiert eine Repository-Regel ersetzen.

### D-20260927-002 – Quellenpflicht bei Grundsatzbewertung
**Status:** ACTIVE  
**Quelle:** [../../PROJECT_CONTROL.md](../../PROJECT_CONTROL.md) § „Antwortstandard für Grundsatzfragen“

Bei Meinungs-, Bewertungs- und Grundsatzfragen zum Projekt werden künftig die einschlägigen Projektquellen genannt. Bestehende Regel, eigene Bewertung und möglicher Änderungsbedarf werden getrennt ausgewiesen.

### D-20260927-003 – Statusstufen nicht vermischen
**Status:** ACTIVE  
**Quelle:** [../../PROJECT_CONTROL.md](../../PROJECT_CONTROL.md) § „Statusmodell“

`APPROVED_BACKLOG`, `IMPLEMENTED`, `VERIFIED` und `PRODUCTION` sind unterschiedliche Zustände. Besprochen oder implementiert bedeutet nicht automatisch getestet oder produktiv.

## Neue Entscheidungen

Neue Grundsatzentscheidungen erhalten fortlaufend eine ID im Format `D-YYYYMMDD-NNN`. Wird eine bestehende Regel ersetzt, bleibt die alte Entscheidung erhalten und wird als `SUPERSEDED` markiert; sie wird nicht gelöscht.
