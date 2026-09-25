# Finales Audit

Stand: 25.09.2026 · App v0.19.10

## Ergebnis

- v0.18.60 härtet primär den Release-Prozess: deterministischer App-Ready-Zustand, parallele CI-Gates, reduzierte Draft-PR-CI, produktiver Post-Deployment-Smoke sowie reproduzierbare Supabase-Migrationen und Parent-Invite-Rate-Limits
- fachliche Lernlogik, Mastery, Leitner, Spacing und Kampfrechnung werden durch diesen Hardening-Release nicht verändert

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
- Tagespensum: normalerweise 5–7 neue Vokabeln und etwa 10–12 Kontakte; täglich dynamisch aus Restlernstand, Testabstand und Unsicherheiten neu berechnet (Vorsprung bis ca. 8 Kontakte, Rückstand bis ca. 14, max. 7 neue Wörter). Letzter Tag vor dem Test wird bei ausreichendem Vorlauf für Wiederholung reserviert; Testtag führt keine neuen Wörter ein.
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
