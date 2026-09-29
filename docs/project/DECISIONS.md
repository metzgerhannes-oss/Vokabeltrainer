# Vokabeltrainer – Decision Register

Stand: 28.09.2026

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
**Status:** SUPERSEDED durch D-20260927-010  
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

Nachrückpriorität: unbekanntes Wort aus dem anstehenden Test → schwaches bereits bekanntes Testwort → fällige bekannte Wiederholung. In den letzten drei Tagen vor dem Test werden keine zusätzlichen unbekannten Wörter nachgezogen. Pro Tag maximal drei Zusatzwörter, bei aktivierter Einstellung „Kurze Einheiten“ zwei. Gemäß D-20260927-010 liegt die Gesamtobergrenze neu eingeführter Wörter bei sechs bzw. vier. Diese Präzisierung folgt außerdem D-20260927-008; Lesen-/Rechtschreibunterstützung allein reduziert das Nachrücklimit nicht. Nachrücker werden als freiwilliger nächster Lernschritt vorgemerkt und verlängern eine bereits laufende Pflicht-Einheit nicht automatisch.

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

### D-20260927-009 – Deutsch Grundschule 1–4 erhält ein eigenes evidenzbasiertes Kompetenzmodell
**Status:** ACTIVE  
**Quelle:** [DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md](DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md); D-20260927-008; [../../VISUAL_DNA.md](../../VISUAL_DNA.md) § 9

Der geplante Deutsch-Grundschulbereich wird von Klasse 1 auf **Klasse 1–4** erweitert und fachlich nicht als bloße Variante des Fremdsprachen-Vokabelmodells behandelt.

Fachliche Kompetenzstände (u. a. Dekodieren, Leseflüssigkeit, Leseverständnis, Handschrift, Rechtschreibung, Wortschatz, Morphologie, Grammatik und Textproduktion) werden getrennt von Unterstützungsmerkmalen geführt. **LRS Lesen**, **LRS Rechtschreiben** und deren Kombination bleiben dediziert; **DaZ/Mehrsprachigkeit** ist eine davon unabhängige Dimension. Die App diagnostiziert keine LRS.

Früher Schriftspracherwerb enthält echte Handschrift und Papier als Lernkanal. Für das geplante Papier-Diktat gilt: OCR-Konfidenz und Rohtext müssen erhalten bleiben; unsichere OCR erzeugt keinen Kinderfehler. Ein Sprachmodell darf pädagogisch erklären und klassifizieren, aber nicht die deterministische fachliche Richtig/Falsch-Entscheidung ersetzen.

Die Fachquelle dokumentiert den Evidenzstand vom 27.09.2026 und muss vor Implementierung bei definierten Review-Triggern erneut geprüft werden.

### D-20260927-010 – Pflicht-Tageskern bleibt bewusst kurz
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6; ersetzt die Mengenlogik aus D-0004

Der verpflichtende Tageskern umfasst außerhalb von „Kurze Einheiten“ **5–6 unterschiedliche
Fokuswörter**, mit „Kurze Einheiten“ **3–4**. Die frühere Formulierung von ungefähr 10–12
Kontakten wird ausdrücklich als Lerninteraktionen innerhalb dieses kleinen Wortsets verstanden
und nicht als 10–12 verschiedene Pflichtwörter.

Im Pflichtkern werden höchstens drei neue Wörter eingeführt, mit „Kurze Einheiten“ höchstens
zwei. Rückstand, ein naher Test oder viele schwache Wörter dürfen den Pflichtkern nicht
verlängern. Stattdessen kann nach Abschluss eine zweite kurze Runde empfohlen werden. Diese
Runde ist freiwillig, erhöht das Pflicht-Tagesziel nicht und erzeugt keine zusätzliche
Battle-Freischaltung.

Strengere „heute sicher“-Evidenz darf eine laufende Pflicht-Einheit nicht durch automatisch
eingeschobene Wiederholungen verlängern. Ein notwendiger Scaffold für ein neues Wort erhält
im Pflichtkern höchstens einen produktiven Follow-up; Fehler dürfen weiterhin einmal gezielt
wiederholt werden. Mastery, Spacing und Testbereitschaft bleiben unverändert streng.

Mit freiwilligem Nachrücken werden insgesamt höchstens sechs neue Wörter pro Tag eingeführt,
bei „Kurze Einheiten“ höchstens vier. Am Testtag werden weiterhin keine neuen Wörter
eingeführt; ein zu später Lernstart wird als Spacing-/Planungsrisiko angezeigt statt durch
eine überlange Pflichtsession kompensiert.

### D-20260928-002 – Testtag braucht einen expliziten Abschluss
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6 und P12

Ein geplanter Test verschwindet am Testtag nicht automatisch aus dem aktuellen Lernweg. Ab dem Testdatum erhält die Heute-Seite die klare Hauptaktion **„Test abschließen“**. Sie darf erst ausgelöst werden, wenn der Test tatsächlich geschrieben wurde; ein Bestätigungsschritt verhindert versehentliches Abschließen.

Der Abschluss ist **unabhängig von der Schulnote**. Er dokumentiert ausschließlich, dass die Prüfung stattgefunden hat. Die Note kann später ergänzt werden und verändert weiterhin keine Mastery-, Leitner- oder Spacing-Daten.

Nach dem Abschluss wird der Test sofort aus dem aktuellen Lernkontext entfernt. Ein bereits geplanter Folgetest wird unmittelbar zum aktuellen Ziel. Fehlt ein Folgetest, zeigt der Tagesbereich **„Nächsten Test vorbereiten“** bzw. im Kindermodus, dass der nächste Test vorbereitet wird. Bei einer Testserie springt die App auf die Vorbereitung des nächsten Serientermins. Ein nicht abgeschlossener Test bleibt auch nach seinem Datum sichtbar, statt still übersprungen zu werden.

## Neue Entscheidungen

Neue Grundsatzentscheidungen erhalten fortlaufend eine ID im Format `D-YYYYMMDD-NNN`. Wird eine bestehende Regel ersetzt, bleibt die alte Entscheidung erhalten und wird als `SUPERSEDED` markiert; sie wird nicht gelöscht.
### D-20260927-011 – T−1-Rettungsmodus priorisiert Abruf statt Vollstoff-Drill
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P3, P6 und P12

Liegt ein geplanter Test am nächsten Tag und sind noch Testwörter unsicher oder unbekannt,
bleibt der verpflichtende Tageskern aus D-20260927-010 kurz. Danach darf die App gezielte
freiwillige Rettungsrunden anbieten. Eine Rettungsrunde enthält höchstens sechs unterschiedliche
Fokuswörter, bei aktivierten „Kurzen Einheiten“ höchstens vier.

Testbereite Wörter werden ausgelassen. Priorität: Fehler aus der vorherigen Rettungsrunde →
noch nicht geprüfte unbekannte Testwörter → noch nicht geprüfte schwache Testwörter. Nach
einer fachlich richtigen, unassistierten Korrektur gibt das Wort den Platz für weitere offene
Wörter frei. Das reale Testformat wird gespiegelt; Diktat verlangt produktive Rechtschreibung.

Der Rettungsmodus darf unbekannte Testwörter am Vortag noch bearbeiten, kennzeichnet den
fehlenden Spacing-Vorlauf aber weiterhin als Risiko. Er erzeugt weder zusätzliche Pflichtwörter
noch weitere Battle-Aktionen und senkt Mastery-, Leitner-, Spacing- oder Testbereitschafts-
kriterien nicht ab. Er dokumentiert ausschließlich tatsächlich erbrachte Lernleistung.
Mehrere Rettungsrunden bleiben getrennte kurze Einheiten; eine lange Vollstoff-Massensession
wird nicht automatisch gestartet.

### D-20260928-001 – Pflicht-Tageskern ist ein durchgehender Übungsraum
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6

Der verpflichtende Tageskern wird aus Kindersicht als **ein zusammenhängender Übungsraum**
behandelt. Ein interner Methoden- oder Queue-Durchlauf ist kein Lektionsende. Solange noch
Pflichtwörter offen sind, führt die App diese Wörter innerhalb derselben Session automatisch
in den nächsten adaptiv passenden Lernschritt weiter. Bereits aufgebaute Scaffolding-
Informationen und die Ergebnis-Historie des Raums bleiben erhalten.

Zwischen Lernschritten darf eine sehr kurze Orientierung („Weiter geht’s“) erscheinen, aber
kein Abschlussbildschirm und keine Wahl zwischen „Zur Übersicht“ und „weitere Lektion“.
Der normale Zurück-Button bleibt als bewusste Abbruchmöglichkeit erhalten.

Erst wenn der Pflicht-Tagesplan vollständig erledigt ist, erscheint **„Übungsraum
abgeschlossen“**. Die Ergebnisansicht fasst Fokuswörter, Zahl der Aufgaben, Aufgaben-
Trefferquote, verwendete Lernmethoden und nötige Korrekturrunden kompakt zusammen.
Einzelabfragen bleiben für Transparenz einklappbar. Freiwilliges Nachrücken, Bonuslernen und
T−1-Rettungsrunden sind weiterhin getrennte Einheiten und werden nicht still an den
Pflicht-Übungsraum angehängt.


### D-20260928-003 – Chatverläufe sind Arbeitsprotokoll, Repository ist Wahrheit
**Status:** ACTIVE  
**Quelle:** [../../PROJECT_CONTROL.md](../../PROJECT_CONTROL.md) § 13; [CHAT_LIFECYCLE.md](CHAT_LIFECYCLE.md)

Chats dürfen Ideen, Debugging, Screenshots, Zwischenstände und Entscheidungsfindung enthalten, sind aber keine dauerhafte Quelle für den aktuellen Projektstand. Vor Archivierung eines relevanten Chats werden Ergebnis, kanonische Regel/Decision, PR/Commit/Release, Verifikationsstatus und offene Restpunkte in das Repository überführt.

Projektchats werden nach ihrem Hauptzweck mit `[DECISION]`, `[CONCEPT]`, `[RESEARCH]`, `[DEV]`, `[BUG]`, `[TEST]` oder `[ARCHIVE]` gekennzeichnet. Offene Arbeit erhält eine Backlog-ID; alte Versions- oder CI-Aussagen aus Chats dürfen einen neueren Repository-Stand nicht ersetzen. Für neue Entwicklungsarbeit wird die Baseline zuerst aus `PROJECT_CONTROL.md`, `CURRENT_STATE.md`, der einschlägigen Fach-/Decision-Quelle und dem aktuellen `main` bestimmt.

### D-20260928-004 – Battle-Rendering wechselt auf Phaser 4
**Status:** ACTIVE  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P9; [../../VISUAL_DNA.md](../../VISUAL_DNA.md) §§ 4–6

Die Kampfszene wird technisch von DOM-/CSS-Animationen auf einen **isolierten Phaser-4-Renderer**
umgestellt. Lern-, Mastery-, Test-, Battle-Ticket- und Festungslogik bleiben weiterhin in der
bestehenden App die fachliche Wahrheit. Phaser erhält ausschließlich einen renderbaren
Szenenzustand und meldet abgeschlossene visuelle Phasen zurück; die Engine darf keine fachlichen
Werte selbst berechnen oder verändern.

Ziel ist eine hochwertige 2D/2.5D-Inszenierung mit getrennten Ebenen und Sprites für Hintergrund,
Armee, Einheiten, Reiter, Banner, Festung, Tor, Geschosse, Staub, Trümmer und Trefferlicht.
Kamerafahrt, Parallax, Tweening und Partikel werden im Renderer gekapselt. Die bestehende
Leserichtung bleibt verbindlich: **eigene Armee links → Handlung/Weg in der Mitte → Ziel rechts**.

Für die erste Umsetzung gilt:
- Phaser 4 wird nur im Spiel-/Battle-Bereich geladen, nicht im Lernmodus.
- Der erste technische Spike umfasst genau einen überzeugenden Angriffspfad, bevor weitere
  Angriffsarten übertragen werden.
- Die bestehende DOM/CSS-Schlacht bleibt bis zur praktischen Abnahme als Fallback erhalten.
- Mobilperformance und Offline-Fähigkeit bleiben Release-Kriterien; eine CDN-Abhängigkeit ist
  für den produktiven Stand nicht zulässig.
- Die grafische Qualität wird über Browser-Render im Zielviewport geprüft, nicht nur über DOM-Tests.

**3D-Abgrenzung:** Echtzeit-3D ist ausdrücklich **nicht** Teil des Battle-Renderers. Für kurze,
nicht-interaktive Story-/Übergangsszenen darf später ein getrenntes 3D-Modul geprüft werden
(z. B. Three.js/WebGL mit glTF-Assets). Dieses Modul darf optional bleiben und darf weder Battle-
noch Lernlogik zu einer 3D-Abhängigkeit machen. Alternativ bleibt für feste Storysequenzen
vorgerendertes Video zulässig, wenn es Ladezeit und Gerätekompatibilität besser erfüllt.

### D-20260928-005 – Avatar und Armee wachsen monoton über das Schuljahr
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P5/P9; [../../VISUAL_DNA.md](../../VISUAL_DNA.md) § 6; B-014

Fachlicher Lernstand und sichtbare Spielentwicklung werden getrennt. Der fachliche Prozentwert
bleibt der Anteil der nachhaltig gemeisterten **aktuell bekannten** Jahresvokabeln und darf
sich verändern, wenn neuer Stoff hinzukommt.

Avatar, Rang, Einheiten und Ausrüstung bilden dagegen eine **kumulative Jahresentwicklung**.
Sie wächst aus tatsächlich erreichten Lern- und Feldzugsmeilensteinen und wird innerhalb
desselben Fachs und Schuljahres nicht durch später hinzugefügte Vokabeln oder Tests
zurückgestuft. Ein Test beginnt deshalb niemals wieder bei Stufe 1.

„Meine Armee“ spiegelt diesen Zustand sichtbar: frühe Stufen zeigen eine kleine, einfach
ausgestattete Formation; zusätzliche Einheiten, Soldaten und hochwertige Ausrüstung kommen
mit der Jahresentwicklung hinzu. Die vollständig ausgerüstete große Armee ist der höchsten
Entwicklungsstufe vorbehalten.

Die Zahl zukünftiger Tests bleibt unbekannt und wird nicht geschätzt. Testfestungen werden
dynamisch ergänzt. Die Jahresfestung ist von Anfang an als langfristiges Fernziel sichtbar,
aber **ohne Datum**, solange kein realer Termin bekannt ist. Sobald ein belastbarer Termin
bekannt wird, kann er im Elternbereich gesetzt, geändert oder wieder entfernt werden. Neue
Testtermine dürfen weiterhin davor ergänzt werden; das Jahresfestungsdatum verändert keine
bereits erreichten Entwicklungsstufen.



### D-20260928-006 – Strittige Systembewertungen bleiben bis zur Elternprüfung neutral
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) Oberstes Produktprinzip; [../../QUIZ_ENGINE.md](../../QUIZ_ENGINE.md) § 8; B-015

Ein Kind darf eine vom System als falsch bewertete konkrete Antwort mit **„Bewertung prüfen lassen“**
beanstanden. Der betroffene Versuch wird sofort aus allen fachlichen Negativwirkungen
zurückgerollt und als offener Prüffall gespeichert. Solange dieser Prüffall offen ist, verändert
er weder Mastery, Spacing, Leitner-Box, Testbereitschaft noch Fehlerstatistik.

Die Entscheidung liegt ausschließlich im Elternbereich. Eltern können die konkrete Kinderantwort
als akzeptierte lokale Variante des betroffenen Lernset-Links freigeben, die zugrunde liegende
Vokabel/Sollantwort im bestehenden Editor korrigieren oder bestätigen, dass die ursprüngliche
Systembewertung richtig war. Eine bestätigte Systembewertung darf erst **nach** dieser Entscheidung
als fachlicher Fehler wirken. Eine freigegebene Variante wird künftig automatisch akzeptiert und
der ursprüngliche aktive Abruf rückwirkend positiv gewertet.

Der Mechanismus ersetzt nicht die deterministische tolerante Bewertung. Groß-/Kleinschreibung,
technische Satz-/Platzhaltervarianten und explizit bekannte Antwortalternativen sollen weiterhin
automatisch korrekt bewertet werden; die Elternprüfung ist das fachliche Sicherheitsnetz für
nicht vorhersehbare korrekte Formulierungen.


### D-20260928-007 – Überspringen verschiebt neutral ans Ende derselben Abfrage
**Status:** LOCKED  
**Quelle:** [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) Rollenmodell Kind / aktiver Abruf; B-016

Das Kind darf eine aktuell angezeigte Vokabel vor der Bewertung mit **„Vokabel überspringen“**
zurückstellen. Der aktuelle Queue-Eintrag wird ausschließlich ans Ende derselben laufenden
Abfrage verschoben. Die Vokabel wird weder entfernt noch als beantwortet behandelt.

Das Überspringen ist fachlich neutral: kein Erfolg, kein Fehler, keine XP, keine Änderung an
Mastery, Spacing, Leitner-Box, Testbereitschaft, Tages-Sicherheitsnachweis oder Fehlerstatistik.
Sobald die zurückgestellte Vokabel am Ende angekommen ist, kann sie nicht erneut aus der Einheit
entfernt werden; sie muss beantwortet oder die gesamte Einheit bewusst beendet werden.


### D-20260928-008 – Deutsch ist v1-Pflichtfach und erhält „Das Wortreich“
**Status:** LOCKED  
**Quelle:** [DEUTSCH_WORTREICH_V1.md](DEUTSCH_WORTREICH_V1.md); [DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md](DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md); [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P9/P11; [../../VISUAL_DNA.md](../../VISUAL_DNA.md) § 9; B-001

Deutsch muss **vor v1.0 produktiv integriert** sein. Der fachliche Bereich bleibt ein eigenständiges Grundschul-Kompetenzmodell und wird nicht auf das Fremdsprachen-Vokabelmodell reduziert.

Die motivierende Spielwelt heißt **„Das Wortreich“**. Der aktive Lernmodus bleibt ruhig und darf den bereits definierten Fuchs als Lernbegleiter nutzen; die vollständige Spielinszenierung findet separat als mittelalterliche Burg-/Ritter-/Belagerungswelt statt. Deutsch erhält damit echte Kämpfe und eine eigene Armee. Gegner sind fiktional und nicht realweltlich codiert.

Diese Entscheidung **ersetzt ausschließlich die frühere visuelle Einschränkung** aus B-001 / VISUAL_DNA § 9, wonach Deutsch ein reiner Fuchs-Lernbereich ohne Battle-Welt sein sollte. D-20260927-009 bleibt für das evidenzbasierte Kompetenzmodell vollständig gültig.

Für v1.0 sind mindestens verpflichtend: auswählbares Fach Deutsch; Klasse-1-Einstieg mit Buchstaben/Lauten/ersten Wörtern; Lernwörter und einfache Sätze; deutsches Audio; deutschspezifische Bewertung; neutrale Systemfehler-/Überspringlogik; eigener Wortreich-Spielbereich und mindestens ein echter Belagerungskampf. Spielprogression darf Mastery, Spacing, Testbereitschaft oder fachliche Bewertung niemals verändern.

### D-20260929-001 – Fremdsprachenprofile wählen zwischen Abenteuer- und Kampfwelt
**Status:** LOCKED  
**Quelle:** [../../VISUAL_DNA.md](../../VISUAL_DNA.md) § 5; [LATIN_FRENCH_VISUAL_LAYOUT.md](LATIN_FRENCH_VISUAL_LAYOUT.md); B-017

Für **Englisch, Latein und Französisch** wird die motivierende Spielwelt pro Profil und pro Fach wählbar. Bei der Profilerstellung entscheidet das Kind für jedes dieser Fächer zwischen **Abenteuer** und **Kampf**.

Die Wahl betrifft ausschließlich Darstellung und Motivationsinszenierung: Avatar, Karte, Story, Animationen, Etappen, Gefährten, Armee/Festungen und visuelle Belohnungen. Sie verändert niemals Vokabelbestand, fachliche Bewertung, Mastery, Spacing, Testbereitschaft, Tagesziel oder sonstige Lernschwellen.

Beide Weltvarianten erhalten aus demselben realen Lernfortschritt äquivalente Fortschrittsereignisse. Eine Variante darf deshalb weder schneller noch leichter zu sichtbaren Belohnungen führen. Ein Weltwechsel in den Profileinstellungen ist jederzeit ohne Fortschrittsverlust möglich. Die kumulative Jahresstufe aus D-20260928-005 bleibt erhalten und wird 1:1 auf die entsprechende visuelle Stufe der anderen Welt abgebildet.

Fachidentität der Varianten:

- **Englisch Abenteuer:** Expeditionen, Wege, Außenposten und Zielorte.
- **Englisch Kampf:** Armee, Kampagne und fiktionale Festungen.
- **Latein Abenteuer:** mediterrane Entdeckungsreise durch Straßen, Städte, Foren, Aquädukte und Provinzen.
- **Latein Kampf:** römische Legion, Marschrouten, Kastelle und fiktionale Gegner.
- **Französisch Abenteuer:** `Voyage Français` mit Reisewegen, Orten, Kultur und Regionen.
- **Französisch Kampf:** französisch inspirierte fiktionale Gefährten-/Festungswelt.

Für alle Kampfvarianten gilt: keine realen Länder, Völker, Religionen oder historischen Konfliktparteien als Feindbilder. Bestehende Profile werden nicht automatisch auf eine andere Welt umgestellt; ihre bisherige Darstellung bleibt bestehen, bis bewusst eine Auswahl geändert wird.

Die ursprüngliche Ausnahme für Deutsch wird durch **D-20260929-002** aufgehoben. D-20260928-008 bleibt für das Wortreich als Deutsch-Kampfwelt und für die fachliche Trennung von Lernen und Spiel gültig.

### D-20260929-002 – Deutsch erhält dieselbe Abenteuer-/Kampfwahl
**Status:** LOCKED  
**Quelle:** [../../VISUAL_DNA.md](../../VISUAL_DNA.md) § 5/§ 9; [DEUTSCH_WORTREICH_V1.md](DEUTSCH_WORTREICH_V1.md); B-017

Die Weltwahl aus D-20260929-001 wird auf **Deutsch** erweitert und technisch zuerst dort umgesetzt. Pro Lernprofil kann für Deutsch zwischen **Abenteuer** und **Kampf** gewählt werden.

- **Abenteuer:** ruhige Fuchs-/Entdeckerwelt mit Fuchspfad, Wortreise, Etappen und einer täglichen nicht-kämpferischen Abenteueraktion.
- **Kampf:** das bestehende **Wortreich** mit Ritterheer, Burgen, Belagerungen und Phaser-Kampf.

Beide Varianten verwenden denselben fachlichen Deutsch-Lernstand und dieselbe kumulative Jahresentwicklung. Die Auswahl verändert weder Literacy-Evidenz, Lernwort-Mastery, Spacing, Testbereitschaft, Tagesziel, Bewertung noch die Zahl der aus einem Tagesziel entstehenden Spielaktionen. Die tägliche Abenteueraktion nutzt deshalb dieselbe Aktionsfreigabe und denselben zugrunde liegenden Fortschrittszustand wie die Kampfaktion, wird aber ohne Battle-Screen und ohne Kampfchoreografie dargestellt.

Ein Wechsel ist in den Profileinstellungen ohne Reset möglich. Bereits erreichte Jahresstufen und Etappenzustände bleiben erhalten. **Bestehende Profile migrieren konservativ zu Kampf/Wortreich**, damit die bisherige Darstellung nicht überraschend verändert wird. Bei neu angelegten Deutsch-Profilen ist eine **bewusste Auswahl** zwischen Abenteuer und Kampf erforderlich.

Der Fuchs bleibt im Lernmodus weiterhin ruhiger Lernbegleiter. In der Abenteuerwelt ist er zusätzlich die sichtbare Spielfigur des separaten Motivationsbereichs.

Die Avatarwahl **m/w/d** ist davon unabhängig und bleibt bei einem Weltwechsel erhalten. Für Klasse 1 sind Avatar- und Weltwahl direkt im Profildialog vorlesbar.

### D-20260929-003 – Wortreich-Startlayout, Stufenlaufbahn und Vorlesen sind verbindlich
**Status:** LOCKED  
**Quelle:** [DEUTSCH_WORTREICH_LAYOUT_V1.md](DEUTSCH_WORTREICH_LAYOUT_V1.md); [../../VISUAL_DNA.md](../../VISUAL_DNA.md) § 9; D-20260928-008; D-20260929-002; D-20260927-009

Für Deutsch wird das am 29.09.2026 freigegebene Wortreich-Startlayout verbindlich. Die
Fuchsentwicklung lautet: **Grundausrüstung → Lederzeug → Ritterlehrling → Ritter → Kronritter → König**.
Die Stufen 3 bis 6 bilden eine direkte Ritterlaufbahn; der König ist die eindeutige Endstufe.

Für Klasse 1 wird Vorlesen als grundlegende Bedienhilfe behandelt. Überschriften, Navigation,
Aktionskarten und sichere Aufgabenanweisungen erhalten Audio. Audio bleibt vor einer Antwort
gesperrt, wenn es die erwartete Lösung oder die zu messende Lesekompetenz vorwegnehmen würde.
Die Vorlesefunktion verändert weder Mastery noch Spacing, Testbereitschaft oder fachliche Bewertung.

Die Profilerstellung berücksichtigt **m/w/d**: Männlich, Weiblich und Neutral/Divers sind
gleichwertige gespeicherte Avatarvarianten. Fehlende finale Bildassets dürfen nicht zu einem
stillen Rückfall auf die männliche Serie führen.

