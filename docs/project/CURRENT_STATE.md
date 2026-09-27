# Vokabeltrainer – Current State

Stand: 27.09.2026, Baseline direkt aus GitHub geprüft.

## Produktionsbaseline

- Repository: `metzgerhannes-oss/Vokabeltrainer`
- produktiver Branch: `main`
- App-Version: **v0.21.11**
- Main-Commit des fachlich und dokumentarisch verifizierten Snapshots: `6995e9e72057eefbfc080db0cc32a36a2a21f947`
- letzter fachlicher Lernrelease: **PR #144 – v0.21.11 – Richtungsspezifische Testbereitschaft**
- PR-CI Lernrelease: **Vokabeltrainer CI #954 – success**
- main-CI Lernrelease: **Vokabeltrainer CI #960 – success**
- Produktionsdeploy Lernrelease: **GitHub Pages #509 – success**
- Bibliotheksharmonisierung: **PR #146 – B-010**
- PR-CI Bibliothek: **Vokabeltrainer CI #961 – success**
- main-CI Bibliothek: **Vokabeltrainer CI #962 – success**
- Produktionsdeploy Bibliothek: **GitHub Pages #510 – success**, inklusive Live-Verifikation

Dieser Abschnitt ist ein Snapshot. Für Statusfragen muss der aktuelle GitHub-Stand erneut live geprüft werden; die hier genannte SHA darf nicht als dauerhaft „neuester Stand“ interpretiert werden.

## Aktuell verbindliche Produktbasis

Die oberste Produktregel steht in [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md): fachlich korrekte Vokabelabfrage vor Komfort, Automatisierung, Gamification oder Featureumfang.

Die visuelle Leitlinie steht in [../../VISUAL_DNA.md](../../VISUAL_DNA.md). Fachspezifische Welten und die Trennung zwischen Lernen und Spiel sind dort verbindlich beschrieben.

## Stand der Kernbereiche

| Bereich | Status | Kanonische Quelle |
|---|---|---|
| Fachliche Abfrage / Bewertung | PRODUCTION | `PRODUCT_DNA.md`, `QUIZ_ENGINE.md` |
| Sense-/Bedeutungsmodell | PRODUCTION | `SENSE_MODEL.md` |
| Lern-/Mastery-Grundsätze | PRODUCTION | `PRODUCT_DNA.md` |
| Same-Day-Spacing-Härtung | PRODUCTION | `PRODUCT_DNA.md` P3, D-20260927-006, PR #143 |
| Richtungsspezifische Testbereitschaft | PRODUCTION | `PRODUCT_DNA.md` P2, D-20260927-007, PR #144 |
| Lernbibliothek / Dokumentationskohärenz | PRODUCTION | `docs/project/LEARNING_COHERENCE_REVIEW.md`, PR #146 |
| Tagesplanung mit testbezogener Last | PRODUCTION | `PRODUCT_DNA.md` P6 + Code/Tests |
| Pflicht-Tagesziel nur nach erfolgreichem Abruf | PRODUCTION | `PRODUCT_DNA.md` P4/P6, D-20260927-005, PR #142 |
| Adaptives Nachrücken / „heute sicher“ | PRODUCTION | `PRODUCT_DNA.md` P3/P6, D-20260927-004, PR #138 |
| Tolerante Satzbewertung | PRODUCTION | README v0.21.2 + Code/Tests |
| Schutz vor System-Schreibvorschlägen | PRODUCTION | README v0.21.3 + Code/Tests |
| Kindnavigation Lernen vs. Spiel | PRODUCTION | `PRODUCT_DNA.md`, `VISUAL_DNA.md` |
| iPhone Battle-Fokusmodus | PRODUCTION | PR #136, `VISUAL_DNA.md` |
| Family Sync | PRODUCTION / Beta-Grenze | `SYNC_ARCHITECTURE.md`, `FINAL_AUDIT.md` |
| praktische v1-Abnahme | OFFEN | `V1_ACCEPTANCE_TEST.md` |

## Offene Verifikationsgrenzen

Die praktische v1-Abnahme ist noch nicht als abgeschlossen dokumentiert. Die zahlreichen `[ ]`-Punkte in [../../V1_ACCEPTANCE_TEST.md](../../V1_ACCEPTANCE_TEST.md) sind daher **nicht** als erledigt zu interpretieren, nur weil zugehörige automatisierte Tests existieren.

Aus [../../FINAL_AUDIT.md](../../FINAL_AUDIT.md) bleibt außerdem als administrative Infrastrukturgrenze dokumentiert, dass die GitHub-Regel „Branch muss vor Merge auf aktuellem main sein“ noch separat administrativ zu aktivieren ist.

## Aktueller produktiver Release

### Richtungsspezifische Testbereitschaft
Status: **PRODUCTION**  
Release: **v0.21.11 / PR #144**

Die Testbereitschaft verlangt passend zum geplanten Testformat unabhängige Evidenz in der relevanten Abrufrichtung. `target` und `source` werden getrennt nachgewiesen, `mixed` verlangt beide Richtungen; Recognition und Listening erhöhen den numerischen Readiness-Score nicht. PR-CI #954, main-CI #960 und Pages #509 sind erfolgreich.

### Lernbibliothek harmonisiert
Status: **PRODUCTION**  
Merge: **PR #146**

Aktuelle Fachquellen und der v1-Abnahmetest verwenden die Informationsarchitektur **Heute · Lernen · Armee · Erfolge**. Kanonische Fachquellen tragen einen fachlichen Prüfstatus, Product DNA P9 ist redaktionell bereinigt und `LEARNING_COHERENCE_REVIEW.md` fasst die Lernarchitektur verbindlich zusammen. PR-CI #961, main-CI #962 und Pages #510 sind erfolgreich.

### Same-Day-Spacing-Härtung
Status: **PRODUCTION**  
Release: **v0.21.10 / PR #143**

Mehrere unabhängige Treffer desselben Wortes am selben Kalendertag bleiben als Übungs- und Accuracy-Evidenz erhalten, können das Spacing-Intervall aber nicht mehrfach verlängern. Die Intervallstufe folgt unterschiedlichen aktiven Erfolgstagen. PR-CI #952, main-CI #953 und Pages #508 sind erfolgreich.

### Tagesziel-Lernintegrität
Status: **PRODUCTION**  
Release: **v0.21.9 / PR #142**

Pflichtwörter werden nur nach einem fachlich richtigen, unassistierten aktiven Abruf als erledigt markiert. Fehlversuche und Antworten mit Hinweis bleiben offen. Dadurch kann weder der Tagesabschluss noch die Battle-Aktion vorzeitig ausgelöst werden. PR-CI #950, main-CI #951 und Pages #507 sind erfolgreich.

### Adaptives Nachrücken innerhalb desselben Lerntags
Status: **PRODUCTION**  
Release: **v0.21.8 / PR #138**

Die Regel ist in [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6 und Decision D-20260927-004 verbindlich spezifiziert. „Heute sicher“ ist getrennt von `completedKeys` und nachhaltiger Mastery. Pflicht-Tagesziel und Battle-Freischaltung bleiben unverändert; freiwilliges Nachrücken ist auf drei Zusatzwörter bzw. zwei im LRS-Modus und insgesamt sieben neu eingeführte Wörter pro Tag begrenzt.

Automatisierte Nachweise liegen im Learning-Integrity-Smoke und im Family-Sync-Lernfortschritts-Browsertest. PR-CI #945, main-CI #946 und Pages-Deploy #504 sind erfolgreich; der Pages-Workflow hat v0.21.8 live verifiziert.
