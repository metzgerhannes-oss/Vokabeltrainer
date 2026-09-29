# Vokabeltrainer – Current State

Stand: 29.09.2026, aktueller main-Stand direkt aus GitHub geprüft.

## Produktionsbaseline

- Repository: `metzgerhannes-oss/Vokabeltrainer`
- produktiver Branch: `main`
- App-Version: **v0.21.43** (Praxis-Hotfix als Release-Kandidat)
- aktueller Stand auf `main`: **v0.21.43 / Merge `3266425cd28711736f8d522657099fbf14c0130c` / PR #214**
- jüngster vollständig live-verifizierter Release: **v0.21.41 / PR #212**
- Produktionsnachweis v0.21.41: **PR-CI #1330 success · main-CI #1331 success · GitHub Pages #568 inklusive Live-Verifikation success**
- aktueller Release-Kandidat: **v0.21.43 – Deutsch-Fuchswelt-Layout-Hotfix / PR #214**; PR-CI vollständig grün, auf `main` gemergt; main-CI/Pages-Live-Verifikation noch offen
- v0.21.30 behebt den praktischen Befund der optisch vollständigen Anfangsarmee; nur tatsächlich freigeschaltete Einheiten stehen im Heerlager
- Phaser-Cinematic v0.21.28: **PR #187 gemergt**, PR-CI **#1166 vollständig grün**
- Phaser-Produktivstatus: echter Englisch-Tagesangriff läuft über lokal ausgeliefertes Phaser 4; Festungs-Gegenwehr, Sound, visuelle Verluste und optionales Vollbild sind produktiv
- fachliche Schutzlinie: Spielprogression, Battle-Choreografie und Jahresfestungsdatum verändern weder Mastery noch Vokabelbewertung oder Testbereitschaft
- v0.21.31 schützt strittige Bewertungen: Kind meldet → Fehlwirkung wird neutralisiert → Eltern entscheiden → lokale Variante wird freigegeben oder Fehler erst dann bestätigt
- v0.21.33 erlaubt „Vokabel überspringen“: ausschließlich ans Ende derselben Session, ohne Bewertung oder Lernstandsänderung; offene Prüffälle blockieren zugleich das Tagesziel nicht
- v0.21.29 trennt den schwankenden fachlichen Prozentwert von der kumulativen Jahresentwicklung; Avatar/Rang/Armee werden durch neuen Stoff nicht zurückgestuft; Jahresfestungsdatum ist optional, gehärtet und synchronisiert
- praktische v1-Abnahme: weiterhin **OFFEN**

PR #187 und PR #188 sind auf `main` gemergt. v0.21.29 ist durch main-CI #1170 und Pages #549 inklusive Live-Verifikation produktiv bestätigt. Die veralteten Parallel-/Alt-PRs #173 und #186 wurden bewusst ohne Merge geschlossen.

Dieser Abschnitt ist ein Snapshot. Für Statusfragen muss der aktuelle GitHub-Stand erneut live geprüft werden; genannte SHAs und CI-Nummern dürfen nicht ohne erneute Prüfung als dauerhaft neuester Stand interpretiert werden.

## Aktuell verbindliche Produktbasis

Die oberste Produktregel steht in [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md): fachlich korrekte Vokabelabfrage vor Komfort, Automatisierung, Gamification oder Featureumfang.

Die visuelle Leitlinie steht in [../../VISUAL_DNA.md](../../VISUAL_DNA.md). Fachspezifische Welten und die Trennung zwischen Lernen und Spiel sind dort verbindlich beschrieben.

## Stand der Kernbereiche

| Bereich | Status | Kanonische Quelle |
|---|---|---|
| Fachliche Abfrage / Bewertung | PRODUCTION / LIVE VERIFIED v0.21.33 | `PRODUCT_DNA.md`, `QUIZ_ENGINE.md`, D-20260928-006/D-20260928-007, B-015/B-016 |
| Sense-/Bedeutungsmodell | PRODUCTION | `SENSE_MODEL.md` |
| Lern-/Mastery-Grundsätze | PRODUCTION | `PRODUCT_DNA.md` |
| Same-Day-Spacing-Härtung | PRODUCTION | `PRODUCT_DNA.md` P3, D-20260927-006, PR #143 |
| Differenzierte LRS-/Lernunterstützung | PRODUCTION | `PRODUCT_DNA.md` P6/P8, D-20260927-008, PR #148 |
| Richtungsspezifische Testbereitschaft | PRODUCTION | `PRODUCT_DNA.md` P2, D-20260927-007, PR #144 |
| Lernbibliothek / Dokumentationskohärenz | PRODUCTION | `docs/project/LEARNING_COHERENCE_REVIEW.md`, PR #146 |
| Tagesplanung mit testbezogener Last | PRODUCTION v0.21.22 | `PRODUCT_DNA.md` P6, D-20260927-010 + Code/Tests |
| Mehrere kommende Einzeltests / frühester Termin | PRODUCTION | PR #160, `V1_ACCEPTANCE_TEST.md` |
| Pflicht-Tagesziel nur nach erfolgreichem Abruf | PRODUCTION | `PRODUCT_DNA.md` P4/P6, D-20260927-005, PR #142 |
| Adaptives Nachrücken / „heute sicher“ | PRODUCTION | `PRODUCT_DNA.md` P3/P6, D-20260927-004, PR #138 |
| Tolerante Satzbewertung | PRODUCTION | README v0.21.2 + Code/Tests |
| Schutz vor System-Schreibvorschlägen | PRODUCTION | README v0.21.3 + Code/Tests |
| Kindnavigation Lernen vs. Spiel | PRODUCTION | `PRODUCT_DNA.md`, `VISUAL_DNA.md` |
| Battle-Viewport / Vollbild | PRODUCTION v0.21.28 | PR #187; standardmäßig scrollbar, optionaler app-eigener Vollbildmodus |
| Phaser-4-Battle-Renderer Englisch | PRODUCTION v0.21.28; weitere Fächer/Fallbacks offen | D-20260928-004, B-012, PR #185/#187 |
| Dauerhafte Jahresentwicklung / Jahresfestung | PRODUCTION / LIVE VERIFIED v0.21.30 | D-20260928-005, B-014, PR #188/#191 |
| Family Sync | PRODUCTION / Beta-Grenze | `SYNC_ARCHITECTURE.md`, `FINAL_AUDIT.md` |
| Deutsch Paket B / Fachgrundgerüst | PRODUCTION / CI VERIFIED v0.21.34 | `docs/project/DEUTSCH_WORTREICH_V1.md`, B-001, D-20260928-008, PR #201 |
| Deutsch Paket C / Klasse-1-Kern | PRODUCTION / LIVE VERIFIED v0.21.35 · PR #202 · CI #1236 · Pages #560 | `docs/project/DEUTSCH_WORTREICH_V1.md`, `DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`, B-001 |
| Deutsch Paket D / Lernwörter & Rechtschreibung | PRODUCTION / LIVE VERIFIED v0.21.36 · PR #203 · CI #1240 · Pages #561 | `docs/project/DEUTSCH_WORTREICH_V1.md`, `DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`, B-001 |
| Deutsch Paket E / Wortreich-Phaser-Belagerung | PRODUCTION / LIVE VERIFIED v0.21.37 · PR #204 · CI #1247 · Pages #562 | `docs/project/DEUTSCH_WORTREICH_V1.md`, D-20260928-008, D-20260928-004 |
| Deutsch Startlayout / Stufen / Vorlesen / m/w/d | PRODUCTION / LIVE VERIFIED v0.21.38 | `docs/project/DEUTSCH_WORTREICH_LAYOUT_V1.md`, D-20260929-003, PR #206 |
| Deutsch Weltwahl Abenteuer/Kampf | PRODUCTION / CI VERIFIED v0.21.39 | D-20260929-002, B-017, `docs/project/DEUTSCH_WORTREICH_V1.md` |
| Deutsch Klasse-1-Erstlektion: Groß/Klein nachfahren → nur nach Laut selbst schreiben | IMPLEMENTED im v0.21.40-Release-Kandidaten; Praxisabnahme Lautqualität bleibt offen | D-20260929-005, B-001, `docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md` § 6 |
| Fachübergreifende Weltwahl Abenteuer/Kampf + 8 vollständige Storylines | IMPLEMENTED im v0.21.40-Release-Kandidaten; Englisch/Latein aktiv, Deutsch integriert, Französisch-Welten vorbereitet bis Fachfreischaltung B-003; CI läuft | D-20260929-001, D-20260929-004, B-017, `docs/project/WORLD_STORYLINES_V1.md` |
| praktische v1-Abnahme | OFFEN | `V1_ACCEPTANCE_TEST.md` |

## Offene Verifikationsgrenzen

Die praktische v1-Abnahme ist noch nicht als abgeschlossen dokumentiert. Die zahlreichen `[ ]`-Punkte in [../../V1_ACCEPTANCE_TEST.md](../../V1_ACCEPTANCE_TEST.md) sind daher **nicht** als erledigt zu interpretieren, nur weil zugehörige automatisierte Tests existieren.

Aus [../../FINAL_AUDIT.md](../../FINAL_AUDIT.md) bleibt außerdem als administrative Infrastrukturgrenze dokumentiert, dass die GitHub-Regel „Branch muss vor Merge auf aktuellem main sein“ noch separat administrativ zu aktivieren ist.

## Aktueller produktiver Release

### Mehrere kommende Tests bleiben chronologisch aktiv
Status: **PRODUCTION**  
Release: **v0.21.18 / PR #160**

Ein später eingetragener Test ersetzt keinen früheren noch bevorstehenden Test mehr.
Mehrere einmalige Tests desselben Fachs können parallel gespeichert bleiben; Lernen,
Heute-Ansicht, Testbereitschaft und Kampagnenziel richten sich immer nach dem frühesten
anstehenden Termin. Auch Bibliothekstests desselben Abschnitts werden als getrennte,
datierte Testpläne gespeichert. Manuelle und OCR-Testvorbereitungen werden nach der
Paarprüfung eingereiht, ohne frühere Termine zu löschen. Eine einmalige Migration stellt
v0.21.17-Daten wieder her, wenn die alte Ersetzungslogik ein früheres Testdatum gelöscht
hat, die zugehörige zukünftige Testfestung den Termin aber noch eindeutig belegt.
PR-CI #994, main-CI #995 und Pages #523 sind erfolgreich; der Live-Deploy wurde
verifiziert.

### Armee-Banner und klare Bildtrennung
Status: **PRODUCTION**  
Release: **v0.21.15 / PR #153**

Der im praktischen iPhone-Test sichtbare Überzug der hellen Missionskarte auf das
Kampagnenbild ist entfernt. Zwischen Bild und Karte besteht mobil ein echter geometrischer
Abstand. Profilname und „Test N“ erscheinen in der Armeeübersicht als parchmentartige
Kampagnenbanner statt als weiße Pillen. Ein WebKit-iPhone-Regressionscheck prüft den
Mindestabstand sowie die Bannerform. Die Testnummerierung bleibt datengetrieben und wird
nicht auf „Test 1“ fest verdrahtet. PR-CI #975, main-CI #976 und Pages #517 sind
erfolgreich; der Live-Deploy wurde im Pages-Workflow verifiziert.

### Mobiles Avatar-Statuslayout
Status: **PRODUCTION**  
Release: **v0.21.13 / PR #150**

Der im praktischen iPhone-Test gefundene Überlagerungsfehler auf „Heute“ ist behoben:
Avatarbild, Stufen-/Teststatus und Tagesaufgabe liegen mobil in einer klaren vertikalen
Reihenfolge. Der Statusblock ist dort kein absolut positioniertes Overlay mehr. Ein
WebKit-iPhone-Regressionscheck prüft sowohl die DOM-Trennung als auch die geometrische
Überlappungsfreiheit. Desktop sowie Lern-, Mastery-, Testbereitschafts- und Battle-Logik
bleiben unverändert. PR-CI #969, main-CI #970 und Pages #514 sind erfolgreich; der
Live-Deploy wurde verifiziert.

### Differenzierte LRS-Unterstützung
Status: **PRODUCTION**  
Release: **v0.21.12 / PR #148**

Lesen und Rechtschreiben sind getrennte Unterstützungsdimensionen; „Kurze Einheiten“ ist
eine unabhängige Belastungseinstellung. Reading-Evidenz steuert Hilfen und Lernroute, aber
nicht Mastery oder Testbereitschaft. Bei aktiver Rechtschreibunterstützung verlangt
„heute sicher“ zusätzlich einen erfolgreichen unassistierten Rechtschreibabruf. Alte
`lrsMode=true`-Profile migrieren konservativ zu Lesen + Rechtschreiben + kurze Einheiten.
Die richtungsspezifische Testbereitschaft aus v0.21.11 bleibt erhalten. PR-CI #965,
main-CI #966 und Pages #512 sind erfolgreich; der Live-Deploy wurde verifiziert.

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

Die Regel ist in [../../PRODUCT_DNA.md](../../PRODUCT_DNA.md) P6 und Decision D-20260927-004 verbindlich spezifiziert. „Heute sicher“ ist getrennt von `completedKeys` und nachhaltiger Mastery. Pflicht-Tagesziel und Battle-Freischaltung bleiben unverändert; freiwilliges Nachrücken ist auf drei Zusatzwörter bzw. zwei bei aktivierter Einstellung „Kurze Einheiten“ und insgesamt sieben neu eingeführte Wörter pro Tag begrenzt.

Automatisierte Nachweise liegen im Learning-Integrity-Smoke und im Family-Sync-Lernfortschritts-Browsertest. PR-CI #945, main-CI #946 und Pages-Deploy #504 sind erfolgreich; der Pages-Workflow hat v0.21.8 live verifiziert.


## Operative Steuerung

Die verbindliche Arbeitsweise steht in [../../PROJECT_CONTROL.md](../../PROJECT_CONTROL.md) §§ 8–12 und Decision D-20260927-009. Vor nichttrivialen Änderungen werden Abnahmekriterien festgelegt; Statusaussagen unterscheiden strikt zwischen `IMPLEMENTED`, `VERIFIED`, `PRODUCTION` und `LIVE VERIFIED`.

Versions- und Governance-Konsistenz wird durch `scripts/vokabeltrainer-project-control-smoke.mjs` im CI-Preflight geschützt.


## Deutsch · Paket B

- Deutsch ist als produktives Fach freigeschaltet (`de-DE`, `deu`, `nativeLiteracy`).
- Eigene Literacy-Evidenz ist vom Fremdsprachen-Mastery getrennt.
- Erste Aufgaben: Hören/Erkennen und Lernwort-Schreiben mit relevanter Groß-/Kleinschreibung.
- Lernlayout: ruhiger Fuchspfad mit Holzschwert-Übungsstationen.
- Spiel-/Motivations-Shell: v0.21.39 bietet pro Deutsch-Profil bewusst **Fuchs-Abenteuer** oder **Das Wortreich**. Beide verwenden denselben fachlichen Zustand und dieselbe kumulative Jahresstufe; Abenteuer bleibt vollständig kampffrei.

