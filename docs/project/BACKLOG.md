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
**Status:** REVIEWED  
**Priorität:** P0/P1 erst nach sauberer fachlicher Spezifikation  
**Betroffene Quellen:** `PRODUCT_DNA.md` P3/P6, Lern-/Scheduler-Code, Tests

Ziel: Wenn ein Kind die geplanten Tageswörter schneller und zuverlässig bearbeitet, dürfen geeignete neue Wörter im selben Lerntag nachrücken.

Vor Freigabe zwingend:
- „heute sicher“ technisch getrennt von nachhaltiger Mastery definieren
- ein bloßer Kontakt darf kein Nachrücken auslösen
- nur tatsächlich korrekt abgeschlossene aktive Abrufe dürfen Kapazität freigeben
- Tagesgrenze von maximal 7 neuen Wörtern respektieren
- Spacing und mehrtägige Mastery nicht verkürzen
- Vorschau, Tagesplan, Session-Fortschritt und Persistenz müssen dieselbe Semantik verwenden
- Tests für Gerätewechsel/Reload und Family Sync vorsehen
- Abhängigkeit: B-007 muss vorher gelöst sein; sonst würde ein Fehlversuch fälschlich Kapazität zum Nachrücken freigeben

Erst nach Festlegung dieser Punkte von `REVIEWED` auf `APPROVED_BACKLOG` bzw. `IN_IMPLEMENTATION` setzen.

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

## B-007 – Tagesziel nur nach fachlich erfolgreichem Abruf erledigen
**Status:** REVIEWED  
**Priorität:** P0 vor adaptivem Nachrücken  
**Quelle:** `docs/project/LEARNING_COHERENCE_AUDIT_2026-09-27.md` K-01

Tagesplan-Kontakt und Tagesplan-Erfolg trennen. Ein falscher unassistierter aktiver Versuch darf ein Planwort nicht als erledigt markieren und keine vorzeitige Tagesaktion ermöglichen.

## B-008 – Spacing-Erfolg gegen Same-Day-Inflation härten
**Status:** REVIEWED  
**Priorität:** P1  
**Quelle:** `docs/project/LEARNING_COHERENCE_AUDIT_2026-09-27.md` K-03

Mehrere richtige aktive Abrufe desselben Wortes am selben Tag dürfen Accuracy verbessern, aber den spacing-relevanten Intervallfortschritt nicht mehrfach beschleunigen.

## B-009 – Testbereitschaft richtungsspezifisch prüfen
**Status:** REVIEWED  
**Priorität:** P1  
**Quelle:** `docs/project/LEARNING_COHERENCE_AUDIT_2026-09-27.md` K-02/K-04

Produktive und rezeptive Abrufrichtung für Testbereitschaft fachlich unterscheiden. Prozentanzeige zusätzlich darauf prüfen, ob passive Recognition-/Listening-Anteile als „Vorbereitung“ statt „Sicherheit“ bezeichnet werden müssen.

## B-010 – Lernbibliothek redaktionell auf aktuellen Stand harmonisieren
**Status:** REVIEWED  
**Priorität:** P2  
**Quelle:** `docs/project/LEARNING_COHERENCE_AUDIT_2026-09-27.md` K-05 bis K-07

Aktuelle Navigation in Pädagogik-/Acceptance-Dokumenten angleichen, Versionskopf-System vereinheitlichen und Dopplung in Product DNA P9 entfernen. Historische README-Releaseeinträge bleiben unverändert.

## Pflege

Ein Backlog-Punkt wird nicht gelöscht, wenn er umgesetzt oder verworfen wird:
- Umsetzung → Status auf `IMPLEMENTED`, anschließend `VERIFIED` / `PRODUCTION`
- Verwerfung → Status auf `REJECTED` plus Decision-ID/Begründung
- Ersatz → `SUPERSEDED` plus Verweis auf Nachfolger
