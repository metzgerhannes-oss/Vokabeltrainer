# Vokabeltrainer – Current State

Stand: 27.09.2026, Baseline direkt aus GitHub geprüft.

## Produktionsbaseline

- Repository: `metzgerhannes-oss/Vokabeltrainer`
- produktiver Branch: `main`
- App-Version: **v0.21.8**
- Release-Main-Commit: `1aa7983c330288a2091c60802ee2c503a716c04d`
- zugehöriger Merge: **PR #138 – v0.21.8 – Adaptives Nachrücken im Tagesplan**
- PR-CI für den finalen Head von PR #138: **Vokabeltrainer CI #945 – success**
- Main-CI für den Release-Commit: **Vokabeltrainer CI #946 – success**
- produktiver Pages-Deploy: **Deploy Vokabeltrainer to GitHub Pages #504 – success**

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
| Tagesplanung mit testbezogener Last | PRODUCTION | `PRODUCT_DNA.md` P6 + Code/Tests |
| Adaptives Nachrücken innerhalb desselben Lerntags | PRODUCTION | `PRODUCT_DNA.md` P3/P6, D-20260927-004, PR #138 |
| Tolerante Satzbewertung | PRODUCTION | README v0.21.2 + Code/Tests |
| Schutz vor System-Schreibvorschlägen | PRODUCTION | README v0.21.3 + Code/Tests |
| Kindnavigation Lernen vs. Spiel | PRODUCTION | `PRODUCT_DNA.md`, `VISUAL_DNA.md` |
| iPhone Battle-Fokusmodus | PRODUCTION | PR #136, `VISUAL_DNA.md` |
| Family Sync | PRODUCTION / Beta-Grenze | `SYNC_ARCHITECTURE.md`, `FINAL_AUDIT.md` |
| praktische v1-Abnahme | OFFEN | `V1_ACCEPTANCE_TEST.md` |

## Offene Verifikationsgrenzen

Die praktische v1-Abnahme ist noch nicht als abgeschlossen dokumentiert. Die zahlreichen `[ ]`-Punkte in [../../V1_ACCEPTANCE_TEST.md](../../V1_ACCEPTANCE_TEST.md) sind daher **nicht** als erledigt zu interpretieren, nur weil zugehörige automatisierte Tests existieren.

Aus [../../FINAL_AUDIT.md](../../FINAL_AUDIT.md) bleibt außerdem als administrative Infrastrukturgrenze dokumentiert, dass die GitHub-Regel „Branch muss vor Merge auf aktuellem main sein“ noch separat administrativ zu aktivieren ist.

## Zuletzt produktiv freigegeben

### Adaptives Nachrücken innerhalb desselben Lerntags
Status: **PRODUCTION**  
Release: **v0.21.8 / PR #138**

Die Regel ist in [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6 und Decision D-20260927-004 verbindlich spezifiziert. „Heute sicher“ ist getrennt von `completedKeys` und nachhaltiger Mastery. Pflicht-Tagesziel und Battle-Freischaltung bleiben unverändert; freiwilliges Nachrücken ist auf drei Zusatzwörter bzw. zwei im LRS-Modus und insgesamt sieben neu eingeführte Wörter pro Tag begrenzt. Nachrücker werden nicht in die laufende Pflicht-Einheit gezwungen, sondern als freiwilliger nächster Lernschritt angeboten.

Produktionsnachweis: PR-CI #945, Main-CI #946 und Pages-Deploy #504 waren vollständig erfolgreich. Der Family-Sync-Browsertest prüft den „heute sicher“-Status, Evidenz und Nachrückwort geräteübergreifend einschließlich Reload und Tagesgrenze.
