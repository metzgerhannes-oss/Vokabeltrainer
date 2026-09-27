# Vokabeltrainer – Backlog

Stand: 27.09.2026

Dieses Backlog enthält nur Punkte, die als Projektarbeit erhalten bleiben sollen. Reine Ideen ohne Bewertung gehören zunächst in den Status `IDEA`; als sinnvoll bestätigte, aber noch nicht umgesetzte Punkte in `APPROVED_BACKLOG`.

## B-001 – Deutsch Grundschule / 1. Klasse
**Status:** APPROVED_BACKLOG  
**Priorität:** noch nicht terminiert  
**Betroffene Quellen:** `SUBJECT_SYSTEM.md`, `VISUAL_DNA.md`, künftig eigene Fach-Spezifikation

Geplanter eigener Lernbereich mit altersgerechter Progression:
Buchstaben kennenlernen, mit dem Finger nachmalen, Aussprache/Laut-Buchstaben-Zuordnung, erste Wörter lesen und schreiben; anschließend Lernwörter der Grundschule sowie Schreiben einfacher Wörter und Sätze.

Vorgabe: seriöse, kindgerechte eigene visuelle Welt; Deutsch 1 darf nicht einfach die militärische Englisch-/Lateinlogik kopieren.

## B-002 – Eigene finale Latein-Grafikserie
**Status:** APPROVED_BACKLOG  
**Priorität:** nach Kernstabilität / im Rahmen der visuellen Ausarbeitung  
**Betroffene Quelle:** `VISUAL_DNA.md`

Latein ist fachlich eigenständig. Der technische Stand verwendet an einzelnen Stellen noch bewusste Fallbacks, bis die eigene finale Legion-/Avatarserie vollständig vorliegt.

## B-003 – Französisch als eigener Fachbereich
**Status:** APPROVED_BACKLOG  
**Priorität:** nach Englisch/Latein-Stabilisierung  
**Betroffene Quellen:** `PRODUCT_DNA.md` P11, `SUBJECT_SYSTEM.md`, `VISUAL_DNA.md`

Französisch soll gemeinsame technische Grundlagen nutzen, aber eigene Fachregeln für Akzente, Formen, Aussprache und eine eigene visuelle Reise-/Sprachwelt erhalten. Die visuelle Vorbereitung ist nicht mit fachlicher Freischaltung gleichzusetzen.

## B-004 – Adaptives Nachrücken innerhalb desselben Tages
**Status:** PRODUCTION  
**Priorität:** P0/P1  
**Decision:** D-20260927-004  
**Betroffene Quellen:** `PRODUCT_DNA.md` P3/P6, Lern-/Scheduler-Code, Tests

Ziel: Wenn ein Kind die geplanten Tageswörter schneller und zuverlässig bearbeitet, dürfen geeignete neue Wörter im selben Lerntag nachrücken.

Umgesetzt in PR #138 / v0.21.8:
- „heute sicher“ ist technisch getrennt von nachhaltiger Mastery und `completedKeys`
- nur produktive, unassistierte und orthografisch korrekte aktive Abrufe zählen
- testbereite Wiederholungswörter benötigen einen sicheren Abruf; neue/schwache Wörter zwei getrennte sichere Abrufe ohne Fehler dazwischen
- Nachrücken folgt der Priorität neues Testwort → schwaches Testwort → fällige bekannte Wiederholung
- in den letzten drei Tagen vor dem Test werden keine zusätzlichen unbekannten Wörter nachgezogen
- maximal drei Zusatzwörter, im LRS-Modus zwei; maximal sieben neu eingeführte Wörter pro Tag bleiben die Obergrenze
- Pflicht-Tagesziel, Mastery und Battle-Aktion bleiben unverändert; Nachrücker werden erst als freiwilliger nächster Lernschritt angeboten und nicht in die laufende Pflicht-Einheit gezwungen
- Persistenz und Family Sync transportieren Sicherheitsstatus, Evidenz und Zusatzwörter
- automatisierte Learning-Integrity- und Family-Sync-Regressionstests sind Bestandteil der Release-CI

Produktionsnachweis: PR-CI #945 erfolgreich, Merge PR #138 auf `main` (`1aa7983c330288a2091c60802ee2c503a716c04d`), main-CI #946 erfolgreich und Pages-Deploy #504 inklusive Live-Verifikation von v0.21.8 erfolgreich.

## B-007 – Tagesziel nur nach fachlich erfolgreichem Abruf erledigen
**Status:** PRODUCTION  
**Priorität:** P0  
**Decision:** D-20260927-005  
**Betroffene Quellen:** `PRODUCT_DNA.md` P4/P6, `js/learning.js`, Learning-Integrity-Smoke

Produktiv seit **v0.21.9 / PR #142**. Ein falscher oder unterstützter aktiver Versuch markiert ein Pflichtwort nicht als erledigt. Erst ein fachlich richtiger, unassistierter aktiver Abruf setzt `completedKeys`. PR-CI #950, main-CI #951 und Pages #507 sind grün.

## B-008 – Spacing-Erfolg gegen Same-Day-Inflation härten
**Status:** PRODUCTION  
**Priorität:** P1  
**Decision:** D-20260927-006  
**Betroffene Quellen:** `PRODUCT_DNA.md` P3, `js/learning.js`, Learning-Integrity-Smoke

Produktiv seit **v0.21.10 / PR #143**. Mehrere richtige aktive Abrufe desselben Wortes am selben Tag verbessern weiterhin Accuracy und Übungsevidenz, verlängern das nächste Wiederholungsintervall aber nicht mehrfach. Spacing-Fortschritt wird aus unterschiedlichen aktiven Erfolgstagen abgeleitet. PR-CI #952, main-CI #953 und Pages #508 sind grün.

## B-009 – Testbereitschaft richtungsspezifisch prüfen
**Status:** IN_IMPLEMENTATION  
**Priorität:** P1  
**Decision:** D-20260927-007  
**Betroffene Quellen:** `PRODUCT_DNA.md` P2, `js/model.js`, `js/learning.js`, Lernintegritäts- und Menü-Smokes

Für die Testbereitschaft werden Bedeutung → Fremdsprachenwort und Fremdsprachenwort → Bedeutung getrennt nachgewiesen. Ein `mixed`-Test verlangt beide Richtungen; Diktat bleibt an die produktive Rechtschreib-/Abrufbasis gebunden. Recognition und Listening erhöhen den numerischen Readiness-Score nicht.

Bestehende Lernstände werden konservativ aus vorhandenen Aktivitätsdaten und – nur wenn nötig – bereits dokumentierten Abrufmodi migriert; es wird keine historisch nie geübte Richtung erfunden.

## B-010 – Lernbibliothek redaktionell harmonisieren
**Status:** IN_IMPLEMENTATION  
**Priorität:** P2  
**Quelle:** `docs/project/LEARNING_COHERENCE_REVIEW.md`

Aktuelle Navigation in Pädagogik- und Acceptance-Dokumenten auf **Heute · Lernen · Armee · Erfolge** vereinheitlichen, kanonische Fachquellen mit einem eindeutigen fachlichen Prüfstatus versehen und die redaktionelle Dopplung in Product DNA P9 entfernen. Historische README-Releaseeinträge bleiben als Historie unverändert.


## B-005 – Praktische v1-Abnahme
**Status:** APPROVED_BACKLOG / RELEASE TASK  
**Priorität:** vor v1.0  
**Quelle:** `V1_ACCEPTANCE_TEST.md`

Die praktische Checkliste auf realem Gerät/Browser muss tatsächlich durchgeführt und dokumentiert werden. Automatisierte CI ersetzt diese Abnahme nicht.

## B-006 – GitHub-Branchregel „up to date before merge“
**Status:** APPROVED_BACKLOG / INFRA  
**Priorität:** vor formaler v1-Freigabe prüfen  
**Quelle:** `FINAL_AUDIT.md`

Die administrative Repository-Regel ist laut Final Audit noch gesondert zu aktivieren bzw. zu verifizieren.

## Pflege

Ein Backlog-Punkt wird nicht gelöscht, wenn er umgesetzt oder verworfen wird:
- Umsetzung → Status auf `IMPLEMENTED`, anschließend `VERIFIED` / `PRODUCTION`
- Verwerfung → Status auf `REJECTED` plus Decision-ID/Begründung
- Ersatz → `SUPERSEDED` plus Verweis auf Nachfolger
