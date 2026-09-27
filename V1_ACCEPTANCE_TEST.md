# V1 Acceptance Test

Stand: 27.09.2026 · Basis: v0.21.21 · Release-Kandidat: stabiler Tagesfortschritt über Updates

Ziel dieses Dokuments ist die verbindliche praktische Abnahme vor v1.0.
Der Test ergänzt die automatisierten CI-, Browser-, Security- und Fachtests.
Ein grüner automatisierter Testlauf ersetzt diesen Praxistest nicht.

Zusatz aus v0.21.12: Im Elternprofil praktisch prüfen, dass **Lesen**, **Rechtschreiben** und **Kurze Einheiten** unabhängig speicherbar sind. Ein Profil nur mit Leseunterstützung darf nicht automatisch die Tageslast verkleinern; ein Profil nur mit Rechtschreibunterstützung muss im Tageslernweg einen echten Schreibabruf erhalten. Nach Family Sync muss dieselbe Einstellung auf dem zugeordneten Kindergerät ankommen.

Zusatz für v0.21.13: Auf einem iPhone prüfen, dass Avatarbild, Stufen-/Teststatus und „Was steht heute an?“ klar untereinander liegen und der dunkle Statusblock das Avatarbild nicht überdeckt.

Zusatz für v0.21.14: In Armee- und Angriffsszene prüfen, dass die eigene Seite mit dem **Profilnamen** und das Ziel mit **„Test N“** beschriftet ist. Die generischen Bildlabels „Deine Armee“ und „Ziel“ dürfen nicht mehr nötig sein; der Fokusmodus muss die beiden Banner klar lesbar erhalten.

Zusatz für v0.21.15: Auf dem iPhone prüfen, dass das Kampagnenbild vollständig sichtbar endet und die helle Karte mit „Angriff gesperrt“ **mit erkennbarem Abstand darunter** beginnt. Profilname und „Test N“ müssen wie Banner/Schilder wirken und dürfen nicht als weiße Pillen erscheinen.

Zusatz für v0.21.16: Wird ein zukünftiger Test vor seinem Termin durch einen neuen Test ersetzt, darf die alte verwaiste Festung die Nummer nicht erhöhen; der verbleibende erste reale Test muss als **„Test 1“** erscheinen.

Zusatz für v0.21.17: In Armeeübersicht und Angriffsszene prüfen, dass Profilname und Testziel **oben im Bild auf horizontalen Pergamentbannern** stehen, jeweils mit kleinem farbigem Heraldik-Schild und waagerechter Zierstange wie in der freigegebenen Referenz. Es dürfen keine stehenden Feldstandarten mehr erscheinen. Der Abstand zur hellen Missionskarte und die korrekte Testnummerierung bleiben unverändert.

Zusatz für v0.21.19: Zwei einmalige Tests für dasselbe Fach an unterschiedlichen zukünftigen Daten anlegen, wobei der zweite Test **vor Erreichen des ersten Termins** erfasst wird. Auf „Heute“, in der Testbereitschaft und in der Armee muss weiterhin der **frühere Test** erscheinen. Der spätere Test muss gespeichert bleiben und darf den ersten weder löschen noch ersetzen. Dies auch einmal mit demselben Lehrwerksabschnitt sowie mit manueller/OCR-Erfassung prüfen.

Zusatz für v0.21.20: Die Schlacht auf iPhone/iPad öffnen. Sie muss **sofort die gesamte App-Fläche belegen**, die untere Hauptnavigation darf nicht sichtbar sein. Armeestärke, Testfestung, Verteidigung und Rang/Ausrüstung müssen **außerhalb des Bildes** liegen; auch Taktik und Hauptaktion dürfen das Kampagnenbild nicht verdecken. Das zusätzliche Festungs-/Rang-Badge im Bild darf in der gemalten englischen Szene nicht erscheinen.

Zusatz für v0.21.21: Im Tageslernweg mindestens zwei Vokabeln fachlich richtig und ohne Hilfe aktiv abrufen, anschließend einen simulierten/realen App-Update-Reload durchführen. Die Anzeige `X / N erledigt` darf nicht auf `0 / N` zurückspringen. Beim einmaligen Übergang von einer alten Versionssignatur dürfen nur heutige unabhängige korrekte aktive Abrufe rekonstruiert werden; Recognition/Hilfen, assistierte Antworten und Fehler dürfen den Zähler nicht erhöhen.

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
- [ ] normalerweise 5–7 neue Wörter pro Tag
- [ ] ungefähr 10–12 Kontakte als Normalbereich
- [ ] bei Rückstand steigt das Pensum plausibel
- [ ] bei Vorsprung sinkt das Pensum plausibel
- [ ] maximal 7 neue Wörter pro Tag
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
