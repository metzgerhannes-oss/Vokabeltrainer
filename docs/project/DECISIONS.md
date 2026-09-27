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

### D-20260927-004 – Begrenztes adaptives Nachrücken innerhalb desselben Lerntags
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P3 und P6

Der morgens berechnete Pflicht-Tagesplan bleibt als festes Tagesziel bestehen. Ein separater Zustand „heute sicher“ darf innerhalb desselben Tages freiwillige Zusatzkapazität freigeben, ohne nachhaltige Mastery, Tagesziel oder Battle-Freischaltung zu verändern.

„Heute sicher“ erfordert produktiven, unassistierten und orthografisch korrekten Abruf. Bereits testbereite Wiederholungswörter benötigen einen solchen Abruf; neue oder schwache Wörter zwei getrennte erfolgreiche aktive Abrufe ohne Fehler dazwischen. Ein bloßer Kontakt über `completedKeys` reicht ausdrücklich nicht.

Nachrückpriorität: unbekanntes Wort aus dem anstehenden Test → schwaches bereits bekanntes Testwort → fällige bekannte Wiederholung. In den letzten drei Tagen vor dem Test werden keine zusätzlichen unbekannten Wörter nachgezogen. Pro Tag maximal drei Zusatzwörter, bei aktivierter Einstellung „Kurze Einheiten“ zwei; die bestehende Obergrenze von sieben neu eingeführten Wörtern pro Tag bleibt erhalten. Diese Präzisierung folgt D-20260927-008; Lesen-/Rechtschreibunterstützung allein reduziert das Nachrücklimit nicht. Nachrücker werden als freiwilliger nächster Lernschritt vorgemerkt und verlängern eine bereits laufende Pflicht-Einheit nicht automatisch.

### D-20260927-005 – Pflicht-Tagesziel braucht erfolgreichen unassistierten Abruf
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P4 und P6

Ein Wort im Pflicht-Tagesplan wird nicht durch bloßen Kontakt oder einen beliebigen aktiven Versuch abgeschlossen. Für `completedKeys` zählt nur ein fachlich richtiger, unassistierter aktiver Abruf innerhalb der Tageslektion.

Ein falscher Versuch bleibt offen und führt weiter zu einer Lerngelegenheit. Eine richtige Antwort mit verwendetem Hinweis bleibt ebenfalls offen. Dadurch kann weder der sichtbare Tagesabschluss noch die daraus folgende Kampfaktion durch einen Fehl- oder Hilfsversuch vorzeitig ausgelöst werden.

Diese Regel ist unabhängig vom strengeren Zustand „heute sicher“ aus D-20260927-004: Pflichtziel-Erledigung benötigt einen erfolgreichen unassistierten Abruf; freiwilliges Nachrücken darf weiterhin zusätzliche orthografische bzw. Wiederholungsevidenz verlangen.

### D-20260927-006 – Spacing-Fortschritt zählt unterschiedliche Erfolgstage
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P3

Mehrere richtige unabhängige Abrufe desselben Wortes am selben Kalendertag bleiben als Übungs- und Accuracy-Evidenz erhalten, dürfen das nächste Spacing-Intervall aber nicht mehrfach verlängern.

Die Intervallstufe wird deshalb aus der Zahl unterschiedlicher aktiver Erfolgstage abgeleitet. Ein weiterer Erfolg am selben Tag erhöht weiterhin `independentSuccesses`, erzeugt aber keinen zusätzlichen Spacing-Tag. Erst ein Erfolg an einem späteren Kalendertag kann die nächste Intervallstufe freigeben.

Cold-Recall kann weiterhin als zusätzliche Qualitätsinformation berücksichtigt werden, jedoch erst bei bereits verteilter Evidenz über mindestens zwei Erfolgstage.

### D-20260927-007 – Testbereitschaft ist abfragerichtungsspezifisch
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P2

Die generische Retrieval-/Spelling-Kompetenz bleibt ein gemeinsamer Lernkern, reicht für die Aussage „testbereit“ aber nicht allein aus. Die App verlangt zusätzlich einen aktuellen unabhängigen Abruf in der für den konkreten Test geplanten Richtung.

- `target`: Bedeutung → Fremdsprachenwort
- `source`: Fremdsprachenwort → Bedeutung
- `mixed`: beide Richtungen
- `dictation`: produktive Rechtschreib-/Abrufbasis; keine Übersetzungsrichtungs-Sperre

Ein späterer falscher unabhängiger Versuch in einer Richtung setzt deren aktuellen Richtungsnachweis auf „nicht bereit“, bis wieder ein unabhängiger richtiger Abruf erfolgt. Unterstützte Treffer erzeugen keinen Richtungsnachweis.

Recognition und Listening bleiben unterstützende Lernformen und tragen nicht zum numerischen Testbereitschafts-Score bei.

### D-20260927-008 – LRS-Unterstützung trennt Lesen, Rechtschreiben und Belastungsreduktion
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P8; P6 für Tageslast/Nachrücken

Die App behandelt LRS nicht als einheitlichen Lern- oder Scheduler-Schalter. Ein Lernprofil
kann **Leseunterstützung**, **Rechtschreibunterstützung** oder beide Dimensionen aktivieren.
Die Einstellung **„Kurze Einheiten“** ist davon unabhängig und steuert kleinere Sessions
sowie das reduzierte freiwillige Nachrücklimit.

Leseunterstützung beeinflusst Hilfen, Audio-/Lesetempo und adaptive Scaffold-Priorität,
aber nicht Mastery oder Testbereitschaft. Rechtschreibunterstützung priorisiert produktive
Schreibmodi; für „heute sicher“ ist bei aktivierter Rechtschreibunterstützung zusätzlich
mindestens ein erfolgreicher unassistierter Rechtschreibabruf erforderlich. Die fachliche
Sollantwort und die bestehenden Mastery-/Spacing-Kriterien werden nicht abgesenkt.

Die App stellt keine Diagnose und leitet keine LRS-Form automatisch ab. Bestehende Profile
mit dem alten `lrsMode=true` werden konservativ zu Lesen + Rechtschreiben + „Kurze
Einheiten“ migriert. `lrsMode` bleibt nur als Kompatibilitätsalias für ältere
synchronisierte Clients erhalten.

D-20260927-004 bleibt für das adaptive Nachrücken gültig; nur die dortige frühere Kopplung
„LRS-Modus = Zwei-Wort-Limit“ wird durch die unabhängige Einstellung „Kurze Einheiten“
präzisiert.

## Neue Entscheidungen

Neue Grundsatzentscheidungen erhalten fortlaufend eine ID im Format `D-YYYYMMDD-NNN`. Wird eine bestehende Regel ersetzt, bleibt die alte Entscheidung erhalten und wird als `SUPERSEDED` markiert; sie wird nicht gelöscht.
