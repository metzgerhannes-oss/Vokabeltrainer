# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Aktueller Stand

App-Version: **v0.18.18**

Das Projekt wurde am 20.09.2026 aus `JohannasGartenwelt/vokabeltrainer` in dieses eigenständige Repository migriert. Produktentscheidungen richten sich verbindlich nach [PRODUCT_DNA.md](PRODUCT_DNA.md).

Die produktive Family-Sync-Infrastruktur nutzt dasselbe Supabase-Projekt wie Johanna's Gartenwelt. Die kanonische Backend-/Recovery-Quelle liegt im Repository `JohannasGartenwelt` unter `supabase/`; dieses Repository enthält nur die Vokabeltrainer-spezifischen Anwendungssourcen und lokale Referenzmigrationen.

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
