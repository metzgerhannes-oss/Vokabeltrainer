# Vokabeltrainer – Project Control Center

Stand: 28.09.2026

Dieses Dokument ist der zentrale Einstieg für Produkt-, Architektur-, Lern-, UX- und Release-Entscheidungen. Es ersetzt keine Fachspezifikation, sondern ordnet die vorhandenen Quellen und verhindert, dass Chatverläufe, alte Audits, Implementierung und verbindliche Produktentscheidungen vermischt werden.

## 1. Grundregel: Repository vor Chatgedächtnis

Für den verbindlichen Projektstand gilt das Repository als **Single Source of Truth**.

Chatverläufe, Erinnerungen und Ideen dürfen zur Rekonstruktion und als Kontext dienen. Eine Aussage gilt aber erst dann als verbindlicher Projektstand, wenn sie einer der unten genannten Quellen eindeutig zugeordnet werden kann oder als neue Entscheidung in [docs/project/DECISIONS.md](docs/project/DECISIONS.md) dokumentiert wurde.

Ist eine Frage im Repository noch nicht geregelt, muss sie als **Vorschlag / neue Entscheidung** bezeichnet werden und darf nicht als bestehende Regel dargestellt werden.

## 2. Quellenhierarchie

Bei Widersprüchen gilt grundsätzlich folgende Rangfolge:

1. **[PRODUCT_DNA.md](PRODUCT_DNA.md)** – fachliche und didaktische Grundprinzipien
2. **[VISUAL_DNA.md](VISUAL_DNA.md)** – verbindliche visuelle und UX-bezogene Leitplanken, soweit sie der Product DNA nicht widersprechen
3. **Fachspezifikationen** – z. B. [QUIZ_ENGINE.md](QUIZ_ENGINE.md), [SENSE_MODEL.md](SENSE_MODEL.md), [SUBJECT_SYSTEM.md](SUBJECT_SYSTEM.md), [SYNC_ARCHITECTURE.md](SYNC_ARCHITECTURE.md), [LIBRARY_INDEX.md](LIBRARY_INDEX.md), [docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md](docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md)
4. **[docs/project/DECISIONS.md](docs/project/DECISIONS.md)** – explizite Grundsatz- und Änderungsentscheidungen mit ID, Datum, Status und Quelle
5. **[docs/project/CURRENT_STATE.md](docs/project/CURRENT_STATE.md)** – aktueller Produktions- und Verifikationsstand
6. **Code + automatisierte Tests auf `main`** – tatsächliche Implementierungswahrheit
7. **[V1_ACCEPTANCE_TEST.md](V1_ACCEPTANCE_TEST.md)** und [docs/project/TEST_MATRIX.md](docs/project/TEST_MATRIX.md) – praktische/technische Verifikation
8. **README, Audits und historische Release-Dokumente** – Verlauf und Begründung, aber keine höhere Autorität als aktuellere verbindliche Quellen

Spezialregel: Bei fachlicher Vokabelbewertung hat die Product DNA immer Vorrang. Bei einer Abweichung zwischen Dokumentation und tatsächlich laufendem Code ist die Abweichung ein Fehlerzustand und muss ausdrücklich benannt werden.

## 3. Antwortstandard für Grundsatzfragen

Wenn zu diesem Projekt nach einer Meinung, Bewertung, Priorisierung oder Grundsatzentscheidung gefragt wird, soll die Antwort künftig vier Dinge sauber trennen:

1. **Projektgrundlage** – welche bestehende Regel/Entscheidung greift?
2. **Bewertung** – passt der Vorschlag dazu, kollidiert er damit oder ist er noch ungeregelt?
3. **Quelle** – konkrete Datei und möglichst Abschnitt bzw. Decision-ID nennen.
4. **Änderungsbedarf** – falls die bestehende Regel angepasst werden sollte, dies ausdrücklich als Änderungsvorschlag markieren.

Beispiel:

> Das passt zu Product DNA P6 „Tagesziel“ und D-20260927-010. Die neue Idee verändert aber die festgelegte Größe oder Struktur des verpflichtenden Tageskerns. Deshalb wäre sie keine reine UI-Anpassung, sondern eine Scheduler-Entscheidung. Quellen: `PRODUCT_DNA.md` § „Die 13 Prinzipien“, Punkt 6; `docs/project/DECISIONS.md` D-20260927-010.

Damit ist jederzeit nachvollziehbar, **warum** eine Empfehlung gegeben wurde und **welche Quelle geändert werden müsste**, wenn eine andere Grundsatzentscheidung getroffen wird.

## 4. Statusmodell

Jeder neue Punkt erhält genau einen Status:

- `IDEA` – noch nicht fachlich bewertet
- `REVIEWED` – geprüft, aber noch nicht freigegeben
- `APPROVED_BACKLOG` – als sinnvoll beschlossen, noch nicht umgesetzt
- `IN_IMPLEMENTATION` – Umsetzung läuft
- `IMPLEMENTED` – im Code vorhanden
- `VERIFIED` – automatisiert oder praktisch geprüft
- `PRODUCTION` – auf `main` und produktiv ausgerollt
- `REJECTED` – bewusst verworfen; Begründung bleibt dokumentiert
- `SUPERSEDED` – durch eine spätere Entscheidung ersetzt

`IMPLEMENTED` bedeutet ausdrücklich **nicht automatisch** `VERIFIED` oder `PRODUCTION`.

## 5. Pflegepflicht bei Änderungen

Eine Änderung ist erst vollständig dokumentiert, wenn die betroffenen Ebenen aktualisiert wurden:

- Grundprinzip geändert → `PRODUCT_DNA.md` bzw. `VISUAL_DNA.md` + neue/aktualisierte Decision-ID
- Fachlogik geändert → zuständige Fachspezifikation + Decision-ID + Tests
- neue offene Arbeit → `docs/project/BACKLOG.md`
- Umsetzung abgeschlossen → Backlog-Status + `CURRENT_STATE.md`, falls produktrelevant
- Release-/Testanforderung geändert → `TEST_MATRIX.md` bzw. `V1_ACCEPTANCE_TEST.md`
- bewusst verworfene Richtung → Decision auf `REJECTED` oder `SUPERSEDED`, nicht still löschen

## 6. Projektquellen

### Kern
- [PRODUCT_DNA.md](PRODUCT_DNA.md)
- [VISUAL_DNA.md](VISUAL_DNA.md)
- [docs/project/DECISIONS.md](docs/project/DECISIONS.md)
- [docs/project/CURRENT_STATE.md](docs/project/CURRENT_STATE.md)
- [docs/project/BACKLOG.md](docs/project/BACKLOG.md)
- [docs/project/TEST_MATRIX.md](docs/project/TEST_MATRIX.md)
- [docs/project/CHAT_LIFECYCLE.md](docs/project/CHAT_LIFECYCLE.md) – Chat-Tags, Repository-Handoff und Archivkriterien

### Fachmodelle
- [QUIZ_ENGINE.md](QUIZ_ENGINE.md)
- [SENSE_MODEL.md](SENSE_MODEL.md)
- [SUBJECT_SYSTEM.md](SUBJECT_SYSTEM.md)
- [LIBRARY_INDEX.md](LIBRARY_INDEX.md)
- [SYNC_ARCHITECTURE.md](SYNC_ARCHITECTURE.md)
- [FOCUSED_LEARNING_UI.md](FOCUSED_LEARNING_UI.md)
- [CACHE_STRATEGY.md](CACHE_STRATEGY.md)
- [docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md](docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md) – kanonische evidenzgeprüfte Fachbasis für Deutsch Grundschule 1–4

### Verifikation und Historie
- [V1_ACCEPTANCE_TEST.md](V1_ACCEPTANCE_TEST.md)
- [FINAL_AUDIT.md](FINAL_AUDIT.md)
- [docs/DEEP_AUDIT_v0.18.39.md](docs/DEEP_AUDIT_v0.18.39.md)
- [README.md](README.md)

## 7. Änderungsprinzip

Das Control Center ist kein zweiter Produktentwurf. Inhalte werden nicht mehrfach in verschiedenen Dateien ausgeschrieben, wenn bereits eine kanonische Fachquelle existiert. Stattdessen werden Quelle, Status und Abhängigkeiten verlinkt.

Ziel: Bei jeder späteren Frage muss klar sein, ob eine Aussage **Prinzip, Entscheidung, Implementierung, Testbefund, Backlog oder bloße Idee** ist.


## 8. Verbindliches Arbeitsprotokoll

Für jede Umsetzung gilt ab jetzt dieselbe Reihenfolge:

1. **Baseline live aus dem Repository bestimmen** – `main`, aktuelle App-Version, offene PRs und `CURRENT_STATE.md` prüfen. Chatgedächtnis allein ist keine Baseline.
2. **Betroffene kanonische Regel bestimmen** – Product DNA, Visual DNA, Fachspezifikation oder Decision-ID nennen. Ist nichts geregelt, zuerst eine neue Decision anlegen.
3. **Abnahmekriterien vor der Änderung festlegen** – beobachtbar und testbar, einschließlich Gerät/Viewport, Datenzustand und ausdrücklich unveränderter Logik.
4. **Änderung in genau einem aktiven Änderungsstrang umsetzen** – für denselben Fehler bzw. dieselbe Funktionsgruppe nicht parallel konkurrierende Implementierungen erzeugen. Andere Ideen werden in den Backlog überführt.
5. **Automatisiert verifizieren** – passende Fach-, Browser- und Regressionstests ausführen. Eine visuelle Änderung benötigt zusätzlich einen geometrischen/visuellen Browsernachweis.
6. **Produktiv verifizieren** – nach Merge auf `main` CI und Pages-Deploy prüfen. Bei sichtbaren UI-Änderungen muss zusätzlich die produktive Darstellung auf dem Zielgerät bzw. Zielviewport geprüft werden.
7. **Projektstatus aktualisieren** – produktrelevante Änderungen in `CURRENT_STATE.md`, Testanforderungen in `TEST_MATRIX.md`/`V1_ACCEPTANCE_TEST.md`, Grundsatzänderungen in `DECISIONS.md`.

Ein neuer Chat darf Anforderungen formulieren oder Entscheidungen vorbereiten. Sobald Code geändert wird, muss der Änderungsstrang jedoch wieder gegen die aktuelle Repository-Baseline aufgelöst werden. Damit können parallele Chats keinen veralteten Codezustand zur vermeintlichen Wahrheit machen.

## 9. Abnahmekriterien sind Pflicht

Vor jeder nichttrivialen Umsetzung müssen konkrete Abnahmekriterien vorliegen. Sie beschreiben **sichtbares bzw. fachlich prüfbares Verhalten**, nicht nur die beabsichtigte Codeänderung.

Für UI-Änderungen enthalten sie mindestens:

- Zielgerät oder Zielviewport, z. B. iPhone 390×844 oder Desktop ≥1100 px
- welche Elemente sichtbar sein müssen
- welche Elemente nicht sichtbar sein dürfen
- welche Elemente sich nicht überlagern dürfen
- welcher Rückweg bzw. nächste Schritt verfügbar sein muss
- welche fachliche Logik unverändert bleiben muss

Für Lern-/Datenlogik enthalten sie mindestens:

- Ausgangszustand
- auslösende Aktion
- erwarteten Zustand danach
- Negativfall bzw. Fehlerfall
- Persistenz-/Sync-Verhalten, falls betroffen
- zu schützende Decision-ID bzw. Product-DNA-Regel

Als Arbeitsvorlage dient [docs/project/CHANGE_TEMPLATE.md](docs/project/CHANGE_TEMPLATE.md).

## 10. Visuelle Änderungen: Referenz → Render → Vergleich

Für visuelle Änderungen gilt eine zusätzliche Pflichtschleife:

**Referenz/Anforderung → Umsetzung → Browser-Render im Zielviewport → geometrischer/visueller Vergleich → Regressionstest → Produktivprüfung**

Ein DOM-/CSS-Test allein reicht nicht, wenn der Fehler visuell oder geometrisch ist. Insbesondere Überlagerungen, Vollbildzustände, Bannerpositionen, Abstände und mobile Navigation müssen im Browserlayout gemessen oder praktisch angesehen werden.

Wenn ein Nutzer-Screenshot die Abweichung zeigt, wird dieser Befund als Abnahmereferenz behandelt. Eine Änderung darf nicht als erledigt bezeichnet werden, solange derselbe sichtbare Fehler im Zielviewport fortbesteht.

## 11. Definition von „fertig“ und „live“

Statuswörter werden strikt verwendet:

- **IMPLEMENTED** – Code/Dokumentation liegt im Änderungsbranch vor.
- **VERIFIED** – die definierten automatisierten und ggf. praktischen Abnahmekriterien sind erfüllt.
- **PRODUCTION** – Änderung ist auf `main` gemergt und der dafür relevante Deploy ist erfolgreich.
- **LIVE VERIFIED** – bei produktrelevanten UI-/Ablaufänderungen wurde zusätzlich die produktive Anwendung geprüft.

Die Aussage **„fertig und live“** ist nur zulässig, wenn mindestens gilt:

`Merge auf main → erforderliche CI grün → Pages-Deploy grün → bei sichtbarer Änderung Live-Prüfung erfolgreich`.

Fehlt ein Schritt, wird genau der erreichte Status genannt. Ein Commit, grüner PR-Test oder Merge allein ist nicht gleichbedeutend mit „live“.

## 12. Konsistenzschutz

`scripts/vokabeltrainer-project-control-smoke.mjs` schützt die Projektsteuerung automatisiert. Der Check vergleicht insbesondere:

- App-Version in `js/core.js`
- Service-Worker-Version in `sw.js`
- sichtbare Version in `index.html`
- aktuelle Version in `README.md`
- Produktionsbaseline in `docs/project/CURRENT_STATE.md`
- Basisversion in `V1_ACCEPTANCE_TEST.md`
- Existenz der kanonischen Projektsteuerungsdateien
- eindeutige Decision- und Backlog-IDs

Der Check läuft im Preflight der CI. Damit wird Dokumentationsdrift zu einem sichtbaren Buildfehler statt zu einem späteren Rekonstruktionsproblem.

## 13. Chat-Lifecycle und Archivierung

Projektchats sind Arbeitsprotokolle und keine dauerhafte Statusdatenbank. Die verbindliche Regel steht in [docs/project/CHAT_LIFECYCLE.md](docs/project/CHAT_LIFECYCLE.md).

Für alte und neue Chats gilt:

- Titel werden nach ihrem Hauptzweck mit `[DECISION]`, `[CONCEPT]`, `[RESEARCH]`, `[DEV]`, `[BUG]`, `[TEST]` oder `[ARCHIVE]` gekennzeichnet.
- Vor Archivierung werden Ergebnis, Decision/Fachquelle, PR/Commit/Release, Verifikationsstatus und offene Restpunkte in die kanonischen Repository-Quellen überführt.
- Offene Arbeit darf nicht ausschließlich in einem Chat verbleiben; sie erhält eine Backlog-ID.
- Alte Versions- und CI-Stände aus Chats dürfen einen aktuelleren Repository-Stand nicht überschreiben.
- Bei neuen Entwicklungsaufgaben wird zuerst die Repository-Baseline bestimmt; alte Chats werden nur ergänzend zur Rekonstruktion herangezogen.

Damit ist Archivierung eine Aufräummaßnahme für den Arbeitsraum, nicht Teil der fachlichen Wahrheit des Projekts.
