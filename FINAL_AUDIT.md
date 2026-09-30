# Finales Audit

Stand: 30.09.2026 · App v0.21.51

## Ergebnis

- v0.21.51 schließt den verbliebenen Post-Test-Fehler: Nach „Test abschließen“ fällt der Pflichtpfad ohne nächsten aktiven Test nicht mehr auf den Jahreswortschatz zurück. Alte Testvokabeln bleiben freiwillig verfügbar; sobald ein neuer Test geplant ist, wird ausschließlich dessen Umfang verpflichtend gelernt. Das Tagesplanschema steigt auf `daily4`.

- v0.21.50 integriert die freigegebene malerische Avatar-Art-Direction in den Startscreen: echte Bildassets statt fachfremder Szenen-/CSS-Fallbacks für alle aktiven Fach-/Stilpfade; Deutsch Grundschule bleibt ein Fuchs. Englisch männlich nutzt die vorhandene volle 6-Stufen-Serie, Latein männlich die neue römische Ganzkörper-Serie; weitere m/w/d-Pfade werden aus dem freigegebenen Atlas gerendert. Die Änderung bleibt rein visuell und verändert keine Lern-, Mastery-, Spacing- oder Testlogik.
  Die Deutsch-WebKit-Regression prüft dabei ausdrücklich den Bildatlas als Start-Avatar in beiden Weltmodi; die vorhandenen SVG-Füchse bleiben nur für Stufenvorschau/technische Fallback-Pfade erhalten.

- v0.21.50 trennt den verpflichtenden Englisch-Testumfang von älteren fälligen Vokabeln und verhindert die Vereinigung eines expliziten Testumfangs mit einer überlappenden Wochenserie. Alte Lernhistorie bleibt erhalten und optionale Wiederholung bleibt verfügbar.
- v0.21.48 ersetzt nach erneut negativem realem iPhone-Befund die Overlay-Technik vollständig durch eine normale HTML-Kontrollkarte. Diese Karte liegt im Dokumentfluss direkt über der Schreibfläche, enthält einen großen Sollbuchstaben auf eigener Grundschul-Lineatur und wird nach dem Kontrollklick automatisch ins sichtbare Viewport gescrollt. Der WebKit-Test muss Sichtbarkeit, Mindestgröße und Viewport-Lage der Karte nachweisen. Reale Geräteabnahme bleibt zwingend.

- v0.21.47 ist der Praxisfix für die auf dem realen iPhone unsichtbare v0.21.46-Selbstkontrolle. Die Sollform wird nicht mehr in denselben Canvas gezeichnet, sondern als eigene SVG-Ebene über der Schreibfläche gerendert. Ein sichtbarer Kontrollstatus kennzeichnet den Modus. WebKit muss die Overlay-Ebene, die tatsächliche Glyphengröße und die deckungsgleiche Lage über dem Canvas nachweisen. Die reale iPhone-Abnahme bleibt separat erforderlich.

- v0.21.46 ergänzt B-018 um eine ausdrücklich **nicht benotende Selbstkontrolle**: eigene Schreibspur bleibt sichtbar, die Sollform wird auf derselben Lineatur eingeblendet, anschließend entscheidet das Kind zwischen „Nochmal schreiben“ und „Passt für mich“. Der Kontrollschritt schreibt keine fachliche oder spielerische Evidenz.

- v0.21.45 reagiert auf den realen iPhone-Befund „kein Ton“ trotz grünem v0.21.44-WebKit-Test. Der Buchstabenlaut verlässt deshalb Web Audio vollständig: jeder der 29 Laute wird als eigene validierte PCM-WAV-Datei erzeugt und beim echten Tastendruck direkt über HTML-`Audio.play()` gestartet. Der Generator blockiert stille/zu leise Dateien per RMS-/Peak-Grenze; Pages prüft live exemplarisch `m.wav` auf hörbare PCM-Nutzdaten. Die reale Geräteabnahme bleibt der letzte Nachweis.

- v0.21.44 behebt den realen iPhone-Audiofehler von B-018: Statt der auf dem Zielgerät nicht decodierbaren M4A-Einzelcontainer wird ein lokaler MP3-Audiosprite per Web Audio API decodiert. A–Z sowie Ä/Ö/Ü besitzen definierte Zeitclips. Der Release ist erst technisch verifiziert, wenn WebKit den Sprite mit `decodeAudioData` tatsächlich decodiert und `playPhoneme('M')` erfolgreich startet; Dateisignaturen allein reichen ausdrücklich nicht mehr. Praktische Wiederholungsabnahme auf dem realen iPhone bleibt zwingend.

- v0.21.43 korrigiert die reale Deutsch-Abenteuer-Startdarstellung nach iPhone-Befund: weichere Fuchsillustration, Fuchs links mit sichtbarem Buchstaben-/Wort-Lernpfad und nächster Lernstation rechts, helle Natur-/Papierwelt sowie eigene Abenteuer-Stufenbezeichnungen statt Kampf-Ausrüstungslabels. Die Änderung ist rein visuell/motivational und verändert keine Mastery-, Spacing-, Test- oder Bewertungslogik. CI- und Live-Verifikation sind vor Merge weiterhin erforderlich.

- v0.21.42 ist der Praxis-Hotfix nach dem realen B-018-iPhone-Befund: Die zusätzlichen `l / m / g`-Karten unter dem eigentlichen Buchstaben waren missverständlich und wurden entfernt. Der bisherige Buchstabenlaut über Browser-Speech-Synthesis war auf iOS nicht zuverlässig phonetisch; die Laut-Tasten verwenden deshalb lokale, offline gecachte Laut-Audiodateien für alle 29 auswählbaren Buchstabenformen. Die damaligen M4A-Struktur-/Offline-Gates waren grün, erwiesen sich aber als unzureichend: Auf dem realen iPhone konnte der Buchstabenlaut nicht abgespielt werden. **v0.21.42 gilt deshalb für diesen Praxispunkt als nicht bestanden.**
- v0.21.41 ist der Release-Kandidat für **B-018 Freies Schreiben**: Deutsch Klasse 1 besitzt eine frei wählbare Buchstabenübung mit Dachgeschoss-/Erdgeschoss-/Keller-Lineatur, Einzel-/Groß-Klein-/Mehrfachauswahl und Buchstabenlaut. Freie Wiederholungen erzeugen bewusst keinerlei fachliche oder spielerische Fortschrittsevidenz. Die automatische Verifikation ist mit PR-CI #1326 vollständig grün, einschließlich statischem B-018-Gate und WebKit-iPhone-Test; die praktische Abschlussabnahme bleibt separat offen.
- v0.21.40 ist der Release-Kandidat für die **fachübergreifende Weltwahl mit vollständiger Storyarchitektur**: Englisch, Latein, Deutsch und die vorbereitete Französisch-Welt besitzen äquivalente Abenteuer-/Kampfpräsentationen sowie jeweils Opening, sechs aufeinander aufbauende Kapitel und ein eigenes Finale. Storykapitel erscheinen im Abenteuer-Hub, auf der Karte und in Kampfwelten, sind vorlesbar und verändern keine fachlichen Werte. Abenteueraktionen nutzen dieselbe einmalige Tagesfreigabe ohne Battle-Screen. Französisch bleibt fachlich bis B-003 gesperrt.
- v0.21.39 / PR #208 ist produktiv und durch main-CI #36587039257 sowie GitHub Pages #36587638196 bestätigt: bewusstes Abenteuer/Kampf-Opt-in für Deutsch, Wechsel ohne fachlichen Reset, sechs-stufige Abenteuer-Fuchsserie, kampffreie Abenteueraktion, m/w/d-Persistenz und vorlesbare Avatar-/Weltwahl.
- v0.21.38 ist auf `main` gemergt: freigegebenes **Deutsch-/Wortreich-Startlayout** mit Grundausrüstung → Lederzeug → Ritterlehrling → Ritter → Kronritter → König, evidenzgeschütztem Vorlesen und m/w/d-Avatarwahl. main-CI #36584417717 und Pages #36585012789 sind erfolgreich.
- v0.21.37 / PR #204 ist produktiv und durch PR-CI #1246, main-CI #1247 sowie GitHub Pages #562 bestätigt: echter deutscher Wortreich-Phaser-Belagerungskampf.
- v0.21.36 / PR #203 ist produktiv und durch PR-CI #1239, main-CI #1240 sowie GitHub Pages #561 bestätigt: Deutsch Paket D mit Lernwort-Strukturmetadaten und differenziertem Rechtschreibfehlerprofil.
- v0.21.35 / PR #202 ist produktiv und durch PR-CI #1235, main-CI #1236 sowie GitHub Pages #560 bestätigt: Der Klasse-1-Kern ergänzt Buchstabenerkennung, Laut–Buchstaben-Zuordnung, Finger-/Stift-Nachspuren, reduzierte Führung, freie Buchstabenproduktion, erste Wörter und einfache Sätze. Handschriftspraxis wird ohne Handschrift-OCR bewusst nicht automatisch als richtig/falsch bewertet. Der Grundlagenfortschritt ist getrennt von XP, Battle-Tickets und Lernwort-Mastery und wird über Family Sync übertragen. Produktionsnachweis: PR #202, PR-CI #1235, main-CI #1236 und Pages #560 erfolgreich.
- v0.21.34 / PR #201 ist produktiv und durch PR-CI #1232, main-CI #1233 sowie GitHub Pages #559 bestätigt: Deutsch-Fachgrundgerüst, Fuchs-Lernwelt und Wortreich-Grundgerüst.
- v0.21.33 ergänzt das neutrale Verschieben einer Vokabel ans Ende derselben laufenden Abfrage. Der Skip erzeugt keinerlei fachliche oder spielerische Wertung. Zusätzlich werden strittige Tagesversuche so gehärtet, dass ein offener Elternprüffall das Tagesziel nicht blockiert, ohne vorzeitig fachliche Evidenz zu erzeugen. Produktionsnachweis: PR #194 gemergt, main-CI #1193 grün, GitHub Pages #554 inklusive Live-Verifikation erfolgreich.
- v0.21.31 führt einen fachlichen Einspruchsweg für möglicherweise systemseitig falsche Bewertungen ein. Gemeldete Versuche werden bis zur Elternentscheidung vollständig neutralisiert; Eltern können lokale Antwortvarianten freigeben, die Vokabel korrigieren oder die Systembewertung bestätigen. Offene Prüffälle werden über Family Sync übertragen. Produktionsnachweis: PR #192 gemergt, main-CI #1185 grün, GitHub Pages #553 inklusive Live-Verifikation erfolgreich.
- v0.21.30 korrigiert einen im praktischen iPhone-Abnahmetest gefundenen Darstellungsfehler der Jahresentwicklung: Gesperrte Einheiten werden im Heerlager nicht mehr als abgedunkelte Vollformation gezeigt, sondern erscheinen erst bei tatsächlicher Freischaltung. Eine sichtbare Feldstärkenanzeige macht den wachsenden Jahresstand nachvollziehbar; fachliche Mastery und Battle-Logik bleiben unverändert.
- v0.21.29 trennt fachlichen Prozentwert und langfristige Spielentwicklung. Avatar, Rang und Armee wachsen kumulativ über das Schuljahr und werden durch später ergänzten Stoff nicht zurückgestuft. Die große voll ausgerüstete Armee erscheint erst auf der höchsten Entwicklungsstufe; vorher wird die Formation aus den tatsächlich freigeschalteten Einheiten aufgebaut. Die Jahresfestung besitzt ein eigenes optionales Datum pro Kind/Fach/Schuljahr, bleibt ohne bekannten Termin undatiert und wird über Family Sync übertragen. Neue Tests bleiben dynamisch und dürfen nicht hinter einer bereits datierten Jahresfestung liegen. Produktionsnachweis: PR-CI #1169, main-CI #1170 und GitHub Pages #549 einschließlich Live-Verifikation sind erfolgreich.

- v0.21.28 erweitert ausschließlich die Kampfdarstellung: Festungs-Gegenwehr, visuelle eigene Verluste, Sound-Cues und optionales Vollbild bleiben von fachlicher Mastery, Testidentität und Lernlogik getrennt.
- v0.21.27 trennt die Identität eines Tests vom Kalenderdatum. Zwei geplante Tests am selben Datum werden nicht mehr automatisch zu einem gemeinsamen Wortumfang zusammengezogen. Ein verschobener, noch offener Test bleibt im Elternbereich unabhängig vom Abstand zum Termin bearbeitbar; vorhandene Lernhistorie und eine bereits gestartete Testfestung werden dem konkreten Test zugeordnet und erhalten.

- v0.21.26 liefert die Bearbeitung offener Tests zuverlässig als neuen Shell-/PWA-Stand aus. Im Elternbereich kann ein noch nicht abgeschlossener Test bis einschließlich Testtag in Termin und Umfang geändert werden; bestehende Lernhistorie und laufender Festungsfortschritt bleiben erhalten. Der Versionssprung aktualisiert Asset-URLs und Service-Worker-Shell-Cache, damit installierte iOS-/PWA-Geräte nicht auf v0.21.25 hängen bleiben.

- v0.21.25 ergänzt am echten Testabschluss eine kurze Konfetti-Belohnung. Sie wird ausschließlich nach der bestätigten, erfolgreichen Testabschlussaktion ausgelöst, bleibt rein dekorativ, beeinflusst keine fachlichen Werte und respektiert `prefers-reduced-motion`.

- v0.21.24 ergänzt den Testtag-Lifecycle: Ein fälliger oder bereits vergangener, noch nicht bestätigter Test bleibt aktuelles Ziel und bietet „Test abschließen“. Der Abschluss wird separat von der Schulnote gespeichert und über Family Sync synchronisiert. Danach wechselt die App sofort auf den nächsten geplanten Test; bei Serien entsteht die Vorbereitung für den nächsten Wochentermin, ohne Folgetest erscheint „Nächsten Test vorbereiten“. Die Kampagnenkarte markiert einen bestätigten Test auch ohne bereits eingetragene Note als abgeschlossen.

- v0.21.24 beseitigt außerdem künstliche Lektionsenden innerhalb des Pflicht-Tageskerns. Solange Pflichtwörter offen sind, bleibt dieselbe Lernsession aktiv und führt automatisch mit der adaptiv nächsten Methode weiter. Erst der vollständig abgeschlossene Übungsraum zeigt eine kompakte Ergebnisübersicht mit Fokuswort-, Aufgaben-, Treffer- und Methodenkennzahlen; Detailabfragen sind einklappbar.

- v0.21.23 behebt einen realen iPhone/WebKit-Fehler der Festungsvorschau: Nach Ausblenden von KPI-, Taktik- und Aktionszeilen konnte der verbleibende `battleStage` trotz formal sichtbarem DOM auf nahezu null Höhe kollabieren. Die Vorschau verwendet deshalb kein flex/grid-abhängiges Resthöhenlayout mehr, sondern einen eigenständigen 16:9-Block. Browserregressionen prüfen jetzt die tatsächliche Geometrie und beide realen Einstiege („Festung ansehen“ und „Zur Schlacht“).

- v0.21.22 trennt „Festung ansehen“ wieder klar von einer echten Schlacht: Ohne freigeschaltete Tagesaktion öffnet die Festung als reduzierte Vollbild-Vorschau mit Kampagnenbild und den beiden Bannern. Battle-KPIs, Angriffsauswahl, Ticketanzeige und der gesperrte Aktionsblock werden dort nicht gerendert. Sobald eine Tagesaktion vorhanden ist, bleibt die vollständige Schlachtansicht mit den außerhalb des Bildes angeordneten Bedienelementen erhalten. Browserregressionen sichern beide Zustände getrennt.

- v0.21.22 ergänzt den kurzen Pflichtkern um einen T−1-Rettungsmodus für den Tag vor dem Test: Nach dem Pflichtteil werden bei weiterem Rückstand nur nicht testbereite Wörter in getrennten freiwilligen 6er- bzw. 4er-Blöcken angeboten. Fehler aus der vorherigen Runde haben Vorrang, danach folgen noch ungeprüfte unbekannte und schwache Testwörter; bereits testbereite Wörter werden ausgelassen. Die Abfrage folgt dem realen Testformat, Diktat verlangt produktive Rechtschreibung. Rettungsrunden verändern weder Pflichtfortschritt noch Battle-Freischaltung und senken Mastery-/Spacing-Kriterien nicht ab.

- v0.21.22 korrigiert die Mengeninterpretation des Tagesplans: 10–12 Lernkontakte werden nicht mehr als 10–12 unterschiedliche Pflichtwörter umgesetzt. Der Pflichtkern enthält regulär 5–6 Fokuswörter, bei „Kurze Einheiten“ 3–4; maximal drei bzw. zwei davon sind neu. Rückstand führt zu einer optional empfohlenen zweiten Kurzrunde statt zu 12–14 Pflichtwörtern. Strengere „heute sicher“-Wiederholungen werden nicht mehr automatisch in den laufenden Pflichtkern eingeschoben. Eine Migration verkleinert bestehende Tagespläne auf das neue Schema und übernimmt passende heutige Erledigungen.

- v0.21.21 behebt den im realen Tageslern-Test sichtbaren Fortschrittsverlust nach einem App-Release: Die Tagesplan-Signatur verwendet jetzt ein eigenes Planschema statt der App-Version. Dadurch setzt ein normales Update `0 / N erledigt` nicht mehr auf null. Beim einmaligen Übergang aus der alten Versionssignatur werden nur heutige fachlich gültige, unabhängige aktive Abrufe wieder als erledigt erkannt; Hilfs-/Recognition-Schritte, assistierte Antworten und Fehler bleiben offen. Ein Regressionstest simuliert genau diesen Release-Wechsel.

- v0.21.20 macht die Schlachtansicht verbindlich bildfokussiert: sie öffnet direkt als app-eigene Vollbildansicht, die Hauptnavigation bleibt ausgeblendet, persistente Kennzahlen/Taktik/Hauptaktion liegen außerhalb der Illustration und das doppelte Festungs-/Rang-Badge verschwindet aus der gemalten Szene. Browserregressionen prüfen Vollbild, versteckte Navigation und geometrische Überlagerungsfreiheit.

- v0.21.19 erhöht die Referenz-Fidelity der Kampagnenbanner: Proportionen, Innenposition, gerollte Pergamentenden, seitlich hängende Wappen und der lange goldene Stab orientieren sich direkt am freigegebenen Screenshot. Die Testlogik bleibt unverändert.

- v0.21.19 korrigiert die Testreihenfolge: Ein neu geplanter späterer Test darf einen früheren noch bevorstehenden Test nicht mehr überschreiben. Mehrere einmalige Termine bleiben parallel gespeichert, der früheste Termin steuert Lernen, Heute und Kampagnenziel. Spätere Bibliotheks-, manuelle und OCR-Testpläne werden nur eingereiht. Für durch v0.21.17 bereits verlorene frühere Termine gibt es eine einmalige konservative Wiederherstellung aus vorhandener zukünftiger Festungsevidenz. Regressionstests sichern Terminreihenfolge, getrennte Testumfänge und Reparatur.

- v0.21.17 führt den Bannerstil exakt auf die freigegebene visuelle Richtung zurück: horizontale Pergamentbanner oben im Bild mit farbigem Heraldik-Schild und waagerechter Zierstange. Die stehenden Feldstandarten aus v0.21.16 entfallen. Testnummernkorrektur und Bild-/Karten-Abstand bleiben unverändert erhalten; Armeeübersicht und Angriffsszene verwenden denselben Stil. Browserregressionen sichern Form, Position und Heraldikdetails.

- v0.21.16 korrigiert zwei Befunde aus dem praktischen iPhone-Test: Profilname und Testziel stehen als echte Feldstandarten innerhalb der Kampagnenszene statt als schwebende Tafeln; außerdem zählt die sichtbare Testfolge keine verwaiste Festung eines ersetzten zukünftigen Testplans mehr mit. Die aktive Testplanung bleibt maßgeblich, Testserien behalten ihre chronologische Historie. WebKit-Regressionen decken beide Fälle ab.

- v0.21.15 beseitigt die im praktischen iPhone-Test sichtbare Überlagerung zwischen Kampagnenbild und heller Missionskarte in der Armeeübersicht. Profilname und „Test N“ werden dort als parchmentartige Banner statt als Pillen dargestellt. Ein WebKit-Regressionscheck schützt den geometrischen Abstand und die Bannerform. Die Testnummerierung bleibt datengetrieben; sie wird nicht künstlich auf „Test 1“ gesetzt.

- v0.21.14 setzt die freigegebene Beschriftungslogik der Angriffsszene um: Das eigene Banner trägt den Profilnamen, das Zielbanner „Test N“ mit schuljahresbezogener Testnummer. Die generischen Bildlabels „DEINE ARMEE“/„ZIEL“ entfallen. Browserregressionen sichern sowohl Battle-Szene als auch Armeeübersicht. Fachliche Lern- und Kampflogik bleibt unverändert.

- v0.21.13 korrigiert den im praktischen iPhone-Test sichtbaren Layoutfehler auf „Heute“: Der Avatar-Statusblock ist mobil kein Overlay mehr, sondern folgt dem Avatarbild als eigener vertikaler Layoutblock. Ein WebKit-Regressionscheck schützt gegen erneute geometrische Überlagerung. Fachliche Lern-, Mastery-, Testbereitschafts- und Battle-Logik bleiben unverändert.

- v0.21.12 trennt LRS-/Lernunterstützung in Lesen und Rechtschreiben und entkoppelt davon die Belastungseinstellung „Kurze Einheiten“. Leseunterstützung steuert Hilfen/Tempo und eine nicht-masterywirksame Reading-Metrik; Rechtschreibunterstützung priorisiert produktiven Schreibabruf und verlangt für „heute sicher“ einen echten unassistierten Rechtschreibnachweis. Altprofile migrieren konservativ, Family Sync transportiert die neuen Profileinstellungen, und die richtungsspezifische Testbereitschaft aus v0.21.11 bleibt unverändert erhalten.

- v0.21.11 macht Testbereitschaft abfragerichtungsspezifisch: `target`, `source` und `mixed` benötigen passende unabhängige Abrufnachweise; Diktat bleibt an die produktive Abruf-/Rechtschreibbasis gebunden. Ein späterer Fehler öffnet nur die betroffene Richtung wieder. Recognition und Listening bleiben Lernhilfen, fließen aber nicht in den numerischen Readiness-Score ein. Bestehende Lernstände werden konservativ aus vorhandener Aktivität migriert.
- v0.21.10 härtet Spacing gegen massierte Same-Day-Erfolge: mehrere richtige unabhängige Abrufe am selben Kalendertag bleiben diagnostisch erhalten, können das Wiederholungsintervall aber nicht mehrfach verlängern. Die Intervallstufe folgt unterschiedlichen aktiven Erfolgstagen; Cold-Recall wirkt erst bei bereits verteilter Evidenz. Mastery und fachliche Bewertung bleiben konservativ und unverändert.
- v0.21.9 schließt die Tagesziel-Lücke: `completedKeys` wird in der Pflichtlektion erst nach einem fachlich richtigen, unassistierten aktiven Abruf gesetzt. Fehlversuche und Antworten mit Hinweis bleiben offen; dadurch kann die Tagesaktion nicht vorzeitig freigeschaltet werden. Der separate strengere Status „heute sicher“ und die Nachrücklogik aus v0.21.8 bleiben unverändert.
- v0.21.7 ergänzt auf „Heute“ den aktiven Profilnamen sowie die testbezogene Lernbereitschaft in Prozent und absolutem Umfang. Im iPhone-Battle werden doppelte Bildinformationen reduziert, der Verteidigungswert in das Festungs-Badge integriert und der bisherige Browser-Vollbildversuch durch einen app-eigenen, scene-only Fokusmodus ersetzt. Fachliche Lern-, Mastery- und Battle-Berechnung bleibt unverändert.
- v0.21.6 setzt das freigegebene Campaign-Target-Design verbindlich um: Armee, Weg und Festung stammen aus einer zusammenhängenden Illustration; aufgesetzte CSS-Geometrie ist nur noch Fallback. Der Battle-Screen nutzt Kapitelkarte, kompaktes 2×2-HUD und große visuelle Angriffskarten. Fachliche Lern- und Battle-Berechnungslogik bleibt unverändert.
- v0.21.5 ergänzt den Battle-Ergebnisdialog um einen expliziten `aria-hidden`-Zustand. Sichtbares Ergebnis und Accessibility-Zustand bleiben damit synchron; geschlossenes Ergebnis wird sofort aus dem assistiven Baum genommen. Battle-Berechnung und Lernlogik bleiben unverändert.
- v0.21.4 korrigiert die beiden im Livetest sichtbaren Spielwelt-Probleme. Der Army-Command-Screen wird mobil kompakter, heller und mit detaillierter Festung dargestellt. Im eigentlichen Battle-Screen wird die bereits vorhandene dedizierte gemalte Battle-Art wieder wirklich geladen; CSS-Soldaten und CSS-Festung sind bei geladener Illustration nur noch Fallback. Kennzahlen und Angriffsauswahl verdecken die Szene nicht mehr unnötig. Storytexte wurden von technischen Planerformulierungen bereinigt; die Vorlesefunktion priorisiert hochwertige deutsche Systemstimmen und nutzt natürlichere Satzpausen. Fachliche Lern-, Test- und Battle-Berechnungslogik bleibt unverändert.
- v0.21.3 schließt die Eingabe-Lücke durch Handy-Autovervollständigung und Schreibvorschläge: alle bewerteten Antwortfelder unterdrücken Browserhilfen; auf älteren Apple-WebKit-Versionen ohne verlässliche Abschaltung übernimmt **im Testcheck** eine eigene sichere Bildschirmtastatur. Normales Lernen behält die native Tastatur. Dadurch bleibt die abgegebene Testcheck-Antwort eine eigenständige Lernleistung, ohne die fachliche Bewertungslogik zu verändern.
- v0.21.2 schließt den P0-Bewertungsfehler bei Platzhaltersätzen: typografische Platzhaltervarianten, Abstände und englische Kontraktions-Tokenisierung werden normalisiert; feste sprachliche Anker bleiben verbindlich. Intern unterscheidet die Quiz-Engine exakt richtig, richtig nach Normalisierung und wirklich falsch. Normalisierte richtige Antworten erzeugen keinen Lern- oder Orthografiefehler.
- v0.21.1 führt die freigegebene visuelle Fach-DNA durchgängig ein: Start/Heute, Fortschrittskarte, Test-/Spielszene und Focused Learning unterscheiden Englisch und Latein sichtbar, während der Lernscreen bewusst ruhig und fachlich identisch bleibt. Die bisherige einheitlich dunkle Frontlinienästhetik wird durch fachbezogene Welten ersetzt; Französisch bleibt deaktiviert, seine Reise-/Etappen-Präsentation ist vorbereitet. Die Shell-Version wurde erhöht, damit installierte PWAs die neuen CSS-/JS-Dateien zuverlässig übernehmen.
- v0.21.1 setzt die freigegebene **Visual DNA** produktweit um: Start/Heute erhält ruhige Fachakzente, die Fortschrittskarte trennt englischen Kampagnenpfad und römische Marschroute, Latein erhält Legion/Kastell/SPQR sowie eine eigene römische Test- und Ergebnisinszenierung, und der fokussierte Lernmodus bleibt bewusst neutral mit nur dezenten Fachakzenten. Französisch ist als Reise-/Etappenwelt vorbereitet, bleibt aber bis zum vollständigen Fach-Aktivierungscheck deaktiviert. Die fachliche Lern-, Mastery-, Leitner-, Spacing- und Bewertungslogik bleibt unverändert.
- v0.21.0 macht den Spielkern sichtbar: Der Armeebereich zeigt **Lernen → Angreifen → Erobern** als klaren 3-Schritt-Loop, eine Seitenfront mit eigener Armee links und Ziel rechts, konkrete Testfestung/Missionsstatus, eine dominante Angriffsaktion sowie eine dunkle dynamische Feldzugskarte mit Frontlinie und Nebel des Krieges. Die fachliche Lern-, Mastery-, Leitner-, Spacing- und Bewertungslogik bleibt unverändert.
- v0.20.0 trennt die Kinderoberfläche strukturell in vier feste Hauptbereiche: **Heute**, **Lernen**, **Armee** und **Erfolge**. Der Start zeigt nur Lernavatar, Fachkontext und die heutige Lernaktion; Karteikasten/Testcheck liegen im Lernbereich, Kampagne/Schlacht/Duell im Spielbereich, Erfolge zeigen ausschließlich fachlichen Fortschritt. Feldzug und Schlacht kehren konsistent in den Spielbereich zurück.
- v0.19.16 behebt den im realen iPhone-Livetest gefundenen iOS-Übergabefehler: Nach erfolgreichem Kopieren eines Kinder-/Eltern-Verbindungslinks schließt der Safari-Hinweisdialog und das Einmal-Invite wird aus der Safari-URL entfernt; der Link bleibt für die Home-Screen-App in der Zwischenablage erhalten
- v0.19.15 schließt das abschließende Deep Audit mit Schwerpunkt Datenintegrität und Family-Sync-Fehlerpfade ab: atomarer Familienwechsel, Backup auch bei direkten QR-/Link-Beitritten, Rollback von nicht persistierten Remote-Ständen, vollständigerer Profil-Setup-Sync sowie sichere Grenzen für noch nicht synchronisierbare Profil-Löschungen
- der produktive Supabase-Stand wurde live geprüft: aktuelle VT-Migrationen sind angewendet, private VT-Tabellen besitzen keine Browser-Tabellenrechte, der interne `vt_device_context` ist für Browserrollen nicht ausführbar, der Pre-Request-Rate-Limit-Hook ist aktiv und die Security-Advisors melden keine Warnung oder Fehler
- der aktuelle Cloud-Datenbestand besitzt keine unvollständigen Setup/Progress-Profilpaare und keine aktiven Kindergeräte ohne Profil-Setup
- fachliche Lernlogik, Sollantworten, Mastery, Leitner, Spacing, XP- und Kampfrechnung werden durch diesen Hardening-Release nicht verändert

Der aktuelle Stand ist technisch und fachlich für den realen Kind-End-to-End-Test freigegeben.
Die automatisierte CI muss für den Release-Commit vollständig grün sein. Ein grüner CI-Stand
ersetzt nicht den praktischen Test mit einem Kind ohne verbale Hilfestellung.

## Release-Blocker geprüft

### Fachliche Vokabelkorrektheit

- zentrale, unveränderliche Question-/Sollantwort-Snapshots
- Set-, Vokabel- und Sense-Identität werden vor der Bewertung geprüft
- falsche Wort↔Bedeutung-Zuordnungen aus OCR werden vor dem Lernen durch Paarprüfung blockiert
- eine bestätigte Paarprüfung bleibt über Neustart/Reload/Sync gültig; nur eine echte Inhaltsänderung macht sie erneut prüfpflichtig
- Lehrwerks-/Set-Formulierungen und zulässige Sense-Antworten bleiben nachvollziehbar getrennt
- Apostrophe und diakritische Zeichen werden im Schreibmodus orthographisch streng bewertet
- semantisch richtige Antworten mit Schreibfehler werden fachlich differenziert behandelt
- Ergebnisübersicht zeigt Frage, eigene Antwort, erwartete Antworten und Bewertung

### Lernprozess

- verbindliche Reihenfolge: Erfassen → prüfen → direkt lernen / aktiv abrufen → verteilt wiederholen → nachhaltig meistern
- fachlich bestätigte Vokabeln sind sofort im adaptiven Lernpfad und in den freiwilligen Übungsarten verfügbar; Abschreiben ist keine Freigabesperre mehr
- Abschreiben ist eine eigene freiwillige Lerneinheit mit Anschauen → handschriftlich schreiben → Abdecken → Erinnern → Vergleichen; bereits ins Vokabelheft übertragene Wörter können ohne Nachteil direkt gelernt werden
- der separate Abschreibstatus wird gespeichert, beeinflusst aber weder Lernbereitschaft noch Mastery
- Tagespensum: verpflichtender Kern mit 5–6 Fokuswörtern, bei „Kurze Einheiten“ 3–4; darin maximal 3 bzw. 2 neue Wörter. Mehrere Lernschritte pro Fokuswort ergeben typischerweise mehrere Kontakte. Rückstand verlängert nicht die Pflichtsession, sondern kann eine getrennte zweite Kurzrunde empfehlen. Insgesamt höchstens 6 neue Wörter pro Tag bzw. 4 mit „Kurze Einheiten“; Testtag führt keine neuen Wörter ein.
- Karteikartenmodus: jederzeit für alle fachlich geprüften Wörter verfügbar; fünf Leitner-Boxen, ausschließlich schriftliche automatische Bewertung; richtig maximal +1 Box, falsch −1 Box, höhere Stufen durch Spacing begrenzt, Box 5 nur bei nachhaltiger Mastery
- Eltern-UX: Steht ein Test an, ist „Test planen“ der Standardweg und übernimmt die ausgewählten Vokabeln automatisch als Lernstoff. „Ohne Test lernen“ dient ausschließlich zusätzlichem Lernstoff ohne Termin.
- Vokabelauswahl unterstützt Einzelauswahl, Alle/Keine und eine inklusive Von–Bis-Spanne; gespeicherte Einzel-/Bereichsauswahl bleibt reload-stabil.
- Einmalige Datenbereinigung entfernt alte Lern-/Test-/Noten-/Importdaten und alle nicht fest eingebauten Vokabeln; Profile/Grundeinstellungen bleiben, die geprüfte Lehrwerksbibliothek wird neu aufgebaut.
- Hinweise zählen nicht wie unabhängige Abrufe
- Fehler werden erneut geplant; Mastery verlangt mehrere unabhängige Abrufe über mehrere Tage
- Testchecks verändern Mastery und Intervalle nicht
- fokussierte Abfrage ohne Kampagne, globale Navigation oder bewegte Fortschrittsanzeige

### Kind-/Eltern-Rollen

- Kindmodus ist der Startzustand
- weitere Eltern-Geräte treten einem bestehenden Familienverbund bei; ein versehentlich falscher Familienverbund kann lokal gewechselt werden, ohne Lern- oder Vokabeldaten zu löschen
- Kindergeräte laden gemeinsame Vokabelbibliothek vor Profileinrichtung und Lernfortschritt
- Kind verwaltet keine Lernbereiche, OCR-Freigaben, Testumfänge, Profile, Lehrwerke oder Backups
- offene Erwachsenenaufgaben werden dem Kind nur als verständlicher Status angezeigt
- Elternbereich ist ein bewusster Rollenwechsel
- Hilfe ist rollenabhängig
- Desktop ab 1100 px nutzt eine linke Seitennavigation, zweispaltige Heute-Ansicht und dauerhaft sichtbare freiwillige Übungen; Tablet/Mobil bleiben kompakt
- auf Eltern-Geräten können Lernprofile bewusst gewechselt werden; ein verbundenes Kindergerät ist dauerhaft an genau das beim Pairing zugewiesene Lernprofil gebunden

### Schlachtmodus / Gamification

- die Schlacht besitzt eine eigene Ergebnisansicht; sie liest ausschließlich bereits feststehende Kampfdaten und zeigt bei Sieg nur reale Werte (+20 XP, Lernfortschritt, Armeestärke, nächstes Kampagnenziel)
- eingetragene reale Schulnoten von 1 bis 6 erzeugen unabhängig von der Notenhöhe ein Prüfungsabzeichen und 50 Abschluss-XP; die Note steuert nur 0–10 zusätzliche Bonus-XP und verändert niemals Mastery, Leitner, Spacing oder fachliche Bewertung
- die XP-Vergabe einer Noteneintragung ist idempotent; erneutes Speichern derselben belohnten Note erzeugt keine doppelten XP
- die Ergebnisansicht schreibt keine Mastery- oder Lernwerte und verändert die bestehende Kampagnenlogik nicht
- bewertete Lerneinheiten zeigen nach Abschluss jede Abfrage mit Eingabe, akzeptierter Sollantwort, Bewertungsgrund und Leitner-Box-Veränderung; die zugrunde liegende fachliche Bewertungslogik wird dabei nicht verändert
- freiwillige Wiederholungsaktionen aus der Ergebnisübersicht laufen mit `isDaily=false` und können deshalb keine zusätzliche tägliche Kampfaktion erzeugen
- eine erfolgreiche Testfestungs-Eroberung wird rein visuell als Torbruch, Entfernen der Gegnerflagge und Setzen der eigenen Fahne dargestellt; der persistente Zustand wird ausschließlich aus `capturedAt` abgeleitet
- der Ergebnisdialog wird bei normaler Bewegung kurz bis nach der Eroberungssequenz verzögert; bei Reduced Motion wird direkt der identische Endzustand gezeigt
- der Karteikasten wird unter „Mein Fortschritt“ dauerhaft mit allen fünf Leitner-Stufen dargestellt; Zahlen und Fälligkeit werden ausschließlich aus dem bestehenden Lernmodell gelesen
- die Karteikasten-Übersicht ist rein lesend und verändert weder Leitner-Boxen noch Mastery
- sichtbare Festungsschäden werden ausschließlich aus dem bereits gespeicherten Verhältnis `defense/maxDefense` abgeleitet; es gibt keinen separaten visuellen Spielfortschritt
- leichte, mittlere und schwere Schadensstufen verändern Risse, Geröll, Ruß, Rauch und die illustrierte Festungs-Layer; die fachliche und kampagnenlogische Bewertung bleibt unverändert
- die Trefferphase nutzt ausschließlich vorhandene UI-Elemente für größeren Impact-Burst, Torblitz, Staubwolke und Shockwave; bei `prefers-reduced-motion` werden diese Animationen deaktiviert
- Sturmangriff und Rammbock besitzen eigene visuelle Angriffsidentitäten: Front-Vorstoß/Bewegungslinien bzw. schwere Rammbock-Anfahrt/Bodenspur/Tor-Einschlag; die Effekte lesen nur den bereits berechneten Angriff und entscheiden kein Kampfergebnis
- der Treffer-Callout zeigt exakt den berechneten Gesamtschaden und den transparenten Taktikanteil; die sichtbaren Festungszustände Intakt/Beschädigt/Stark beschädigt/Kritisch/Erobert werden ausschließlich aus `defense/maxDefense` und `capturedAt` abgeleitet
- Reduced Motion deaktiviert die neuen Sturm-/Rammbockbewegungen und Bodenspuren, erhält aber Trefferinformation und identischen persistenten Endzustand
- Pfeilhagel, Reiterangriff und Spezialangriff besitzen ebenfalls eigene rein visuelle Sequenzen: mehrwellige Pfeilbahnen, Flankenritt mit Staub/Bewegungsspur sowie Elite-/Adleraura mit stärkstem Licht- und Impactmoment; alle lesen nur den bereits feststehenden Angriffstyp und das berechnete Ergebnis
- jeder Angriff besitzt einen eindeutigen kindgerechten Treffer-Callout; Reduced Motion entfernt auch diese neuen Bewegungs-Layer, lässt Schaden/Taktiktext und persistenten Festungszustand unverändert sichtbar
- die Battle-Basisszene ist als kohärente illustrative Fantasy-Bühne neu aufgebaut; das bisherige dedizierte Battle-Artwork wird nur noch mit niedriger Opazität als Textur genutzt, während CSS-Landschaft, Angriffsweg, Formation und neu materialisierte Festung die sichtbare Komposition bilden
- die Armee verwendet eine gestaffelte Formation statt einer flachen Reihe, die Festung erhält strukturierte Steinflächen, Schatten, Fenster und klarere Silhouette; die Leserichtung bleibt links nach rechts auf das Testziel gerichtet
- der normale Battle-CTA ist nicht mehr als fixed Overlay über der Grafik positioniert, sondern sitzt direkt unter der Bühne; immersive Vollbildansicht behält bewusst einen fixierten CTA
- die vier Battle-Ebenen bewegen sich phasenabhängig mit dezentem Parallax/Kamerafokus; bei `prefers-reduced-motion` werden alle neuen Transform-Bewegungen deaktiviert
- die Battle-Grafik wird zusätzlich in getrennte visuelle Ebenen für Hintergrund, Armee, Festung und Atmosphäre aufgeteilt; dies ist rein präsentational und verändert keinerlei Lern- oder Kampflogik
- die englische Schlacht verwendet ein eigenes UI-freies Battlefield-Asset über den getrennten Loader `VTBattleArt`; Armee-/Lagergrafik und Battle-Grafik sind technisch getrennt
- das dedizierte Battlefield ist lokal/offline gecacht; CSS-Landschaft bleibt als Lade-/Fehler-Fallback erhalten und die bestehende Kampfmechanik liegt unverändert darüber
- die illustrierte englische Armee-Grafik wird ausschließlich aus lokalen, offline gecachten PWA-Ressourcen aufgebaut; keine externe Bildquelle und keine Lockerung der CSP
- jede Einheit besitzt eine eigene Detailansicht mit fünfstufigem Aufwertungspfad; aktuelle Stufe, nächste sichtbare Verbesserung und exakte Lernbedingung werden transparent angezeigt
- die Einheitendetailansicht ist rein lesend und verändert weder Mastery noch Lernfortschritt
- „Meine Armee“ ist eine vorgelagerte, jederzeit betrachtbare Erlebnisansicht; Einheitstufen und Boni werden nur aus vorhandenem Lernfortschritt abgeleitet und schreiben keinen fachlichen Lernstand
- die sechs Einheiten besitzen transparente Rollen (Front, Fernkampf, Mobilität, Belagerung, Schutz, Versorgung); die sichtbaren Rollenwerte 0–100 werden ausschließlich aus den bestehenden Einheitenstufen abgeleitet und erzeugen keinen separaten Lern- oder Spielstand
- jede Einheit macht ihre fünf Entwicklungsstufen zusätzlich durch Stufenname, fünf Marker sowie abgestufte Rahmen-/Bildwirkung sichtbar; diese Darstellung wird ausschließlich aus dem bereits vorhandenen Einheitenlevel berechnet und speichert keinen eigenen Fortschritt
- das interaktive Heerlager ordnet dieselben sechs Einheitenillustrationen räumlich nach Front, Flanke, Belagerung, Fernkampf und Versorgung an; es ist vollständig aus vorhandenem Zustand abgeleitet, öffnet nur bestehende Detailansichten und schreibt keine Lern- oder Kampfwerte
- die Feldzugskarte setzt keine vorab bekannte Testanzahl voraus: vorhandene Testtermine/Festungen/Noten werden chronologisch zu Stationen zusammengeführt, neue zukünftige Tests verlängern den Weg dynamisch, unbekannte Zukunft bleibt als Nebelabschnitt sichtbar und die Jahresfestung ist ausschließlich ein langfristiges Fortschrittsziel
- Feldzugskarte, Stationsauswahl und Fantasienamen werden deterministisch aus vorhandenem Zustand abgeleitet; die Karte speichert keinen zweiten Lern- oder Kampagnenstand und ist Bestandteil des Offline-App-Shells
- Rollenwerte verändern weder Testbereitschaft noch Mastery noch den fachlichen Lernstand; ab v0.18.44 dürfen passende Angriffsarten daraus ausschließlich einen kleinen, auf 10 Schaden begrenzten Kampagnen-Taktikbonus ableiten
- die Armeeansicht besitzt keine eigenständige Spielwährung; Aufwertungen entstehen automatisch durch Lernen und nachhaltige Wiederholung
- Schlacht ist ein separater Erlebnisbereich nach einer abgeschlossenen Lerneinheit
- pro Fach und Kalendertag wird höchstens eine Kampfaktion ausschließlich durch das vollständig abgeschlossene Tagesziel freigeschaltet; freiwillige Übungen zählen nicht mit
- Animationen, Einheiten, Festungen, Jahreszeiten, Rang und Ausrüstung liegen außerhalb der Abfrage
- Bosskämpfe, Spezialangriffe und Story verändern keinen fachlichen Lernstand
- jede geplante Prüfung erzeugt eine eigene Testfestung; Testabstand bestimmt die anfängliche Verteidigung, Lernqualität den begrenzten Schadensbonus; nach früher Eroberung wird dieselbe Festung bis zum Test gesichert
- Sturm/Front, Pfeilhagel/Fernkampf, Rammbock/Belagerung und Reiter/Mobilität verwenden dieselben zentralen Einheitsschwellen wie die Armeeansicht; Vorschau, gespeicherter Kampflog und Ergebnis weisen den Taktikanteil transparent aus
- Freundschaftsduelle sind deterministisch; kein Zufall entscheidet über das Ergebnis
- Herausforderungscodes enthalten ab v0.17.1 keinen Profilnamen und nur die für den Vergleich nötigen Daten
- der Battle-Browsertest prüft explizit, dass Mastery durch Kampf und Bosskampf unverändert bleibt

### LRS / Accessibility

- LRS-Modus mit ruhigerem Layout und anpassbarer Darstellung
- keine erzwungenen Versalien in LRS-Orientierungslabels
- sichtbarer Tastaturfokus und zentrale Zielgrößen von mindestens 44 px
- Skip-Link und zugängliche Namen dynamischer Antwortfelder
- Reduced-Motion wird berücksichtigt
- Boss-Fortschritt und Schlachtfeld besitzen zugängliche Beschriftungen
- Hilfen verschwinden während des fokussierten Abrufs

### Daten / Datenschutz

- IndexedDB ist Primärspeicher; localStorage nur Fallback und für die lokale Family-Sync-Gerätekonfiguration
- importierte Backups werden plausibilisiert, gehärtet und nach dem Restore zurückgelesen
- Laufzeitindizes werden nicht persistiert
- Größenlimits für Backup/Import sind vorhanden
- der einmalige v0.14.1-Vokabel-Purge löscht Lerninhalte nur einmal je Browserprofil
- Freundschaftsduell funktioniert ohne Server und überträgt keine Profildaten automatisch
- Herausforderungscodes sind bewusst nicht kryptographisch fälschungssicher; darauf weist die UI hin
- Familiensynchronisierung ist optional und trennt gemeinsame Daten, Profileinrichtung und Lernfortschritt
- jedes verbundene Gerät besitzt ein eigenes zufälliges Geräteschlüssel-Geheimnis
- Kindergeräte können serverseitig nur den eigenen Profilfortschritt schreiben
- Eltern können Geräte auflisten und widerrufen; Kinder-Einladungen sind einmalig und zeitlich begrenzt

### Security

- CSP ohne unsafe-inline und unsafe-eval
- keine externen Laufzeitskripte erforderlich
- object-src none und base-uri none
- dynamische Texte aus Lern-/Importdaten werden vor HTML-Ausgabe escaped
- OCR und Wörterbuchressourcen werden lokal ausgeliefert
- Browser-Smokes behandeln JavaScript-/CSP-Fehler als Fehler
- Hilfe-Browsertest überwacht zusätzlich die Browser-Konsole
- Supabase-Family-Sync nutzt ausschließlich einen Publishable Key im Browser; privilegierte Schlüssel bleiben serverseitig
- Family-Sync-RPCs prüfen Geräte-ID und Geräteschlüssel serverseitig und begrenzen Kinderrechte unabhängig vom Frontend
- sensible Family-Sync-RPCs sind über den Supabase-Pre-Request-Hook rate-limitiert; seit v0.18.60 umfasst dies auch Erzeugen und Einlösen der neuen Parent-Invites

### PWA / Offline / Deployment

- versionsgetrennter App-Shell-Cache
- langlebiger OCR-/Wörterbuch-Ressourcencache
- Service Worker aktualisiert installierte Apps mit kontrolliertem einmaligem Reload
- Chromium-Service-Worker-/Offline-Smoke
- WebKit/iPhone-Smokes für Shell, Lernen, Hilfe, OCR, optionales Abschreiben und Schlacht
- Battle-Saisontest ist nicht mehr auf einen bestimmten Kalendermonat fest verdrahtet
- der eigene GitHub-Pages-Workflow deployt nur nach erfolgreichem Vokabeltrainer-CI und checkt exakt den getesteten Commit aus
- GitHub Pages ist auf „GitHub Actions“ umgestellt; der Produktions-Deploy wird damit ausschließlich nach erfolgreichem Vokabeltrainer-CI ausgelöst
- nach dem Pages-Deploy prüft ein Live-Smoke die tatsächlich ausgelieferte Version in `index.html`, `js/core.js` und `sw.js`
- die CI ist in parallele Gates für Preflight, Core-UI, Daten/Sicherheit und Gameplay getrennt; der Required Check `test` aggregiert diese Ergebnisse
- Draft-PRs führen nur den schnellen Preflight aus; die vollständigen Browser-Gates starten bei Ready-for-Review
- Browser-Smokes können auf den expliziten lokalen Bootstrap-Zustand `vt-app-ready` warten, statt nur das Vorhandensein einzelner globaler Variablen zu erraten

## Audit-Korrekturen v0.17.1

1. **Datensparsamkeit im Freundschaftsduell:** Profilname sowie unnötige Detailwerte wurden aus neuen Herausforderungscodes entfernt. Alte Codes bleiben lesbar, der darin enthaltene Name wird nicht mehr übernommen.
2. **Zeitstabiler Battle-Test:** Der Saisontest ermittelt Frühling/Sommer/Herbst/Winter dynamisch statt dauerhaft „Herbst“ zu erwarten.
3. **Accessibility:** Schlachtfeld und Boss-Fortschritt wurden expliziter beschriftet.
4. **Testhärtung:** Der Hilfe-Test prüft nun auch Browser-Konsole/CSP-Fehler.
5. **Dokumentationsdrift:** README und finales Audit müssen per Preflight dieselbe App-Version wie der Code tragen.

## Audit-Korrekturen v0.18.18

1. **Visuelle Konsistenz:** Karten, Navigation, Dialoge, Formulare und Statusflächen nutzen ein gemeinsames ruhiges Designsystem.
2. **Lernfokus geschützt:** Die fokussierte Abfrage wurde nur visuell verfeinert; Abläufe, Bewertung und Mastery bleiben unverändert.
3. **LRS geschützt:** Der LRS-Modus behält reduzierte Schatten und eine sachliche Darstellung.
4. **Rollen geschützt:** Eltern-/Kinderlogik und Family-Sync wurden durch den Design-Pass nicht verändert.

## Audit-Korrekturen v0.18.60

1. **CI-Orchestrierung:** Der frühere monolithische Testjob ist in parallele Release-Gates aufgeteilt. Dadurch werden mehrere Fehler im selben Lauf sichtbar.
2. **Flake-Härtung:** Die App setzt nach vollständiger lokaler Initialisierung `window.__VT_APP_READY__` und sendet `vt-app-ready`; die nachweislich flakigen Reload-/DOM-Smokes warten auf diesen Zustand.
3. **Draft-PRs:** Unfertige Drafts lösen keine vollständige Browser-Suite mehr aus. Bei `ready_for_review` wird die komplette Release-CI gestartet.
4. **Post-Deployment:** Der Pages-Workflow validiert nach dem Deployment die tatsächlich ausgelieferte Versionskonsistenz.
5. **Backend-Reproduzierbarkeit:** Die produktive Parent-Invite-Migration `20260924203104` sowie die neue Rate-Limit-Migration `20260925041851` liegen versioniert im Vokabeltrainer-Repository.
6. **Rate Limits:** `vt_create_parent_invite` und `vt_claim_parent_invite` sind produktiv in den gemeinsamen Supabase-Pre-Request-Schutz aufgenommen.
7. **Offene Infrastrukturgrenze:** Die GitHub-Regel „Branch muss vor Merge auf aktuellem Main sein“ ist weiterhin administrativ zu aktivieren; sie kann über die derzeitige GitHub-Integration nicht geändert werden.

## Bewusste Grenzen vor v1

- Family Sync ist vorhanden und wurde am 21.09.2026 zusätzlich end-to-end gegen die produktiven Supabase-RPCs mit getrenntem Eltern-/Kindergerät, Einmal-Invite, Rechteprüfung, Progress-Sync, Revisionskonflikt und Geräte-Revoke erfolgreich getestet. Vor v1 bleibt die Funktion dennoch als Beta gekennzeichnet; lokale Backups bleiben eine unabhängige Rückfallebene.
- Browser/OS können lokalen Webspeicher unter extremem Speicherdruck löschen; Backup bleibt notwendig.
- Gleichzeitige Änderungen desselben synchronisierten Dokuments werden bewusst als Konflikt markiert und nicht automatisch zusammengeführt.
- Herausforderungscodes sind kein vertrauenswürdiger Leistungsnachweis und können manipuliert werden.
- Gamification kann Motivation unterstützen, ist aber kein Beleg für höheren Lernerfolg; deshalb bleibt sie außerhalb des Abrufs.
- Französisch bleibt deaktiviert, bis Sprach-/OCR-Pipeline vollständig getestet ist.

## Praktischer Test vor v1

Der nächste entscheidende Test ist ein echter Kind-Test ohne Erklärungen. Beobachtet werden:
- erster Blick: erkennt das Kind die heutige Hauptaktion?
- freiwilliges Abschreiben: erkennt das Kind, dass es die Einheit überspringen kann und versteht bei Nutzung Abschreiben → Abdecken → Erinnern → Vergleichen?
- normale Abfrage: versteht es Fehlerfeedback und „Weiter“?
- Abschluss: findet und versteht es die Ergebnisübersicht?
- Belohnung: versteht es, dass eine Schlacht freigeschaltet wurde?
- Schlacht: findet es Angriffsart, Vollbild und Ergebnis ohne Hilfe?
- Rückweg: kommt es selbständig zu Heute/Lernen zurück?
- kritisch: erster Fehlklick, Pause >5 Sekunden, Zurückspringen oder Nachfrage werden notiert.
- die sechs bestehenden Festungsstufen besitzen eigenständige, im Hero-Redesign klar unterscheidbare Silhouetten; die Darstellung liegt separat in `css/battle-fortress.css` und verändert keine Lern- oder Kampflogik
