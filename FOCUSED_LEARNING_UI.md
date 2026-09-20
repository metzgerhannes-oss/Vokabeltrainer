# Focused Learning UI

Stand: 20.09.2026 · App v0.10.1

## Ziel

Während eines aktiven Abrufs zeigt die App nur Informationen, die für die aktuelle Lernhandlung notwendig sind. Motivation, Kampagne, globale Navigation und diagnostische Fortschrittsanzeigen bleiben außerhalb der Abrufphase.

Damit setzt Punkt 5 insbesondere die Product-DNA-Prinzipien 2, 4, 8 und 9 um.

## Änderungen

### 1. Eigener Fokusmodus

Beim Start einer Lerneinheit erhält der `body` die Klasse `learning-focus`.

Währenddessen werden ausgeblendet:

- globale Kopfzeile
- Bottom Navigation
- Kampagne
- sonstige Startseiteninformationen
- Skill-Strip
- Verwechslungswarnungen vor der Antwort

Innerhalb der Lerneinheit bleiben sichtbar:

- Zurück
- Lernmodus
- Position in der Einheit
- ruhige Aufgabenorientierung ohne veränderlichen Fortschrittsbalken
- aktuelle Aufgabe
- notwendige Eingabe- und Hilfselemente

### 2. Kein Vorwegnehmen der Lösung

Lernhilfen mit der vollständigen Lösung werden nicht vor einem aktiven Abruf angezeigt.

Der in v0.9.x gefundene Spelling-Leak wurde bereits vor Punkt 5 mit v0.9.21 behoben und bestehende Spelling-Credits konservativ zur erneuten Validierung fällig gesetzt.

### 3. Sofortiges, aber nicht flüchtiges Feedback

Nach einer Antwort erscheint die Rückmeldung unmittelbar.

Die App springt danach nicht mehr nach wenigen hundert Millisekunden automatisch weiter. Stattdessen bleibt die Rückmeldung sichtbar, bis der Lernende bewusst **Weiter** auswählt.

Bei Fehlern können anschließend erscheinen:

- richtige Lösung
- Vergleich der Eingabe
- Lernkarte
- höchstens wenige relevante Verwechslungswörter

Diese Informationen erscheinen erst **nach** dem Abruf.

### 4. Inhaltlicher Abruf und Orthographie

Die allgemeine Bedeutungs-/Abrufprüfung bleibt bei unkritischer Zeichensetzung fehlertolerant. Schreibkompetenz wird dagegen separat und streng bewertet: Apostrophe und diakritische Zeichen werden nicht entfernt. Ein inhaltlich richtiger Abruf mit ungenauer Schreibweise kann daher Abrufkompetenz bestätigen, erhält aber keinen zusätzlichen Spelling-Credit. Der Schreibfehler wird zusätzlich im Fehlerprofil erfasst, die Spelling-Sicherheit konservativ abgesenkt und die Vokabel am Folgetag erneut fällig. Im direkten Schreibmodus gilt die ungenaue Form als Fehler.

Das verhindert insbesondere, dass Formen wie `cant` als orthographisch gleichwertig zu `can't` gelten, und bereitet die Architektur auf französische Akzente vor.

### 5. Lateinische Regelhilfe

Die Mini-Regel wird bei Latein-Formen nicht mehr automatisch vor der Antwort gezeigt.

Die Schaltfläche **Regelhilfe** blendet sie bei Bedarf ein und markiert den Versuch als unterstützt. Damit bleibt ein zunächst unabhängiger Abruf möglich.

### 6. LRS und Barrierefreiheit

Bereits im vorgeschalteten Audit ergänzt:

- sichtbarer Tastaturfokus
- mindestens 44 px hohe zentrale Bedienelemente
- Skip-Link
- zugängliche Namen für dynamische Antwortfelder
- `prefers-reduced-motion`
- keine erzwungene Großschreibung der kleinen Orientierungslabels im LRS-Modus
- ausreichenderer Kontrast bei Importhinweisen

## Evidenzbasis

Die Umsetzung ist absichtlich konservativ und wurde vor Abschluss von Punkt 5 erneut gegen aktuelle Literatur geprüft:

- **Digitales Feedback:** Brummer et al. (2024) fanden in einer Meta-Analyse digital vermittelten Feedbacks starke positive Effekte sowohl für unmittelbares als auch verzögertes Feedback; verzögertes Feedback war leicht stärker, wichtiger war aber eine konsistente Feedbackstrategie. Daraus folgt für die App keine Behauptung, unmittelbares Feedback sei generell überlegen. Wir geben die Korrektur direkt nach dem Abruf, lassen sie aber sichtbar, bis der Lernende selbst **Weiter** wählt. DOI: 10.1007/s10984-024-09501-4
- **Digitale Ablenkung:** Martin et al. (2025) fassten 26 Studien zu digitaler Ablenkung im Bildungskontext zusammen. Technologiebedingte Ablenkungen waren ein zentraler Ursachenbereich und Leistungsprobleme die häufigste berichtete Folge. Der Review enthält überwiegend Hochschulstudien und nur wenig K-12-Evidenz; deshalb wird daraus keine kindsspezifische Effektgröße abgeleitet. DOI: 10.1007/s11423-025-10550-6
- **Gamification während Retrieval Practice:** van den Broek et al. (2026) berichten für adaptive Retrieval Practice, dass Punkte und Fortschrittsbalken Motivation steigerten, aber keinen nachweisbaren Effekt auf Lernverhalten oder verzögerten Abruf hatten. Das stützt unsere Trennung: Kampagne/XP bleiben außerhalb des Abrufs; auch der veränderliche Session-Fortschrittsbalken wurde entfernt. DOI: 10.1016/j.chb.2025.108862
- **Kognitive Barrierefreiheit:** W3C-COGA empfiehlt kurze kritische Pfade, wenig unnötigen Inhalt, klare Labels und Kontrolle über unerwartete Inhaltsänderungen. Das passt zu unserem statischen Aufgabenbild und dem bewussten **Weiter**. Siehe W3C Cognitive Accessibility: „Help Users Focus“ und „Let Users Control When the Content Moves or Changes“.
- **LRS-Typografie:** Kleine Erhöhungen des Buchstabenabstands können insbesondere bei jungen Leserinnen und Lesern mit Dyslexie helfen; zugleich werden keine speziellen „Dyslexie-Schriften“ als Heilsversprechen eingesetzt. Die App nutzt gut lesbare Sans-Serif-Schriften und individuell einstellbare Größe/Abstände.

## Nicht behauptet

- Ein manueller Weiter-Button wird nicht als wissenschaftlich nachgewiesen lernwirksamer als jede Form automatischer Taktung dargestellt.
- Die App behauptet keine therapeutische Wirkung bei LRS.
- Gamification wird nicht generell als schädlich behandelt; sie wird lediglich während des Abrufs getrennt, um die Kernaufgabe nicht zu überlagern.

## Tests

`scripts/vokabeltrainer-focused-ui-smoke.mjs` prüft auf einem iPhone/WebKit-Profil:

- Fokusmodus wird beim Lernen aktiviert
- globale Navigation ist während des Abrufs nicht sichtbar
- diagnostische Extras erscheinen nicht vor der Antwort
- Antwortfeld besitzt einen zugänglichen Namen
- Feedback erscheint sofort
- kein automatisches Weiterblättern nach Feedback
- **Weiter** erhält Fokus
- keine automatische Weiterleitung
- strenge Orthographie im Schreibmodus
- semantisch richtiger Abruf mit Schreibfehler bleibt getrennt bewertet und wird früh erneut fällig
- Verlassen der Einheit stellt die normale Navigation wieder her
