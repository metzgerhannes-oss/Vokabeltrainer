# Vokabeltrainer – Backlog

Stand: 27.09.2026

Dieses Backlog enthält nur Punkte, die als Projektarbeit erhalten bleiben sollen. Reine Ideen ohne Bewertung gehören zunächst in den Status `IDEA`; als sinnvoll bestätigte, aber noch nicht umgesetzte Punkte in `APPROVED_BACKLOG`.

## B-001 – Deutsch Grundschule 1–4 / Das Wortreich
**Status:** IMPLEMENTED / TECHNISCH VERIFIZIERT · praktische v1-Abnahme offen  
**Priorität:** P0 / Release-Blocker vor v1.0  
**Decisions:** D-20260927-009, D-20260928-008  
**Kanonische Fachquelle:** `docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`  
**v1-/Spiel-Spezifikation:** `docs/project/DEUTSCH_WORTREICH_V1.md`  
**Weitere Quellen:** `PRODUCT_DNA.md` P8/P9/P11, `VISUAL_DNA.md` § 9, `SUBJECT_SYSTEM.md`, D-20260927-008

Deutsch ist vor v1.0 verpflichtend produktiv zu integrieren. Der Fachbereich bleibt evidenzbasiert und kompetenzorientiert; seine motivierende Spielwelt heißt **„Das Wortreich“**.

Verbindliche Leitlinien:
- Klasse 1 als produktiver Einstieg: Buchstaben, Laut–Buchstaben-Zuordnung, Nachspuren → freie Produktion, erste Wörter und einfache Sätze
- Lernwörter, Rechtschreibung und deutsche Sätze als Anschluss
- deutsches Audio/Vorlesen dort, wo es die Lösung nicht vorwegnimmt
- eigene deutsche Bewertungslogik; Groß-/Kleinschreibung nicht pauschal tolerant
- LRS Lesen / Rechtschreiben und DaZ bleiben getrennte Unterstützungsdimensionen
- Fuchs bleibt als ruhiger Lernbegleiter möglich
- separater Spielbereich **Das Wortreich** mit Ritterheer, Burgprogression und Belagerungskämpfen
- mindestens ein echter Deutsch-Kampf vor v1.0
- Gegner rein fiktional
- keine Rückwirkung von Kampf/Armee auf Mastery, Spacing, Testbereitschaft oder fachliche Bewertung
- strittige Bewertungen und Überspringen müssen auch in Deutsch gemäß D-20260928-006/007 neutral funktionieren

**Paket A – Produkt-/Architekturverankerung:** IMPLEMENTED.  
**Paket B – Fachgrundgerüst:** PRODUCTION / CI VERIFIED v0.21.34 (PR #201, main-CI #1233, Pages #559).  
**Paket C – Klasse-1-Kern:** PRODUCTION / LIVE VERIFIED v0.21.35 (PR #202, PR-CI #1235, main-CI #1236, Pages #560).  
**Paket D – Lernwörter/Rechtschreibung:** PRODUCTION / LIVE VERIFIED v0.21.36 (PR #203, PR-CI #1239, main-CI #1240, Pages #561).  
**Paket E – Wortreich:** PRODUCTION / LIVE VERIFIED v0.21.37 (PR #204, CI #1247, Pages #562).  
**Paket F:** praktische v1-Abnahme bleibt offen; technische Mindestanforderungen sind umgesetzt.

## B-002 – Eigene finale Latein-Grafikserie
**Status:** SUPERSEDED durch B-019 / v0.21.50  
**Priorität:** nach Kernstabilität / im Rahmen der visuellen Ausarbeitung  
**Betroffene Quelle:** `VISUAL_DNA.md`

Latein ist fachlich eigenständig. Der technische Stand verwendet an einzelnen Stellen noch bewusste Fallbacks, bis die eigene finale Legion-/Avatarserie vollständig vorliegt.

## B-003 – Französisch als eigener Fachbereich
**Status:** IMPLEMENTED · v0.21.53 Release-Kandidat  
**Priorität:** P0/P1 · fachliche Freischaltung  
**Betroffene Quellen:** `PRODUCT_DNA.md` P11, `SUBJECT_SYSTEM.md`, `VISUAL_DNA.md`

Französisch nutzt die gemeinsame Facharchitektur, ist ab v0.21.53 aber regulär freigeschaltet:
- lokales `fra.traineddata` aus dem gepinnten offiziellen Tesseract-`tessdata_fast`-Stand
- `fr-FR` für Lernwort-Audio/Hören/Diktat
- französische Akzente bleiben Teil der Lexemidentität
- produktive Zielantworten verlangen über die Capability `strictTermOrthography` korrekte Akzente und Apostrophe; typografische Apostrophvarianten bleiben technisch tolerant
- Varianten/Formen werden nur akzeptiert, wenn sie als `acceptedTerms` bzw. Sense-Variante explizit hinterlegt sind; es werden keine Antwortformen erfunden
- OCR-/Textimport bewahrt typische Formen wie `école`, `garçon`, `être`, `où`
- Retrieval, Spacing, Mastery, Testplanung, Notenskala, Bibliothek und Family-Sync bleiben auf der generischen Facharchitektur
- `Voyage Français` und die vorbereitete fiktionale Festungswelt werden mit der Fachaktivierung regulär erreichbar

Die visuelle Weltwahl bleibt als eigener Produktpunkt B-017 geführt; ihre fachliche Sperre durch B-003 ist beseitigt.

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
**Status:** v0.21.57 fachübergreifender produktiver Phaser-Pfad IMPLEMENTED · praktische visuelle Gesamt-Abnahme offen  
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

**Iteration 2 – längere Belagerung und Übernahme:**
- Gesamtablauf deutlich länger als der erste Spike, ohne Leerlauf
- mindestens zwei klar getrennte Treffer-/Beschädigungsstufen
- sichtbare strukturelle Schäden an Tor/Mauer statt nur Partikel
- kleine stilisierte Feuer-/Glutstellen und Rauch nach stärkerem Treffer; kindgerecht und ohne Gewaltfokus
- gegnerisches Banner fällt erst nach der Beschädigungsphase
- eigene Truppen rücken anschließend sichtbar in Richtung Tor nach
- eigenes Banner markiert die Übernahme; Feuer beruhigt sich im Ergebniszustand
- Ergebnisphase erst nach der Übernahme, nicht unmittelbar nach dem ersten Treffer
- Reduced Motion bleibt verkürzt, aber bildet alle fachlich irrelevanten visuellen Kernbeats ab
- bestehende Lern-, Battle-Ticket-, Schadens- und Festungslogik bleibt unverändert

Produktionsnachweis der isolierten Vorschau:
- Basis-Renderer: PR #175
- Iteration 2: PR #176
- PR-CI #1101 nach erfolgreichem Browser-Game-Rerun grün
- main-CI #1102 grün
- GitHub Pages #540 erfolgreich
- B-012 bleibt **IN_IMPLEMENTATION**, weil der Phaser-Renderer zwar für den echten Englisch-Tagesangriff produktiv ist, Latein/weitere Fallback-Fälle und die praktische visuelle Gesamt-Abnahme aber noch offen sind.

**Iteration 3 – Angriffstypen im Phaser-Renderer:**
- alle bestehenden produktiven Angriffsarten erhalten eine eigene sichtbare Choreografie: Sturmangriff, Pfeilhagel, Rammbock, Reiterangriff und Eliteangriff
- die Wahl verändert nur die Darstellung; fachlicher Schaden und Taktikbonus bleiben weiterhin außerhalb von Phaser
- Angriffstyp kann im isolierten Spike direkt gewählt und über Query-Parameter reproduzierbar gestartet werden
- Rammbock bleibt die schwere Belagerungsreferenz aus Iteration 2
- Sturmangriff priorisiert Infanterie und Formation
- Pfeilhagel priorisiert mehrere gestaffelte Fernkampfwellen
- Reiterangriff priorisiert Flankenbewegung und Geschwindigkeit
- Eliteangriff kombiniert mehrere bereits freigeschaltete Einheitenrollen, ohne zusätzliche fachliche Wirkung zu erfinden
- Renderer erhält zusätzlich einen Outcome-Zustand: normaler Treffer vs. tatsächliche Eroberung; Bannerwechsel/Übernahme darf nur beim Eroberungs-Outcome erscheinen
- Browser-Smoke prüft alle fünf Angriffstypen sowie die Trennung Treffer/Eroberung
- bei Eroberung ziehen erst alle sichtbaren Einheiten durch das aufgebrochene Tor und verschwinden in der Festung; erst danach wird der Profilbanner gehisst

**Iteration 4 – Produktivintegration Englisch:**
- der echte Englisch-Tagesangriff nutzt Phaser 4 statt der DOM/CSS-Kampfanimation
- Phaser wird erst beim tatsächlichen Angriff lazy geladen; Lernen und übrige App-Bereiche laden die Engine nicht
- bestehende App-Logik bleibt alleinige Quelle für Ticketverbrauch, Angriffsschaden, Taktikbonus, Festungsverteidigung, Eroberung und XP
- Phaser erhält nur Angriffstyp, bestehenden sichtbaren Schadensstand, Profilinitialen und das aus der App-Logik vorab ableitbare Outcome `hit|capture`
- tatsächliche Zustandsänderung wird erst nach Abschluss der visuellen Phaser-Sequenz über `resolveTestFortressAction()` geschrieben
- schlägt das Laden/Starten von Phaser fehl, fällt derselbe bereits begonnene Angriff ohne doppelten Ticketverbrauch auf den bestehenden Renderer zurück
- Latein, Französisch und Sicherung einer bereits eroberten Festung bleiben zunächst auf dem bestehenden Renderer
- Phaser-Engine und Produktionsmodule werden lokal im Service Worker vorgecached; kein CDN
- sichtbarer Produktions-Buildmarker im Canvas-Bereich: `v0.21.27 · Phaser`
- eigener iPhone-WebKit-Smoke prüft Capture und normalen Treffer im echten Battle-Flow sowie unveränderte fachliche Mastery
- Produktionsnachweis: PR #185 gemergt auf `main`; CI #1150 vollständig grün

**Iteration 5 – Cinematic Upgrade v0.21.28:**
- Festung und Profilbanner werden in der Phaser-Szene deutlich größer und präsenter
- die Festung wehrt sich sichtbar mit Pfeilsalven und einem stilisierten Katapult
- Gegenwehr kann einzelne eigene Einheiten rein visuell aus dem weiteren Vormarsch nehmen; daraus entsteht **kein** fachlicher Malus und keine Änderung an Mastery, Testbereitschaft oder Ticketlogik
- bei Eroberung ziehen nur die visuell verbliebenen Einheiten durch das Tor; der Profilbanner folgt erst danach
- kurze Sound-Cues werden lokal über Web Audio erzeugt; keine externen Sounddateien und keine zusätzliche Netzabhängigkeit
- Schlachtansicht bleibt standardmäßig scrollbar; Vollbild ist eine optionale app-eigene Ansicht und lässt sich wieder verlassen, ohne die Schlacht zu schließen
- Browser-Smokes decken Gegenwehr, visuelle Verluste, Sound-Fähigkeit, unveränderte fachliche Mastery sowie optionales Vollbild ab
- Produktionsnachweis: PR #187 gemergt auf `main`; CI #1166 vollständig grün

**Iteration 6 – Fachübergreifender Produktivpfad v0.21.57:**
- produktiver Phaser-4-Angriff für Englisch, Latein, Französisch-Kampf und Deutsch/Wortreich
- Latein nutzt Theme `roman` mit mediterran-römischer Farb-/Umgebungsidentität
- Französisch-Kampf nutzt Theme `french-battle` mit eigener fiktionaler Festungsidentität
- Abenteuerwelten bleiben ohne Battle-Screen
- Subject/Theme werden im Phaser-Bridge nicht mehr auf Englisch/Kampagne reduziert
- Browser-Regression prüft für Latein und Französisch Renderer, Subject/Theme, Gegenwehr, Capture, Ticketverbrauch und unveränderte Mastery
- offen bleibt die praktische visuelle Gesamt-Abnahme auf realen Geräten

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


## B-014 – Dauerhafte Jahresentwicklung & Jahresfestung
**Status:** PRODUCTION / LIVE_VERIFIED v0.21.30  
**Priorität:** P1 Spielprogression  
**Decision:** D-20260928-005  
**Betroffene Quellen:** `PRODUCT_DNA.md` P5/P9, `VISUAL_DNA.md` § 6, Armee-/Kampagnenmodell

Ziel: Fachlichen Prozentwert und langfristige Spielentwicklung sauber trennen. Avatar, Rang,
Einheiten und Ausrüstung wachsen kumulativ über ein Schuljahr und dürfen durch später neu
bekannt werdende Vokabeln oder Tests nicht zurückgestuft werden.

Produktiv umgesetzt in v0.21.29:
- eigene kumulative Jahresentwicklung aus gemeisterten Wörtern, abgeschlossenen Tests und eroberten Testfestungen
- Armee-/Avatarstufen verwenden die Jahresentwicklung statt des schwankenden aktuellen Mastery-Prozentsatzes
- „Meine Armee“ wächst sichtbar von kleiner Formation bis zum vollständigen Heer
- Jahresfestung bleibt ohne realen Termin undatiert; Termin kann im Elternbereich gesetzt, geändert oder entfernt werden
- Termin wird gehärtet, über Family Sync übertragen und darf nicht vor bereits geplanten späteren Tests liegen
- Wochenserien enden hinter einer datierten Jahresfestung
- Regressionstests sichern Nicht-Rückstufung, dynamische Feldzugskarte und unveränderte fachliche Mastery

Der technische Neuaufbau erfolgte auf v0.21.28-`main` in **PR #188**; der veraltete PR #173 wurde
bewusst ohne Merge geschlossen und durch diesen sauberen Nachfolger ersetzt.

Produktionsnachweis: PR #188 gemergt auf `main` (`2c5801d0d43bbc7cd10d4092b283ea0ceea76f5f`), PR-CI #1169 grün, main-CI #1170 grün und GitHub Pages #549 inklusive Live-Verifikation erfolgreich.

**Praktischer Befund v0.21.29:** Die Wachstumswerte waren korrekt, aber gesperrte Einheiten blieben im Heerlager als abgedunkelte Vollformation sichtbar. Dadurch war die geforderte kleine Anfangsarmee praktisch nicht erkennbar. **Fix v0.21.30:** Im Heerlager werden nur tatsächlich freigeschaltete Einheiten gerendert; die Upgrade-Karten zeigen weiterhin auch gesperrte spätere Einheiten. Eine sichtbare `X von 6`-Anzeige macht den Feldstand eindeutig. Produktionsnachweis: PR #191 gemergt auf `main` (`cdefc0490f0821d476fef0e43a9528dfaa0edf4a`), main-CI #1180 grün und GitHub Pages #552 inklusive Live-Verifikation erfolgreich.


## B-015 – Strittige Systembewertung & Elternfreigabe
**Status:** PRODUCTION / LIVE_VERIFIED v0.21.31  
**Priorität:** P0 fachliche Korrektheit  
**Decision:** D-20260928-006  
**Betroffene Quellen:** `PRODUCT_DNA.md` Oberstes Produktprinzip, `QUIZ_ENGINE.md` § 8

Ziel: Ein Kind muss eine möglicherweise systemseitig falsche Bewertung melden können, ohne dass
dieser strittige Versuch bis zur fachlichen Entscheidung den Lernstand verschlechtert.

Umsetzung v0.21.31:
- Kinderfeedback **„Bewertung prüfen lassen“** direkt nach einer als falsch bewerteten Antwort
- vollständiges Zurückrollen der gerade erzeugten negativen Lernwirkung
- neutraler Status bis zur Elternentscheidung
- eigener synchronisierter Prüffall mit Frage-Snapshot, Kinderantwort und akzeptierten Sollantworten
- Elternaufgabe **„Strittige Antworten prüfen“**
- Eltern können eine Antwort als lokale zulässige Variante freigeben, die Vokabel bearbeiten oder die Systembewertung bestätigen
- freigegebene Varianten werden künftig im betroffenen Lernset automatisch akzeptiert
- Elternfreigabe wertet den ursprünglichen aktiven Abruf rückwirkend positiv
- bestätigte Systembewertung erzeugt erst nach der Entscheidung genau einen fachlichen Fehler
- Family Sync transportiert offene und entschiedene Prüffälle
- Browser-Regressionsprüfung schützt Neutralität, Elternfreigabe und spätere automatische Akzeptanz

Produktionsnachweis B-015: PR #192 gemergt auf `main` (`491d03fbe649332b8b05033300a2edea7f95dab8`), main-CI #1185 grün und GitHub Pages #553 inklusive Live-Verifikation erfolgreich. v0.21.32 ergänzt die Tagesplan-Härtung: offene Prüffälle zählen für den aktuellen Tagesauftrag organisatorisch als bearbeitet, bleiben fachlich aber neutral; Elternfreigabe übernimmt die Erledigung, Ablehnung öffnet sie wieder.


## B-016 – Vokabel neutral ans Abfrageende verschieben
**Status:** PRODUCTION / LIVE_VERIFIED v0.21.32  
**Priorität:** P1 Lernkomfort ohne fachliche Wirkung  
**Decision:** D-20260928-007  
**Betroffene Quellen:** `PRODUCT_DNA.md` Rollenmodell Kind, Lernqueue

Ziel: Das Kind kann eine aktuell ungünstige Vokabel zurückstellen, ohne sie aus der Lerneinheit
zu entfernen oder eine Bewertung auszulösen.

Umsetzung v0.21.32:
- Button **„Vokabel überspringen“** vor der Bewertung
- aktueller Queue-Eintrag wandert ans Ende derselben Session
- keinerlei Ergebnis-, XP-, Mastery-, Leitner-, Spacing- oder Fehlerwirkung
- am letzten Queue-Platz ist erneutes Überspringen deaktiviert
- eigener iPhone-WebKit-Smoke prüft Reihenfolge und Neutralität

Produktionsnachweis B-016: PR #194 gemergt auf `main` (`cb306ad4571832d6115aab38438093c58d4b5cc4`), main-CI #1193 vollständig grün und GitHub Pages #554 inklusive Live-Verifikation erfolgreich.


## Pflege

Ein Backlog-Punkt wird nicht gelöscht, wenn er umgesetzt oder verworfen wird:
- Umsetzung → Status auf `IMPLEMENTED`, anschließend `VERIFIED` / `PRODUCTION`
- Verwerfung → Status auf `REJECTED` plus Decision-ID/Begründung
- Ersatz → `SUPERSEDED` plus Verweis auf Nachfolger

## B-017 – Weltwahl Abenteuer oder Kampf pro Fach
**Status:** IMPLEMENTED · v0.21.54 Release-Kandidat · alle vier Fächer mit unabhängiger Abenteuer-/Kampfwahl  
**Priorität:** P1 visuelle/Profile-UX vor finaler Fachwelten-Ausarbeitung  
**Decision:** D-20260929-001 · D-20260929-002  
**Betroffene Quellen:** `VISUAL_DNA.md`, `docs/project/LATIN_FRENCH_VISUAL_LAYOUT.md`, Profilmodell, Profilerstellung, Profileinstellungen, Spiel-/Fortschrittsrenderer

Bei der Profilerstellung soll pro unterstütztem Fach separat zwischen **Abenteuer** und **Kampf**
gewählt werden können. Die Auswahl ist später ohne Fortschrittsverlust änderbar. Die technische
Einführung startet mit **Deutsch**; Englisch, Latein und Französisch folgen auf derselben
Profil-/Persistenzarchitektur.

Umsetzungspaket:

- Profilmodell erhält eine fachbezogene Weltpräferenz, z. B. `worldModeBySubject`
- Profilerstellung zeigt pro unterstütztem Fach die Auswahl **Abenteuer | Kampf**
- Deutsch v0.21.39: Fuchs-Abenteuer vs. Wortreich/Kampf; bestehende Profile bleiben konservativ auf Kampf, neue Deutsch-Profile müssen bewusst wählen
- Deutsch-Abenteuer besitzt eine eigene nicht-militärische Sechsstufen-Fuchsserie
- Englisch v0.21.40: Expedition vs. Armee/Feldzug; Abenteuer bleibt kampffrei
- Latein v0.21.40: zivile mediterrane Entdeckungsreise vs. Legion/Kastelle; Abenteuer bleibt kampffrei
- Französisch v0.21.40: Voyage Français vs. fiktionale Gefährten-/Festungswelt technisch vorbereitet; ab v0.21.53 durch B-003 fachlich freigeschaltet
- Avatar- und Deutsch-Weltwahl sind vorlesbar; m/w/d und Weltpräferenz werden gemeinsam über Family Sync übertragen
- Profileinstellungen erlauben denselben Wechsel später
- bestehende Profile behalten zunächst ihre bisherige Darstellung; keine überraschende Migration
- kumulative Jahresstufe aus D-20260928-005 wird beim Wechsel 1:1 auf die andere Welt übertragen
- Lernstand, Mastery, Spacing, Testbereitschaft, Tagesziel und Bewertung bleiben unverändert
- äquivalente Fortschrittsereignisse verhindern unterschiedliche Belohnungsgeschwindigkeit
- Englisch erhält eine klar unterscheidbare Abenteuer- und Kampfpräsentation
- Latein erhält zusätzlich zur Legions-/Kampfserie eine zivile mediterrane Abenteuer-/Entdecker-Serie
- Französisch erhält zusätzlich zu `Voyage Français` eine fiktionale Kampf-/Festungsserie
- alle Kampfwelten verwenden ausschließlich fiktionale Gegner; keine realen Länder, Völker, Religionen oder historischen Konfliktparteien
- jede der acht Fachwelten besitzt Opening, sechs aufeinander aufbauende Storykapitel und ein eigenes Jahresfinale; kanonisch in `docs/project/WORLD_STORYLINES_V1.md` / D-20260929-004
- Storykapitel sind im Abenteuer-Hub, auf der Karte und im Kampfkontext vorlesbar und schreiben keinerlei fachlichen Zustand
- Browser-/Persistenz-/Family-Sync-Tests sichern Weltwahl, Wechsel ohne Reset und fachliche Neutralität

Abnahme:

1. Ein neues Profil kann für jedes aktive Fach unabhängig eine Welt wählen; Deutsch bildet seit v0.21.39 die Referenz, v0.21.40 generalisiert die Architektur.
2. Ein späterer Wechsel verändert keinen fachlichen Lernwert.
3. Die sichtbare Jahresstufe bleibt vor und nach dem Wechsel gleichwertig.
4. Abenteuer und Kampf sind visuell eindeutig unterscheidbar, bleiben aber innerhalb derselben Fachidentität.
5. Bestehende Profile funktionieren ohne manuelle Migration weiter.

Abschluss v0.21.54:
- Englisch, Latein, Deutsch und Französisch sind regulär auswählbar
- jedes aktive Fach zeigt bei neuen Profilen bewusst **keine** still vorausgewählte Welt
- Abenteuer/Kampf wird pro Fach separat gespeichert und kann später gewechselt werden
- alle acht Welten besitzen sechs Fortschrittsstufen und den kanonischen Storybogen
- der Weltwechsel verändert weder Vokabeldaten, persönlichen Lernstand, Tagespläne, Testserien, Testabschlüsse noch Notenskalen
- die Browser-Regression prüft die Weltwahl jetzt explizit für alle vier freigeschalteten Fächer

## B-018 – Freies Schreiben: Grundschul-Hilfslinien und freie Buchstabenauswahl
**Status:** v0.21.55 neutrale Schreibspur-Plausibilitätsprüfung IN_IMPLEMENTATION · praktische Geräteabnahme offen  
**Priorität:** P0 für Deutsch Klasse 1 / praktische v1-Abnahme  
**Bezug:** B-001, `docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`

Beim freien Schreiben in Deutsch Klasse 1 braucht die Schreibfläche eine kindgerechte
Grundschul-Lineatur. Die Buchstaben sollen nicht frei in einem leeren Feld schweben, sondern
räumlich in **Dachgeschoss – Erdgeschoss – Keller** eingeordnet werden können.

Verbindliche Anforderungen:

- freie Schreibfläche mit sichtbaren Hilfslinien für **Dach / Erdgeschoss / Keller**
- Ober-, Mittel- und Unterlängen müssen an der Lineatur eindeutig erkennbar sein
- Linien bleiben auch beim Finger-/Stift-Schreiben auf kleinen Displays gut sichtbar
- Hilfslinien dürfen die geschriebene Spur nicht überdecken
- im **freien Lernen** kann das Kind selbst bestimmen, welche Buchstaben geübt werden
- Auswahl eines einzelnen Buchstabens oder mehrerer Buchstaben gleichzeitig
- Groß- und Kleinbuchstaben müssen gezielt auswählbar sein
- die manuelle Auswahl darf weder Mastery noch Testbereitschaft künstlich erhöhen; sie ist freie Übung
- Vorlesen/Laut des ausgewählten Buchstabens bleibt verfügbar, sofern dadurch keine abgefragte Lösung verraten wird
- Auswahl bleibt innerhalb der freien Übung erhalten, bis sie geändert oder zurückgesetzt wird

Abnahme:

1. Ein Kind kann z. B. nur **a**, nur **A/a** oder eine Gruppe wie **a, e, m, s** auswählen.
2. Die freie Übung erzeugt ausschließlich Aufgaben aus der manuellen Auswahl.
3. Beim Schreiben sind Dach-, Erdgeschoss- und Kellerbereich jederzeit sichtbar.
4. Buchstaben mit Ober- und Unterlängen lassen sich eindeutig zur Lineatur einordnen.
5. Freies Üben verändert keine fachliche Bewertung allein durch Anzahl der Wiederholungen.

Umsetzung v0.21.41:
- eigener Einstieg „Freies Schreiben“ im Deutsch-Klasse-1-Grundlagenbereich
- Einzelauswahl von Groß- und Kleinbuchstaben sowie Mehrfachauswahl; die Auswahl bleibt bis Änderung/Reset erhalten
- Aufgabenzyklus wird ausschließlich aus den gewählten Zeichen aufgebaut
- Canvas-Lineatur mit Dachgeschoss, Erdgeschoss und Keller; Hilfslinien liegen unter der Schreibspur
- Buchstabenlaut bleibt verfügbar
- freie Wiederholung schreibt keinerlei Foundation-, Mastery-, Readiness-, Tagesziel-, XP- oder Battle-Evidenz
- statischer B-018-Smoke und WebKit-iPhone-Regressionsprüfung ergänzen die CI

Praktischer Befund auf v0.21.41:
- die zusätzlichen Karten `l = Dach`, `m = Erdgeschoss`, `g = Keller` direkt unter dem Übungsbuchstaben waren missverständlich und werden in v0.21.42 entfernt
- Browser-/iOS-TTS sprach die bisherigen Laut-Hilfsstrings nicht zuverlässig als Buchstabenlaut; v0.21.42 verwendet deshalb lokale Laut-Audiodateien für alle 29 auswählbaren Buchstabenformen
- Buchstabenlaute haben bewusst **keinen Speech-Synthesis-Fallback**; normale Anweisungen/Wörter/Sätze behalten die Vorlesefunktion
- alle Lautdateien werden für Offline/PWA im Service Worker vorgehalten
- praktische Wiederholungsabnahme auf dem realen Gerät bleibt zwingend offen

Praktischer Befund auf v0.21.42:
- auf dem realen iPhone erschien trotz grünem CI die Meldung „Der Buchstabenlaut konnte nicht abgespielt werden.“
- Ursache: Die M4A-Dateien erfüllten die damaligen Strukturprüfungen, waren auf iOS jedoch nicht zuverlässig decodierbar
- v0.21.44 ersetzt die M4A-Einzelcontainer durch einen lokalen MP3-Audiosprite mit Zeitclips für A–Z und Ä/Ö/Ü
- neues Release-Gate: WebKit muss den Sprite mit `decodeAudioData` tatsächlich decodieren und einen Lautclip starten; Dateisignatur/Dateigröße allein genügt nicht
- defekte M4A-Dateien bleiben unreferenziert und werden nicht mehr im Offline-Shell gecacht

Praktischer Befund auf v0.21.44:
- WebKit-CI decodierte und startete das generierte WAV erfolgreich; der Live-Deploy validierte die Datei ebenfalls
- auf dem realen iPhone blieb die Laut-Taste trotzdem vollständig stumm
- lokale Analyse bestätigt, dass der erzeugte M-Laut selbst nicht stumm ist; der Fehler liegt damit im Web-Audio-Ausgabepfad auf dem Zielgerät
- v0.21.45 verwendet 29 einzelne PCM-WAV-Dateien und startet sie direkt über das native HTML-`Audio`-Element innerhalb des echten Tastendrucks
- der Generator blockiert zu kurze, stille oder zu leise Laute anhand von Dauer, RMS und Peak
- WebKit prüft den nativen `playing`-Status; Pages prüft live die PCM-Nutzdaten von `m.wav`

Praktischer Befund auf v0.21.47:
- verschärfter WebKit-Test bestätigte eine sichtbare SVG-Overlay-Ebene
- auf dem realen iPhone war dennoch keine erkennbare Kontrolle sichtbar
- v0.21.48 verwirft deshalb Overlay-Technik vollständig
- stattdessen erscheint eine normale **HTML-Kontrollkarte** im Dokumentfluss mit „So soll … aussehen“, großem Sollbuchstaben und eigener Dach-/Erdgeschoss-/Keller-Lineatur
- nach Kontrollklick wird die Karte automatisch ins sichtbare iPhone-Fenster gescrollt
- WebKit prüft Sichtbarkeit, Mindestgröße und tatsächliche Lage im Viewport

Praktischer Befund auf v0.21.46:
- Kontrollmodus und Folgebuttons wurden aktiv, aber auf dem realen iPhone war keine Sollform sichtbar
- damit ist der damalige Same-Canvas-Overlayweg praktisch nicht bestanden
- v0.21.47 rendert die Sollform als **separate SVG-Overlay-Ebene** exakt über der Schreibfläche
- zusätzlich erscheint sichtbar **„Kontrolle aktiv · Blau gestrichelt = Sollform“**
- WebKit prüft nicht nur DOM-Zustand, sondern Sichtbarkeit, tatsächliche Glyphengröße und deckungsgleiche Overlay-Lage

Erweiterung v0.21.55:
- die echte Finger-/Stiftbahn wird während des freien Schreibens punktweise erfasst
- „Kontrollieren“ prüft neutral Größe, horizontale Lage sowie Ober-/Mittel-/Unterlängen gegen Dachgeschoss, Erdgeschoss und Keller
- Rückmeldung lautet ausschließlich sinngemäß „ähnelt der Sollform“ oder gibt einen konkreten Lagehinweis; keine automatische Richtig/Falsch-Wertung
- die geometrische Kontrolle schreibt keinerlei Foundation-, Mastery-, Readiness-, Tagesziel-, XP- oder Battle-Evidenz
- die sichtbare Sollformkarte bleibt zusätzlich für den eigenen Formvergleich erhalten

Erweiterung v0.21.46:
- nach eigener Schreibspur erscheint erst auf Wunsch die Aktion **„Kontrollieren“**
- die eigene Spur bleibt sichtbar; die Sollform wird halbtransparent/gestrichelt direkt auf derselben Dach–Erdgeschoss–Keller-Lineatur eingeblendet
- danach ausschließlich **„Nochmal schreiben“** oder **„Passt für mich“**
- keine automatische Handschriftbewertung, kein Richtig/Falsch und keine fachliche oder spielerische Fortschrittsevidenz

## B-019 – Finale Avatarserien in einheitlicher Referenzqualität
**Status:** IMPLEMENTED v0.21.50 · vollständiges CI-Matrix-Gate v0.21.56 · PRAXISABNAHME OFFEN  
**Priorität:** P0 visuelle Produktqualität  
**Decision:** D-20260930-001  
**Betroffene Quellen:** `VISUAL_DNA.md § 2.1/§ 10/§ 13`, `docs/project/LATIN_FRENCH_VISUAL_LAYOUT.md`, `js/menu-avatar-art.js`

Verbindlicher Umfang:

- Englisch männlich: bestehende finale 6-Stufen-Serie
- Englisch weiblich / neutral: freigegebene malerische Atlas-Serie
- Latein männlich / weiblich / neutral: eigene römische Avatarserie; männlich als Ganzkörperfolge
- Französisch männlich / weiblich / neutral: eigene malerische Fachserie
- Deutsch Grundschule: Fuchs als persönlicher Avatar in Abenteuer **und** Wortreich/Kampf
- sechs Stufen müssen sichtbar mit der Jahresentwicklung wechseln
- fachfremde Armee-/Szenenbilder dürfen nie als Avatar erscheinen
- CSS-/DOM-/SVG-Figuren bleiben nur technischer Ladefehler-Fallback
- Atlas wird offline/PWA mit ausgeliefert

Abnahme:

1. iPhone und Desktop zeigen für jeden aktiven Fach-/Stilpfad ein echtes Bildasset.
2. Latein verwendet nie das englische Armee-Hero-Bild.
3. Deutsch zeigt auf Start/Heute immer den Fuchs; die Ritterarmee bleibt im Spielbereich.
4. Stufe 1–6 wechselt reproduzierbar auf das zugehörige Artwork.
5. Weltwechsel verändert keinen fachlichen Lernstand.
6. Keine regulär erreichbare Profilvariante fällt auf die technische CSS-/SVG-Figur zurück.

