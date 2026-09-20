# Finales Audit vor Release-Candidate-Test

Stand: 20.09.2026 · App v0.10.2

## Ergebnis

Der Stand ist für den anschließenden Release-Candidate-/End-to-End-Test freigegeben, sobald die zugehörige CI vollständig grün abgeschlossen ist.

## Im Audit geprüft

### Datenmodell und Persistenz

- Sense-Modell: getrennte Bedeutungen, keine Mastery-Vererbung zwischen Senses
- globale Bibliothek: ISBN → Lehrwerk → Unit/Lektion → Vokabel/Sense
- Laufzeitindizes werden nicht persistiert
- IndexedDB bleibt Primärspeicher, localStorage nur Fallback
- Backup-Import wird vor der Migration plausibilisiert
- Restore wird nach dem Schreiben aus dem tatsächlich verwendeten Speicherbackend zurückgelesen
- Restore vergleicht Profile, Bücher, Buchzuordnungen, Lernsets, globale Vokabeln, Set-Zuordnungen, Lernfortschritt, Noten, Testchecks, Aktivität sowie aktives Profil/Fach
- Backup-Größenlimits entsprechen den Limits der State-Härtung

### Lernlogik

- Mastery bleibt konservativ: aktiver Abruf, Orthographie, mehrere Erfolgstage, zeitlicher Abstand und Cold Recall
- Hinweise zählen nicht wie unabhängige Abrufe
- Schreibmodus zeigt die Lösung nicht vor dem Abruf
- Apostrophe und diakritische Zeichen werden in Schreibkompetenz streng bewertet
- semantisch richtiger Abruf mit Orthographiefehler bekommt keinen Spelling-Credit und wird früh erneut fällig
- Testcheck bewertet Fremdsprachen-Schreibantworten und Diktat orthographisch streng
- Testcheck verändert Mastery/Intervalle weiterhin nicht
- Latein-Formentraining, Handschrift und abgeschlossene Testchecks zählen als aktive Lerntage, erzeugen dadurch aber keine zusätzliche Mastery

### Focused Learning / LRS / Accessibility

- globale Navigation und Kampagne verschwinden während des Abrufs
- kein dynamischer Fortschrittsbalken während der Aufgabe
- Feedback bleibt bis zum bewussten „Weiter“ stehen
- Hilfen erscheinen erst auf Wunsch bzw. nach der Antwort
- sichtbarer Tastaturfokus
- zentrale Zielgrößen mindestens 44 px
- Skip-Link
- zugängliche Namen dynamischer Antwortfelder
- Reduced Motion
- LRS-Modus ohne erzwungene Versalien in Orientierungslabels

### Sicherheit und Import

- CSP ohne unsafe-inline und unsafe-eval
- keine externen Laufzeit-Skripte erforderlich
- Datei-/CSV-/Backupdaten werden gehärtet und längenbegrenzt
- OCR läuft mit lokal ausgelieferten Ressourcen
- Bilddateien sind größenbegrenzt
- semantisch unklare OCR-Treffer werden nicht automatisch einem Sense zugeordnet

### PWA / Offline / Deployment

- versionsgetrennter App-Shell-Cache
- langlebiger OCR-/Wikidict-Ressourcencache
- Migration alter Cache-Pfade aus JohannasGartenwelt
- fremde Origin-Caches werden nicht gelöscht
- WebKit/iPhone-Smoke
- Chromium-Service-Worker-/Offline-Smoke
- GitHub-Pages-Workflow auf aktuellen stabilen Action-Majors

## Im finalen RC-Test noch praktisch zu prüfen

Diese Punkte sind absichtlich Bestandteil des nächsten End-to-End-Tests und nicht durch statische Audits ersetzbar:

1. echtes Profil neu anlegen und zwischen Profilen wechseln
2. ISBN fotografieren/eingeben und Lehrwerk zuordnen
3. Vokabelseite fotografieren, OCR kontrollieren und importieren
4. bekannte ISBN/Unit mit zweitem Profil wiederverwenden
5. Tagesziel über mehrere adaptive Lernmodi absolvieren
6. Schreibfehler, Hinweis, Fehlerwiederholung und Mastery-Entwicklung praktisch beobachten
7. Testcheck in Ziel-, Quell-, Mixed- und Diktatmodus
8. App schließen/neu öffnen und Datenbestand prüfen
9. offline starten und bereits gecachte Ressourcen verwenden
10. Backup erstellen, Daten verändern, Backup wiederherstellen und Bestand vergleichen

## Bewusste Grenzen vor v1

- „Globale Bibliothek“ ist derzeit global innerhalb des lokalen App-Datenbestands; geräteübergreifende Synchronisierung benötigt später eine Backend-/Sync-Schicht.
- Französisch bleibt deaktiviert, solange die vollständige lokale OCR-/Sprachressource nicht vorhanden und getestet ist.
- Browser/OS können Webspeicher unter extremem Speicherdruck löschen; deshalb bleibt der Backup-Export erforderlich.
- Der nächste Test ist bewusst ein realer End-to-End-Test; ein grüner CI-Stand ersetzt diesen nicht.
