# Lernkohärenz-Audit – Gesamtbibliothek

Stand: 27.09.2026

## Urteil

Die pädagogische Gesamtarchitektur ist **in sich stimmig und tragfähig**. Ein konzeptioneller Neubau ist nicht erforderlich.

Die zentrale Lernkette ist konsistent über die maßgeblichen Quellen hinweg:

**Erfassen → fachlich prüfen → unterstützend kennenlernen → aktiv abrufen → unmittelbares Feedback → verteilt erneut abrufen → testbereit werden → nachhaltig meistern**

Besonders kohärent sind:
- fachliche Paarintegrität vor Lernen,
- produktiver Abruf als Kern,
- klare Trennung von Unterstützung und Mastery,
- mehrtägige Spacing-/Mastery-Gates,
- Trennung von Testbereitschaft und langfristiger Mastery,
- Sense-spezifische Lernstände,
- getrennte Behandlung von Semantik und Orthographie,
- LRS-/Accessibility-Unterstützung ohne Therapiebehauptung,
- Gamification außerhalb des eigentlichen Abrufs.

Die Forschungsbasis passt zu diesem Aufbau. Spaced Practice zeigt für L2-Lernen einen mittleren bis großen Vorteil; längere Abstände sind insbesondere bei verzögerten Tests günstiger als sehr kurze Abstände. Produktive und rezeptive Lernrichtung übertragen sich nur teilweise aufeinander. Retrieval plus korrektives Feedback ist für Rechtschreibung bei Kindern lernwirksam. Gamifizierte Rückmeldung kann Motivation steigern, ohne notwendigerweise den verzögerten Abruf zu verbessern. Diese Befunde stützen die bestehende Grundarchitektur.

## Kanonische Projektquellen

- `PRODUCT_DNA.md` – Lernpipeline und Prinzipien P1–P13
- `QUIZ_ENGINE.md` – fachliche Integrität der einzelnen Abfrage
- `SENSE_MODEL.md` – Bedeutungsidentität und getrennte Lernstände
- `FOCUSED_LEARNING_UI.md` – Fokus, Feedback und unterstützte Aufgaben
- `docs/PAEDAGOGISCHE_DOKUMENTATION.md` – pädagogische Gesamterklärung
- `docs/project/DECISIONS.md` – D-0001 bis D-0008
- `docs/project/TEST_MATRIX.md` – Release-Gates der Lernlogik

## Was fachlich besonders stark ist

### 1. Fachliche Wahrheit steht vor Automatik
`PRODUCT_DNA.md` und `QUIZ_ENGINE.md` ziehen dieselbe harte Grenze: OCR, Bibliothek und Automatik dürfen keine Sollantwort erfinden. Unklare Zuordnungen werden blockiert statt gegen das Kind bewertet.

### 2. Unterstützung wird nicht mit Beherrschung verwechselt
Erkennen, Hören, Wortbausteine, Handschrift und Vokabeldusche dürfen unterstützen, erzeugen aber keine nachhaltige Mastery. Produktiver Abruf, Rechtschreibung und gegebenenfalls Kontext tragen den fachlichen Fortschritt.

### 3. Mastery ist konservativ
`js/model.js` verlangt für Mastery u. a. mehrere unabhängige Erfolge, mindestens drei Erfolgstage, mindestens zwei Cold-Recall-Tage, einen Abstand von mindestens drei Tagen und ein Intervall von mindestens sieben Tagen. Damit kann ein Wort nicht an einem einzigen guten Lerntag „gemeistert“ werden.

### 4. Testbereitschaft und langfristiges Behalten sind getrennt
Die App darf ein Wort vor einem realen Schultest als testbereit einstufen, ohne daraus langfristige Mastery abzuleiten. Diese Trennung ist fachlich sinnvoll und in der Eltern-/Pädagogikdokumentation verständlich erklärt.

### 5. Mehrdeutigkeit ist sauber modelliert
Das Sense-Modell verhindert Mastery-Transfer zwischen echten Bedeutungen desselben Lexems und verlangt bei mehrdeutigen Abrufen einen Cue bzw. eine eindeutige Abfragerichtung.

### 6. Motivation bleibt außerhalb der Lernbewertung
XP, Armee, Legion, Festung und Story verändern weder Sollantwort noch Spacing noch Mastery. Das entspricht D-0003/D-0005 und der Product DNA.

---

# Befunde, die vor v1 nachgeschärft werden sollten

## K-01 – Tagesziel kann nach einem falschen aktiven Versuch als bearbeitet gelten

**Schweregrad:** HOCH / Lernintegrität  
**Status:** REVIEWED  
**Betroffene Regeln:** D-0001, D-0004, B-004

In `js/learning.js` wird bei jedem **unassistierten aktiven Versuch** im Tagesplan `markDailyPlanWordDone(w)` aufgerufen, bevor feststeht, ob die Antwort richtig war. `dailyPlanStatus()` wertet anschließend allein `completedKeys` aus.

Damit kann ein Wort für das Tagesziel als erledigt gelten, obwohl der aktive Versuch falsch war. Wenn dadurch alle Planwörter als erledigt gelten, kann auch die Tagesaktion freigeschaltet werden.

Das widerspricht der fachlichen Bedeutung von „Tagesziel geschafft“ und ist besonders relevant für das geplante adaptive Nachrücken.

**Sollrichtung:** Tagesplan-Kontakt und Tagesplan-Erfolg getrennt speichern. „Erledigt“ darf mindestens einen fachlich erfolgreichen, nicht assistierten aktiven Abruf voraussetzen; ein Fehlversuch bleibt offen und erzeugt eine erneute Lerngelegenheit.

## K-02 – Produktive und rezeptive Abrufrichtung teilen denselben Retrieval-Nachweis

**Schweregrad:** MITTEL–HOCH  
**Status:** REVIEWED  
**Betroffene Regeln:** D-0003, D-0004; Testbereitschaft

`reverseRecall` (Fremdsprache → deutsche Bedeutung) und `recall` (deutsche Bedeutung → Fremdsprachenwort) zahlen beide in denselben Retrieval-Skill und dieselben Erfolgstage ein. Rechtschreibung kann zusätzlich separat, z. B. über Diktat, erworben werden.

Dadurch kann das Modell theoretisch Retrieval-Sicherheit und Spelling-Sicherheit kombinieren, ohne dass die **konkrete produktive Übersetzungsrichtung** in entsprechendem Umfang gezeigt wurde.

Aktuelle Evidenz spricht gegen vollständigen Transfer zwischen den Richtungen: Bernardi et al. (2024) fanden über drei Experimente nur **partiellen** Transfer zwischen produktivem und rezeptivem Lernen.

**Sollrichtung:** Testbereitschaft mindestens testformat-spezifisch machen. Für einen Zielsprachentest sollte mindestens ein aktueller unabhängiger produktiver Abruf in genau dieser Richtung verlangt werden; für rezeptive Tests entsprechend umgekehrt. Für langfristige Mastery ist zu entscheiden, ob beide Richtungen explizit nachgewiesen werden sollen oder ob produktiver Abruf als Mindestanker reicht.

Quelle: https://doi.org/10.1080/09658211.2024.2397043

## K-03 – Mehrere richtige Abrufe am selben Tag können das nächste Intervall verlängern

**Schweregrad:** MITTEL–HOCH  
**Status:** REVIEWED  
**Betroffene Regeln:** D-0003

`independentSuccesses` steigt bei jedem unabhängigen aktiven Erfolg, auch bei mehreren Erfolgen am selben Kalendertag. Dieser Zähler beeinflusst direkt die Intervallfolge `0, 1, 3, 7, 14, 30, 60`.

Die hohen Leitner-Boxen und Mastery sind zwar zusätzlich an unterschiedliche Tage gebunden; der **Scheduler** selbst kann aber durch massierte Wiederholungen am selben Tag schneller auf größere Abstände springen.

Das ist nicht vollständig konsistent mit dem eigenen Prinzip „verteiltes Lernen statt kurzfristigem Pauken“.

**Sollrichtung:** Intervallfortschritt primär an distinct-day/cold-recall evidence koppeln oder höchstens einen spacing-relevanten Erfolgscredit pro Wort und Tag vergeben. Zusätzliche Erfolge am selben Tag dürfen weiterhin Accuracy und Übungsdiagnostik verbessern.

Die L2-Meta-Analyse von Kim & Webb (2022) stützt die grundsätzliche Trennung von massierter und verteilter Übung und zeigt Vorteile von Spacing, besonders bei verzögerten Tests.

Quelle: https://doi.org/10.1111/lang.12479

## K-04 – Testbereitschafts-Prozent enthält kleine passive Anteile

**Schweregrad:** MITTEL  
**Status:** REVIEWED  
**Betroffene Quellen:** `js/model.js`, UI Testfortschritt

`testReadinessScore()` enthält aktuell je 3 % Gewicht für Recognition und Listening. Das harte `isTestReady()`-Gate verlangt trotzdem aktive Retrieval-/Spelling-Werte, daher kann passives Training allein kein Wort als „bereit“ markieren.

Der angezeigte Durchschnitts-Prozentwert kann jedoch durch unterstützende Leistungen steigen. Das ist nur dann stimmig, wenn dieser Wert als **Vorbereitungsgrad** verstanden wird. Als „Sicherheit“ wäre er fachlich zu stark formuliert.

**Sollrichtung:** Entweder Prozentwert rein produktiv berechnen oder die UI ausdrücklich als „Vorbereitung“/„Lernstand“ benennen; „x von y sicher“ bleibt die strengere Aussage.

## K-05 – Pädagogische Dokumentation und v1-Abnahme verwenden teilweise die alte Navigation

**Schweregrad:** MITTEL / Dokumentationskohärenz  
**Status:** REVIEWED

Aktueller Produkt- und UI-Stand:
**Heute · Lernen · Armee · Erfolge**

Ältere Dokumentationsstellen sprechen noch von:
**Heute · Üben · Fortschritt · Armee**

Betroffen:
- `docs/PAEDAGOGISCHE_DOKUMENTATION.md`
- `V1_ACCEPTANCE_TEST.md`
- historische README-Abschnitte sind korrekt als Historie, dürfen aber nicht als aktuelle Navigation gelesen werden.

**Sollrichtung:** Pädagogische Dokumentation und v1-Praxistest auf die aktuelle Informationsarchitektur umstellen. Historische README-Releases unverändert lassen.

## K-06 – Fachspezifikationen tragen unterschiedliche alte App-Versionsstände

**Schweregrad:** NIEDRIG–MITTEL / Governance  
**Status:** REVIEWED

Beispiele:
- `SUBJECT_SYSTEM.md`: v0.9.16
- `FOCUSED_LEARNING_UI.md`: v0.19.15
- `PAEDAGOGISCHE_DOKUMENTATION.md`: v0.18.40
- aktueller produktiver App-Stand: v0.21.7

Der Inhalt kann weiterhin korrekt sein, aber die Versionsköpfe lassen nicht eindeutig erkennen, ob ein Dokument veraltet oder nur seitdem unverändert gültig ist.

**Sollrichtung:** Für kanonische Fachquellen künftig statt eines bloßen alten App-Versionslabels zwei Felder verwenden:
- „fachlich zuletzt geprüft am“
- „gültig für aktuellen Stand: ja/nein“

## K-07 – Kleine redaktionelle Dopplung in Product DNA P9

**Schweregrad:** NIEDRIG  
**Status:** REVIEWED

Der Absatz zum sichtbaren Game Loop „Lernen → Tagesaktion → angreifen → Festung …“ steht in P9 in nahezu gleicher Form doppelt. Inhaltlich kein Problem, aber bei einer kanonischen Grundsatzquelle sollte die Doppelung entfernt werden.

---

# Nicht als Problem bewertet

## Erste neue Wörter dürfen unterstützt beginnen
Der adaptive Modus kann bei neuen Wörtern zunächst Recognition bzw. im LRS-Modus Listening wählen und plant anschließend wieder produktiven Abruf. Das ist mit der Product DNA vereinbar, weil Unterstützung keine Mastery erzeugt.

## Kontext ist Ergänzung, nicht Pflicht für jedes Wort
Kontext fließt in Mastery nur dann zwingender ein, wenn dort wiederholt Fehler auftreten. Das ist für einen Vokabeltrainer sinnvoller als eine pauschale Kontextpflicht für jedes Wort.

## Abschreiben bleibt freiwillig
Die Bibliothek trennt korrekt zwischen möglicher Einprägehilfe und nachgewiesenem Abruf. Es besteht kein Grund, Abschreiben wieder zum Freigabetor zu machen.

## Gamification muss nicht „Lernen beweisen“
Die aktuelle 2026er Studie zu gamifiziertem Feedback in adaptiver Retrieval Practice fand bessere subjektive Motivation, aber keinen Vorteil beim verzögerten Abruf. Damit ist die Projektentscheidung, Spielmechanik als Motivationsschicht und nicht als Lernnachweis zu behandeln, weiterhin gut begründet.

Quelle: https://doi.org/10.1016/j.chb.2025.108862

---

# Priorität

Vor einer Erweiterung der Lernlogik sollten in dieser Reihenfolge entschieden werden:

1. **K-01 Tagesziel-Erfolg sauber definieren**
2. **K-03 Spacing-Fortschritt gegen Same-Day-Inflation härten**
3. **K-02 Richtungsspezifische Retrieval-Evidenz für Testbereitschaft**
4. danach erst **B-004 Adaptives Nachrücken innerhalb desselben Tages**
5. K-04 bis K-07 als Konsistenz-/Dokumentationspaket bereinigen

## Fazit

Das Projekt ist pädagogisch **kein Sammelsurium von Features**, sondern besitzt bereits eine erkennbare Lernarchitektur. Die gefundenen Punkte verlangen keine neue Lernphilosophie. Sie betreffen vor allem die saubere Übersetzung der bereits richtigen Grundprinzipien in Status-, Scheduler- und Readiness-Semantik.

Die zentrale Linie sollte unverändert bleiben:

**fachlich richtige Paare → produktiver Abruf → korrektives Feedback → verteilte Wiederholung → konservative Mastery; Unterstützung und Motivation helfen, ersetzen diesen Nachweis aber nicht.**
