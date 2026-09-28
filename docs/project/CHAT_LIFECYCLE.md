# Vokabeltrainer – Chat Lifecycle

Stand: 28.09.2026

Dieses Dokument regelt, wie Projektchats verwendet, verschlagwortet, in das Repository überführt und anschließend archiviert werden. Ziel ist nicht möglichst viel Chat-Historie, sondern ein kleiner, eindeutiger und aktueller Projektkontext.

## 1. Grundsatz

**Repository = verbindliche Wahrheit. Chat = Arbeitsprotokoll.**

Chats dürfen Ideen, Zwischenstände, Screenshots, Debugging und Entscheidungsfindung enthalten. Dauerhaft gültige Regeln, Statusaussagen oder offene Arbeit müssen jedoch in den kanonischen Repository-Quellen landen.

Ein archivierter oder alter Chat ist deshalb nie die primäre Quelle für den aktuellen Projektstand.

## 2. Chat-Tags

Für Projekttitel werden nur folgende Präfixe verwendet:

- `[DECISION]` – Grundsatzentscheidung oder Änderung einer bestehenden Regel
- `[CONCEPT]` – Produkt-, Lern- oder UX-Konzept
- `[RESEARCH]` – Fachliteratur, Evidenz, externe Gegenprüfung
- `[DEV]` – aktive Implementierung
- `[BUG]` – Fehlersuche und Korrektur
- `[TEST]` – praktische Abnahme, Screenshots und Regression
- `[ARCHIVE]` – abgeschlossen; keine aktive Quelle mehr

Ein Chat erhält nur den Tag, der seinen Hauptzweck beschreibt. Zusätzliche Themen werden in Backlog, Decision Register oder Fachquelle überführt statt durch immer längere Titel abzubilden.

## 3. Lebenszyklus eines Chats

1. **Aktiv:** Das Thema wird diskutiert, geprüft oder umgesetzt.
2. **Handoff:** Sobald ein belastbares Ergebnis vorliegt, wird es in die zuständige Repository-Quelle überführt.
3. **Verifiziert:** Umsetzung/Teststatus wird mit PR, Commit, CI und gegebenenfalls Live-Prüfung dokumentiert.
4. **Archivierbar:** Der Chat enthält keine Information mehr, die ausschließlich dort existiert.
5. **Archiv:** Der Chat darf mit `[ARCHIVE]` gekennzeichnet und im ChatGPT-Projekt archiviert werden.

Archivierung ersetzt niemals den Handoff ins Repository.

## 4. Mindest-Handoff vor Archivierung

Vor dem Archivieren eines relevanten Chats müssen – soweit zutreffend – genau diese Informationen im Repository gesichert sein:

- **Ergebnis:** Was wurde entschieden oder umgesetzt?
- **Kanonische Quelle:** Product DNA, Visual DNA, Fachspezifikation oder Decision-ID.
- **Umsetzung:** PR, Commit und Release/Version.
- **Verifikation:** `IMPLEMENTED`, `VERIFIED`, `PRODUCTION` oder `LIVE VERIFIED`.
- **Restpunkte:** offene Arbeit mit Backlog-ID; keine offenen Aufgaben nur im Chat.
- **Abgelöste Richtung:** bei verworfenen/ersetzten Regeln `REJECTED` bzw. `SUPERSEDED` mit Begründung.

## 5. Welche Chats werden erhalten?

### A – dauerhaft wertvoll
Grundsatzentscheidungen, Lernkonzept, LRS/DaZ, Evidenz, Testkonzept und Architektur.

Vorgehen: Ergebnis vollständig in kanonische Quelle/Decision überführen; danach kann auch dieser Chat archiviert werden.

### B – Arbeitsverlauf
Implementierung, CI-Fehler, Screenshots, wiederholte Statusabfragen, visuelle Korrekturschleifen.

Vorgehen: nur Endergebnis, PR/Commit, Verifikation und Restpunkte sichern; anschließend archivieren.

### C – obsolet
Verworfene Konzepte, alte Versionsstände, erledigte Bugs ohne verbleibende Erkenntnis.

Vorgehen: nur notwendige historische Entscheidung sichern; dann archivieren.

## 6. Regel für neue Arbeitschats

Bei jeder neuen nichttrivialen Entwicklungsaufgabe wird die Baseline zuerst aus dem Repository bestimmt:

1. `PROJECT_CONTROL.md`
2. `docs/project/CURRENT_STATE.md`
3. einschlägige Decision-/Fachquelle
4. aktueller Code/Tests auf `main`
5. alte Chats nur dann ergänzend, wenn eine Information dort noch rekonstruiert werden muss

Ein alter Chat darf einen neueren Repository-Stand niemals überschreiben.

## 7. Abschlussregel

Ein Entwicklungschat ist archivierbar, wenn:

- die Änderung auf den aktuellen Repository-Stand aufgelöst ist,
- die relevante Decision/Fachspezifikation aktualisiert ist,
- offene Punkte im Backlog stehen,
- der tatsächliche Implementierungs-/Produktionsstatus dokumentiert ist,
- keine einzigartige Projektinformation nur noch im Chat steckt.

Für reine Ideen ohne Freigabe genügt ein `IDEA`-Eintrag oder eine bewusste Entscheidung, sie nicht weiterzuführen.

## 8. Praktische Nutzung

Die ChatGPT-Archivierung selbst ist eine Oberfläche außerhalb des Repositorys. Dieses Dokument definiert deshalb die **inhaltlichen Voraussetzungen und die Benennung**, nicht die technische Archivaktion.

Empfohlene Titelform:

`[TAG] Kurzes Thema – optional Version/Teilbereich`

Beispiele:

- `[BUG] Festungsvorschau iPhone – v0.21.23`
- `[DEV] Nahtloser Übungsraum – v0.21.24`
- `[RESEARCH] Deutsch Grundschule 1–4 – Evidenz`
- `[ARCHIVE] Battle-Banner v0.21.14–19`

Damit bleibt die Chatliste durchsuchbar, während das Repository die fachliche Wahrheit trägt.
