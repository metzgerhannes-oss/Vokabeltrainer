# Vokabeltrainer – Deep Audit v0.18.39

**Stand:** 23.09.2026  
**Prüfziel:** technische Release-Qualität, fachliche Lernintegrität, Sicherheit, Datenhaltung, Sync, OCR, PWA/Offline und Oberfläche vor v1.0.

## 1. Gesamtbewertung

Der geprüfte Stand besitzt eine ungewöhnlich starke automatisierte Absicherung für eine lokale Web-App: fachliche Abfrageintegrität, Migrationen, OCR-Paarung, Familien-Sync, iPhone/WebKit, Desktop, Karteikasten, Fokusmodus, Battle und Offline-Service-Worker werden in CI geprüft. Das oberste Produktprinzip – falsche Sollantworten oder falsche Wort↔Bedeutung-Paare sind Release-Blocker – ist technisch sichtbar umgesetzt.

Im Deep Audit wurden drei konkrete UI-/Rollenthemen gefunden und in v0.18.39 gehärtet:

1. Ein als Kindergerät gekoppeltes Gerät durfte lokal noch den Elternmodus öffnen. Der Server begrenzte zwar dessen Sync-Rechte, die Oberfläche war aber nicht hart genug getrennt. **Behoben:** Kindergeräte erkennen ihre Sync-Rolle und sperren Eltern-/Administrationsansichten auch lokal.
2. Die Armee-Ansicht erzeugte im Deep-UI-Test bei sehr schmalen Geräten (320 px, anschließend noch ein Bonus-Grid-Fall bei 375 px) horizontalen Overflow. **Behoben:** zusätzlicher Narrow-Phone-Layoutschutz; der neue Deep-UI-Test prüft 320/375/390/820/1440 px.
3. Die neuen Bibliotheks-Audio-Buttons waren nur 42×36 px groß. **Behoben:** mindestens 44×44 px, passend zum eigenen UI-Standard und zu Apples allgemeiner Touch-Empfehlung.

Nach diesen Härtungen gibt es aus dem Code-/Daten-Audit **keinen bekannten P0-Release-Blocker**. Vor einem formalen v1.0-Label bleiben einige P2/P3-Punkte, vor allem manuelle Accessibility-Abnahme, technische Modularisierung und Deployment-Optimierung.

## 2. Prüfmethodik

Geprüft wurden:

- geschützter GitHub-`main`-Branch, PR- und Statuscheck-Regeln
- vollständiger GitHub-Actions-Releasepfad bis GitHub Pages
- statische JavaScript-/CSP-/DOM-Prüfungen
- WebKit/iPhone- und Desktop-Regressionsläufe
- neuer Deep-UI-Audit für 320, 375, 390, 820 und 1440 px
- Touchzielgrößen und horizontales Overflow
- dynamische DOM-Injection mit absichtlich HTML-artigen Profil-, Lernset- und Vokabeltexten
- IndexedDB-/localStorage-Persistenz, Backup/Restore und Migration
- Service Worker, Offline-Shell und bedarfsgesteuertes OCR-/Wörterbuch-Caching
- OCR-Import, Paarfreigabe und Schutz gegen ungeprüfte Sollantworten
- Lernmodell, Mastery, Leitner-Boxen, Fehlerwiederholung und Tagesplanung
- Family-Sync-Client und produktive Supabase-Funktionen, Grants, RLS und Pre-Request-Limits
- aktuelle Supabase-Sicherheitsdokumentation
- zentrale lernpsychologische und L2-Vokabellern-Literatur

## 3. Release- und CI-Architektur

### Positiv

- `main` ist durch ein aktives GitHub-Ruleset geschützt.
- Pull Request und Statuscheck `test` sind verpflichtend.
- Force-Push und Branch-Löschung sind blockiert.
- GitHub Actions werden mit konkreten Commit-SHAs referenziert.
- GitHub Pages deployt erst nach erfolgreichem CI-Lauf und checkt den exakt getesteten Commit aus.
- Dependabot prüft wöchentlich die Browser-Testabhängigkeiten und GitHub Actions.
- Laufzeitcode hat keine npm-Runtime-Abhängigkeit; Playwright liegt ausschließlich unter `ci/browser`.

### CI-Abdeckung

Der Releasepfad prüft unter anderem:

- JavaScript-Syntax
- Preflight/CSP/Manifest
- Sense-/Bedeutungsmodell
- Lernintegrität
- Evidence-Core-Regeln
- Quiz-Engine
- Sprach-/Fachsystem
- Bibliotheksindex
- OCR-Paarung
- Set-Reparatur
- Persistenz und Migration
- Family-Sync-Architektur
- Kind-/Eltern-Rollentrennung
- WebKit iPhone
- Lernstoffplanung
- Battle
- Armee
- Hilfesystem
- Fokusmodus
- Leitner-Karteikarten
- Desktop
- Correct-answer-Diagnostic
- OCR-Paarprüfung End-to-End
- Erstkontakt/Abschreiben
- Chromium Service-Worker offline
- neu: Deep Responsive UI Audit
- neu: dynamischer DOM-Injection-Smoke

## 4. Fachliche Abfrageintegrität

### Wort und Bedeutung

Das Datenmodell trennt:

- globales Lexem
- Bedeutung/Sense
- set-/lehrwerksbezogene Wortform und Bedeutung
- akzeptierte Varianten
- persönlichen Lernstand

Damit hängt Lernfortschritt nicht bloß an einer Zeichenfolge. Eine Änderung an Wort/Bedeutung kann eine erneute Paarfreigabe auslösen.

### OCR

OCR ist bewusst nicht die fachliche Wahrheit:

1. Bild wird lokal verarbeitet.
2. Tesseract und Sprachmodelle werden von derselben App-Domain geladen.
3. Erkannte/ergänzte Paare werden als Importdaten gespeichert.
4. Fotoimporte sind zunächst **nicht fachlich freigegeben**.
5. Vor dem Lernen muss die Wort↔Bedeutung-Paarung bestätigt werden.
6. Erst dann gelangen die Wörter in den normalen Lernpfad.

Das ist eine zentrale Sicherheitsbarriere gegen OCR-Fehler.

### Bewertung

Die Quiz-Engine führt pro Aufgabe einen Snapshot der erwarteten Antworten. Die Ergebnisübersicht zeigt:

- Frage
- eigene Antwort
- akzeptierte Sollantwort(en)
- Bewertungsstatus
- Bewertungsgrund
- ggf. Leitner-Box vorher/nachher
- Fremdsprachenwort mit Vorlesefunktion

Falsche oder orthografisch auffällige Antworten sind dadurch nachprüfbar.

## 5. Lernmodell

### Mastery

Mastery ist konservativ und produktiv ausgerichtet. Erkennen, Hören und Wortbausteine erhöhen weder Mastery noch Leitner-Stufe noch Wiederholungsintervall.

Für `Nachhaltig gemeistert` verlangt die aktuelle Implementierung unter anderem:

- Retrieval-Skill mindestens 2
- Spelling-Skill mindestens 2
- mindestens 5 unabhängige Erfolge
- Erfolge an mindestens 3 Tagen
- mindestens 3 Tage maximaler Abstand zwischen erfolgreichen Abrufen
- mindestens 2 Cold-Recall-Tage
- Wiederholungsintervall mindestens 7 Tage
- Kontextanforderung, wenn wiederholt Kontextfehler aufgetreten sind

Die fünf sichtbaren Karteikastenstufen sind eine kindgerechte Darstellung. Die höhere Stufe kann nicht durch beliebig viele Wiederholungen am selben Tag erzwungen werden.

### Fehler

Ein aktiver Fehler:

- senkt relevante Skillwerte
- setzt die Wiederholung wieder auf heute
- bewegt die Karte höchstens eine Box zurück
- erzeugt innerhalb der Einheit einen erneuten Abruf nach mehreren dazwischenliegenden Aufgaben

Support-Aufgaben können einen späteren produktiven Follow-up-Abruf auslösen, bekommen aber selbst keinen Mastery-Kredit.

### Tagesplanung

Der Tagesplan berücksichtigt Testdatum, Testumfang, noch neue Wörter und Wiederholungsbedarf. Neue Wörter werden gedeckelt; ein unrealistischer Rückstand wird als Überlastungs-/Spacing-Risiko markiert statt durch unbegrenzte Tagesmengen kaschiert.

**Einordnung:** Diese Parameter sind evidenzinformierte Produktheuristiken. Sie sind kein klinisch oder schulpsychologisch validierter individueller Optimal-Scheduler.

## 6. Audio und Antwortschutz

Audio ist eine Grundfunktion, kein eigener Lernmodus.

Sicherheitsregel:

- Ist das Fremdsprachenwort bereits sichtbar, darf es vor der Antwort vorgelesen werden.
- Muss das Fremdsprachenwort erst erinnert werden, darf Audio die Lösung vorher nicht verraten.
- Diktat ist ausdrücklich als Audio-Aufgabe modelliert.
- Nach Fehlern kann die korrekte Wortform automatisch vorgelesen werden.
- Ergebnisübersicht, Bibliothek und Lernkarten bieten Audio auf Wunsch.

Die Funktion nutzt `speechSynthesis` und damit die auf dem Gerät verfügbaren Stimmen. Das ist besonders bei Latein **keine Garantie für eine didaktisch kuratierte oder muttersprachlich korrekte Aussprache**.

## 7. LRS-/Accessibility-orientiertes Design

Positiv:

- kein spezieller „Dyslexie-Wunderfont“
- Sans-Serif-Grundschrift
- einstellbare Schriftgröße und Buchstabenabstände
- Fokusmodus ohne globale Navigation während des Abrufs
- Reduced-Motion-Unterstützung
- Audio/TTS
- Handschrift und Wortbausteine als optionale Werkzeuge
- keine Zeitdrucklogik als Mastery-Kriterium
- große Hauptaktionen
- neuer automatischer 44×44-Touchzieltest für zentrale mobile Controls
- vier klare Kinderbereiche: Heute · Üben · Fortschritt · Armee

Der Begriff „LRS-Modus“ ist als Bedien-/Lernunterstützung zu verstehen, nicht als Diagnostik oder Therapie.

### Noch manuell abzunehmen

Automatisierte Browserprüfungen ersetzen keinen vollständigen Assistive-Technology-Test. Vor v1.0 wird ein manueller Durchlauf mit mindestens **VoiceOver auf iPhone** empfohlen, einschließlich:

- Tab-/Fokusreihenfolge
- Dialogankündigungen
- dynamisches Feedback
- Ergebnisübersicht
- OCR-Paarprüfung
- Armee/Battle nur hinsichtlich Bedienbarkeit, nicht dekorativer Detailbeschreibung

## 8. Sicherheit und Datenschutz

### Browser

- strenge CSP ohne `unsafe-inline` und `unsafe-eval`
- `object-src 'none'`, `base-uri 'none'`, `frame-src 'none'`
- keine Werbe-/Analytics-SDKs im geprüften Laufzeitstand
- dynamische Nutzereingaben werden auf den zentralen Oberflächen escaped
- neuer DOM-Safety-Smoke prüft Profil, Lernset, OCR-Paarprüfung und Vokabeleditor mit HTML-artigen Eingaben
- Fotos werden lokal verarbeitet und nicht als OCR-Dateien an einen Drittanbieter übertragen

### Family Sync / Supabase

Produktiv geprüft:

- Vokabeltrainer-Tabellen liegen im privaten Schema.
- `anon` besitzt keinen direkten SELECT-Zugriff auf `vt_families`, `vt_devices`, `vt_documents` oder `vt_invites`.
- Browsercode verwendet einen Supabase-Publishable-Key, keinen Service-/Secret-Key.
- Zugriff erfolgt über öffentliche RPC-Wrapper und private Implementierungsfunktionen.
- Gerätegeheimnisse werden serverseitig mit bcrypt geprüft.
- Einladungen verwenden zufällige Einmal-Tokens mit kurzer Gültigkeit.
- Child-Devices dürfen nur eigene Fortschrittsdaten schreiben.
- Revisionsnummern verhindern stilles Überschreiben konkurrierender Änderungen.
- Konflikte werden erhalten und müssen aufgelöst werden.
- Pre-Request-Rate-Limits sind produktiv aktiviert.
- Der `authenticator` nutzt `pgrst.db_pre_request=private.jgw_pre_request`.

Geprüfte Limits:

- Familie anlegen: 10 / Stunde / IP
- Elternbeitritt: 12 / 15 Minuten / IP
- Kinder-Einladung: 30 / 15 Minuten / IP
- Geräteverwaltung: 60 / 5 Minuten / IP
- Sync: 180 / 5 Minuten / IP

Die Supabase-Security-Advisors melden für die privaten VT-Tabellen „RLS enabled, no policy“ als Information. Da direkte Tabellen-Grants für `anon` entzogen sind und die Tabellen nicht als öffentliche Datenoberfläche genutzt werden, ist dies im aktuellen RPC-Modell kein offener Tabellenzugriff. Supabase empfiehlt grundsätzlich die Kombination aus Grants, RLS und bewusst begrenzter API-Oberfläche; genau diese Grenzen müssen bei Backend-Änderungen erneut geprüft werden.

### Gemeinsame Backend-Abhängigkeit

Die Rate-Limit-/Pre-Request-Basis wird mit Johanna’s Gartenwelt geteilt. Das ist im Migrations-README dokumentiert. Der Vokabeltrainer-Ordner allein ist daher **kein vollständiges Standalone-Abbild des Supabase-Projekts**.

Produktiv relevante gemeinsame Migrationen:

- `20260921100151_harden_vt_rate_limits`
- `20260921134427_global_rate_limit_cleanup`

Das ist akzeptabel, solange der Recovery-Prozess beide Repositories ausdrücklich einbezieht.

## 9. Persistenz, Backup und Recovery

- Primärspeicher: IndexedDB.
- Fallback: localStorage.
- Zustand wird vor Persistenz begrenzt/pruned.
- Import-/Backupgrößen sind gedeckelt.
- Backup-Restore prüft Struktur und ungewöhnliche Größen.
- Restore läuft durch die aktuelle Migration/Härtung.
- Vor dem Ersetzen werden bestehende und importierte Datenmengen angezeigt.
- Nach Restore wird der persistierte Zustand erneut verifiziert.
- Bei fehlgeschlagener Verifikation wird der vorherige Zustand wiederhergestellt.

Das ist für eine lokale Familien-App robust.

## 10. PWA und Offline

- Installierbar als Standalone-PWA.
- Service Worker cached die kleine App-Shell vorab.
- OCR-/Wörterbuch-Großdateien werden erst bei Bedarf persistent gecached.
- Initiale Shell liegt bei ungefähr **0,85 MB**.
- Das gesamte Repository liegt dagegen bei ungefähr **144 MB / 137 MiB**, hauptsächlich wegen lokaler Wörterbücher und OCR-Modelle.
- Die PWA unterstützt ab v0.18.39 Portrait und Landscape.
- Chromium-Offlinetest ist Bestandteil des CI.

### Offener P2-Punkt: Deployment-Artefakt

GitHub Pages lädt derzeit den gesamten Repository-Inhalt als Pages-Artefakt hoch. Das beeinträchtigt die Initial-Ladezeit nicht entsprechend stark, ist aber operativ unnötig groß und enthält auch CI-/Dokumentationsdateien. Nach v1.0 bzw. vor stärkerer Nutzung sollte ein explizites Runtime-Artefakt (`_site`) erzeugt werden.

## 11. Wartbarkeit

Stärken:

- fachliche Kernregeln sind durch spezifische Regressionstests geschützt
- sensible Änderungen laufen über PR + CI
- zentrale Datenmigration/Härtung existiert
- Product DNA dokumentiert Prioritäten

Technische Schuld:

- `js/ui.js`, `js/learning.js` und `css/app.css` sind inzwischen groß
- mehrere Module arbeiten auf globalem `state`/`session`
- `focus-ui.js` überschreibt bewusst Lern-Feedbackfunktionen; das erhöht Kopplung
- einzelne alte CSS-/Helper-Pfade für den früheren `practiceDisclosure` sind noch vorhanden
- kein dediziertes Komponenten-/Modulsystem

**Empfehlung:** Nach Stabilisierung von v1.0 modularisieren, aber nicht kurz vor Release einen Großumbau erzwingen. Die vorhandenen Tests reduzieren das aktuelle Risiko stärker als ein übereilter Refactor.

## 12. Bekannte Grenzen / keine falschen Versprechen

Die App ist:

- ein evidenzinformierter Vokabeltrainer
- ein Organisationswerkzeug für schulische Tests
- ein lokales/optional synchronisiertes Lernsystem
- eine Motivationsoberfläche mit strikt getrenntem Spielbereich

Die App ist **nicht**:

- ein diagnostisches Instrument für LRS/ADHS oder andere Lernstörungen
- eine Lerntherapie
- ein Ersatz für Unterricht oder individuelle Förderung
- ein objektiver Notenprädiktor
- ein wissenschaftlich validiertes individuelles Gedächtnismodell
- ein Garantieversprechen, dass „100 %“ dauerhaftes Behalten bedeutet
- ein System mit kuratierten professionellen Audioaufnahmen
- derzeit ein vollständiges Lehrkraftportal

## 13. Offene Punkte vor v1.0

### P1 – sollte vor dem v1.0-Tag abgeschlossen sein

- v0.18.39 vollständig grün durch PR- und Produktions-CI sowie Pages deployen.
- manueller VoiceOver-Abnahmelauf auf einem realen iPhone dokumentieren.
- einmaliger realer End-to-End-Familien-Sync-Test mit Eltern- und Kindergerät durchführen: Einladung, erster Pull, Lernfortschritt, Konfliktfall, Geräteentzug.

### P2 – sinnvoll, aber kein aktueller Release-Blocker

- Pages-Artefakt auf Runtime-Dateien begrenzen.
- Latein-Audio auf realen Zielgeräten qualitativ prüfen und ggf. als „Gerätestimme“ deutlicher kennzeichnen.
- größere UI-/Learning-Dateien nach v1 modularisieren.
- automatisierte Kontrast-/Accessibility-Tree-Prüfung ergänzen.
- alte `practiceDisclosure`-Reste entfernen.

### P3 – Weiterentwicklung

- Lehrkraft-View erst mit explizitem Datenschutz-/Freigabemodell implementieren.
- Französisch erst aktivieren, wenn Sprache, OCR, Orthografie und Tests vollständig fachlich abgenommen sind.
- Schedulerparameter langfristig anhand realer, anonymisiert ausgewerteter Lernergebnisse validieren, falls ein entsprechendes Datenschutzkonzept besteht.

## 14. Quellen und Standards

Lernforschung:

- Kang, Gollan & Pashler (2013), *Retrieval practice is better than imitation for foreign vocabulary learning*. DOI: https://doi.org/10.3758/s13423-013-0450-z
- Kim & Webb (2022), *The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis*. DOI: https://doi.org/10.1111/lang.12479
- da Silva, Ekuni & Jaeger (2023), *Retrieval practice benefits for spelling performance in fifth-grade children*. DOI: https://doi.org/10.1080/09658211.2023.2248420
- Goossens et al. (2014), *The benefit of retrieval practice over elaborative restudy in primary school vocabulary learning*. DOI: https://doi.org/10.1016/j.jarmac.2014.05.003
- *Comparing the merits of word writing and retrieval practice for L2 vocabulary learning* (2020). DOI: https://doi.org/10.1016/j.system.2020.102206
- Li (2023), *Investigating effects of computer-mediated feedback on L2 vocabulary learning*. DOI: https://doi.org/10.1016/j.compedu.2023.104763
- Uchihara (2022), *Does Mode of Input Affect How Second Language Learners Create Form–Meaning Connections and Pronounce Second Language Words?* DOI: https://doi.org/10.1111/modl.12775
- Chen, Miller & Ke (2026), *The effect of contextual diversity on L1 and L2 word learning: A systematic review and meta-analysis*. DOI: https://doi.org/10.1017/S0142716426100691
- Colenbrander et al. (2024), *The Effects of Morphological Instruction on Literacy Outcomes for Children in English-Speaking Countries*. DOI: https://doi.org/10.1007/s10648-024-09953-3
- Stevens et al. (2021), *Current State of the Evidence: Orton-Gillingham Reading Interventions*. https://pmc.ncbi.nlm.nih.gov/articles/PMC8497161/
- Wery & Diliberto, *The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy*. https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233/

Accessibility / Plattform:

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Apple Human Interface Guidelines – Buttons/Accessibility: https://developer.apple.com/design/human-interface-guidelines/buttons
- British Dyslexia Association – Dyslexia Friendly Style Guide: https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide

Backend:

- Supabase – Securing your API: https://supabase.com/docs/guides/api/securing-your-api
- Supabase – Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase – API keys: https://supabase.com/docs/guides/getting-started/api-keys
