# Vokabeltrainer – Test Matrix

Stand: 27.09.2026

Ziel: Nicht nur festhalten, **dass** etwas getestet wurde, sondern welche Produktregel dadurch geschützt wird.

Die detaillierte praktische v1-Abnahme bleibt in [../../V1_ACCEPTANCE_TEST.md](../../V1_ACCEPTANCE_TEST.md). Dieses Dokument ordnet die Release-Gates den kanonischen Regeln zu.

| Gate | Schützt | Mindestnachweis | Release-Blocker |
|---|---|---|---|
| Fachliche Paarintegrität | D-0001, D-0002 | Sollantwort ↔ Bedeutung korrekt; OCR/Import nicht ungeprüft lernbar | ja |
| Quiz-Bewertung | D-0001 | richtige/falsche/normalisierte Antwort korrekt bewertet und erklärbar | ja |
| Mastery/Spacing | D-0003 | Hinweise/Audio/Erkennen erzeugen keine Mastery; mehrtägige Regeln bleiben erhalten | ja |
| Tagesplan | D-0004, D-20260927-004 | gleiche Formel in Vorschau und Tagesplan; fixes Pflichtziel; „heute sicher“ getrennt von Kontakt/Mastery; Nachrückpriorität, Nah-Test-Schutz, 7-Neuwort-Grenze und 3/2-Zusatzlimit korrekt | ja |
| Input-Integrity | D-0001 | Systemvorschläge/Autokorrektur umgehen die eigentliche Leistung nicht | ja |
| Lernfokus | D-0005 | keine störende Spielinszenierung im aktiven Abruf | ja, wenn kritischer Lernweg beeinträchtigt |
| Kindnavigation | D-0007 | nächster Schritt ohne Erklärung auffindbar; kein Sackgassenpfad | ja |
| Fachtrennung | D-0006 | Fachwechsel verändert keine fachfremden Daten/Regeln | ja bei Daten-/Bewertungsfehler |
| Family Sync | Datenintegrität | Rechte, Konflikte, Revoke, Backup/Restore, Gerätewechsel | ja bei Datenverlust/Rechtebruch |
| Accessibility | D-0007 + Grunddesign | Fokus, Dialoge, Touchflächen, Landscape, Screenreader-Semantik | nach Schweregrad; kritischer Pfad ja |
| Battle/Game | D-0003, D-0005 | keine Rückwirkung auf Mastery; Tagesaktion nicht duplizierbar; Fokusmodus rückkehrbar | ja bei fachlicher Rückwirkung |
| Praktische v1-Abnahme | gesamter Kernpfad | reales Gerät/Browser, Kind-/Elternwege ohne Entwicklerhilfe | vor v1 verpflichtend |

## Änderungsregel

Jede neue Grundsatzentscheidung muss vor `PRODUCTION` mindestens einem Gate zugeordnet werden. Gibt es kein passendes Gate, wird dieses Dokument erweitert.

Bei Änderungen an D-0001 bis D-0004 ist mindestens ein automatisierter Regressionstest erforderlich; reine manuelle Abnahme reicht dort nicht aus.

## Trennung der Testzustände

- **automatisiert grün** = technischer Nachweis für definierte Fälle
- **praktisch geprüft** = reales Nutzungsszenario wurde durchgeführt
- **fachlich freigegeben** = erwartete Regeln/Sollantworten wurden inhaltlich bestätigt
- **produktiv** = Änderung ist auf `main` gemergt und ausgerollt

Diese Zustände dürfen nicht synonym verwendet werden.
