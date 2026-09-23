# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Aktueller Stand

App-Version: **v0.18.38**

Das Projekt wurde am 20.09.2026 aus `JohannasGartenwelt/vokabeltrainer` in dieses eigenständige Repository migriert. Produktentscheidungen richten sich verbindlich nach [PRODUCT_DNA.md](PRODUCT_DNA.md).

Die produktive Family-Sync-Infrastruktur nutzt dasselbe Supabase-Projekt wie Johanna's Gartenwelt. Die kanonische Backend-/Recovery-Quelle liegt im Repository `JohannasGartenwelt` unter `supabase/`; dieses Repository enthält nur die Vokabeltrainer-spezifischen Anwendungssourcen und lokale Referenzmigrationen.

## v0.18.38 – transparente Ergebnisübersicht

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
