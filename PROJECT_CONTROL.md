# Vokabeltrainer – Project Control Center

Stand: 27.09.2026

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
