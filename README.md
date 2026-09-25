# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Aktueller Stand

App-Version: **v0.19.1**

Das Projekt wurde am 20.09.2026 aus `JohannasGartenwelt/vokabeltrainer` in dieses eigenständige Repository migriert. Produktentscheidungen richten sich verbindlich nach [PRODUCT_DNA.md](PRODUCT_DNA.md).

Die produktive Family-Sync-Infrastruktur nutzt dasselbe Supabase-Projekt wie Johanna's Gartenwelt. Die kanonische Backend-/Recovery-Quelle liegt im Repository `JohannasGartenwelt` unter `supabase/`; dieses Repository enthält nur die Vokabeltrainer-spezifischen Anwendungssourcen und lokale Referenzmigrationen.

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
