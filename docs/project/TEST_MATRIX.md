## B-018 · Freies Schreiben Deutsch Klasse 1

| Prüfung | Automatisierung | Erwartung |
|---|---|---|
| Dachgeschoss – Erdgeschoss – Keller | `vokabeltrainer-b018-free-writing-smoke.mjs` + WebKit Paket C | drei klar benannte Schreibzonen direkt in der Schreibfläche, Hilfslinien unter der Spur; keine zusätzliche l/m/g-Legendenkarte |
| freie Buchstabenauswahl | WebKit Paket C | nur `m`, `M/m` und Mehrfachauswahl möglich; Aufgaben bleiben in der Auswahl |
| Buchstabenlaut | statischer B-018-Smoke + WebKit-Decoding + Praxisabnahme | 29 lokale MP3-Laute; kein Speech-Synthesis-Fallback; WebKit muss alle 29 Dateien tatsächlich decodieren und die Laut-Taste ohne Fehler auslösen; reale iPhone-Wiedergabe/Qualität praktisch prüfen |
| Fortschrittsneutralität | statischer B-018-Smoke + WebKit Paket C | keine Foundation-, Mastery-, Readiness-, Tagesziel-, XP- oder Battle-Mutation |

# Vokabeltrainer – Test Matrix

Stand: 27.09.2026

Ziel: Nicht nur festhalten, **dass** etwas getestet wurde, sondern welche Produktregel dadurch geschützt wird.

Die detaillierte praktische v1-Abnahme bleibt in [../../V1_ACCEPTANCE_TEST.md](../../V1_ACCEPTANCE_TEST.md). Dieses Dokument ordnet die Release-Gates den kanonischen Regeln zu.

| Gate | Schützt | Mindestnachweis | Release-Blocker |
|---|---|---|---|
| Fachliche Paarintegrität | D-0001, D-0002 | Sollantwort ↔ Bedeutung korrekt; OCR/Import nicht ungeprüft lernbar | ja |
| Quiz-Bewertung | D-0001 | richtige/falsche/normalisierte Antwort korrekt bewertet und erklärbar | ja |
| Mastery/Spacing | D-0003, D-20260927-006 | Hinweise/Audio/Erkennen erzeugen keine Mastery; mehrere Treffer am selben Tag verlängern das Intervall nicht mehrfach; höhere Intervalle brauchen unterschiedliche Erfolgstage | ja |
| Testbereitschaft | D-20260927-007 | `target` und `source` besitzen getrennte unabhängige Abrufnachweise; `mixed` verlangt beide; Diktat nutzt die produktive Basis; Recognition/Listening erhöhen den Readiness-Score nicht | ja |
| Tagesplan | D-0004, D-20260927-004, D-20260927-005, D-20260927-008 | gleiche Formel in Vorschau und Tagesplan; Pflichtwort erst nach richtigem unassistiertem aktivem Abruf erledigt; „heute sicher“ getrennt von Kontakt/Mastery; Nachrückpriorität, Nah-Test-Schutz, 7-Neuwort-Grenze und 3/2-Zusatzlimit über die unabhängige Einstellung „Kurze Einheiten“ korrekt | ja |
| LRS-/Lernunterstützung | D-20260927-008 | Lesen/Schreiben getrennt; Altprofil-Migration; Reading ohne Mastery-/Readiness-Effekt; echter Rechtschreibabruf für „heute sicher“ bei Schreibunterstützung; „Kurze Einheiten“ unabhängig; Eltern→Kind-Sync | ja bei falscher Bewertung, falscher Lernroute oder Datenverlust |
| Input-Integrity | D-0001 | Systemvorschläge/Autokorrektur umgehen die eigentliche Leistung nicht | ja |
| Lernfokus | D-0005 | keine störende Spielinszenierung im aktiven Abruf | ja, wenn kritischer Lernweg beeinträchtigt |
| Kindnavigation | D-0007 | nächster Schritt ohne Erklärung auffindbar; kein Sackgassenpfad | ja |
| Fachtrennung | D-0006 | Fachwechsel verändert keine fachfremden Daten/Regeln | ja bei Daten-/Bewertungsfehler |
| Deutsch v1 / Wortreich | D-20260927-009, D-20260928-008 | Deutsch auswählbar; Klasse-1-Kern, Lernwörter/Sätze, Audio und deutsche Bewertung funktionieren; Wortreich-Battle separat; Spiel verändert keine fachlichen Werte | ja – v1 darf ohne diesen Kern nicht freigegeben werden |
| Family Sync | Datenintegrität | Rechte, Konflikte, Revoke, Backup/Restore, Gerätewechsel | ja bei Datenverlust/Rechtebruch |
| Accessibility | D-0007 + Grunddesign | Fokus, Dialoge, Touchflächen, Landscape, Screenreader-Semantik | nach Schweregrad; kritischer Pfad ja |
| Battle/Game | D-0003, D-0005 | keine Rückwirkung auf Mastery; Tagesaktion nicht duplizierbar; Fokusmodus rückkehrbar | ja bei fachlicher Rückwirkung |
| Praktische v1-Abnahme | gesamter Kernpfad | reales Gerät/Browser, Kind-/Elternwege ohne Entwicklerhilfe | vor v1 verpflichtend |
| Dokumentationskohärenz | PROJECT_CONTROL / B-010 | aktuelle Fachquellen verwenden die aktuelle Navigation; kanonische Dokumente tragen einen fachlichen Prüfstatus; historische Release-Texte bleiben als Historie erkennbar | nein |\n| Project-Control-Konsistenz | D-20260927-001, D-20260927-003, D-20260927-009 | App-/SW-/UI-/README-/Current-State-/Acceptance-Version konsistent; kanonische Steuerdateien vorhanden; Decision-/Backlog-IDs eindeutig | ja für Release-/Statusdrift |

## Änderungsregel

Jede neue Grundsatzentscheidung muss vor `PRODUCTION` mindestens einem Gate zugeordnet werden. Gibt es kein passendes Gate, wird dieses Dokument erweitert.

Bei Änderungen an D-0001 bis D-0004 ist mindestens ein automatisierter Regressionstest erforderlich; reine manuelle Abnahme reicht dort nicht aus.

## Trennung der Testzustände

- **automatisiert grün** = technischer Nachweis für definierte Fälle
- **praktisch geprüft** = reales Nutzungsszenario wurde durchgeführt
- **fachlich freigegeben** = erwartete Regeln/Sollantworten wurden inhaltlich bestätigt
- **produktiv** = Änderung ist auf `main` gemergt und ausgerollt

Diese Zustände dürfen nicht synonym verwendet werden.


## Visuelle Abnahme

Bei Änderungen, deren Fehlerbild visuell oder geometrisch ist, genügt ein statischer Codecheck nicht. Die Mindestabnahme umfasst den Browser-Render im festgelegten Zielviewport und einen Vergleich mit der Anforderung bzw. Referenz. Überlagerung, Navigation, Vollbildzustand, Abstände und Positionen müssen dabei im realen Layout geprüft werden.

Erst nach erfolgreicher lokaler/CI-Verifikation und – nach dem Merge – produktiver Prüfung darf ein solcher Befund als `LIVE VERIFIED` gelten.
