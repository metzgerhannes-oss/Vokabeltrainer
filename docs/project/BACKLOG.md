# Vokabeltrainer – Backlog

Stand: 27.09.2026

Dieses Backlog enthält nur Punkte, die als Projektarbeit erhalten bleiben sollen. Reine Ideen ohne Bewertung gehören zunächst in den Status `IDEA`; als sinnvoll bestätigte, aber noch nicht umgesetzte Punkte in `APPROVED_BACKLOG`.

## B-001 – Deutsch Grundschule 1–4
**Status:** APPROVED_BACKLOG  
**Priorität:** noch nicht terminiert  
**Decision:** D-20260927-009  
**Kanonische Fachquelle:** `docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`  
**Weitere Quellen:** `PRODUCT_DNA.md` P8, `VISUAL_DNA.md` § 9, `SUBJECT_SYSTEM.md`, D-20260927-008

Der ursprünglich nur für die 1. Klasse vorgemerkte Deutschbereich ist nach Gegenprüfung gegen den aktuellen Bildungsplan Baden-Württemberg und aktuelle Fachliteratur auf **Klasse 1–4** erweitert.

Verbindliche Leitlinien der späteren Umsetzung:
- eigener Fuchs-Lernbereich statt Battle-Welt
- Kompetenzmodell von phonologischer Bewusstheit/Buchstaben über Lesen und Handschrift bis Rechtschreibung, Grammatik und Textproduktion
- LRS-Unterstützung dediziert als **Lesen**, **Rechtschreiben** oder **beides**
- DaZ/Mehrsprachigkeit als unabhängige Unterstützungsdimension, nicht als LRS
- früher Schriftspracherwerb mit expliziter Laut–Schrift-Verknüpfung und echter Handschrift; Nachspuren geht in freie Produktion über
- Lernwörter als Teil eines Mehrkomponenten-Rechtschreibsystems
- Papier-Diktat mit Foto/OCR als geplanter Modus; unsichere OCR darf nie als Fehler des Kindes gewertet werden
- LLM darf erklären/klassifizieren, aber nicht die deterministische Richtig/Falsch-Entscheidung oder rohe Handschrift ersetzen
- eigene Deutsch-Mastery-Dimensionen für Lesen, Schreiben/Rechtschreibung, Verstehen usw.

Die vollständige Evidenzbasis, Anpassungen und Literatur sind in der kanonischen Fachquelle dokumentiert.

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
**Status:** PRODUCTION  
**Priorität:** P1  
**Decision:** D-20260927-007  
**Betroffene Quellen:** `PRODUCT_DNA.md` P2, `js/model.js`, `js/learning.js`, Lernintegritäts- und Menü-Smokes

Für die Testbereitschaft werden Bedeutung → Fremdsprachenwort und Fremdsprachenwort → Bedeutung getrennt nachgewiesen. Ein `mixed`-Test verlangt beide Richtungen; Diktat bleibt an die produktive Rechtschreib-/Abrufbasis gebunden. Recognition und Listening erhöhen den numerischen Readiness-Score nicht.

Bestehende Lernstände werden konservativ aus vorhandenen Aktivitätsdaten und – nur wenn nötig – bereits dokumentierten Abrufmodi migriert; es wird keine historisch nie geübte Richtung erfunden.

Produktiv seit **v0.21.11 / PR #144**. PR-CI #954, main-CI #960 und Pages #509 sind grün; der Live-Deploy wurde erfolgreich verifiziert.

## B-010 – Lernbibliothek redaktionell harmonisieren
**Status:** PRODUCTION  
**Priorität:** P2  
**Quelle:** `docs/project/LEARNING_COHERENCE_REVIEW.md`

Produktiv über **PR #146**. Aktuelle Navigation in Pädagogik- und Acceptance-Dokumenten ist auf **Heute · Lernen · Armee · Erfolge** vereinheitlicht, kanonische Fachquellen tragen einen eindeutigen fachlichen Prüfstatus und die redaktionelle Dopplung in Product DNA P9 ist entfernt. Historische README-Releaseeinträge bleiben als Historie unverändert.

Produktionsnachweis: PR-CI #961, main-CI #962 und Pages #510 sind grün; der Live-Deploy wurde erfolgreich verifiziert.


## B-011 – Differenzierte LRS-Unterstützung Lesen / Rechtschreiben
**Status:** PRODUCTION  
**Priorität:** P1 vor praktischer v1-Abnahme  
**Decision:** D-20260927-008  
**Betroffene Quellen:** `PRODUCT_DNA.md` P6/P8, `js/core.js`, `js/model.js`, `js/learning.js`, `js/ui.js`, Family Sync, Release-CI

Der bisherige globale LRS-Schalter ist technisch in getrennte Unterstützung für **Lesen**
und **Rechtschreiben** aufgeteilt. **„Kurze Einheiten“** ist eine unabhängige Einstellung.
Altprofile werden konservativ migriert; Reading-Evidenz bleibt außerhalb von Mastery und
Testbereitschaft. Rechtschreibunterstützung priorisiert produktiven Schreibabruf und verlangt
für „heute sicher“ zusätzlich einen echten unassistierten Rechtschreibabruf.

Automatisierte Regressionen decken Altprofil-Migration, getrennte Einstellungen,
Mastery-Neutralität der Reading-Metrik, Rechtschreib-Evidenz, Reset/Purge und
Eltern→Kind-Family-Sync ab.

Produktiv seit **v0.21.12 / PR #148**. PR-CI **#965**, main-CI **#966** und
GitHub Pages **#512** sind grün; der Pages-Workflow hat den Live-Deploy erfolgreich
verifiziert.

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


## B-012 – Phaser-4-Battle-Renderer
**Status:** IN_IMPLEMENTATION  
**Priorität:** P1 visuelle Kampfüberarbeitung  
**Decision:** D-20260928-004  
**Betroffene Quellen:** `VISUAL_DNA.md` §§ 4–6, `PRODUCT_DNA.md` P9, Battle-UI/Renderer

Ziel ist, die bestehende CSS-/DOM-Kampfanimation durch eine eigenständige Phaser-4-Szene
zu ersetzen, ohne die fachliche Battle-Logik anzutasten.

Erster Spike:
- nur Englisch / eine Testfestung / ein Angriffspfad
- klar sichtbare getrennte Ebenen für Landschaft, Armee und Festung
- glaubwürdiges Vorrücken mit zeitversetzten Einheiten
- Projektil-/Rammbock-/Treffersequenz mit Kamera und Partikeln
- Ergebnisphase ohne UI-Überlagerung
- iPhone-Zielviewport und Desktop
- produktiv später ausschließlich mit lokal ausgelieferter Engine/Assets für Offline-Fähigkeit
- bestehende Battle-Logik und Tagesaktion bleiben unverändert

Abnahme des Spikes: Die Szene muss visuell erkennbar besser als die aktuelle DOM/CSS-Version
sein; insbesondere dürfen keine bloßen Gesamtbild-Verschiebungen, leeren Fallback-Landschaften
oder artefaktartigen Einschlagseffekte als finale Lösung gelten.

## B-013 – Kurze 3D-Storyszenen prüfen
**Status:** APPROVED_BACKLOG  
**Priorität:** nach stabilem Phaser-Battle  
**Decision:** D-20260928-004  
**Kanonische Konzeptquelle:** `docs/project/STORY_3D_CONCEPT.md`  
**Weitere Quelle:** `VISUAL_DNA.md`

3D ist als optionaler Cinematic Layer projektiert, aber ausdrücklich noch nicht zur
Implementierung freigegeben. Geplant sind sehr kurze Storymomente wie Festungsenthüllung,
Eroberung, Rang-/Ausrüstungsaufstieg, Kampagnenübergang und Jahresfinale.

Technischer Kandidat ist ein isolierter Three.js/WebGL-Renderer mit lokal ausgelieferten
glTF/GLB-Assets. Für feste Sequenzen wird weiterhin gegen vorgerendertes Video verglichen.
Der normale Kampf bleibt Phaser 2D/2.5D; Lern- und Battle-Logik bleiben vollständig außerhalb
des 3D-Moduls.

Vor einer Umsetzung ist genau ein Festungsenthüllungs-Spike vorgesehen. Erst nach Messung von
Ladezeit, Framerate, Speicherbedarf, Offline-/Fallback-Verhalten und älteren iPhones wird
entschieden, ob Three.js, Video oder kein 3D die produktive Richtung ist.

## Pflege

Ein Backlog-Punkt wird nicht gelöscht, wenn er umgesetzt oder verworfen wird:
- Umsetzung → Status auf `IMPLEMENTED`, anschließend `VERIFIED` / `PRODUCTION`
- Verwerfung → Status auf `REJECTED` plus Decision-ID/Begründung
- Ersatz → `SUPERSEDED` plus Verweis auf Nachfolger
