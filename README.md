# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Projektsteuerung

Verbindlicher Einstieg für Quellenhierarchie, Entscheidungen, Backlog, Produktionsstand und Teststatus: **[PROJECT_CONTROL.md](PROJECT_CONTROL.md)**.

Bei Grundsatzfragen werden bestehende Projektregel, Bewertung und mögliche Änderung getrennt und mit der jeweiligen Repository-Quelle belegt.

Arbeits- und Archivregeln für Projektchats: **[docs/project/CHAT_LIFECYCLE.md](docs/project/CHAT_LIFECYCLE.md)**.

## Aktueller Stand

App-Version: **v0.21.40**

- v0.21.40 (Release-Kandidat): Die Weltwahl **Abenteuer | Kampf** ist auf die gesamte Facharchitektur übertragen. Englisch erhält Expedition vs. Armee/Feldzug, Latein zivile mediterrane Entdeckungsreise vs. Legion/Kastelle, Französisch Voyage Français vs. vollständig fiktionale Gefährten-/Festungswelt. Alle Varianten verwenden denselben fachlichen Zustand und dieselbe kumulative Jahresstufe; Abenteuer öffnet keinen Battle-Screen. Französisch bleibt als Fach bis B-003 noch nicht freigeschaltet.

- v0.21.39: Deutsch kann pro Profil bewusst zwischen **Fuchs-Abenteuer** und **Kampf / Das Wortreich** wählen. Bestehende Profile bleiben auf Wortreich. Der Wechsel erhält Lernstand und kumulative Jahresstufe; Abenteuer nutzt eine eigene sechs-stufige, nicht-militärische Vektor-Fuchsserie und dieselbe einmalige Tagesaktionsfreigabe ohne Battle-Screen. Profilwahl ist m/w/d-fähig und für Klasse 1 vorlesbar. Produktionsnachweis: PR #208, main-CI #36587039257 und GitHub Pages #36587638196 erfolgreich.
- v0.21.38: freigegebenes Wortreich-Startlayout mit **Grundausrüstung → Lederzeug → Ritterlehrling → Ritter → Kronritter → König**, evidenzgeschützter Vorlesefunktion und persistenter Avatarwahl **Männlich / Weiblich / Neutral-Divers**; auf `main` gemergt und durch main-CI #36584417717 sowie Pages #36585012789 verifiziert.

- v0.21.37: Deutsch Paket E macht „Das Wortreich“ zum echten Phaser-Belagerungskampf: deutscher Produktionsrenderer, eigene Wald-/Pergamentpalette, Ritterheer-/Burgsprache und iPhone-Regressionsschutz. Phaser bleibt reine Darstellung; Schaden, Tickets und fachlicher Lernstand verbleiben in der bestehenden App-Logik.
- v0.21.36: Deutsch Paket D erweitert Lernwörter um Silben, Wortstamm, Wortfamilie und einen redaktionellen Rechtschreibfokus. Deutsch-Fehler werden getrennt als Groß-/Kleinschreibung, Buchstabenfolge, Wortstruktur oder Satzkontext geführt und steuern gezielte Folgeübungen; eine angefochtene Bewertung rollt auch dieses Fehlerprofil neutral zurück. Produktionsnachweis: PR #203, PR-CI #1239, main-CI #1240 und Pages #561 erfolgreich.
- v0.21.35: Deutsch Paket C ergänzt den Klasse-1-Kern mit Buchstabenerkennung, Laut–Buchstaben-Zuordnung, Finger-/Stift-Nachspuren, reduzierter Führung, freier Buchstabenproduktion, ersten Wörtern sowie einfachen Satzaufgaben. Handschriftspraxis wird bewusst nicht automatisch als richtig/falsch bewertet; die neue Grundlagen-Evidenz bleibt getrennt von XP, Battle-Tickets und Lernwort-Mastery und wird über Family Sync übertragen. Produktionsnachweis: PR #202, PR-CI #1235, main-CI #1236 und Pages #560 erfolgreich.
- v0.21.34: Deutsch Paket B integriert das Fachgrundgerüst produktnah: auswählbares Deutsch mit de-DE-Audio, eigener Native-Literacy-Capability und getrennten Kompetenzzuständen, fachlich relevanter Groß-/Kleinschreibung bei Rechtschreibaufgaben, ruhigem Fuchs-Lernlayout mit Holzschwert-Stationen sowie einem getrennten Ritter-/Burg-Spielbereich „Das Wortreich“. Der Paket-B-Browser-Smoke prüft iPhone- und Desktopdarstellung sowie die Fachtrennung.
- v0.21.33: Das Kind kann eine aktuelle Vokabel neutral überspringen; sie wird ausschließlich ans Ende derselben laufenden Abfrage verschoben und bleibt ohne Bewertungs-, XP- oder Lernstandsänderung. Offene strittige Bewertungen blockieren außerdem das heutige Tagesziel nicht: Sie gelten bis zur Elternentscheidung nur organisatorisch als bearbeitet, fachlich aber weiterhin neutral.
- v0.21.31: Kinder können eine möglicherweise systemseitig falsche Bewertung direkt mit „Bewertung prüfen lassen“ melden. Der Versuch bleibt bis zur Elternentscheidung fachlich neutral. Eltern können die Antwort als lokale zulässige Variante freigeben, die Vokabel bearbeiten oder die Systembewertung bestätigen; freigegebene Varianten werden künftig automatisch akzeptiert.
- v0.21.30: Praktischer iPhone-Abnahmetest deckte auf, dass „Meine Armee“ trotz neuer Jahresentwicklung weiterhin wie die volle Armee wirkte, weil gesperrte Einheiten im Heerlager nur abgedunkelt statt entfernt wurden. Das Heerlager zeigt jetzt ausschließlich tatsächlich freigeschaltete Einheiten und kennzeichnet sichtbar, wie viele von sechs Einheiten bereits im Feld stehen.
- v0.21.29: Avatar, Rang und Armee erhalten eine dauerhafte Jahresentwicklung, die durch später ergänzten Lernstoff nicht zurückgestuft wird. „Meine Armee“ wächst sichtbar mit dem tatsächlich erreichten Stand; die Jahresfestung bleibt bis zu einem real bekannten Termin undatiert und kann im Elternbereich datiert, geändert oder wieder geöffnet werden.
- v0.21.28: Die englische Phaser-Schlacht erhält das Cinematic Upgrade: größere Festung und Profilbanner, aktive Gegenwehr mit Pfeilen und Katapult, rein visuelle eigene Verluste, dezente offlinefähige Sound-Cues sowie eine standardmäßig scrollbar bleibende Schlacht mit optionalem Vollbild.
- v0.21.27: Geplante Tests erhalten eine eigene Identität statt über das Datum zusammengefasst zu werden. Ein verschobener Test bleibt auch vor dem Testtag bearbeitbar und verschmilzt nicht mehr mit einem anderen Test am selben Datum; bestehender Lern- und Festungsfortschritt bleibt erhalten.

- v0.21.26: Offene Tests bleiben bis zum tatsächlichen Abschluss bearbeitbar. Testdatum und Testumfang können im Elternbereich geändert werden, ohne Lernhistorie oder laufenden Festungsfortschritt zurückzusetzen. Der Versionssprung aktualisiert zugleich Shell- und Service-Worker-Cache, damit diese Änderung auf installierten iOS-/PWA-Geräten zuverlässig geladen wird.

- v0.21.26: Der echte Testabschluss erhält eine kurze, rein dekorative Konfetti-Belohnung. Sie startet erst nach bestätigtem und erfolgreich gespeichertem „Test abschließen“, verändert weder Lernstand noch XP und wird bei aktivierter reduzierter Bewegung nicht animiert.

- v0.21.24: Der verpflichtende Tageslernweg ist ein durchgehender **Übungsraum**: interne Methodenwechsel erzeugen keinen künstlichen Lektionsabschluss; offene Pflichtwörter werden nach einer kurzen Orientierung automatisch mit der nächsten passenden Methode weitergeführt. Erst der vollständig erledigte Pflichtkern zeigt eine kompakte Ergebniszusammenfassung. Zusätzlich hat der Testtag jetzt einen expliziten Abschluss: Ab Testdatum wird **„Test abschließen“** zur Hauptaktion. Der Test bleibt bis zur Bestätigung aktuell, auch wenn das Datum bereits vorbei ist. Danach erscheint sofort der nächste geplante Test; fehlt er, wechselt die App auf **„Nächsten Test vorbereiten“**. Bei Testserien wird direkt der nächste Termin zur Vorbereitung angeboten. Der Abschluss ist unabhängig von der später nachtragbaren Schulnote.

- v0.21.23: Behebt die auf realen iPhones sichtbare leere Festungsvorschau. WebKit konnte den 16:9-Bildbereich nach dem Ausblenden der Battle-Steuerung auf nahezu null Höhe zusammenschieben. Die Vorschau erhält jetzt eine eigenständige, nicht schrumpfende 16:9-Geometrie. Regressionstests prüfen beide Einstiege – „Festung ansehen“ aus der Armee und „Zur Schlacht“ aus „Mein Feldzug“ – auf echte sichtbare Bildhöhe statt nur auf `display != none`.

- v0.21.22: Der verpflichtende Tageskern ist auf 5–6 Fokuswörter begrenzt, mit „Kurze Einheiten“ auf 3–4. Rückstand bläht die Pflichtsession nicht mehr auf. Zusätzlich gibt es für den Tag vor einem Test einen T−1-Rettungsmodus: testbereite Wörter werden ausgelassen, Fehler und noch ungeprüfte unsichere/ unbekannte Testwörter werden in getrennten freiwilligen Kurzrunden priorisiert, und die Abfrage spiegelt das reale Testformat. Rettungsrunden erzeugen keine zusätzliche Battle-Aktion und lockern Mastery oder Spacing nicht. Automatische „heute sicher“-Wiederholungen verlängern den Pflichtkern nicht mehr. Bereits heutiger Fortschritt aus dem alten 12er-Plan wird beim Wechsel auf den kompakten Plan soweit fachlich passend übernommen. Die Armee-Schaltfläche „Festung ansehen“ ist wieder ein reiner bildfokussierter Vorschauweg: Solange keine Tagesaktion freigeschaltet ist, werden Battle-HUD, Angriffskarten und der gesperrte Aktionsblock vollständig ausgeblendet; erst mit echter Angriffs-/Sicherungsaktion erscheint die Schlachtsteuerung.

- v0.21.21: Tagesfortschritt bleibt über App-Releases hinweg erhalten. Die Tagesplan-Signatur ist nicht mehr an die App-Version gekoppelt; ein heute bereits bearbeiteter Plan wird bei einem Update weiterverwendet. Für den heutigen Wechsel aus der alten Versionssignatur werden fachlich gültige, unabhängige aktive Abrufe aus der Aktivitätshistorie konservativ zurückgerechnet; reine Erkennungs-/Hilfsaufgaben und Fehler zählen nicht als erledigt.

- v0.21.20: Die eigentliche Schlacht öffnet immer als app-eigene Vollbildansicht. Die feste Hauptnavigation ist dort ausgeblendet; Kennzahlen, Angriffsauswahl und Hauptaktion liegen außerhalb der Illustration statt darüber. Das doppelte Festungs-/Rang-Badge wird in der gemalten Szene ausgeblendet. Banner- und Testlogik bleiben unverändert.

- v0.21.19: Banner in Armee- und Angriffsszene näher an der freigegebenen Referenz: schmale Pergamentrolle mit gerollten Enden, großer seitlich hängender Heraldik-Wimpel und langer goldener Stab mit Speerspitzen. Testlogik bleibt unverändert.

Das Projekt wurde am 20.09.2026 aus `JohannasGartenwelt/vokabeltrainer` in dieses eigenständige Repository migriert. Produktentscheidungen richten sich verbindlich nach [PRODUCT_DNA.md](PRODUCT_DNA.md).

Die produktive Family-Sync-Infrastruktur nutzt dasselbe Supabase-Projekt wie Johanna's Gartenwelt. Die kanonische Backend-/Recovery-Quelle liegt im Repository `JohannasGartenwelt` unter `supabase/`; dieses Repository enthält nur die Vokabeltrainer-spezifischen Anwendungssourcen und lokale Referenzmigrationen.

## v0.21.19 – Mehrere kommende Tests bleiben chronologisch aktiv

- ein später eingetragener Test ersetzt **nicht mehr** einen früheren noch bevorstehenden Test
- mehrere einmalige Tests desselben Fachs können parallel geplant bleiben; Lernen, Heute-Ansicht und Kampagnenziel richten sich immer nach dem **frühesten anstehenden Termin**
- auch mehrere Tests aus demselben Lehrwerksabschnitt erhalten getrennte datierte Testpläne und eigene Vokabelauswahlen
- manuell und per OCR vorbereitete spätere Tests werden nach der Paarprüfung eingereiht, ohne den früheren Test zu löschen
- „Plan löschen“ entfernt bei einmaligen Tests nur noch den aktuell gewählten Termin statt alle zukünftigen Tests
- eine einmalige v0.21.17-Reparatur stellt einen früheren Test wieder her, wenn die alte Ersetzungslogik sein Datum gelöscht hat, aber die bereits erzeugte zukünftige Testfestung den Termin eindeutig belegt
- Regressionstests sichern Bibliothek, manuelle Erfassung, OCR, Terminreihenfolge und Datenreparatur

## v0.21.17 – Heraldik-Banner wie freigegebene Referenz

- Profilname und „Test N“ erscheinen wieder als **horizontale Pergamentbanner am oberen Bildrand**
- jedes Banner trägt einen kleinen farbigen Heraldik-Schild und eine waagerechte Zierstange; dadurch entspricht die Darstellung wieder der freigegebenen Referenz statt den stehenden Feldstandarten aus v0.21.16
- links bleibt der Profilname, rechts die datengetriebene Testnummer; die Korrektur der Testfolge aus v0.21.16 bleibt unverändert erhalten
- die geometrische Trennung zwischen Kampagnenbild und heller Missionskarte bleibt ebenfalls erhalten
- derselbe Bannerstil wird in Armeeübersicht und eigentlicher Angriffsszene verwendet
- WebKit-Regressionen prüfen horizontale Proportion, obere Position, Heraldik-Schild und Zierstange

## v0.21.16 – Stehende Feldbanner und korrekte Testfolge

- Profilname und „Test N“ stehen in der Armeeübersicht jetzt auf **sichtbar gesetzten Feldstandarten** mit Mast und farbigem Wappenstück innerhalb der Schlachtszene statt auf schwebenden Tafeln am oberen Bildrand
- die Standarten sind an Armee und Zielseite räumlich verankert und bleiben auf dem iPhone vollständig innerhalb der Szene
- die Testnummer ignoriert verwaiste Festungsdaten eines inzwischen ersetzten zukünftigen Testplans; ein solcher Test darf die sichtbare Nummer nicht mehr von „Test 1“ auf „Test 2“ erhöhen
- reguläre aktive Testpläne sowie echte Testserien bleiben in der chronologischen Nummerierung erhalten
- WebKit-Regressionsprüfungen sichern sowohl die stehenden Banner als auch die Bereinigung der Testfolge

## v0.21.15 – Armee-Banner und klare Bildtrennung

- Profilname und „Test N“ erscheinen in der Armeeübersicht als ruhige, parchmentartige Kampagnenbanner statt als weiße Pillen
- das Kampagnenbild und die helle Missionskarte sind mobil geometrisch getrennt; der bisherige negative Überzug der Karte auf das Bild entfällt
- ein WebKit-iPhone-Regressionscheck prüft den Mindestabstand und die Bannerform
- die Testnummernlogik bleibt fachlich unverändert und wird nicht auf „Test 1“ fest verdrahtet

## v0.21.14 – Angriffsszene mit Profil-/Testbanner

- generische Szenenbeschriftungen „DEINE ARMEE“ und „ZIEL“ werden durch in die Kampagnenszene integrierte Banner ersetzt
- das eigene Banner zeigt den aktiven **Profilnamen**
- das Zielbanner zeigt **„Test N“**, wobei N aus der chronologischen Testfolge des aktuellen Fachs und Schuljahres gebildet wird
- die Nummerierung beginnt in jedem neuen Schuljahr wieder bei Test 1
- Banner bleiben auch im app-eigenen Fokusmodus sichtbar und ersetzen zusätzliche erklärende Bildlabels
- Lern-, Mastery-, Testbereitschafts- und Kampfschadenslogik bleiben unverändert

## v0.21.13 – Mobiles Avatar-Statuslayout

- auf Mobilgeräten liegt der Stufen-/Teststatus jetzt als eigener Layoutblock **unter** dem Avatarbild statt als Overlay darüber
- Avatarbild, Status und Tagesaufgabe bilden damit eine klare vertikale Reihenfolge
- Desktop behält die kompakte bestehende Darstellung
- ein WebKit-iPhone-Regressionscheck stellt sicher, dass der Statusblock weder im Avatarrahmen liegt noch diesen geometrisch überlappt
- Lernlogik, Mastery, Tagesplan, Testbereitschaft und Gamification bleiben unverändert

## v0.21.12 – Differenzierte LRS-Unterstützung

- LRS-/Lernunterstützung ist im Profil getrennt nach **Lesen** und **Rechtschreiben** wählbar; beide Dimensionen können unabhängig oder gemeinsam aktiv sein
- **Kurze Einheiten** sind davon getrennt und steuern kleinere Sessions sowie das reduzierte freiwillige Nachrücklimit von zwei statt drei Zusatzwörtern
- alte Profile mit `lrsMode=true` werden konservativ auf Lesen + Rechtschreiben + kurze Einheiten migriert; `lrsMode` bleibt nur als Kompatibilitätsalias für ältere Sync-Clients
- Leseunterstützung priorisiert Audio/Laut-Schrift-Scaffolds und ruhigen Wortblitz; die `reading`-Supportmetrik verändert Mastery und Testbereitschaft nicht
- Rechtschreibunterstützung priorisiert Schreiben/Diktat stärker; erfolgreiche unassistierte Rechtschreibabrufe werden zusätzlich über `spellingSuccessDays` dokumentiert
- für „heute sicher“ reicht bei aktiver Rechtschreibunterstützung reine Retrieval-Evidenz nicht: mindestens ein erfolgreicher unassistierter Rechtschreibabruf ist erforderlich
- die richtungsspezifische Testbereitschaft aus v0.21.11 bleibt vollständig erhalten
- Family Sync transportiert `literacySupport` und `reducedLoad` als Profileinstellungen vom Eltern- zum Kindergerät
- automatisierte Lernintegritäts-, Reset/Purge- und Family-Sync-Smokes schützen Migration, getrennte Dimensionen und fachliche Grenzen

## v0.21.11 – Richtungsspezifische Testbereitschaft

- Testbereitschaft verlangt jetzt zusätzlich einen unabhängigen Abruf in der tatsächlich geplanten Test-Richtung
- `target`: Bedeutung → Fremdsprachenwort; `source`: Fremdsprachenwort → Bedeutung; `mixed`: beide Richtungen
- ein späterer unabhängiger Fehler setzt nur den betroffenen Richtungsnachweis wieder offen; ein unterstützter Treffer stellt ihn nicht wieder her
- Diktat verwendet weiterhin die produktive Retrieval-/Spelling-Basis ohne Übersetzungsrichtungs-Sperre
- Recognition und Listening bleiben Lernhilfen, fließen aber nicht mehr in den numerischen Testbereitschafts-Score ein
- bestehende Lernstände werden konservativ aus vorhandenen Aktivitätsdaten bzw. dokumentierten Abrufmodi migriert; nie geübte Richtungen werden nicht erfunden
- Learning-Integrity-Smoke prüft Richtungstrennung, Fehler-Reset, Hilfsversuche, Diktat und die passive Score-Isolation; der Menü-Smoke schützt die testbezogene Fortschrittsanzeige

## v0.21.10 – Same-Day-Spacing-Härtung

- das Wiederholungsintervall wird nicht mehr aus der bloßen Zahl aller unabhängigen Treffer abgeleitet, sondern aus **unterschiedlichen aktiven Erfolgstagen**
- mehrere richtige Abrufe desselben Wortes am selben Kalendertag bleiben als Übungs- und Accuracy-Evidenz erhalten, verlängern das nächste Intervall aber nicht mehrfach
- ein Erfolg an einem späteren Tag kann die nächste Intervallstufe freigeben
- Cold-Recall kann weiterhin einen begrenzten Zusatzimpuls geben, aber erst bei bereits verteilter Evidenz über mindestens zwei Erfolgstage
- Mastery-Kriterien, Tagesziel, adaptives Nachrücken und Battle-Logik bleiben ansonsten unverändert
- Learning-Integrity-Smoke prüft explizit: zwei Same-Day-Treffer bleiben beim Ein-Tages-Intervall; ein späterer Erfolg darf das Intervall erhöhen

## v0.21.9 – Tagesziel-Lernintegrität

- ein Pflichtwort im Tagesplan wird erst nach einem **fachlich richtigen, unassistierten aktiven Abruf** als erledigt markiert
- falsche aktive Versuche bleiben im Pflichtziel offen und können weder „Tagesziel geschafft“ noch die Kampfaktion vorzeitig auslösen
- richtige Antworten mit verwendetem Hinweis bleiben ebenfalls offen; Hilfe unterstützt das Lernen, ersetzt aber nicht den Pflichtabruf
- der strengere separate Zustand „heute sicher“ aus v0.21.8 bleibt unverändert und steuert weiterhin nur freiwilliges Nachrücken
- Learning-Integrity-Smoke prüft explizit unterstützten Treffer, Fehlversuch und anschließenden unabhängigen Erfolg

## v0.21.8 – Adaptives Nachrücken im Tagesplan

- der morgens erzeugte Pflicht-Tagesplan bleibt für den ganzen Tag als festes Tagesziel bestehen
- zusätzlich wird ein eigener Zustand **„heute sicher“** geführt; `completedKeys` bleibt ausschließlich der Kontakt-/Pflichtzielstatus und entscheidet nicht über das Nachrücken
- bereits testbereite Wiederholungswörter können nach einem produktiven, unassistierten und orthografisch korrekten Abruf ihren aktiven Platz freigeben
- neue oder noch schwache Wörter benötigen zwei getrennte erfolgreiche aktive Abrufe ohne Fehler dazwischen; ein Fehler setzt die Sicherheitsserie zurück
- unterstützte Modi wie Erkennen, Hören oder Wortbausteine können ein Wort nicht „heute sicher“ machen
- nach einem sicheren Wort wird priorisiert ein noch unbekanntes Wort aus dem anstehenden Test, danach ein schwaches Testwort und anschließend eine fällige Wiederholung als freiwilliger Vorsprung vorgemerkt; die laufende Pflicht-Einheit wird dadurch nicht automatisch verlängert
- in den letzten drei Tagen vor einem Test werden keine zusätzlichen unbekannten Wörter mehr nachgezogen; der Schwerpunkt bleibt auf Konsolidierung
- Zusatzlernen ist auf maximal drei Wörter pro Tag begrenzt, im LRS-Modus auf zwei; die bestehende Obergrenze von sieben neu eingeführten Wörtern pro Tag bleibt bestehen
- Zusatzwörter verändern weder das offizielle Tagesziel noch dessen Fortschrittsanzeige und erzeugen keine weitere Kampfaktion
- „heute sicher“ verändert die nachhaltige Mastery nicht; deren mehrtägige Abstandsregeln bleiben unverändert
- Sicherheitsstatus, Nachrückwörter und Evidenz liegen im bestehenden Tagesplan und werden deshalb mit dem Profilfortschritt über Family Sync synchronisiert
- Lernlogik-Smokes prüfen Sicherheitskriterien, Fehler-Reset, Priorität, Nah-Test-Schutz, Limits und unverändertes Tagesziel; der Family-Sync-Browsertest prüft den Zustand geräteübergreifend

## v0.21.7 – Testfortschritt & Battle-Fokus

- Startscreen zeigt im Profil-/Avatarbereich den aktiven Profilnamen statt der generischen Bezeichnung „Avatar“
- geplanter nächster Test zeigt testbezogen **Prozentwert plus absoluten Stand**, z. B. „68 % · 21 von 31 Vokabeln sicher“
- die Kennzahl verwendet die bestehende fachliche Testbereitschaft des konkreten Testumfangs, nicht den allgemeinen Jahresfortschritt
- iPhone-Battle zeigt in der Normalansicht nur noch Armeestärke sowie Rang/Ausrüstung als Bild-Overlays; Testziel und Verteidigung werden nicht doppelt oben eingeblendet
- Verteidigungswert steht direkt im Festungs-Badge unter dem Schadensstatus
- bisheriger Browser-„Vollbild“-Schalter wird zum zuverlässigen **Fokusmodus** ohne Fullscreen-API
- Fokusmodus zeigt nur die Querformat-Kampagnenszene, Festungsstatus/Verteidigung, „Fokus schließen“ und „Angriff wählen“
- Story, KPI-HUD, Bottom-Navigation, Angriffskarten und sonstige Bedienflächen verschwinden im Fokusmodus
- keine Änderung an Lernbewertung, Mastery, Testbereitschaftslogik oder Battle-Berechnung

## v0.21.6 – Campaign Target Design

- Englisch-Kampagne nutzt in Armeeübersicht und Schlacht dieselbe zusammenhängende Kampagnenszene
- aufgesetzte CSS-Armee und CSS-Festung werden bei geladener Illustration vollständig ausgeblendet
- Battle-Screen folgt dem freigegebenen Target-Design: Kapitelkarte, 2×2-KPI-HUD über der Szene, Festungsstatus im Bild, große visuelle Angriffskarten
- gemalte Battle-Illustration ist wieder voll sichtbar statt nur schwache Hintergrundtextur
- Angriffsarten nutzen große Bildflächen aus der Kampagnenillustration statt kleiner textlastiger Buttons
- Visual-DNA verbietet künftig Hintergrundbild + separat aufgesetzte CSS-Festung/Armee
- keine Änderung an Lernbewertung, Mastery, Testplanung oder Battle-Berechnung

## v0.21.5 – Battle Result Accessibility

- Ergebnis-Overlay besitzt einen expliziten `aria-hidden`-Zustand
- sichtbares Battle-Ergebnis wird für assistive Technologien freigegeben, geschlossenes Ergebnis sofort wieder verborgen
- Battle-Smokes prüfen sichtbaren und verborgenen Accessibility-Zustand
- keine Änderung an Battle-Berechnung, Belohnungen oder Lernlogik

## v0.21.4 – Army Command Visual Reset

- mobile Kampagnenansicht neu komponiert: 3-Schritt-Loop bleibt horizontal statt drei große dunkle Blöcke zu stapeln
- vorhandenes Kampagnen-Artwork wird wieder deutlich sichtbar statt stark abgedunkelt
- alte graue Mini-CSS-Festung wird durch die detaillierte Festungssilhouette ersetzt
- Missionspanel wird als helle, integrierte Ebene über die Szene gelegt
- eigentlicher Battle-Screen lädt wieder die vorhandene dedizierte gemalte Battle-Art; die primitive CSS-Armee/-Festung dient nur noch als technischer Fallback
- Battle-Kennzahlen liegen nicht mehr als vier dunkle Blöcke über der Illustration; Angriffsarten und Hauptaktion werden heller und ruhiger integriert
- Storytexte verwenden natürliche Sätze statt technischer Planertexte wie „31 ausgewählt am 28.09.“
- Vorlesen nutzt bessere deutsche Voice-Auswahl, neutralere Tonhöhe und Satzpausen; die UI nennt es bewusst „Geschichte hören“ statt einen dramatischen Sprecher zu versprechen
- aktive Armee-Navigation verwendet die Campaign-Farbwelt statt des globalen Violetts
- Lern-, Test-, Mastery-, Ticket- und Battle-Berechnungslogik bleiben unverändert

## v0.21.3 – Input-Integrity: keine Systemvorschläge

- alle bewerteten Antwortfelder deaktivieren Browser-Autovervollständigung, Autokorrektur, Rechtschreibprüfung und Schreibvorschläge
- Safari 18+ nutzt zusätzlich `writingsuggestions="false"`
- auf älteren iOS-/iPadOS-WebKit-Versionen, die QuickType nicht zuverlässig abschalten können, wird **nur im Testcheck** eine eigene Bildschirmtastatur verwendet
- die sichere Testcheck-Tastatur blockiert Paste/Drop, unterstützt physische Tastaturen und enthält Buchstaben, deutsche Sonderzeichen und relevante Satzzeichen; normales Lernen behält die native Tastatur
- bestehende Lern- und Bewertungslogik bleibt unverändert; geändert wird nur die Eingabequelle

## v0.21.2 – P0: tolerante Satzbewertung

- Platzhaltervarianten `...`, `…`, `___` und `[ ]` werden in Satzantworten fachlich gleich behandelt
- Abstände rund um Platzhalter und Satzzeichen erzeugen keinen Lernfehler
- englische Kontraktions-Tokenisierung wie `What 's` / `What's` und `do n't` / `don't` wird normalisiert
- Platzhaltersätze werden über feste sprachliche Anker bewertet; fehlende oder veränderte Anker bleiben falsch
- intern wird zwischen exakt richtig, richtig nach Normalisierung und wirklich falsch unterschieden
- beide richtigen Fälle zählen für Kinder als richtig und erzeugen keinen falschen Orthografie-/Lernfehler

## v0.21.1 – Visual DNA: eigenständige Fachwelten

- verbindliche `VISUAL_DNA.md` für Bildsprache, Lern-/Spieltrennung und Fachidentitäten
- Start/Heute erhält ruhige fachabhängige Akzente für Englisch, Latein und vorbereitet Französisch
- Fortschrittskarte trennt Kampagnenpfad, römische Marschroute und vorbereitete Sprachreise statt einer einheitlichen Kriegsmetapher
- Latein erhält im Test-/Spielbereich Legion, Kastelle, SPQR-Identität, römische Texte und eigene Ergebnisdarstellung
- Französisch bleibt fachlich deaktiviert, die Reise-/Etappen-Präsentation ist jedoch vorbereitet
- Shell-Version wurde erhöht, damit installierte PWAs die neuen CSS-/JS-Dateien zuverlässig übernehmen

## v0.21.0 – Spielbereich: Kommandoszene & sichtbarer Game Loop

- **Lernen → Angreifen → Erobern** ist als klarer 3-Schritt-Spielablauf direkt im Armeebereich sichtbar
- der Armeebereich verwendet eine dunkle 2D-Kommandoszene mit eigener Armee links und gegnerischem Ziel rechts
- der aktuelle Auftrag zeigt konkrete Testfestung, Termin, Festungsstatus und verfügbare Tagesaktion
- die Hauptaktion ist bewusst dominant: Festung ansehen bzw. Angriff starten
- Rang, Stärke, Ausrüstung und verfügbare Aktion werden als kompaktes HUD angezeigt
- die Feldzugskarte ist jetzt eine Frontlinienkarte mit eroberten Zielen, aktivem Ziel und **Nebel des Krieges** für noch unbekannte zukünftige Tests
- die Zahl der Tests bleibt vollständig dynamisch; neue Testtermine verlängern den Feldzug weiterhin automatisch
- automatisierte WebKit-Tests prüfen den Zustandswechsel vom abgeschlossenen Tagesziel zur verfügbaren Angriffsaktion sowie die neue Frontlinienkarte
- Product DNA schreibt die Trennung **Heute · Lernen · Armee · Erfolge** und den sichtbaren Game Loop verbindlich fest
- Lernlogik, Sollantworten, Mastery, Leitner, Spacing, Testbereitschaft und bestehende Battle-Ticket-Regeln bleiben unverändert

## v0.20.0 – Kinderoberfläche: Lernen und Spiel getrennt

- die Kinderoberfläche hat vier feste Hauptbereiche: **Heute · Lernen · Armee · Erfolge**
- **Heute** ist bewusst lernzentriert: Lernavatar, aktives Fach, heutige Aufgabe und der primäre Button „Jetzt lernen“; Armee, Festung, Feldzug, Karteikasten und Erfolge konkurrieren dort nicht mehr um Aufmerksamkeit
- **Lernen** bündelt Karteikarten, unsichere Wörter, kompletten Lernstoff, Spezialtraining, Karteikasten und Testcheck
- **Armee** ist der eigenständige Spielbereich für Armeeentwicklung, Feldzug, Festung/Schlacht und Freundschaftsduell
- **Erfolge** zeigt den fachlichen Fortschritt ohne Kampagnen- oder Karteikastenoberfläche
- Feldzug und Schlacht bleiben navigativ im Spielbereich; der Armee-Tab bleibt auch in Spiel-Unteransichten als Hauptbereich aktiv
- der Start wurde visuell beruhigt; die bisherige Landschaft/Festung als Startkulisse entfällt, der Avatar bleibt als motivierendes Element erhalten
- automatisierte WebKit-Tests prüfen die neuen Klickwege, responsive Darstellung, Karteikasten im Lernbereich und die Spiel-Rückwege
- Lernlogik, Frage-/Sollantwort-Zuordnung, Mastery, Leitner, Spacing und Bewertungsregeln bleiben unverändert

## v0.19.16 – iOS-Home-Screen-Handoff

- nach erfolgreichem Kopieren eines Kinder-/Eltern-Verbindungslinks schließt der iOS-Safari-Hinweisdialog automatisch
- das einmalige Invite-Fragment wird anschließend aus der Safari-URL entfernt, damit der Home-Bildschirm-Eintrag auf der neutralen App-URL basiert
- schlägt das Kopieren fehl, bleibt der Dialog offen und der Link wird nicht verworfen
- ein eigener WebKit-iPhone-Regressionsfall prüft genau diesen Ablauf
- Lernlogik, Sollantworten, Mastery, Leitner, Spacing, XP- und Kampflogik bleiben unverändert

## v0.19.15 – Abschließendes Deep-Audit-Hardening

- Familienwechsel und Invite-Übernahmen committen den neuen lokalen Familienstand erst nach vollständigem Laden, Härtung und erfolgreicher Persistierung; Fehler stellen alten Datenstand und alte Verbindung wieder her
- auch direkte QR-/Link-Beitritte bieten vor möglicher lokaler Datenübernahme ausdrücklich ein Backup an
- fehlgeschlagene Remote-Persistierung rollt nicht nur Daten, sondern auch die zugehörigen Sync-Snapshots im Arbeitsspeicher zurück
- Profil-Setup synchronisiert nun auch Avatarstil und automatische Aussprachekorrektur
- Profil-Löschung und vollständiger App-Reset sind bei aktivem Family-Sync gesperrt, solange das Sync-Protokoll noch keine eindeutigen Profil-Tombstones übertragen kann
- Backup-Restore im Family-Sync darf keine bestehenden Familienprofile implizit entfernen; ein zulässiger Restore wird vollständig zur Synchronisierung vorgemerkt
- Remote-Dokumente werden vor dauerhafter Übernahme erneut durch die zentrale State-Härtung geführt
- ein altes HTML-Markup-Artefakt zwischen den Battle-Stylesheets wurde bereinigt
- Lernlogik, Sollantworten, Mastery, Leitner, Spacing, XP- und Kampflogik bleiben unverändert

## v0.19.14 – Family-Sync-Härtung

- Konflikte zwischen lokalem und Cloud-Stand werden nicht mehr still überschrieben: Eltern wählen ausdrücklich „Cloud übernehmen“ oder „Dieses Gerät behalten“
- beim Wechsel in einen anderen Familienverbund bleibt die bisherige Verbindung erhalten, bis der neue Verbund erfolgreich verbunden wurde
- vor einer Datenübernahme kann ein lokales Backup erstellt werden
- serverseitig widerrufene Geräte stoppen die Synchronisation und verwerfen ihre lokalen Geräte-Zugangsdaten
- WebKit-End-to-End-Tests decken Konfliktauflösung und Revocation-Pfade ab
- die Supabase-Migration `20260925205453_harden_vt_device_context_boundary` entzieht Browserrollen den direkten Zugriff auf den internen `vt_device_context`; die öffentliche RPC-Grenze bleibt funktionsfähig
- Lernlogik, Mastery, Spacing und Bewertungsregeln bleiben unverändert

## v0.19.13 – OCR-/Pair-Review-Härtung

- Foto-/OCR-Importe bleiben dauerhaft an eine gültige Paarfreigabe gebunden; die Sicherheit hängt nicht mehr nur an einer einmaligen Migrationsmarke
- ein OCR-Lernset ist nur lernbereit, wenn Freigabezeitpunkt und aktuelle Paar-Signatur vorhanden und konsistent sind
- ein explizit übergebener Verifikationszeitpunkt kann eine offene oder veraltete Paarprüfung nicht mehr beim Publizieren in die Lehrwerksbibliothek umgehen
- neuer Fotoimport und erneutes Einlesen löschen alte Freigabesignaturen ausdrücklich
- nachträgliche fachliche Änderungen an Wort oder Bedeutung öffnen die Paarprüfung wieder und sperren den Kind-Lernpfad bis zur erneuten Bestätigung
- Restore/Migration quarantänisiert auch bei aktuellen Datenständen fehlende oder inhaltlich veraltete OCR-Freigaben
- Regressionstests decken direkte Aufrufe und die Verwendung von `setNeedsPairReview` als Array-Callback ab
- der WebKit-End-to-End-Test prüft zusätzlich die reale Bearbeitung nach Freigabe bis zurück in den gesperrten Kindmodus
- Lernlogik, Mastery, Spacing und Bewertungsregeln bleiben unverändert

## v0.19.12 – Accessibility und Tastatur-Kernpfad

- Dialoge erhalten explizite Modal-Semantik und eine programmatisch verknüpfte Überschrift
- beim Öffnen wandert der Fokus reproduzierbar auf die Dialogüberschrift; Schließen und Escape geben ihn an den ursprünglichen Auslöser zurück
- der Tastaturfokus wird im Browser-Test sichtbar geprüft, ebenso der aktuelle Navigationszustand über `aria-current`
- der reine Icon-Button zum Löschen eines Profils besitzt einen spezifischen zugänglichen Namen und mindestens 44 × 44 CSS-Pixel Touchfläche
- auch das Schließen des Hilfepopovers erfüllt nun 44 × 44 CSS-Pixel
- der Eltern-Rückweg und Dialoge werden zusätzlich in kompakter Landscape-Ansicht auf Sichtbarkeit und horizontalen Overflow geprüft
- der neue WebKit-Accessibility-Smoke ist verbindlicher Bestandteil von `browser-core`
- Lernlogik, Mastery, Spacing, XP und fachliche Bewertung bleiben unverändert

## v0.19.11 – Backup/Restore als Release-Gate

- Backup-Export wird im WebKit-Browsertest mit echtem JSON-Inhalt, Dateinamen und Versionsmetadaten geprüft
- Restore wird Ende-zu-Ende mit Profil, Lernset, Testplanung, Lernfortschritt und Notenhistorie getestet
- der Test verifiziert nach dem Restore zusätzlich den tatsächlich persistent gespeicherten Zustand
- manipulierte/ungültige Backups werden abgewiesen, das 25-MB-Größenlimit wird geprüft und fehlgeschlagene Persistierung muss sauber auf den bisherigen Stand zurückrollen
- der Test läuft verbindlich im `browser-data-security`-Gate
- die praktische Restore-Abnahme auf einem separaten realen Browserprofil bleibt vor v1.0 weiterhin erforderlich
- keine Änderung an Lernlogik, Mastery, Spacing oder fachlicher Bewertung

## v0.19.10 – Battle-Stabilität und deterministische CI

- laufende Battle-Sequenzen besitzen eine Generation; alte Timer werden beim Neustart oder Verlassen verworfen und können keinen neuen UI-Zustand mehr überschreiben
- das Ergebnis-Overlay wird zusätzlich über ein explizites Battle-Result-Ereignis angesteuert; der DOM-Observer bleibt nur als robuste Rückfallebene bestehen
- die Battle-CI ist in unabhängige Szenarien für Navigation/Reveal, Visuals, Angriff/Ergebnis/Sicherung und Duell aufgeteilt
- jedes Battle-Szenario startet mit frischem Browserzustand und die gesamte Battle-Suite läuft im CI dreimal hintereinander
- CI-Fehler liefern strukturierte Battle-Diagnosen statt bloßer Timeout-Meldungen
- der veraltete, divergierte PR #95 wurde geschlossen
- Lernlogik, Mastery, Spacing, XP-Regeln und fachliche Bewertung bleiben unverändert

## v0.19.9 – Stabile Schlachtergebnisse

- ein echtes Race Condition beim schnellen Schließen und erneuten Öffnen der Schlachtergebnis-Ansicht ist behoben: ein alter Hide-Timer kann kein bereits neu geöffnetes Ergebnis mehr unsichtbar machen
- die Ergebnisansicht räumt ausstehende Sichtbarkeits-Frames und Hide-Timer beim Zustandswechsel sauber auf
- der Battle-Browsertest prüft dieselben fachlichen Zustände jetzt deterministisch und toleriert interne Re-Renders der Bühne
- keine Änderung an Mastery, XP, Testplanung, Kampfschaden oder Lernbewertung

## v0.19.8 – Einheitliche Armee im Fortschritt

- die Kampagnenvorschau im Kindbereich **Fortschritt / Erfolge** verwendet in Englisch jetzt dieselbe hochwertige lokale Armee-Illustration wie **Meine Armee**
- der bisherige stilistische Bruch zwischen alter CSS-Soldatenreihe und neuer Armeeansicht entfällt
- Testfestung und ihr Zustand bleiben als bestehende Overlay-Darstellung erhalten
- sobald das lokale Armee-Asset geladen ist, aktualisiert sich die Vorschau automatisch; bei fehlendem Asset bleibt der bisherige CSS-Fallback verfügbar
- Latein behält bewusst die neutrale Fallbackdarstellung, bis eine eigene Legion-Grafikserie vorliegt
- reine Darstellungsänderung ohne Einfluss auf Mastery, XP, Tagesplanung, Testfestung oder Kampfergebnis

## v0.19.7 – Vier klare Kind-Navigationen

- die untere Kind-Navigation besteht fachlich aus **Heute · Üben · Fortschritt · Armee** und verwendet jetzt auch technisch exakt vier gleich breite Spalten
- die alte fünfte, leere Rasterspalte ist entfernt; dadurch sind die vier Ziele auf kleinen iPhones gleichmäßiger verteilt und leichter zu treffen
- der Project-Menu-Browsertest schützt die Vier-Spalten-Struktur gegen Regressionen
- reine Layoutkorrektur ohne Änderung von Navigation, Lernlogik, Mastery, XP oder Kampagne

## v0.19.6 – Konsistente Rücknavigation im Kindbereich

- **Fortschritt**, **Karteikasten** und **Erfolge** besitzen jetzt einen jederzeit sichtbaren Rückweg **← Menü**
- der Rückweg bleibt beim Scrollen im Fortschrittsbereich sichtbar und vermeidet den früheren Sackgassen-Eindruck nach einem Sprung aus dem Project Menu
- Armee, Feldzug und Schlacht behalten ihre bereits kontextbezogenen Rückwege; damit folgt die gesamte Kinderwelt derselben Navigationslogik
- die Änderung ist ausschließlich Navigation/UI und verändert weder Mastery, Leitner, XP, Tagesplanung noch Kampflogik
- der Project-Menu-Browsertest prüft den neuen Rückweg explizit

## v0.19.5 – Avatarwahl pro Lernprofil

- jedes Lernprofil besitzt eine eigene **Avatarwahl: männlich oder weiblich**
- die Auswahl ist eine reine Darstellungspräferenz und wird bewusst nicht als Geschlechtsangabe des Kindes verwendet
- bestehende Profile bleiben für Rückwärtskompatibilität auf der bisherigen männlichen Avatarserie
- Avatarstil und fachlicher Fortschritt sind strikt getrennt; ein Wechsel verändert weder Mastery, XP, Scheduler noch Kampflogik
- die Asset-Auflösung ist jetzt nach Fach, Avatarstil und Entwicklungsstufe getrennt, z. B. `english-male-stage-3` und `english-female-stage-3`
- die weibliche Grafikserie kann dadurch separat ergänzt werden, ohne Profil- oder Lernlogik erneut umzubauen

## v0.19.4 – Full-Body Avatarserie Englisch

- die sechs Englisch-Stufen verwenden jetzt die neu erstellte **Ganzkörper-Serie** derselben Figur statt der bisherigen Ausschnittbilder
- die Entwicklung bleibt klar lesbar: leichte Grundausrüstung → Schulterpanzer → verstärkte Ausrüstung → Ritterrüstung → Elite → voll ausgerüsteter Endstand
- die Assets sind als kompakte WebP-Ressourcen eingebunden und werden weiterhin lokal/offline rekonstruiert
- das Menü zeigt den Avatar als große Figur innerhalb der Landschaft; die Bildfläche wird nicht mehr als gerahmte Thumbnail-Karte behandelt
- die Stufenauswahl bleibt ausschließlich an den fachlichen Mastery-Fortschritt gekoppelt und verändert keine Lern- oder Kampfdaten
- der Browser-Test prüft zusätzlich, dass das geladene Englisch-Asset tatsächlich ein Ganzkörper-Portraitformat besitzt

## v0.19.3 – Englische Avatar-Grafiken

- die sechs technischen Avatarstufen besitzen jetzt **sechs echte, voneinander unterscheidbare Englisch-Grafiken** statt nur Skalierung und CSS-Aufwertung derselben Figur
- die Grafiken bleiben derselben Figur und demselben Stil treu; Ausrüstung, Präsenz und Rangwirkung wachsen sichtbar von Stufe 1 bis Stufe 6
- jede Grafik liegt offline im App-Shell und wird lokal aus kompakten WebP-Base64-Ressourcen rekonstruiert
- die Darstellung wird weiterhin ausschließlich aus dem bestehenden Mastery-Fortschritt abgeleitet; die Bilder speichern und verändern keinen Lernwert
- Latein verwendet bis zur eigenen Grafikserie bewusst weiterhin den vorhandenen Fallback und bleibt technisch unabhängig vorbereitet
- der Project-Menu-Browsertest prüft, dass die richtige Englisch-Grafik zur berechneten Stufe geladen wird und Latein nicht versehentlich Englisch-Artwork übernimmt

## v0.19.2 – Mitwachsender Avatar

- der Menü-Avatar besitzt **sechs klar definierte Entwicklungsstufen** bei 0 · 18 · 36 · 54 · 72 · 90 % nachhaltigem Schuljahresfortschritt
- die Stufe wird ausschließlich aus dem bestehenden fachlichen Mastery-Fortschritt gelesen; Avatar, Menü und Fachwechsel schreiben keinerlei Lernfortschritt zurück
- jede Stufe hat einen stabilen technischen Artwork-Schlüssel (z. B. `english-stage-3` bzw. `latin-stage-3`), damit die finalen Grafiken später ohne erneuten Logik- oder Layoutumbau eingesetzt werden können
- bis zu den finalen Einzelgrafiken wächst die vorhandene Illustration sichtbar über Größe, Standarte, Rangabzeichen und Elite-Aura mit
- die aktuelle Avatarstufe und der nächste Entwicklungspunkt werden im Menü angezeigt; bei Stufe 6 ist die Entwicklung als maximal markiert
- Browser-Tests schützen alle Stufengrenzen sowie die Trennung zwischen visueller Entwicklung und fachlicher Mastery

## v0.19.1 – Project Menu 1.0

- die Kinder-Startseite ist als eigener 16:9-Spiel-/Lern-Hub aufgebaut; der fachliche Einstieg **„Jetzt lernen“** bleibt die dominante Aktion
- ein eigener Avatarbereich nutzt zunächst die vorhandene Armee-Illustration als austauschbares Platzhalter-Asset; spätere Avatarstufen benötigen dadurch keinen erneuten Layoutumbau
- das Banner zeigt ausschließlich vorhandene Fachwerte: nachhaltig gemeisterte Vokabeln und tatsächlich eroberte Testfestungen
- vier direkte Menüwege verbinden **Meine Armee · Feldzug · Karteikasten · Erfolge** mit den bestehenden Ansichten
- Fachwechsel ist direkt im Menü möglich; Armee und Feldzug führen über „← Menü“ wieder zum Hub zurück
- das neue Menü verändert weder Mastery, Spacing, Tagesplanung noch Kampfrechnung

## v0.19.0 – Lernkern konsolidiert

- **„Jetzt lernen“** ist der eindeutige primäre Einstieg in den automatisch berechneten Tagesplan; nach einem begonnenen Tagesziel wird daraus „Weiterlernen“
- die bereits eingeführte evidenzbasierte Trennung bleibt verbindlich: produktiver Abruf bestimmt Mastery, während Erkennen, Hören und Wortbausteine nur unterstützen
- falsche bzw. orthografisch ungenaue Antworten bieten die richtige Fremdsprachenform direkt nach der Bewertung als Audio an; automatisches Vorlesen bleibt lösungssicher und abschaltbar
- der adaptive Scheduler priorisiert fällige, schwache und testrelevante Wörter, begrenzt neue Wörter und führt nach unterstützenden Aufgaben wieder zu produktivem Abruf
- der Kind-Pfad bleibt auf **Heute · Üben · Fortschritt · Armee** reduziert; „Üben“ behält vier Hauptwege und bündelt weitere Hilfen unter Spezialtraining
- CI schützt diese Lernkern-Regeln jetzt zusätzlich als v0.19-Abnahmekriterien

## v0.18.60 – Release-Reliability

- die CI ist in unabhängige Gates für Preflight, Core-UI, Daten/Sicherheit und Gameplay aufgeteilt; mehrere Fehler werden dadurch parallel sichtbar statt erst nacheinander
- Draft-PRs führen nur den schnellen Preflight aus; die vollständigen Browser-Gates starten erst bei Ready-for-Review
- ein zentraler `test`-Aggregator bleibt der verpflichtende Branch-Protection-Check
- die App signalisiert nach vollständig abgeschlossener lokaler Initialisierung deterministisch `vt-app-ready`; flakige Reload-Tests warten auf diesen Zustand
- GitHub Pages prüft nach dem Deployment die tatsächlich ausgelieferte Version in `index.html`, `js/core.js` und `sw.js`
- die produktiven Parent-Invite-Migrationen sind mit ihren echten Supabase-Versionen im Repository nachvollziehbar
- Erzeugen und Einlösen von Parent-Invites ist zusätzlich im produktiven Supabase-Pre-Request-Rate-Limit enthalten

## v0.18.59 – QR-Verbindungen

- Kindergeräte erhalten nach Auswahl des Profils direkt einen lokal erzeugten QR-Code; Teilen und Kopieren bleiben als Fallback erhalten
- weitere Eltern-Geräte können über einen eigenen einmaligen 15-Minuten-QR-Code beitreten, ohne die wiederverwendbare Familien-PIN im QR-Code offenzulegen
- der Parent-Invite wird serverseitig nur gehasht gespeichert, ist einmal verwendbar und lädt nach erfolgreicher Annahme den bestehenden Familienstand
- Freundschaftsduelle zeigen den QR-Code als primären Austauschweg; Link und Rohcode bleiben als Fallback verfügbar
- QR-Erzeugung läuft vollständig lokal in der App und wird offline mit ausgeliefert
- iOS-15-Safari verbraucht Geräte-Invites weiterhin nicht vorzeitig, damit die Home-Screen-Web-App korrekt eingerichtet werden kann

## v0.18.54 – Festungs-Reveal

- eine neu geplante Testfestung wird beim ersten Öffnen der Schlacht einmalig als neues Ziel inszeniert
- der Reveal zeigt Festungsname, Typ, Testdatum, Vokabelumfang und eingeplante Lerntage
- derselbe Test wird nicht erneut inszeniert; der Zeitpunkt wird direkt an der bestehenden Testfestung gespeichert
- reduzierte Bewegung wird respektiert und zeigt denselben Inhalt ohne Animation
- Lernlogik, Tagesangriff, Schaden, XP und Mastery bleiben unverändert

## v0.18.52 – Unterschiedliche Festungsstufen

- Vorposten, Wachturm, Grenzmauer, Bergzitadelle, Hauptfestung und Jahresfestung haben jetzt deutlich unterschiedliche Silhouetten und Größen
- die vorhandenen Kampagnen-IDs werden rein visuell stärker genutzt; Lernlogik und Kampfrechnung bleiben unverändert
- spätere Festungen wirken größer, massiver und atmosphärisch bedrohlicher
- die Jahresfestung erhält eine eigene monumentale Stein-/Metalloptik statt nur eine skalierte Standardburg
- die neue Progressionsdarstellung liegt technisch in `css/battle-fortress.css` statt weiterer Battle-Sonderregeln in `app.css`
- iPhone-Abstufungen wurden separat optimiert

## v0.18.49 – Hero Base Scene: Schlachtgrafik neu aufgebaut

- die Schlachtfläche wurde als **einheitliche Fantasy-Bühne** neu aufgebaut: Himmel, Berge, Gelände, Angriffsweg, Armee und Festung folgen jetzt derselben stilisierten Bildsprache
- das bisher dominante realistische Battle-Artwork bleibt nur noch als sehr dezente Textur im Hintergrund; die neue illustrative Szene trägt die eigentliche Komposition
- die Armee steht jetzt in einer **gestaffelten Formation** mit Tiefenwirkung statt als flache Reihe einzelner Figuren
- Festungsmauer, Türme, Tor und Keep erhalten Material, Licht, Schatten, Fenster, Steinstruktur und klarere Silhouette
- die Leserichtung ist bewusst **Armee links → Angriffsraum in der Mitte → Festung rechts**
- Phasenleiste, Rangplakette und Festungsstatus wurden deutlich verkleinert und in eine leichte HUD-Ebene überführt
- die Hauptaktion **Tagesziel/Angriff** liegt im normalen Modus jetzt unterhalb der Illustration und verdeckt die Schlachtszene nicht mehr
- auf dem iPhone nutzt die Szene eine kompaktere 4:3-Bühne; Formation, Festung und CTA passen sich responsiv an
- bestehende Angriffsanimationen und Kampfrechnung bleiben unverändert; die Änderung ist rein präsentational

## v0.18.48 – Angriffsgrafik 1.1: alle Angriffe eigenständig

- **Pfeilhagel** bekommt eine eigene mehrwellige Pfeilsequenz mit verdunkeltem Himmel und höherem Einschlag an Mauer/Zinnen
- **Reiterangriff** läuft sichtbar über die Flanke, mit eigener Staubspur, schneller seitlicher Bewegung und Flanken-Treffer
- **Spezialangriff** ist jetzt der deutlich spektakulärste Angriff: Elite-Aura, konzentrische Ringe, Stern-/Adlereffekt, stärkster Lichtimpuls und größter Impact
- jeder Angriff zeigt einen eigenen Treffer-Callout: **PFEILHAGEL!**, **FLANKENTREFFER!**, **ELITESCHLAG!** bzw. in Latein **ADLERSCHLAG!**
- Kamera- und Lichtführung unterscheiden sich zusätzlich pro Angriffstyp, ohne irgendeine Kampfrechnung zu verändern
- Reduced Motion blendet alle neuen Bewegungs-Layer aus; Schaden, Taktikanteil und Endzustand bleiben vollständig sichtbar
- damit besitzen Sturm, Pfeilhagel, Rammbock, Reiter und Spezialangriff nun jeweils eine sofort erkennbare visuelle Identität

## v0.18.47 – Angriffsgrafik 1.0

- **Sturmangriff** und **Rammbock** besitzen jetzt klar unterscheidbare, kindgerechte Angriffsbilder statt nur derselben Grundanimation
- der Sturmangriff zeigt sichtbare Vorwärtsdynamik der Front mit Bewegungslinien und einem stärkeren finalen Vorstoß
- der Rammbock erhält eine eigene schwere Anfahrt, Bodenspur, Torfokus und einen deutlich sichtbaren Tor-Einschlag
- beim Einschlag erscheint ein kurzer visueller Callout mit **echtem Gesamtschaden** und dem bereits berechneten kleinen Taktikanteil
- der sichtbare Festungszustand wird zusätzlich als **Intakt → Beschädigt → Stark beschädigt → Kurz vor dem Fall → Erobert** angezeigt
- dieser Zustand wird ausschließlich aus `defense/maxDefense` bzw. `capturedAt` abgeleitet; es entsteht kein zweiter Spielstand
- die normale Kampfsequenz wurde kompakter getaktet, damit Angriff und Treffer unmittelbarer wirken
- Reduced Motion entfernt die neuen Bewegungs-/Spureffekte, zeigt aber weiterhin Trefferwert und Endzustand
- Mastery, Leitner, Spacing, Testbereitschaft und fachliche Bewertung bleiben unverändert

## v0.18.46 – dynamische Feldzugskarte 1.0

- der Kinderbereich besitzt jetzt eine eigene **Feldzugskarte** als übergeordnete Kampagnenübersicht
- die Karte setzt ausdrücklich **keine feste Zahl von Tests** voraus: neue geplante Tests werden automatisch als neue Stationen entlang der Route ergänzt
- bekannte Testtermine, bereits erzeugte Testfestungen und eingetragene Schulnoten werden zu einer gemeinsamen chronologischen Route zusammengeführt
- bereits absolvierte Stationen bleiben vor später neu geplanten Tests in ihrer Reihenfolge stabil; zusätzliche zukünftige Ziele verlängern nur den Weg
- der noch unbekannte Teil des Schuljahres bleibt als **„Unbekanntes Land“** sichtbar und erklärt, dass weitere Testziele später erscheinen
- die **Jahresfestung** bleibt als festes Fernziel bestehen, steht aber für den langfristigen Schuljahresfortschritt und nicht für den „letzten“ oder eine vorab gezählte Anzahl von Tests
- Stationen unterscheiden Ziel entdeckt, aktuelles Testziel, erobert, gesichert, Ergebnis offen und Test abgeschlossen; eingetragene Noten erscheinen als Abschlussmarke
- vier datumsabhängige Landschaftsregionen strukturieren die Reise: Herbstmark, Winterwald, Frühlingslande und Sommerhöhe
- die aktive Station führt direkt zur bestehenden Schlacht; alle Kartendaten werden aus bereits vorhandenem Test-, Festungs-, Noten- und Lernstand abgeleitet
- die Feldzugskarte ist offline Teil des App-Shells und verändert weder Mastery, Leitner, Spacing noch fachliche Bewertung

## v0.18.45 – interaktives Heerlager

- „Meine Armee“ besitzt jetzt zusätzlich eine **räumliche Aufstellung im Heerlager**
- alle sechs Einheiten stehen entsprechend ihrer Aufgabe: Schutz und Infanterie vorne, Belagerung in der Mitte, Fernkampf und Versorgung hinten, Kavallerie an der Flanke
- die Aufstellung verwendet dieselben lokalen Einheitenillustrationen, Stufen und Rollen wie die Einheitenkarten
- jede Einheit im Heerlager ist direkt anklickbar und öffnet dieselbe Detail-/Aufwertungsansicht
- auf kleinen Displays wird die räumliche Formation automatisch in eine übersichtliche Liste umgebaut; kein horizontaler Überlauf
- das Heerlager ist rein präsentational und verändert keinerlei Lern-, Mastery- oder Kampfwerte

## v0.18.44 – Einheitenrollen wirken in der Schlacht

- Sturm, Pfeilhagel, Rammbock und Reiterangriff greifen jetzt auf die passende sichtbare **Einheitenrolle** zurück
- der vorhandene Rollenwert erzeugt einen bewusst kleinen **Taktikbonus von 0–10 Schaden**
- der garantierte Basisschaden und der bestehende Testbereitschaftsbonus bleiben erhalten; kein Angriff kann durch eine schwache Einheit „scheitern“
- der Spezialangriff verwendet den Durchschnitt der vier offensiven Rollen statt einer einzelnen Einheit
- Angriffsauswahl, Vorschau und Ergebnis zeigen den Taktikbonus transparent an
- Einheitenrollen und Schlacht nutzen dieselben zentralen Aufwertungsschwellen, damit Anzeige und Kampf nicht auseinanderlaufen
- Taktik verändert ausschließlich die Kampagnenrechnung; **Mastery, Leitner, Spacing, Testbereitschaft und fachliche Bewertung bleiben unverändert**

## v0.18.43 – sichtbare Einheitenentwicklung

- jede Einheit zeigt ihre **fünf Entwicklungsstufen** jetzt unmittelbar auf Karte und Detailansicht
- die allgemeinen Stufen heißen in Englisch **Rekrut → Ausgebildet → Erfahren → Elite → Veteran**; Latein nutzt passende Legionsbezeichnungen
- fünf sichtbare Stufenmarker zeigen auf einen Blick, wie weit eine Einheit entwickelt ist
- Rahmen, Bildwirkung und Hervorhebung verändern sich mit der Stufe; hohe Stufen sind dadurch auch ohne Lesen erkennbar
- die Detailansicht verbindet Stufenname, konkrete Ausrüstung und den bestehenden fünfstufigen Aufwertungspfad
- die Darstellung wird ausschließlich aus dem vorhandenen Einheitenlevel berechnet und speichert keinen zusätzlichen Fortschritt
- Mastery, Leitner, Spacing, Testbereitschaft und Schlachtschaden bleiben unverändert

## v0.18.42 – klare Einheitenrollen & Kampfstärken

- alle sechs Einheiten besitzen jetzt eine klar benannte Aufgabe: **Front, Fernkampf, Mobilität, Belagerung, Schutz und Versorgung**
- „Meine Armee“ zeigt einen eigenen Bereich **Kampfstärken** mit einem Wert von 0–100 je Rolle
- die Rollenwerte werden ausschließlich aus den bereits vorhandenen Einheitenstufen und deren Fortschritt abgeleitet; es entsteht kein zweiter fachlicher Lernstand
- jede Einheitenkarte zeigt ihre Rolle unmittelbar, die Detailansicht erklärt Aufgabe und aktuellen Rollenwert
- Klick auf eine Kampfstärke führt direkt zur zugehörigen Einheit und ihrem Aufwertungspfad
- die neuen Werte verändern in diesem Schritt weder Mastery noch Testbereitschaft noch den Schaden einer Schlacht; sie schaffen eine transparente Grundlage für spätere taktische Darstellung

## v0.18.41 – Testabschluss belohnt

- jede eingetragene reale Schulnote von **1 bis 6** dokumentiert einen absolvierten Vokabeltest und erzeugt ein **Prüfungsabzeichen**
- jeder eingetragene Test vergibt **50 Abschluss-XP**, unabhängig von der Note
- die Note beeinflusst nur einen kleinen Bonus von **0 bis 10 XP**; Note 6 erhält damit weiterhin die volle positive Abschlussbelohnung
- Noten mit Plus/Minus und Dezimalnoten wie **2+** oder **1,7** werden unterstützt
- dieselbe Noteneintragung kann XP nur einmal vergeben
- „Meine Armee“ zeigt die Zahl der Prüfungsabzeichen sichtbar in der Armeeübersicht
- Schulnoten verändern weiterhin **weder Mastery, Leitner-Boxen, Spacing noch die fachliche Bewertung**

## v0.18.40 – Elternanleitung & pädagogische Dokumentation

- im Elternbereich stehen **Anleitung für Eltern** und **Pädagogische Dokumentation** direkt zur Verfügung
- beide Dokumente sind in der App lesbar und offline in der App-Shell enthalten
- beide Dokumente können als echte PDF-Datei lokal exportiert werden
- In-App-Ansicht und PDF verwenden dieselben Markdown-Quelldokumente, damit Inhalte nicht auseinanderlaufen
- der PDF-Export arbeitet lokal im Browser ohne externen Dokumentendienst
- ein WebKit-Test prüft beide Dokumente und die erzeugten PDF-Dateien

## v0.18.39 – Deep-Audit-Härtung

- gekoppelte Kindergeräte können den lokalen Eltern-/Administrationsmodus nicht mehr öffnen
- der Schutz liegt zusätzlich zur serverseitigen Sync-Rolle direkt in der Oberfläche und Navigation
- Bibliotheks-Audio verwendet mindestens 44 × 44 CSS-Pixel große Touchziele
- die installierte PWA unterstützt Portrait und Landscape
- neuer WebKit-Deep-UI-Test prüft 320, 375, 390, 820 und 1440 px auf Overflow und Bediengrößen
- zusätzlicher DOM-Sicherheits-Smoke prüft dynamische Nutzereingaben in Profil, Lernset, OCR-Paarprüfung und Vokabelbearbeitung

## v0.18.38 – Audio als Grundfunktion

- Aussprache ist in Bibliothek, Ergebnisübersicht, Erstkontakt, Handschriftvergleich, sicheren Erkennungsaufgaben und Kontext verfügbar
- der fokussierte Lernmodus nutzt die Einstellung zum automatischen Vorlesen nach Fehlern
- Deutsch → Fremdsprache bleibt vor der Antwort ohne Zielwort-Audio; die Lösung wird nicht verraten
- Ergebnisübersichten behalten die Fremdsprachen-Vokabel als expliziten Audio-Anker

## v0.18.37 – klare Kinderbereiche

- Hauptnavigation: **Heute · Üben · Fortschritt · Armee**
- „Heute“ konzentriert sich auf eine dominante Tagesaktion
- „Üben“ bietet genau vier Einstiege: Karteikarten, Unsichere Wörter, Alle Vokabeln, Spezialtraining
- Hören, Rechtschreibung, Kontext, Handschrift, Abschreiben, Wortblitz, Vokabeldusche und Wortbausteine sind unter Spezialtraining gebündelt

## v0.18.36 – evidenzbasierter Lernkern

- Mastery basiert auf produktivem Abruf; Erkennen, Hören und Wortbausteine verändern Mastery, Leitner-Box und Spacing nicht
- Fehler werden mit späterem Wiederabruf statt unmittelbarer Massierung beantwortet
- Audio wurde lösungssicher in den Lernkern integriert
- eigener Evidence-Core-CI-Guard schützt diese Regeln

## v0.18.35 – transparente Ergebnisübersicht

- nach jeder bewerteten Lerneinheit bleibt eine vollständige Ergebnisübersicht sichtbar
- jede Abfrage zeigt **Frage**, **eigene Antwort**, **richtige/akzeptierte Antwort** und den konkreten Bewertungsstatus
- falsche bzw. orthografisch auffällige Antworten erhalten einen verständlichen Bewertungsgrund statt nur einer roten Markierung
- bei bewerteten Aufgaben wird zusätzlich **Box vorher → Box nachher** angezeigt
- Karteikarten- und normale schriftliche Abrufaufgaben verwenden dieselbe Ergebnislogik
- **„Fehler nochmal üben“** startet gezielt nur die in dieser Einheit fehlerhaften Vokabeln
- **„Alle nochmal üben“** wiederholt den gesamten in der Einheit vorkommenden Wortbestand ohne Duplikate
- beide Wiederholungsrunden sind freiwillige Zusatzübungen und können keine weitere Kampfaktion desselben Tages erzeugen
- die bestehende Bewertungslogik selbst bleibt unverändert; die neue Ansicht macht ihre Ergebnisse nur transparent
- der WebKit-Test prüft eigene Antwort, Sollantwort, Bewertungsgrund, Leitner-Box-Bewegung sowie gezielte Fehlerwiederholung

## v0.18.34 – sichtbare Festungseroberung

- beim tatsächlichen Sieg wird die Eroberung jetzt sichtbar ausgespielt: **Tor fällt**, **Gegnerflagge verschwindet**, **eigene Fahne wird gesetzt**
- der Ergebnisbildschirm erscheint erst nach dieser kurzen Eroberungssequenz, damit der Sieg sichtbar bleibt
- nach der Animation wechselt die Festung in den dauerhaften `captured`-Zustand
- beim späteren Öffnen wird dieser Zustand direkt aus `capturedAt` wiederhergestellt
- auch die kleine Kampagnenansicht zeigt die eigene Fahne auf der bereits eroberten Festung
- Englisch nutzt eine blau-goldene, Latein eine rot-goldene Fahne
- `prefers-reduced-motion` überspringt die Bewegung, zeigt aber sofort denselben finalen Eroberungszustand
- keine neue Spielmechanik: Siegbedingung, XP, Mastery, Angriffsschaden, Testfestungslogik, OCR und Sync bleiben unverändert
- der Battle-WebKit-Test prüft Animation, Reduced Motion und den persistenten Zustand nach erneutem Rendern

## v0.18.33 – dauerhafte Karteikasten-Übersicht

- **„Mein Fortschritt“** zeigt jetzt den aktuellen Karteikasten dauerhaft außerhalb einer laufenden Übung
- alle fünf Leitner-Stufen bleiben sichtbar: **Neu → Im Lernen → Bekannt → Sicher → Nachhaltig gemeistert**
- jede Box zeigt aktuelle Kartenanzahl und Anteil am gesamten Karteikasten
- zusätzlich werden die Gesamtzahl der Karten und die heute fälligen Karten angezeigt
- der Button **„Karteikarten üben“** startet unverändert den bestehenden schriftlichen Karteikartenmodus
- die Übersicht ist rein lesend und verwendet direkt `leitnerDistribution()`; sie verändert weder Boxen noch Mastery
- die Übersicht bleibt auch bei leeren Boxen vollständig sichtbar, damit der Lernweg verständlich bleibt
- der bestehende Karteikarten-WebKit-Test prüft die Fünf-Boxen-Übersicht, reale Verteilung, Fälligkeit und Nicht-Veränderung des Lernstands

## v0.18.32 – dauerhafte Festungsschäden

- der bereits gespeicherte Belagerungszustand aus `defense/maxDefense` wird jetzt deutlich sichtbar auf der Testfestung dargestellt
- **leicht beschädigt:** erste Risse und dezente Verdunkelung
- **mittel beschädigt:** zusätzliche Risse, sichtbares Geröll, Ruß/Abplatzungen und erster Rauch
- **schwer beschädigt:** alle Risse sichtbar, starkes Geröll, dunklere Mauer-/Torflächen und deutlich mehr Rauch
- die illustrierte Festungs-Layer wird parallel zur CSS-Festung sichtbar abgenutzt; der Schaden bleibt deshalb auch zwischen Lerntagen konsistent
- die kleine Kampagnenansicht übernimmt dieselbe Schadensstufe
- der exakte Schadenswert wird als `data-damage-percent` aus dem gespeicherten Verteidigungswert abgeleitet und nicht separat gespeichert
- der Battle-WebKit-Test prüft 25 %, 50 % und 80 % Schaden sowie Risse, Geröll, Rauch und die illustrierte Festung
- keine neue Spielmechanik: Mastery, XP, Angriffsschaden, Testfestungslogik, OCR und Sync bleiben unverändert

## v0.18.31 – stärkere Trefferwirkung

- der Einschlag erhält einen deutlich größeren, helleren Impact-Burst mit Funken- und Lichtkranz
- das Festungstor blitzt beim Treffer kurz auf
- Staub wird als größere, mehrstufige Wolke mit zwei zusätzlichen seitlichen Puffs aufgebaut
- die vorhandene Shockwave bekommt mehr räumliche Tiefe
- Projektilsalven erhalten stärkere Licht-/Glühwirkung, ohne ihre Fluglogik zu verändern
- alle Effekte nutzen ausschließlich vorhandene DOM-Elemente und CSS; keine neuen Assets und keine neue Spielmechanik
- `prefers-reduced-motion` deaktiviert sämtliche neuen Trefferanimationen vollständig
- der Battle-WebKit-Test prüft Impact, Torblitz, Staub, Shockwave sowie Reduced Motion
- Mastery, XP, OCR, Sync und Testfestungslogik bleiben unverändert

## v0.18.30 – Testfestungen & tägliche Belagerung

- **eine geplante Prüfung = eine Festung**; Termin und ausgewählter Vokabelumfang bestimmen das konkrete Kampagnenziel
- die Festungsverteidigung skaliert beim Entstehen mit dem Testabstand: 100 Basispunkte pro geplantem Angriffstag, maximal 14 Tage
- ein abgeschlossenes Tagesziel gibt genau **eine Kampfaktion pro Fach und Tag**; freiwilliges Üben erzeugt keine zusätzlichen Angriffe
- jeder Angriff verursacht garantierten Basisschaden; höhere Testbereitschaft liefert einen begrenzten Schadensbonus
- die Festung bleibt jederzeit anschaubar; nach dem Angriff ist nur die Tagesaktion verbraucht
- frühe Eroberung erzeugt keine neue Festung: bis zum Test folgen **Sicherungseinsätze** an derselben Festung
- Rang, Einheiten und Ausrüstung bleiben langfristige Schuljahresentwicklung und sind von der kurzfristigen Testbelagerung getrennt
- eingetragene Schulnoten können an der zugehörigen Testfestung angezeigt werden, verändern aber weder Eroberung noch Mastery
- die früheren festen Mastery-Schwellen sind keine Siegbedingung mehr; die sechs Festungen dienen nur noch als visuelle Größenstufen

## v0.18.29 – Freies Üben & Tages-Schlacht

- „Alle Vokabeln“ übt einen gewählten Bereich vollständig und mischt jeden Durchgang neu.
- „Unsichere üben“ bündelt noch nicht nachhaltig gemeisterte Wörter.
- Wortbausteine verwenden Lernblöcke; ganze Sätze werden davon ausgeschlossen.
- Die Schlacht wird nur durch das Tagesziel freigeschaltet, bleibt dann den Tag über offen und vergibt nur eine Tagesbelohnung.

## v0.18.28 – Parallax & Kamerafokus

- die vier Battle-Layer reagieren jetzt phasenabhängig auf die bestehende Kampfsequenz
- **Vorrücken:** Armee bewegt sich sichtbar nach vorn, der Hintergrund läuft leicht gegenläufig
- **Angriff:** dezenter Kamerazug zum Gefechtszentrum
- **Einschlag:** kurzer Fokus/Zoom auf die Festung ohne hektischen Screen-Shake
- **Ergebnis:** Kamera beruhigt sich wieder und gibt Übersicht
- keine neue Kampflogik und keine neuen Assets; nur Bewegung auf der bestehenden Layer-Architektur
- `prefers-reduced-motion` schaltet sämtliche neuen Transform-Bewegungen vollständig ab
- der Battle-WebKit-Test prüft sowohl phasenabhängige Bewegung als auch den reduzierten Bewegungsmodus
- Mastery, XP, OCR, Sync und Kampfergebnislogik bleiben unverändert

## v0.18.27 – echte Battle-Grafik-Layer

- die englische Kampfszene besteht jetzt aus getrennten visuellen Ebenen statt nur einem einzelnen Hintergrundbild
- Ebenen: **Hintergrund**, **Armee**, **Festung** und **Atmosphäre**
- Armee und Festung nutzen getrennte Masken, damit sie später unabhängig bewegt, skaliert und animiert werden können
- die Ebenen bleiben in diesem Schritt bewusst deckungsgleich; noch keine zusätzliche Kamerafahrt oder Parallax-Bewegung
- die vorhandene CSS-Landschaft bleibt weiterhin als Lade-/Fehler-Fallback bestehen
- der Battle-Test prüft explizit alle vier Layer und das erfolgreiche Laden der drei Bild-Layer
- reine Darstellungsarchitektur: Kampflogik, Mastery, XP, OCR und Sync bleiben unverändert

## v0.18.26 – hochwertige Sieg-/Ergebnisansicht

- ein abgeschlossener Kampf öffnet eine eigene, bildschirmfüllende Ergebnisansicht im freigegebenen dunkelblau/goldenen Kampagnenstil
- Siege zeigen ausschließlich echte App-Daten: eroberte Festung, tatsächliche **+20 XP**, aktuellen Lernfortschritt, Armeestärke und das nächste reale Kampagnenziel
- Boss-Siege werden als eigener „Boss besiegt!“-Zustand dargestellt
- bei nicht ausreichendem Lernfortschritt zeigt die Ergebnisansicht sachlich den noch fehlenden Fortschritt; es gibt keine erfundenen Belohnungen
- die Ergebnisansicht verwendet die bereits lokale/offline verfügbare Battle-Illustration als Hintergrund und bleibt ohne externe Bildquelle oder laufende Kosten
- „Weiter“ führt zurück in die bestehende Schlacht, „Meine Armee“ direkt in die Armeeübersicht
- die Ansicht ist rein präsentational und verändert weder Mastery noch Kampagnenlogik
- der Battle-WebKit-Test prüft Ergebnisansicht, echte XP-Belohnung, Lernfortschritt, nächstes Ziel und Boss-Ergebnis

## v0.18.25 – dediziertes Battlefield

- die englische Schlacht nutzt jetzt ein eigenes, UI-freies Battlefield-Motiv statt des wiederverwendeten Armee-/Lagerhintergrunds
- das Motiv zeigt Armee, Belagerungsgerät und gegnerische Festung als reine Szenengrafik; Buttons, Phasenleiste und Texte bleiben echte App-UI
- das Battlefield liegt als eigenes lokales WebP-Asset in Chunks vor und wird vollständig offline mit der PWA ausgeliefert
- eigener Loader `VTBattleArt` trennt Battle-Grafik technisch von `VTArmyArt`
- CSS-Landschaft bleibt als Fallback erhalten, falls das Bild nicht geladen werden kann
- Battle-Test prüft explizit, dass die dedizierte Battle-Ressource aktiv ist
- reine Präsentationsänderung: Kampfphasen, Kampfergebnis, Mastery, OCR und Sync bleiben unverändert

## v0.18.24 – illustrierte Schlachtgrundlage

- die englische Schlacht nutzt erstmals eine echte hochwertige Bild-Layer-Grundlage statt ausschließlich CSS-Landschaft
- dafür wird die bereits lokal/offline ausgelieferte Armee-Illustration wiederverwendet; keine neue externe Abhängigkeit und keine laufenden Kosten
- die bisherige CSS-Sky-/Hügel-/Bodenebene bleibt als Fallback erhalten und wird erst nach erfolgreichem Bildladen ausgeblendet
- Festung, Einheiten, Angriffstypen, Treffer, Boss und die fünf Kampfphasen bleiben technisch unverändert darüber aktiv
- CSP bleibt unverändert streng; die Bildquelle ist dieselbe lokale Blob-Ressource wie in „Meine Armee“
- ein WebKit/iPhone-Test prüft, dass genau eine illustrierte Battle-Layer geladen wird
- reine Präsentationsänderung: Lernlogik, Mastery, OCR, Sync und Kampfergebnislogik bleiben unverändert

## v0.18.23 – Abschreiben ist freiwillig

- fachlich geprüfte Vokabeln sind sofort im normalen adaptiven Lernpfad verfügbar
- das Tagesziel startet bei neuen Wörtern direkt mit dem eigentlichen Lernen und nicht mehr automatisch mit Abschreiben
- **Abschreiben** ist jetzt eine eigene freiwillige Lerneinheit unter „Mehr üben“, gleichrangig zu Karteikarten und anderen Zusatzübungen
- die Abschreib-Einheit bleibt mit Anschauen, handschriftlichem Schreiben, Abdecken, aktivem Erinnern und Vergleichen erhalten
- bereits in ein Vokabelheft übertragene Wörter können ohne Umweg direkt gelernt werden
- der Abschreibstatus wird separat gespeichert, sperrt aber keine Vokabel und verändert keine Mastery
- der bisherige Karteikarten-„Vorkenntnis-Beweis“ entfällt, weil keine Abschreib-Sperre mehr umgangen werden muss
- Elternfreigabe der Wort↔Bedeutung-Paare bleibt weiterhin Voraussetzung vor dem Lernen

## v0.18.22 – Einheitendetail & Aufwertungspfad

- Klick auf eine Einheit in **„Meine Armee“** öffnet eine eigene Detailansicht
- große Einheitendarstellung mit aktueller Stufe und aktueller sichtbarer Ausbaustufe
- die **nächste sichtbare Verbesserung** wird namentlich angezeigt
- die **exakte Lernbedingung** für die nächste Stufe wird direkt genannt
- jede Einheit besitzt einen sichtbaren fünfstufigen Aufwertungspfad mit erreicht / aktuell / als Nächstes / gesperrt
- keine Münzen, keine Käufe und kein eigener Spielfortschritt: alle Stufen werden weiterhin ausschließlich aus vorhandenen Lernwerten abgeleitet
- die Detailansicht verwendet dieselben lokalen, offlinefähigen Illustrationen wie die Armeeübersicht
- das Öffnen und Betrachten der Detailansicht verändert Mastery oder Lernfortschritt nicht

## v0.18.21 – illustrierte Armee-Grafik

- die englische Armeeansicht nutzt erstmals die freigegebene halb-realistische, epische Grafikrichtung als echte App-Ressource
- Feldlager-Hintergrund und sechs Einheitenmotive werden lokal mit der PWA ausgeliefert; keine externen Bilddienste, keine laufenden Lizenz- oder API-Kosten
- die sechs Einheitenbilder werden als kompaktes Sprite geladen und in den Karten sowie der Detailvorschau wiederverwendet
- alle Grafikressourcen liegen im Service-Worker-App-Shell-Cache und funktionieren damit auch offline
- CSP bleibt unverändert streng; die Bilder werden aus lokalen Ressourcen in Blob-URLs aufgebaut, ohne Inline-Styles oder externe Origins
- bei fehlender Grafik bleibt eine robuste CSS-/Symbol-Fallbackdarstellung erhalten
- Latein erhält weiterhin die neutrale Fallbackdarstellung, bis ein eigenes römisches Legion-Assetset vorliegt
- reine Präsentationsänderung: Lernlogik, Mastery, OCR und Family-Sync bleiben unverändert

## v0.18.20 – „Meine Armee“ als eigener Erlebnisbereich

- neue Kinderansicht **„Meine Armee“** zwischen Fortschritt und Schlacht
- sechs sichtbare Einheitentypen: Infanterie/Legionäre, Bogenschützen/Sagittarii, Kavallerie/Equites, Rammbock/Belagerungsgerät, Schildträger und Unterstützung
- Stufen und Freischaltungen werden ausschließlich aus vorhandenem Lernfortschritt, stabilen Wörtern, Lerntagen und Kampagnenfortschritt abgeleitet
- keine eigene Spielwährung und kein separater fachlicher Fortschritt; Öffnen, Betrachten und Auswählen einer Einheit verändert Mastery nicht
- Übersicht zeigt Rang, Armeestärke, Moral, Ausrüstung, Festungsfortschritt, Boni und das nächste erreichbare Upgrade
- erste hochwertige dunkelblaue/goldene Armee-Designsprache als technische Basis für die späteren halb-realistischen Grafik-Assets
- eigener WebKit/iPhone-Smoke-Test schützt Layout, Einheitendarstellung und die Trennung vom Lernstand

## v0.18.18 – visueller Qualitäts-Pass

- ruhigere, konsistentere Oberflächen mit feineren Linien, weicheren Flächen und klarerer Typografie
- Heute-Ansicht erhält eine stärkere visuelle Hierarchie, ohne zusätzliche Ablenkung im Lernprozess
- Navigation, Karten, Dialoge, Formulare, Elternbereich und Desktop-Workspace folgen jetzt einem gemeinsamen Designsystem
- fokussierte Lernansicht bleibt bewusst reduziert; LRS-Modus behält schattenarme Darstellung
- Schlachtbereich bleibt atmosphärischer als der Lernbereich, ohne fachlichen Lernstand oder Abläufe zu verändern
- reine Präsentationsänderung: Lernlogik, OCR, Family-Sync und Sicherheitsarchitektur bleiben unverändert

## v0.18.16 – Familienverbund beitreten & wechseln

- die Einrichtung trennt jetzt klar zwischen **„Bestehender Familie beitreten“** und **„Neue Familie anlegen“**
- weitere Eltern-Geräte treten mit Familien-ID + bestehender PIN demselben Familienverbund bei, statt versehentlich eine zweite Familie anzulegen
- ein verbundenes Eltern-Gerät kann über **„Familie wechseln“** die lokale Sync-Verbindung lösen und anschließend einer anderen bestehenden Familie beitreten; lokale Lern- und Vokabeldaten bleiben dabei erhalten
- beim erstmaligen Einrichten eines Kindergeräts werden Sync-Dokumente verbindlich in der Reihenfolge **gemeinsame Bibliothek → Profileinrichtung → Lernfortschritt** verarbeitet
- damit stehen die gemeinsamen Vokabeln bereits bereit, bevor Lernsets und Fortschrittsdaten des Kindes eingelesen werden
- der Family-Sync-CI-Test prüft Beitritt, Wechsel und die Dokumentreihenfolge als Regression

## v0.18.15 – Elternfreigabe bleibt gültig

- einmal bestätigte Wort↔Bedeutung-Paare bleiben nach Neustart, Reload und Family-Sync freigegeben
- der Startabgleich repariert fehlende Bibliotheks-Verifikationszeitpunkte aus einer vorhandenen Elternfreigabe, statt den Lernbereich erneut zu sperren
- jede Elternfreigabe speichert zusätzlich einen kompakten Inhalts-Fingerabdruck der tatsächlich geprüften Paare
- eine echte Änderung an Wort, Bedeutung oder akzeptierten Varianten macht die Freigabe wieder prüfpflichtig
- ein Regressionstest bildet Neustart + unveränderte Freigabe sowie die erneute Sperre nach Inhaltsänderung ab

## v0.18.14 – Desktop-Workspace & Vorkenntnis-Beweis

- ab 1100 px nutzt die App ein echtes Desktop-Layout mit linker Navigation, breitem Tagesbereich und dauerhaft sichtbaren freiwilligen Lernarten
- der Elternbereich nutzt auf Desktop vier kompakte Funktionskarten nebeneinander; Mobil- und Tabletansicht bleiben unverändert fokussiert
- **Karteikarten** sind als feste Schnellaktion auf der Heute-Seite jederzeit erreichbar, sobald geprüfte Vokabeln vorhanden sind
- Karteikarten dürfen auch mit neuen, noch nicht abgeschriebenen Vokabeln gestartet werden
- schreibt das Kind eine solche Vokabel beim ersten unbeeinflussten Versuch ohne Hilfe orthographisch korrekt, gilt die Vorkenntnis als nachgewiesen: der Abschreib-Erstkontakt für dieses Wort entfällt und das Wort geht direkt in die Wiederholung
- ein Fehlversuch beweist nichts und lässt das Wort im normalen Kennenlernprozess
- der Vorkenntnis-Beweis vergibt **keine Mastery**; Box 5 und „nachhaltig gemeistert“ bleiben an zeitlich verteilte Abrufe gebunden
- der Beweisstatus wird separat gespeichert und über Backup/Sync erhalten

## v0.18.12 – dynamische Testplanung nach tatsächlichem Lernstand

- Testtage werden als lokale Kalendertage gerechnet; „in 7 Tagen“ entspricht exakt sieben Datumswechseln und ist unabhängig von Sommer-/Winterzeit
- der ausgewählte Testumfang wird unverändert als konkrete Vokabelmenge übernommen
- bei mindestens zwei Tagen Vorlauf wird der letzte Tag vor dem Test bewusst als Wiederholungstag ohne geplante neue Wörter reserviert
- das Pensum wird an jedem neuen Lerntag aus dem tatsächlich verbleibenden Lernstoff neu berechnet
- Rückstand erhöht zunächst die Zahl neuer Wörter bis maximal 7 und danach die Wiederholungen; das Gesamtziel kann vorübergehend bis 14 Kontakte steigen
- Vorsprung reduziert die Belastung bis auf kleine 3er-Blöcke neuer Wörter und etwa 8 Kontakte
- bereits kennengelernte, aber noch unsichere Wörter fließen ebenfalls in die dynamische Wiederholungsmenge ein
- neue Wörter am Tag vor dem Test werden ausdrücklich als Spacing-Risiko markiert; am Testtag selbst werden keine neuen Wörter mehr angesetzt
- Vorschau im Testplan und tatsächlicher Tagesplan verwenden dieselbe Berechnungslogik

## v0.18.11 – schriftlicher Karteikartenmodus mit fünf Boxen

- neuer Lernmodus **Karteikarten** unter „Mehr üben“: Bedeutung sehen, Vokabel vollständig schreiben, automatisch prüfen
- fünf sichtbare Stufen: **Neu → Im Lernen → Bekannt → Sicher → Nachhaltig gemeistert**
- eine richtige unabhängige schriftliche Antwort bewegt die Karte höchstens eine Box nach hinten; eine falsche Antwort genau eine Box nach vorne
- wiederholtes Richtigantworten am selben Tag kann die zeitlich geschützten höheren Boxen nicht künstlich überspringen
- Box 5 wird nur erreicht, wenn zusätzlich die bestehende nachhaltige Mastery-Logik erfüllt ist
- die fünf Boxen visualisieren denselben Lernstand; sie bilden kein konkurrierendes zweites Bewertungssystem
- ein abgeschlossener Karteikartenblock zählt als Lerneinheit und kann einen Schlacht-Angriff freischalten

## v0.18.10 – Schlacht nach Kennenlern-Einheit & neutraler Abschreibtext

- auch ein vollständig abgeschlossener täglicher Kennenlern-/Abschreibblock zählt als Lerneinheit und vergibt genau einen Angriff
- die Abschlussansicht zeigt die freigeschaltete Schlacht unmittelbar an
- der Erstkontakt setzt kein Vokabelheft mehr voraus: das Kind schreibt von Hand auf Papier oder in ein beliebiges Heft
- beim zweiten Abruf wird nur verlangt, die erste Abschrift zu verdecken und erneut aus dem Kopf zu schreiben
- die Battle-Belohnung des Erstkontakts ist gegen versehentliche Mehrfachvergabe abgesichert

## v0.18.9 – Von-bis-Auswahl & sauberer Daten-Neustart

- in „Test planen“ und „Ohne Test lernen“ können Vokabeln jetzt zusätzlich als inklusiver Bereich **Von–Bis** ausgewählt werden
- „Nur Bereich“ setzt exakt die gewählte Nummernspanne; Einzelhäkchen sowie „Alle/Keine“ bleiben weiterhin möglich
- einmaliger Bereinigungsreset entfernt alte Lernbereiche, Tests, Noten, Aktivitäten, Lernstände, Buchzuordnungen und alle nicht fest eingebauten Vokabeln
- Kinderprofile und ihre Grundeinstellungen bleiben erhalten, damit sie nicht neu eingerichtet werden müssen
- anschließend wird ausschließlich die fotografisch geprüfte feste Camden-Town-Bibliothek wieder aufgebaut
- bei aktivem Familiensync wird ein Eltern-Gerät versuchen, den bereinigten Stand kontrolliert in die Cloud zu übernehmen
- explizit ausgewählte Testvokabeln bleiben nun auch nach Speicherung/Reload als exakte Auswahl erhalten

## v0.18.8 – Testplanung und Lernen ohne Test klar getrennt

- steht ein Test an, ist **„Test planen“** der Standardweg und wird im Elternbereich zuerst angeboten
- im Testplan werden Termin und konkrete Vokabeln direkt gewählt; die ausgewählten Wörter werden automatisch zum Lernstoff des Kindes
- **„Ohne Test lernen“** ist ausschließlich für Lernstoff gedacht, für den kein konkreter Testtermin feststeht
- das Testdatum wurde aus den allgemeinen Lernstoff-Details entfernt und kann nur noch über „Test planen“ gesetzt werden
- leere Zustände und Elternhinweise zeigen beide Wege ausdrücklich statt eines mehrdeutigen „Lernstoff festlegen“
- der sichtbare Begriff „Lernset“ wurde weiter auf technische/interne Stellen zurückgedrängt

## v0.18.7 – ein zentraler Lernstoff-Workflow

- „Lernstoff festlegen“ ist der normale Einstieg: Kind → Lehrwerk → Kapitel → konkrete Vokabeln
- alternative Quellen wie Foto/Text und manuelle Erfassung starten ebenfalls aus diesem einen Einstieg
- die Bibliothek ist Verwaltungs- und Korrekturbestand, nicht mehr ein paralleler Lernweg
- der Testplan wählt die Vokabeln direkt per Checkbox aus; ein technisches Lernset muss nicht mehr vorher angelegt werden
- ausgewählte Buchvokabeln werden im Hintergrund dem Profil zugeordnet und als exakter Testumfang gespeichert
- der Testdialog zeigt vor dem Speichern die daraus berechnete Tageslast mit 5–7 neuen Wörtern und Wiederholungen
- bereits bekannte Wörter behalten ihren persönlichen Lernstand und müssen bei erneuter Verwendung nicht künstlich neu „kennengelernt“ werden

## v0.18.6 – Hilfe-Popover auf iPhone schließen

- Kontext-Hinweise besitzen jetzt eine sichtbare Schließen-Schaltfläche.
- Tippen außerhalb des Hinweises schließt ihn sofort, auch auf iPhone/WebKit.
- Das Verhalten ist im mobilen WebKit-Smoke-Test abgesichert.

## v0.18.4 – feste Camden-Town-Lehrwerksbibliothek

- Die fotografisch geprüften Word lists „Welcome to Camden Town!“ und „Theme 1: At school“ sind fest mit der App ausgeliefert.
- Lautschrift und gelb hinterlegte Pick-up-/Hinweisboxen sind bewusst nicht Bestandteil der Bibliothek.
- Die Buchform bleibt je Abschnitt erhalten; gebräuchliche im Buch angegebene Alternativen werden als akzeptierte Antworten hinterlegt.
- Die feste Bibliothek wird idempotent in die globale Bibliothek gemergt und überschreibt keine Lernstände.

## v0.18.5 – Bibliothekszuordnung & begrenztes Tagespensum

- geprüfte Lehrwerksabschnitte können im Elternbereich direkt einem Kind zugeordnet werden
- persönlicher Lernstoff eines Profils kann gelöscht werden, ohne die gemeinsame Lehrwerksbibliothek zu beschädigen
- verwaiste Fehlimporte des gelöschten Profils werden dabei aufgeräumt, gemeinsam genutzte Vokabeln bleiben erhalten
- neue Vokabeln werden pro Tag auf 5–7 begrenzt
- Wiederholungen ergänzen das Tagesziel auf ungefähr 10–12 Vokabelkontakte
- ein gesetzter Testtermin verteilt noch unbekannte Wörter auf die verbleibenden Lerntage; mathematisch nicht erreichbare Pläne werden sichtbar markiert
- Erstkontakt/Freischaltung erfolgt pro Vokabel statt als Alles-oder-nichts-Sperre für das gesamte Lernset

## Architektur

- statische Web-App ohne Serverzwang
- IndexedDB für lokale Lerndaten
- Service Worker für Offline-Fähigkeit
- langlebiger OCR-/Wörterbuch-Ressourcencache
- lokales Tesseract OCR
- lokales Wikidict
- Englisch und Latein aktiv; Französisch architektonisch vorbereitet, aber bis zur vollständigen OCR-Ressource deaktiviert
- automatisierte Preflight-, Sense-, Lernintegritäts-, Bibliotheks-, WebKit/iPhone- und Chromium-Smoke-Tests
- fokussierter Lernmodus ohne globale Navigation, Kampagne oder Fortschrittsdiagnostik während des Abrufs

## Zentrale Dokumente

- [PRODUCT_DNA.md](PRODUCT_DNA.md)
- [SYNC_ARCHITECTURE.md](SYNC_ARCHITECTURE.md) – Familien-, Geräte- und Eltern/Kinder-Synchronisation
- [SENSE_MODEL.md](SENSE_MODEL.md)
- [SUBJECT_SYSTEM.md](SUBJECT_SYSTEM.md)
- [CACHE_STRATEGY.md](CACHE_STRATEGY.md)
- [LIBRARY_INDEX.md](LIBRARY_INDEX.md)
- [FOCUSED_LEARNING_UI.md](FOCUSED_LEARNING_UI.md)
- [FINAL_AUDIT.md](FINAL_AUDIT.md)
- [docs/DEEP_AUDIT_v0.18.39.md](docs/DEEP_AUDIT_v0.18.39.md) – technisches Deep Audit vor v1.0
- [docs/ELTERN_ANLEITUNG.md](docs/ELTERN_ANLEITUNG.md) – Bedienungsanleitung für Eltern
- [docs/PAEDAGOGISCHE_DOKUMENTATION.md](docs/PAEDAGOGISCHE_DOKUMENTATION.md) – Ziel, Lernlogik und Grenzen für Eltern und Schulpädagogen
- [QUIZ_ENGINE.md](QUIZ_ENGINE.md)


## v0.10.5 – Abfragekorrektur

- Lehrwerks-/Set-Formulierungen und kanonische Sense-Antworten werden gemeinsam akzeptiert.
- Nach jeder normalen Lerneinheit erscheint eine Einzelübersicht mit Frage, eigener Antwort, erwarteten/akzeptierten Antworten und Bewertung.
- Die Ergebnisübersicht kann als Text kopiert werden, damit fehlerhafte Zuordnungen nachvollziehbar gemeldet werden können.


## v0.11.0 – neuer Abfragekern

Die Vokabelabfrage wurde als Kernprodukt technisch neu aufgebaut.

- jede Aufgabe besitzt einen unveränderlichen Frage-/Sollantwort-Snapshot
- zentrale Bewertung statt verteilter Vergleichslogik
- Retry bleibt exakt im selben Lernset und Sense
- interne Set-/Sense-Abweichungen stoppen die Aufgabe statt sie falsch zu werten
- Satzzeichen erzeugen keine heimlichen Antwortalternativen mehr
- Foto-/OCR-Lernsets müssen vor dem Lernen sichtbar als Wort↔Bedeutung-Paare bestätigt werden
- ältere Fotoimporte werden einmalig ebenfalls zur Paarprüfung gesperrt
- Ergebnisübersicht ist über Question-ID und Set-Link reproduzierbar


## v0.17.x – Schlachtmodus

- eigener, nur nach abgeschlossenen Lerneinheiten erreichbarer Schlachtbereich
- animierte Armee, Festungsschäden, Ergebnisdarstellung und immersiver Vollbildmodus
- unterschiedliche Einheiten, sechs Festungsstufen, Angriffsarten, Jahreszeiten sowie Rang-/Ausrüstungsoptik
- Bosskämpfe, Spezialangriff, kindgerechte Kampagnenkapitel und animierte Freundschaftsduelle
- Gamification bleibt strikt außerhalb der aktiven Vokabelabfrage und verändert keinen Mastery-Wert
- v0.17.1 minimiert die Daten in Herausforderungscodes: kein Profilname und keine unnötigen Detailwerte
