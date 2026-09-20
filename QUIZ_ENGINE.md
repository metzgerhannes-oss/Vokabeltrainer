# Quiz Engine – Vokabelabfrage als Kernprodukt

Stand: 20.09.2026

## Ziel

Die Abfrage darf eine korrekte Antwort nur dann als falsch markieren, wenn die **vorher gezeigte Frage** und ihre **vorher festgelegten Sollantworten** dies tatsächlich ergeben. Bibliotheks-, Sense- oder Lernsetdaten dürfen sich während einer Aufgabe nicht erneut in die Bewertung einmischen.

## Architektur

### 1. Datenqualität vor Lernen

Foto-/OCR-Importe werden nicht mehr automatisch zum Lernen freigegeben.

- breite Übersetzungsspalten werden erhalten
- automatisch ergänzte Wörter/Bedeutungen sind nicht vorausgewählt
- OCR-Vokabeln sind zunächst nicht verifiziert
- das Lernset erhält `pairReviewRequired=true`
- Tagesziel, Lernmodus und Testcheck schließen solche Lernsets aus
- vor der Freigabe zeigt **Paare prüfen** exakt Wort ↔ Bedeutung sowie alle akzeptierten Varianten
- erst **Paare stimmen · Lernen freigeben** hebt die Sperre auf
- bereits bestehende ältere Fotoimporte werden einmalig ebenfalls zur Paarprüfung gezwungen

### 2. Unveränderliche Frage

`js/quiz-engine.js` erzeugt für jede bewertete Aufgabe einen Snapshot mit:

- Lernset-Link
- Lernstand-ID
- Vokabel-ID
- Sense-ID
- angezeigter Frage
- akzeptierten Antworten
- Abfragerichtung
- Orthographie-Regel

Der Snapshot wird mit `Object.freeze()` fixiert. Was angezeigt wurde, bleibt damit bis zur Bewertung dieselbe Aufgabe.

### 3. Eine zentrale Bewertung

`gradeQuizQuestion()` ist die zentrale Bewertungsfunktion.

Sie trennt:

- semantisch korrekt
- orthographisch korrekt
- Gesamtbewertung der konkreten Aufgabe

Schreibmodus und Diktat sind orthographisch streng. Beim normalen Abruf kann eine semantisch richtige, aber orthographisch ungenaue Antwort getrennt bewertet und früh erneut fällig werden.

### 4. Keine implizit erfundenen Alternativen

Antwortstrings werden nicht mehr automatisch an `/`, `;` oder `,` zerlegt.

Beispiel:

- `to look at sb/sth` bleibt **eine** Antwort
- `schauen; ansehen` erzeugt nicht still zwei Antworten

Mehrere gültige Formulierungen müssen explizit als Sense-Synonyme oder akzeptierte Overrides im Datenmodell vorliegen.

### 5. Stabile Identität bei Wiederholung

Die Lernqueue enthält nicht mehr nur eine Lernstand-ID, sondern eine feste Referenz aus:

- `setLinkId`
- `progressId`
- `setId`
- `vocabId`
- `senseId`

Retry und adaptive Folgeaufgaben übernehmen dieselbe Referenz. Eine Vokabel, die in mehreren Lernsets vorkommt, kann dadurch nicht mehr unbemerkt auf den Wortlaut eines anderen Lernsets wechseln.

### 6. Fail closed

Wenn Lernset, Sense oder Vokabel-ID nicht mehr zur gezeigten Frage passen, wird die Aufgabe gestoppt.

Sie wird **nicht als falsch gewertet**.

Die App führt dann direkt zu **Paare prüfen**.

### 7. Nachvollziehbare Ergebnisse

Die Ergebnisübersicht speichert für jede Aufgabe:

- Question-ID
- exakten Lernset-Link
- Frage
- eigene Antwort
- akzeptierte Sollantworten
- Bewertung
- Orthographie-Bewertung
- Hilfe ja/nein

Damit ist eine fehlerhafte Bewertung reproduzierbar.

## Tests

Der Abfragekern wird unter anderem durch folgende Prüfungen geschützt:

- `vokabeltrainer-quiz-engine-smoke.mjs`
- `vokabeltrainer-learning-integrity-smoke.mjs`
- `vokabeltrainer-correct-answer-diagnostic.mjs`
- `vokabeltrainer-ocr-pairing-smoke.mjs`
- `vokabeltrainer-set-repair-smoke.mjs`
- `vokabeltrainer-pair-review-ui-smoke.mjs`
- Focused-Learning-WebKit-Test
- Chromium-Service-Worker-/Offline-Test

## Produktregel

**Abfragequalität schlägt Automatik.**

Wenn die App eine Zuordnung nicht sicher kennt, muss sie nachfragen oder das Lernen blockieren. Sie darf keine vermutlich passende Übersetzung erfinden und anschließend das Kind dagegen bewerten.
