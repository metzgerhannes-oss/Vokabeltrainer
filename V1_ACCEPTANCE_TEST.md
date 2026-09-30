# V1 Acceptance Test

Stand: 30.09.2026 · Basis: v0.21.51 · Release-Kandidat; Prüfschwerpunkte: B-018 Schreibkontrolle und Avatar-Art-Abnahme

Ziel dieses Dokuments ist die verbindliche praktische Abnahme vor v1.0.
Der Test ergänzt die automatisierten CI-, Browser-, Security- und Fachtests.
Ein grüner automatisierter Testlauf ersetzt diesen Praxistest nicht.


## Aktueller Praxisfortschritt

- [ ] **Avatar-Art v0.21.50:** Auf realem iPhone nacheinander Englisch, Latein und Deutsch sowie verfügbare m/w/d-Varianten prüfen. Der Startscreen muss eine hochwertige gemalte Figur zeigen; Latein darf kein englisches Armee-Szenenbild mehr verwenden. Deutsch Grundschule zeigt in allen Weltvarianten den Fuchs. Stufenwechsel 1–6 muss das passende Bild wechseln; technische CSS-/SVG-Figuren dürfen im Normalbetrieb nicht sichtbar sein.

- [ ] **B-018 Praxisabnahme:** Auf realem iPhone/iPad nur „m“, danach „M/m“ und danach „a, e, m, s“ auswählen; prüfen, dass ausschließlich diese Buchstaben geübt werden, Dach/Erdgeschoss/Keller beim Schreiben sichtbar bleiben, der Buchstabenlaut funktioniert und wiederholtes freies Schreiben keinen Mastery-/Testfortschritt erzeugt.
- [ ] **B-018 Selbstkontrolle v0.21.48:** Buchstaben schreiben → „Kontrollieren“ → direkt oberhalb der eigenen Schreibfläche muss eine sichtbare Kontrollkarte „So soll … aussehen“ mit großem blauem Sollbuchstaben auf eigener Dach-/Erdgeschoss-/Keller-Lineatur erscheinen und automatisch ins Sichtfeld scrollen → „Nochmal schreiben“ löscht die Übung → erneut schreiben/kontrollieren → „Passt für mich“ wechselt weiter. Keine Richtig/Falsch-Wertung und kein Lern-/Spielprogress.

**Praktischer Befund v0.21.47 (nicht bestanden):** Trotz grünem WebKit-Sichtbarkeitstest erschien auf dem realen iPhone weiterhin keine erkennbare Kontrolle. **Fix v0.21.48:** keine Overlay-Technik mehr; normale HTML-Kontrollkarte im Dokumentfluss mit Auto-Scroll.

**Praktischer Befund v0.21.46 (nicht bestanden):** Kontrollmodus/Buttons wechselten, aber auf dem realen iPhone wurde keine Sollform sichtbar angezeigt. **Fix v0.21.47:** separate SVG-Overlay-Ebene statt Zeichnung im selben Canvas; sichtbarer Kontrollstatus.

**Praktischer Befund v0.21.41 (nicht bestanden):** Die zusätzlichen `l/m/g`-Karten waren missverständlich; Browser-TTS war kein verlässlicher Buchstabenlaut. Die Karten sind seit v0.21.42 entfernt.

**Praktischer Befund v0.21.42 (nicht bestanden):** Auf dem realen iPhone meldete die Laut-Taste „Der Buchstabenlaut konnte nicht abgespielt werden.“ Ursache: Die ausgelieferten M4A-Container bestanden nur den zu schwachen Strukturtest, waren für iOS aber nicht zuverlässig decodierbar. **Fix v0.21.44:** MP3-Audiosprite + Web-Audio-Decoding; CI muss echtes WebKit-Decoding nachweisen. Reale Wiederholungsprüfung auf demselben iPhone erforderlich.

**Praktischer Befund v0.21.44 (nicht bestanden):** WebKit-CI und Live-WAV-Prüfung waren grün, auf dem realen iPhone kam beim Druck auf „Laut hören“ dennoch kein hörbarer Ton. Der WAV selbst enthält messbare Audiodaten; damit gilt der Web-Audio-Ausgabepfad auf dem Zielgerät als unzureichend. **Fix v0.21.45:** 29 einzelne PCM-WAV-Dateien + nativer HTML-`Audio`-Start direkt im Tastendruck; Generator prüft RMS/Peak. Reale Wiederholungsprüfung erforderlich.
- [x] Praxisblock 1 – Kind-End-to-End auf realem iPhone: Einstieg, Tageslernen, Fehler/Korrektur, Tagesabschluss, Testabschluss und Schlacht praktisch durchgeführt.
- [x] Praxisblock 2 – Elternbereich: Test anlegen, bestehenden Test verschieben/bearbeiten, Vokabelumfang ändern und mehrere zukünftige Tests praktisch durchgeführt.
- [ ] Praxisblock 3 – v0.21.30: dynamische Anfangsarmee nach sichtbarem Wachstumsfix, monotones Wachstum und datierbare Jahresfestung praktisch prüfen.
- [ ] Praxisblock 4 – Family Sync, zweites Gerät, Backup/Restore und Offline/PWA praktisch prüfen.

Die Detail-Checkboxen darunter bleiben der verbindliche Nachweis für Einzelfälle. Ein abgeschlossener Praxisblock ersetzt keine noch separat offene Detailprüfung außerhalb seines ausdrücklich genannten Umfangs.

Zusatz aus v0.21.12: Im Elternprofil praktisch prüfen, dass **Lesen**, **Rechtschreiben** und **Kurze Einheiten** unabhängig speicherbar sind. Ein Profil nur mit Leseunterstützung darf nicht automatisch die Tageslast verkleinern; ein Profil nur mit Rechtschreibunterstützung muss im Tageslernweg einen echten Schreibabruf erhalten. Nach Family Sync muss dieselbe Einstellung auf dem zugeordneten Kindergerät ankommen.

Zusatz für v0.21.13: Auf einem iPhone prüfen, dass Avatarbild, Stufen-/Teststatus und „Was steht heute an?“ klar untereinander liegen und der dunkle Statusblock das Avatarbild nicht überdeckt.

Zusatz für v0.21.14: In Armee- und Angriffsszene prüfen, dass die eigene Seite mit dem **Profilnamen** und das Ziel mit **„Test N“** beschriftet ist. Die generischen Bildlabels „Deine Armee“ und „Ziel“ dürfen nicht mehr nötig sein; der Fokusmodus muss die beiden Banner klar lesbar erhalten.

Zusatz für v0.21.15: Auf dem iPhone prüfen, dass das Kampagnenbild vollständig sichtbar endet und die helle Karte mit „Angriff gesperrt“ **mit erkennbarem Abstand darunter** beginnt. Profilname und „Test N“ müssen wie Banner/Schilder wirken und dürfen nicht als weiße Pillen erscheinen.

Zusatz für v0.21.16: Wird ein zukünftiger Test vor seinem Termin durch einen neuen Test ersetzt, darf die alte verwaiste Festung die Nummer nicht erhöhen; der verbleibende erste reale Test muss als **„Test 1“** erscheinen.

Zusatz für v0.21.17: In Armeeübersicht und Angriffsszene prüfen, dass Profilname und Testziel **oben im Bild auf horizontalen Pergamentbannern** stehen, jeweils mit kleinem farbigem Heraldik-Schild und waagerechter Zierstange wie in der freigegebenen Referenz. Es dürfen keine stehenden Feldstandarten mehr erscheinen. Der Abstand zur hellen Missionskarte und die korrekte Testnummerierung bleiben unverändert.

Zusatz für v0.21.19: Zwei einmalige Tests für dasselbe Fach an unterschiedlichen zukünftigen Daten anlegen, wobei der zweite Test **vor Erreichen des ersten Termins** erfasst wird. Auf „Heute“, in der Testbereitschaft und in der Armee muss weiterhin der **frühere Test** erscheinen. Der spätere Test muss gespeichert bleiben und darf den ersten weder löschen noch ersetzen. Dies auch einmal mit demselben Lehrwerksabschnitt sowie mit manueller/OCR-Erfassung prüfen.

Zusatz für v0.21.20: Die Schlacht auf iPhone/iPad öffnen. Sie muss **sofort die gesamte App-Fläche belegen**, die untere Hauptnavigation darf nicht sichtbar sein. Armeestärke, Testfestung, Verteidigung und Rang/Ausrüstung müssen **außerhalb des Bildes** liegen; auch Taktik und Hauptaktion dürfen das Kampagnenbild nicht verdecken. Das zusätzliche Festungs-/Rang-Badge im Bild darf in der gemalten englischen Szene nicht erscheinen.

Zusatz für v0.21.21: Im Tageslernweg mindestens zwei Vokabeln fachlich richtig und ohne Hilfe aktiv abrufen, anschließend einen simulierten/realen App-Update-Reload durchführen. Die Anzeige `X / N erledigt` darf nicht auf `0 / N` zurückspringen. Beim einmaligen Übergang von einer alten Versionssignatur dürfen nur heutige unabhängige korrekte aktive Abrufe rekonstruiert werden; Recognition/Hilfen, assistierte Antworten und Fehler dürfen den Zähler nicht erhöhen.

Zusatz für v0.21.22: Einen normalen Tagesplan mit deutlich mehr als sechs offenen Testvokabeln prüfen. Der Pflichtkern darf höchstens **6 Fokuswörter** enthalten; mit „Kurze Einheiten“ höchstens **4**. Maximal 3 bzw. 2 neue Wörter dürfen im Pflichtkern liegen. Auch bei massivem Rückstand darf der Pflichtzähler nicht auf 12–14 Wörter steigen. Nach Abschluss darf eine **zweite kurze Runde** empfohlen werden, sie muss freiwillig bleiben und darf keine zweite Battle-Aktion erzeugen. Ein bestehender 12er-Tagesplan aus v0.21.21 muss beim Update verkleinert werden, ohne bereits heute erledigte passende Wörter zu verlieren.

T−1-Zusatz für v0.21.22: Einen Test für **morgen** mit deutlichem Rückstand prüfen. Nach dem kurzen Pflichtkern muss die App eine **Rettungsrunde** anbieten, aber nicht den kompletten Testumfang am Stück. Die Runde enthält höchstens 6 Fokuswörter bzw. 4 bei „Kurze Einheiten“. Bereits testbereite Wörter dürfen nicht erscheinen. Nach einem Fehler muss das Wort in der nächsten Priorität vorne stehen; nach einer korrekten unassistierten Korrektur müssen noch ungeprüfte offene Wörter nachrücken. Bei `target`, `source`, `mixed` und `dictation` muss die Rettungsrunde die reale Testrichtung spiegeln. Diktat muss produktiv geschrieben werden. Rettungsrunden dürfen weder `completedKeys` des Pflichtziels noch eine weitere Battle-Aktion erzeugen.

Festungsansicht-Zusatz für v0.21.22: Vor Abschluss des Tagesziels in „Meine Armee“ auf **„Festung ansehen“** tippen. Es muss eine saubere Vollbild-Vorschau mit Kampagnenbild, Profilbanner und „Test N“-Banner erscheinen. **Nicht** sichtbar sein dürfen die vier Battle-KPI-Karten, Angriffskarten, Ticketanzeige oder der deaktivierte Block „Tagesziel noch offen“. Nach abgeschlossenem Tagesziel muss derselbe Einstieg dagegen die vollständige Schlachtsteuerung anzeigen.

Zusatz für v0.21.23: Dies auf einem realen iPhone über **beide** Wege prüfen: (1) „Meine Armee“ → „Festung ansehen“ und (2) „Mein Feldzug“ → aktuelles Ziel → „Zur Schlacht“. Das Kampagnenbild muss in beiden Fällen als echter 16:9-Bildbereich sichtbar sein; eine leere dunkle Fläche, eine nur horizontale Linie oder einzelne abgeschnittene Banner-/Schildteile sind Release-Blocker.

Zusatz für v0.21.24 – Übungsraum: Einen Tages-Übungsraum mit mindestens einem neuen/unsicheren Wort so bearbeiten, dass nach dem ersten Methoden-Durchlauf noch mindestens ein Pflichtwort offen ist. Es darf **kein** Abschlussbildschirm mit „Zur Übersicht“ oder „weitere/nächste Lektion“ erscheinen. Nach einer kurzen Orientierung muss derselbe Übungsraum automatisch mit den offenen Wörtern und der adaptiv nächsten passenden Methode weitergehen. Erst bei vollständig erledigtem Pflichtkern erscheint „Übungsraum abgeschlossen“ mit Fokuswörtern, Aufgaben, Trefferquote und verwendeten Lernmethoden. Bonuslernen und T−1-Rettungsrunde dürfen nicht automatisch angehängt werden.

Zusatz für v0.21.24 – Testtag: Einen Test auf **heute** setzen. Der primäre Button muss **„Test abschließen“** heißen. Nach Antippen muss eine Bestätigung erscheinen; erst danach wird der Test als abgeschlossen gespeichert. Ohne eingetragene Schulnote muss die Kampagnenstation trotzdem „Test abgeschlossen“ anzeigen, die Note bleibt später nachtragbar. Ist ein weiterer Test geplant, muss er unmittelbar danach als nächstes Ziel erscheinen. Gibt es keinen Folgetest, muss im Elternmodus **„Nächsten Test vorbereiten“** und im Kindermodus die entsprechende Vorbereitungsanzeige erscheinen. Bei einem wöchentlichen Test muss nach Abschluss der nächste Serientermin zur Umfangsvorbereitung erscheinen. Einen gestern fälligen, nicht abgeschlossenen Test ebenfalls prüfen: Er darf nicht still übersprungen werden. Nach der bestätigten Abschlussaktion muss einmal kurz Konfetti erscheinen; bei aktivierter Systemeinstellung für reduzierte Bewegung darf diese Animation entfallen. Das Konfetti darf weder Klicks blockieren noch den Wechsel zum nächsten Test verzögern.


Zusatz für v0.21.33 – Vokabel überspringen: In einer laufenden normalen Lernabfrage bei mindestens zwei Vokabeln **„Vokabel überspringen“** wählen. Sofort muss die nächste Vokabel erscheinen; die übersprungene Vokabel muss am Ende derselben Einheit erneut erscheinen. Vorher/nachher müssen XP, Mastery, Leitner-Box, Fehlerzahl und Ergebniszähler für diesen Skip unverändert sein. Am letzten Queue-Platz ist erneutes Überspringen deaktiviert. In Prüfungsmodus, Wortblitz und Vokabeldusche darf der Button nicht angeboten werden.

Zusatz für v0.21.31 – strittige Systembewertung: Eine fachlich vertretbare, vom System aber zunächst als falsch bewertete Satz-/Antwortvariante eingeben und **„Bewertung prüfen lassen“** wählen. Der gerade erzeugte Fehler muss sofort aus Mastery, Spacing, Leitner-Box und Fehlerstatistik entfernt werden. Im Elternbereich muss die Meldung mit Frage, Kinderantwort und bisher akzeptierten Antworten erscheinen. „Antwort als richtig freigeben“ muss die Variante lokal speichern, den ursprünglichen aktiven Abruf rückwirkend positiv werten und dieselbe Antwort beim nächsten Auftreten automatisch akzeptieren. Ein zweiter Prüffall mit eindeutig falscher Antwort muss nach „Systembewertung bestätigen“ genau einen fachlichen Fehler erzeugen. Den offenen Prüffall zusätzlich einmal über Family Sync zwischen Kinder- und Eltern-Gerät prüfen.

Zusatz für v0.21.30 – sichtbare Anfangsarmee: Der praktische iPhone-Test zeigte in v0.21.29 noch eine optisch fast vollständige Heerlager-Formation, weil gesperrte Einheiten lediglich abgedunkelt dargestellt wurden. In v0.21.30 dürfen im Heerlager nur tatsächlich freigeschaltete Einheiten stehen; gesperrte Einheiten bleiben ausschließlich in den Upgrade-/Detailkarten sichtbar. Die Anzeige „X von 6 Einheiten im Feld“ muss dem realen Stand entsprechen.

Zusatz für v0.21.29 – Jahresentwicklung: Mit wenig erreichtem Jahresfortschritt muss „Meine Armee“ als kleine, einfach ausgestattete Formation erscheinen; die vollständige große Armee darf erst auf der höchsten Entwicklungsstufe sichtbar werden. Danach neuen, noch ungelernten Stoff für einen späteren Test hinzufügen: Der fachliche Prozentwert darf dadurch sinken, **Avatarstufe, Rang und Armee dürfen aber nicht zurückgestuft werden**. Einen weiteren Test hinzufügen und prüfen, dass die Kampagnenkarte dynamisch wächst statt eine feste Gesamtzahl anzunehmen.

Zusatz für v0.21.29 – Jahresfestung: Ohne hinterlegten Termin muss die Jahresfestung auf der Kampagnenkarte als Fernziel mit **„Datum noch offen“** erscheinen. Im Elternbereich anschließend ein reales Datum innerhalb des Schuljahres setzen; es muss nach Family Sync im Kindermodus auf der Kampagnenkarte erscheinen. Datum ändern und anschließend wieder entfernen. Bereits erreichte Avatar-/Armeestufen dürfen sich dadurch nicht verändern. Ein Jahresfestungsdatum vor einem bereits geplanten späteren Test muss abgewiesen werden.

## Grundregel

Die fachlich korrekte Vokabelabfrage ist die Daseinsberechtigung der App.

Folgende Befunde sind **Release-Blocker**:

- falsche Wort↔Bedeutung-Zuordnung
- falsche Sollantwort
- fachlich falsche Bewertung einer Antwort
- falsches Profil / falscher Lernstand nach Sync
- Kind kann geschützte Elternfunktionen erreichen
- Datenverlust ohne klar erkennbaren Konflikt / Fehlerhinweis
- produktiver JavaScript-/CSP-Fehler, der einen Kernablauf blockiert
- Offline-/PWA-Fehler, der eine zuvor geladene Kernfunktion unbenutzbar macht

Andere UX-Probleme werden nach Schweregrad bewertet und nur dann vor v1.0 korrigiert,
wenn sie den selbständigen Kernablauf wesentlich behindern.

---

# A. Kind-End-to-End-Test

## Testaufbau

- [ ] Produktive GitHub-Pages-Version verwenden
- [ ] möglichst Gerät / Browser verwenden, auf dem nicht entwickelt wurde
- [ ] vorhandenes realistisches Kinderprofil verwenden
- [ ] mindestens ein geprüftes Vokabelset mit offenem Lernbedarf
- [ ] mindestens einen absichtlichen Fehler im Lernlauf vorsehen
- [ ] Testperson erhält **keine Bedienerklärung**
- [ ] Beobachter greift nur ein, wenn der Test sonst vollständig abbricht

## Beobachtungsregeln

Bei jedem Schritt notieren:

- erster Fehlklick
- Pause länger als ca. 5 Sekunden
- Rücksprung / unnötiger Navigationswechsel
- Nachfrage an Erwachsene
- sichtbare Unsicherheit trotz korrekter Bedienung
- technischer Fehler

## A1 – Einstieg und Orientierung

- [ ] App öffnet ohne sichtbaren Fehler
- [ ] Kind erkennt, welches Profil aktiv ist
- [ ] Profilwechsel ist ohne Hilfe auffindbar und eindeutig
- [ ] Kind erkennt auf „Heute“ die wichtigste Aktion
- [ ] freiwillige Übungen konkurrieren visuell nicht mit dem Tagesziel
- [ ] keine Eltern-/Administrationsfunktion ist im Kindmodus zugänglich

**Beobachtungen:**

- Erster Fehlklick:
- Pause >5 s:
- Nachfrage:
- Sonstiges:

## A2 – Tageslektion

- [ ] Kind startet die Tageslektion selbständig
- [ ] neue Vokabeln können direkt gelernt werden
- [ ] Abschreiben wird nicht als Pflicht missverstanden
- [ ] Frage und Eingabefeld sind eindeutig
- [ ] Tastatur-/Touch-Bedienung funktioniert zuverlässig
- [ ] Audio ist dort verfügbar, wo es die Lösung nicht vorwegnimmt
- [ ] Fokus bleibt auf der eigentlichen Abfrage
- [ ] keine Kampagnen-/Armeeanimation stört den Abruf

**Beobachtungen:**

- Erster Fehlklick:
- Pause >5 s:
- Nachfrage:
- Sonstiges:

## A3 – Fehler und Feedback

Mindestens eine Antwort bewusst falsch oder orthografisch fehlerhaft eingeben.

- [ ] die App bewertet die Antwort fachlich korrekt
- [ ] das Kind erkennt, dass die Antwort falsch / auffällig war
- [ ] die erwartete bzw. akzeptierte Antwort ist verständlich
- [ ] der Bewertungsgrund ist verständlich
- [ ] Audio nach Fehler verrät nicht vorher die Lösung
- [ ] „Weiter“ ist eindeutig
- [ ] Fehler führt später zu einer erneuten Lerngelegenheit
- [ ] keine künstliche Mastery durch Hinweis / Erkennen / Audio

**Beobachtungen:**

- Erster Fehlklick:
- Pause >5 s:
- Nachfrage:
- Sonstiges:

## A4 – Abschluss und Ergebnisübersicht

- [ ] Kind erkennt, dass die Einheit beendet ist
- [ ] Ergebnisübersicht wird gefunden / automatisch verstanden
- [ ] Frage, eigene Antwort und richtige/akzeptierte Antwort sind unterscheidbar
- [ ] Bewertungsstatus ist verständlich
- [ ] Leitner-Box-Veränderung wirkt nachvollziehbar
- [ ] „Fehler nochmal üben“ ist verständlich
- [ ] „Alle nochmal üben“ ist verständlich
- [ ] freiwilliges Wiederholen löst keine zusätzliche Tages-Schlacht aus

**Beobachtungen:**

- Erster Fehlklick:
- Pause >5 s:
- Nachfrage:
- Sonstiges:

## A5 – Schlacht

Voraussetzung: Tagesziel vollständig abgeschlossen.

- [ ] Kind erkennt, dass eine Schlacht freigeschaltet wurde
- [ ] Schlacht ist nach der Tageslektion auffindbar
- [ ] Festung / Ziel des aktuellen Tests ist verständlich
- [ ] Angriffsart ist ohne Erklärung auswählbar
- [ ] Vollbild / Kampfszene funktioniert
- [ ] Treffer und Festungsschaden sind sichtbar
- [ ] bei Eroberung wird der Sieg eindeutig dargestellt
- [ ] Ergebnisansicht zeigt nur reale Werte
- [ ] Kind findet danach selbständig zurück zu „Heute“ oder „Lernen“
- [ ] am selben Tag ist keine zweite Kampfbelohnung durch freiwilliges Üben möglich

**Beobachtungen:**

- Erster Fehlklick:
- Pause >5 s:
- Nachfrage:
- Sonstiges:

## A6 – Lernen und Erfolge

- [ ] „Lernen“ zeigt die vorgesehenen vier Hauptwege klar
- [ ] Karteikarten sind jederzeit für geprüfte Wörter erreichbar
- [ ] „Alle Vokabeln“ ist auffindbar
- [ ] „Unsichere Wörter“ ist verständlich
- [ ] Spezialtraining ist auffindbar, aber nicht dominant
- [ ] der Karteikasten ist im Bereich „Lernen“ erreichbar und zeigt fünf Stufen
- [ ] Kind versteht grob, dass Wörter nach hinten wandern, wenn sie sicherer werden
- [ ] „Erfolge“ zeigt fachlichen Fortschritt ohne Kampagnen-/Karteikastenoberfläche
- [ ] das Öffnen von „Erfolge“ verändert keine Lernwerte

---

# B. Eltern-End-to-End-Test

## B1 – Elternbereich öffnen

- [ ] bewusster Rollenwechsel erforderlich
- [ ] gekoppeltes Kindergerät kann Elternbereich nicht öffnen
- [ ] Desktop- und Mobilansicht funktionieren
- [ ] Hauptfunktionen sind ohne Suche auffindbar

## B2 – Test planen

- [ ] neuen Test anlegen
- [ ] Fach auswählen
- [ ] Testdatum setzen
- [ ] Vokabelumfang auswählen
- [ ] Einzelauswahl funktioniert
- [ ] „Alle“ / „Keine“ funktioniert
- [ ] Von–Bis-Auswahl ist inklusiv und verständlich
- [ ] Auswahl bleibt nach Reload erhalten
- [ ] gespeicherter Test erscheint korrekt im Kinderlernplan

## B3 – Vokabeln erfassen / OCR

Mit einem realistischen Lehrbuchfoto testen.

- [ ] Bildimport funktioniert
- [ ] Lautschrift wird nicht als Lerninhalt übernommen
- [ ] irrelevante gelbe / redaktionelle Boxen werden ignoriert
- [ ] Wort↔Bedeutung-Paare sind fachlich plausibel
- [ ] Eltern-Paarprüfung ist zwingend vor dem Lernen
- [ ] einzelne Paare können korrigiert werden
- [ ] akzeptierte Antwortvarianten sind prüfbar
- [ ] fachliche Änderung macht Freigabe erneut erforderlich
- [ ] unveränderte Freigabe bleibt nach Reload gültig
- [ ] OCR-Fehler können nicht unbemerkt in die Abfrage gelangen

## B4 – Lernplanung

- [ ] Tagespensum passt zum verbleibenden Testabstand
- [ ] Pflichtkern normalerweise 5–6 Fokuswörter; mit „Kurze Einheiten“ 3–4
- [ ] maximal 3 neue Wörter im normalen Pflichtkern; mit „Kurze Einheiten“ maximal 2
- [ ] mehrere Lernschritte innerhalb der Fokuswörter dürfen ungefähr 10–12 Kontakte ergeben, ohne daraus 10–12 Pflichtwörter zu machen
- [ ] bei Rückstand bleibt der Pflichtkern kurz und empfiehlt bei Bedarf eine zweite freiwillige Kurzrunde
- [ ] bei Vorsprung kann der Pflichtkern auf 5 bzw. 3 Fokuswörter sinken
- [ ] insgesamt maximal 6 neue Wörter pro Tag; mit „Kurze Einheiten“ maximal 4
- [ ] letzter Tag vor dem Test ist bei ausreichendem Vorlauf Wiederholungstag
- [ ] am Testtag werden keine neuen Wörter eingeführt
- [ ] fällige / unsichere Wörter werden priorisiert
- [ ] falsche oder mit Hinweis gelöste aktive Versuche markieren das Pflichtwort nicht als erledigt
- [ ] erst ein richtiger unassistierter aktiver Abruf lässt den Pflichtfortschritt steigen
- [ ] bei Testformat `target` zählt ein Wort erst mit unabhängigem Bedeutung→Fremdsprachenwort-Abruf als testbereit
- [ ] bei Testformat `source` zählt ein Wort erst mit unabhängigem Fremdsprachenwort→Bedeutung-Abruf als testbereit
- [ ] bei `mixed` sind beide Richtungen nachgewiesen
- [ ] Recognition/Listening allein erhöhen den Testbereitschafts-Score nicht

## B5 – Anleitung & Pädagogik

- [ ] Abschnitt „Anleitung & Pädagogik“ ist sichtbar
- [ ] Anleitung für Eltern ist direkt in der App lesbar
- [ ] Pädagogische Dokumentation ist direkt in der App lesbar
- [ ] Inhalte funktionieren offline
- [ ] PDF-Export Anleitung funktioniert
- [ ] PDF-Export Pädagogik funktioniert
- [ ] PDFs sind mehrseitig, lesbar und vollständig
- [ ] keine externen PDF-Dienste werden benötigt

## B6 – Backup / Restore

- [ ] Backup exportieren
- [ ] Backup-Datei erkennbar / plausibel
- [ ] Restore auf separatem Browserprofil testen
- [ ] Daten werden nach Restore korrekt zurückgelesen
- [ ] Profile vorhanden
- [ ] Vokabelsets vorhanden
- [ ] Testplanung vorhanden
- [ ] Lernfortschritt vorhanden
- [ ] ungültige / manipulierte Datei wird abgewiesen
- [ ] Größenlimits greifen verständlich
- [ ] bei aktivem Family-Sync kann ein Restore kein bestehendes Familienprofil stillschweigend entfernen
- [ ] ein zulässiger Restore wird anschließend vollständig zur Synchronisierung vorgemerkt
- [ ] vollständiger App-Reset wird bei aktivem Family-Sync nicht fälschlich als familienweite Löschung angeboten

## B7 – Family Sync (Beta)

Mit zwei getrennten Geräten / Browserprofilen testen.

- [ ] bestehender Familie beitreten
- [ ] gemeinsamer Vokabelbestand erscheint
- [ ] Kinderprofil erscheint korrekt
- [ ] Lernfortschritt erscheint korrekt
- [ ] Kindergerät kann nur eigenen Fortschritt schreiben
- [ ] Eltern können Geräte sehen
- [ ] Gerät kann widerrufen werden
- [ ] Einmal-Einladung ist nach Verwendung ungültig
- [ ] Konflikt wird sichtbar gemeldet und nicht still überschrieben
- [ ] lokales Backup bleibt unabhängig vom Sync möglich
- [ ] manueller Beitritt und direkter QR-/Link-Beitritt bieten vor lokaler Datenübernahme ein Backup an
- [ ] scheitert der Wechsel nach erfolgreicher Serveranmeldung beim Laden oder lokalen Speichern, bleiben alter lokaler Stand und alte Verbindung erhalten
- [ ] widerrufenes Gerät stoppt den Sync und verwirft seine Geräte-Zugangsdaten, ohne lokale Lerndaten zu löschen
- [ ] Profil-Löschung ist bei aktivem Sync gesperrt, solange das Protokoll keine eindeutigen Profil-Tombstones unterstützt
- [ ] Avatarstil und automatische Aussprachekorrektur bleiben zwischen Eltern-Geräten konsistent

---

# C. Geräte- und Darstellungsabnahme

Mindestens prüfen:

- [ ] iPhone / Safari oder WebKit-nahe Ansicht
- [ ] Android / Chromium, falls verfügbar
  - Automatisiert ergänzt: Chromium-Responsive-Audit über 320 / 375 / 390 / 820 / 1440 px; ersetzt keinen Test auf physischer Android-Hardware.
- [ ] Desktop Chromium (Windows)
- [ ] 320 px Breite
- [ ] 375 / 390 px Breite
- [ ] Tablet ca. 820 px
- [ ] Desktop ab 1440 px
- [ ] Portrait
- [ ] Landscape
- [ ] keine horizontalen Überläufe in Kernansichten
- [ ] zentrale Touchziele mindestens 44 × 44 CSS-Pixel
- [ ] sichtbarer Tastaturfokus
- [ ] Reduced Motion respektiert
- [ ] LRS-Modus bleibt ruhig und lesbar

---

# D. Offline-/PWA-Abnahme

- [ ] App einmal vollständig online laden
- [ ] App / PWA schließen
- [ ] Netzwerk deaktivieren
- [ ] App erneut öffnen
- [ ] „Heute“ funktioniert
- [ ] Lernen funktioniert
- [ ] Erfolge funktioniert
- [ ] Armee / Schlacht-Grundansicht funktioniert
- [ ] lokale Audio-/Wörterbuch-/OCR-Ressourcen funktionieren soweit vorgesehen
- [ ] Elternanleitung und Pädagogik sind offline lesbar
- [ ] kein Endlos-Ladezustand
- [ ] nach erneutem Onlinegehen kein Datenverlust

---

# E. Abschlussprüfung vor v1.0

Automatisiert – Snapshot für **v0.21.5 / Release-Commit `df7b9c5ee7553ebb2ae91573fd0c7933c9ace410`**:

- [x] vollständige CI grün
- [x] Browser-/WebKit-Smokes grün
- [x] Evidence-Core-Guard grün
- [x] Battle-Smoke grün
- [x] Security-/CSP-Smokes grün
- [x] Parent-Docs-/PDF-Test grün
- [x] Backup-/Restore-Browser-Smoke grün
- [x] Offline-/Service-Worker-Smoke grün
- [x] Family-Sync-Test grün
- [x] GitHub-Pages-Deployment grün
- [x] README, FINAL_AUDIT und App-Version stimmen überein

Diese Häkchen dokumentieren ausschließlich den genannten Release-Stand. Die folgenden praktischen Abnahmen bleiben bewusst offen und können nicht durch CI ersetzt werden.

Praktisch:

- [ ] Kind-End-to-End-Test ohne Hilfe bestanden
- [ ] keine fachliche Fehlbewertung beobachtet
- [ ] Eltern-End-to-End-Test bestanden
- [ ] mindestens ein echter OCR-Import geprüft
- [ ] Backup + Restore praktisch geprüft
- [ ] Produktiv-PWA praktisch offline geprüft
- [ ] keine offenen Release-Blocker

## Freigaberegel

**v1.0 kann freigegeben werden, wenn:**

1. kein fachlicher Release-Blocker offen ist,
2. die automatisierte Release-CI vollständig grün ist,
3. der Kind-End-to-End-Test ohne notwendige Erwachsenenhilfe im Kernablauf gelingt,
4. Eltern Testplanung, Vokabelprüfung und Backup selbständig durchführen können,
5. produktive PWA und Offline-Kernfunktionen praktisch geprüft wurden.

---

# Testprotokoll

| Datum | Tester / Rolle | Gerät / Browser | Bereich | Beobachtung | Schweregrad | Maßnahme | Erledigt |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

## Schweregrade

- **BLOCKER** – v1.0 darf nicht veröffentlicht werden
- **HOCH** – Kernablauf erheblich gestört; vor v1.0 beheben
- **MITTEL** – merkliche UX-/Verständnisstörung; bewusste Entscheidung erforderlich
- **NIEDRIG** – kosmetisch / Komfort; kann nach v1.0 folgen

## Ergebnis

- [ ] **Freigegeben für v1.0**
- [ ] **Nicht freigegeben – Blocker offen**

Freigabedatum:

Geprüfte Version / Commit:

Offene Restpunkte:


---

# G. Deutsch-v1-Freigabe

**Kanonische Quellen:** `docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`, `docs/project/DEUTSCH_WORTREICH_V1.md`, D-20260928-008, D-20260929-005.

Diese Sektion ist vor v1.0 verpflichtend. Ein deaktivierter Platzhalter oder reine Dokumentation genügt nicht.

## G1 – Fach und Klasse-1-Einstieg

Automatisierter Implementierungsstand v0.21.35: Paket C deckt die untenstehenden Klasse-1-Kernpfade technisch ab; die Checkboxen bleiben bis zur praktischen End-to-End-Abnahme auf realem Gerät bewusst offen.

- [x] Deutsch ist als eigenes Fach auswählbar
- [x] Fachwechsel vermischt keine Lernstände mit Englisch/Latein
- [ ] erste Klasse-1-Lektion startet mit Groß-/Kleinbuchstaben-Paaren und nicht mit einer Auswahlabfrage
- [ ] sichtbares Nachfahren geht beim selben Buchstabenpaar in freies Schreiben ohne sichtbare Vorlage über
- [ ] Groß-/Kleinbuchstaben werden dabei mit einem Laut/Phonemhinweis angeboten; auf iPhone und Android klingt der Laut tatsächlich kindgerecht und nicht wie ein bloßer Buchstabenname
- [ ] Buchstaben-/Graphemaufgabe funktioniert
- [ ] Laut–Buchstaben-Zuordnung funktioniert und die richtige Auswahl steht nicht systematisch an derselben Position
- [ ] erste Wörter können gelesen/geübt werden
- [ ] erste Wörter können produktiv geschrieben werden; vor der Antwort ist die Sollwortform verborgen und nur Audio bietet das Lernwort an
- [ ] einfache Sätze können geübt werden
- [ ] deutsche Aufgabentexte und Wörter können dort vorgelesen werden, wo Audio die Lösung nicht vorwegnimmt
- [ ] sichtbares Abschreiben bleibt klar als freiwillige Übung getrennt und erzeugt keine Rechtschreib-/Mastery-Evidenz

## G2 – Deutsche Bewertung

Automatisierter Implementierungsstand v0.21.36: Paket D ergänzt differenzierte Deutsch-Rechtschreibfehler, Wortstrukturmetadaten und gezielte Folgeübungen. Die praktische Bewertung der Bedienbarkeit und fachlichen Verständlichkeit bleibt offen.


- [x] Groß-/Kleinschreibung wird je Aufgabentyp fachlich korrekt behandelt
- [x] Rechtschreibaufgaben verlangen die definierte Sollschreibung
- [x] reine Lese-/Erkennungsaufgaben werden nicht künstlich zu Rechtschreibtests
- [ ] technische Satz-/Platzhaltervarianten werden nur bei fachlicher Gleichwertigkeit toleriert
- [ ] Lernwörter können Silben, Wortstamm, Wortfamilie und Rechtschreibfokus sinnvoll nutzen
- [ ] Groß-/Kleinschreibung, Buchstabenfolge, Wortstruktur und Satzkontext werden im Fehlerprofil getrennt geführt, ohne diagnostische Aussage
- [ ] „Bewertung prüfen lassen“ neutralisiert einen strittigen Versuch auch in Deutsch
- [ ] Elternentscheidung kann Variante freigeben, Sollinhalt korrigieren oder Systembewertung bestätigen
- [ ] „Vokabel überspringen“ verschiebt auch in Deutsch nur ans Ende derselben Session und bleibt neutral

## G3 – Das Wortreich

Automatisierter Implementierungsstand v0.21.37: Ein echter deutscher Phaser-4-Belagerungskampf ist implementiert. Der Test prüft `german / wordrealm`, iPhone-Darstellung, Eroberung, Ticketverbrauch, XP-Belohnung und unveränderte fachliche Mastery. Die praktische v1-Abnahme der Wirkung und Verständlichkeit bleibt offen.


- [x] eigener Deutsch-Spielbereich ist sichtbar
- [x] Lernmodus bleibt frei von Battle-Animation
- [x] eigene Burg-/Ritteridentität ist ohne reine Beschriftung erkennbar
- [ ] eigener Fortschritt startet klein und wächst aus tatsächlichem Lernfortschritt
- [ ] mindestens ein echter Belagerungskampf ist spielbar
- [ ] eigene Armee steht links, Kampfzone in der Mitte, Zielburg rechts
- [ ] gegnerische Burg reagiert sichtbar (z. B. Pfeile / Gegenfeuer / Verteidigung)
- [ ] Kampf bleibt kindgerecht ohne Verletzungs-/Gewaltdetails
- [ ] Gegner sind fiktional und nicht realweltlich codiert
- [ ] Kampfergebnis verändert Mastery, Spacing, Testbereitschaft und fachliche Bewertung nicht
- [ ] freiwilliges Üben erzeugt keine zusätzliche Tages-Kampfaktion

## G3b – Deutsch-Weltwahl Abenteuer / Kampf

Automatisierter Implementierungsstand v0.21.39: Profilerstellung, Persistenz, m/w/d,
Family Sync, Weltwechsel ohne fachlichen Reset, kampffreie Abenteueraktion und sechs
nicht-militärische Abenteuer-Fuchsstufen werden in CI/WebKit geprüft. Die praktische
Verständlichkeit auf echtem Gerät bleibt separat abzunehmen.

- [ ] neues Deutsch-Profil verlangt bewusst **Abenteuer** oder **Kampf**
- [ ] Wahl ist ohne Lesekompetenz über Vorlesen verständlich
- [ ] Männlich / Weiblich / Neutral-Divers sind auswählbar und bleiben nach Neustart erhalten
- [ ] bestehendes Deutsch-Profil bleibt nach Update auf Kampf / Wortreich
- [ ] Weltwechsel erhält Lernstand, Mastery, Spacing, Testbereitschaft und Jahresstufe
- [ ] Abenteuer zeigt sechs klar aufbauende, nicht-militärische Fuchsstufen
- [ ] Abenteueraktion öffnet keinen Battle-Screen
- [ ] Abenteuer und Kampf verbrauchen höchstens dieselbe eine Tages-Spielaktion
- [ ] Family Sync überträgt Weltwahl und Neutral/Divers zwischen Eltern- und Kindergerät
- [ ] Rückwechsel auf Wortreich stellt die Kampfpräsentation ohne Lernstandsverlust wieder her
- [ ] jede gewählte Welt zeigt eine nachvollziehbare Story vom Opening über sechs Kapitel bis zum Finale
- [ ] Storykapitel auf Hub/Karte/Kampf stimmen mit derselben Welt und Stufe überein
- [ ] Storytexte sind vorlesbar
- [ ] Weltwechsel bildet dieselbe Stufe auf das entsprechende Kapitel der Partnerwelt ab
- [ ] keine Kampfstory verwendet reale Länder, Völker, Religionen oder historische Konfliktparteien als Gegner

## G4 – Plattform / Release

- [ ] Kernpfad auf iPhone-Zielviewport praktisch geprüft
- [ ] Kernpfad auf Desktop praktisch geprüft
- [ ] Offline-/PWA-Grundfunktion für den Deutsch-Kern geprüft
- [ ] Deutsch-Audio praktisch geprüft
- [ ] automatisierte Fachtrennungs- und Bewertungsregressionen grün
- [ ] reale Kind-/Eltern-End-to-End-Abnahme für Deutsch durchgeführt

**Release-Regel:** Die fachlichen Punkte aus G1/G2 sowie mindestens ein funktionsfähiger Wortreich-Kampf aus G3 sind vor v1.0 verpflichtend. Eine Rückwirkung der Spielwelt auf fachliche Lernwerte ist ein Release-Blocker.


## H – Fachübergreifende Weltwahl Abenteuer / Kampf

Automatisierter Implementierungsstand v0.21.40: Englisch, Latein und Deutsch können pro aktivem Fach zwischen Abenteuer und Kampf wechseln; die vorbereitete Französisch-Architektur besitzt Voyage Français und eine fiktionale Gefährten-/Festungswelt. Französisch bleibt bis B-003 fachlich gesperrt.

- [ ] Englisch: Expedition und Kampf/Feldzug sind klar unterscheidbar
- [ ] Latein: zivile Entdeckungsreise und Legion/Kastelle sind klar unterscheidbar
- [ ] Französisch nach Fachfreischaltung: Voyage Français und fiktionale Kampfwelt sind klar unterscheidbar
- [ ] neue Profile verlangen für jedes aktive Fach eine bewusste Weltwahl
- [ ] Weltwechsel erhalten Mastery, Spacing, Testbereitschaft, Tagesziel und Jahresstufe
- [ ] Abenteueraktionen öffnen keinen Battle-Screen und verbrauchen höchstens dieselbe eine Tagesaktion
- [ ] Kampfvarianten verwenden nur fiktionale Gegner
