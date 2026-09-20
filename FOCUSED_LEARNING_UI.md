# Focused Learning UI

Stand: 20.09.2026 · App v0.10.0

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
- ruhiger Fortschrittsbalken
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

Die allgemeine Bedeutungs-/Abrufprüfung bleibt bei unkritischer Zeichensetzung fehlertolerant. Schreibkompetenz wird dagegen separat und streng bewertet: Apostrophe und diakritische Zeichen werden nicht entfernt. Ein inhaltlich richtiger Abruf mit ungenauer Schreibweise kann daher Abrufkompetenz bestätigen, erhält aber keinen zusätzlichen Spelling-Credit. Im direkten Schreibmodus gilt die ungenaue Form als Fehler.

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

Die Umsetzung ist absichtlich konservativ:

- **Retrieval Practice + Feedback:** Eine EFL-Laborstudie von Aljabri (2024) fand Vorteile von Retrieval Practice mit Feedback und in diesem Setting bessere Langzeitwerte bei unmittelbarem gegenüber verzögertem Feedback. Die Stichprobe bestand aus erwachsenen EFL-Lernenden; deshalb wird daraus keine exakte Timing-Regel für Kinder abgeleitet. Für die App folgt daraus lediglich: Rückmeldung direkt nach dem Abruf geben und ausreichend verarbeitbar darstellen. DOI: 10.1057/s41599-024-03983-6
- **Seductive Details / Ablenkung:** Neuere Arbeiten bestätigen, dass interessante, aber lernirrelevante Details Aufmerksamkeit und Lernen beeinträchtigen können. Die Kampagne bleibt deshalb außerhalb des Abrufbildschirms. Siehe u. a. Kienitz et al. (2023), Instructional Science, DOI 10.1007/s11251-023-09632-w, sowie aktuelle Arbeiten 2024–2026 zum Seductive-Detail-Effekt.
- **WCAG 2.2:** Fokusdarstellung, nicht verdeckter Fokus und ausreichende Zielgrößen werden an WCAG 2.2 ausgerichtet. Besonders relevant: SC 2.4.11, 2.4.13 und 2.5.8. https://www.w3.org/TR/WCAG22/
- **Dyslexia Style Guide:** Die British Dyslexia Association empfiehlt u. a. gut lesbare Sans-Serif-Schriften, ausreichende Schriftgröße/Abstände und das Vermeiden längerer Texte in Versalien. https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide

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
- Verlassen der Einheit stellt die normale Navigation wieder her
