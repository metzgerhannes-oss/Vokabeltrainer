# Finales Audit

Stand: 21.09.2026 · App v0.18.3

## Ergebnis

Der aktuelle Stand ist technisch und fachlich für den realen Kind-End-to-End-Test freigegeben.
Die automatisierte CI muss für den Release-Commit vollständig grün sein. Ein grüner CI-Stand
ersetzt nicht den praktischen Test mit einem Kind ohne verbale Hilfestellung.

## Release-Blocker geprüft

### Fachliche Vokabelkorrektheit

- zentrale, unveränderliche Question-/Sollantwort-Snapshots
- Set-, Vokabel- und Sense-Identität werden vor der Bewertung geprüft
- falsche Wort↔Bedeutung-Zuordnungen aus OCR werden vor dem Lernen durch Paarprüfung blockiert
- Lehrwerks-/Set-Formulierungen und zulässige Sense-Antworten bleiben nachvollziehbar getrennt
- Apostrophe und diakritische Zeichen werden im Schreibmodus orthographisch streng bewertet
- semantisch richtige Antworten mit Schreibfehler werden fachlich differenziert behandelt
- Ergebnisübersicht zeigt Frage, eigene Antwort, erwartete Antworten und Bewertung

### Lernprozess

- verbindliche Reihenfolge: Erfassen → prüfen → kennenlernen/abschreiben → aktiv abrufen → verteilt wiederholen → nachhaltig meistern
- Erstkontakt enthält Abschreiben, Abdecken, Erinnern, Vergleichen und Blockabruf
- Hinweise zählen nicht wie unabhängige Abrufe
- Fehler werden erneut geplant; Mastery verlangt mehrere unabhängige Abrufe über mehrere Tage
- Testchecks verändern Mastery und Intervalle nicht
- fokussierte Abfrage ohne Kampagne, globale Navigation oder bewegte Fortschrittsanzeige

### Kind-/Eltern-Rollen

- Kindmodus ist der Startzustand
- Kind verwaltet keine Lernsets, OCR-Freigaben, Testumfänge, Profile, Lehrwerke oder Backups
- offene Erwachsenenaufgaben werden dem Kind nur als verständlicher Status angezeigt
- Elternbereich ist ein bewusster Rollenwechsel
- Hilfe ist rollenabhängig
- Lernprofile können in der Kinderansicht direkt und eindeutig gewechselt werden

### Schlachtmodus / Gamification

- Schlacht ist ein separater Erlebnisbereich nach einer abgeschlossenen Lerneinheit
- Angriffe sind begrenzt und werden als Belohnung freigeschaltet
- Animationen, Einheiten, Festungen, Jahreszeiten, Rang und Ausrüstung liegen außerhalb der Abfrage
- Bosskämpfe, Spezialangriffe und Story verändern keinen fachlichen Lernstand
- Festungen fallen ausschließlich an den definierten Lernfortschrittsschwellen
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
- sensible Family-Sync-RPCs sind über den Supabase-Pre-Request-Hook rate-limitiert

### PWA / Offline / Deployment

- versionsgetrennter App-Shell-Cache
- langlebiger OCR-/Wörterbuch-Ressourcencache
- Service Worker aktualisiert installierte Apps mit kontrolliertem einmaligem Reload
- Chromium-Service-Worker-/Offline-Smoke
- WebKit/iPhone-Smokes für Shell, Lernen, Hilfe, OCR, Erstkontakt und Schlacht
- Battle-Saisontest ist nicht mehr auf einen bestimmten Kalendermonat fest verdrahtet
- der eigene GitHub-Pages-Workflow deployt nur nach erfolgreichem Vokabeltrainer-CI und checkt exakt den getesteten Commit aus
- GitHub Pages ist auf „GitHub Actions“ umgestellt; der Produktions-Deploy wird damit ausschließlich nach erfolgreichem Vokabeltrainer-CI ausgelöst

## Audit-Korrekturen v0.17.1

1. **Datensparsamkeit im Freundschaftsduell:** Profilname sowie unnötige Detailwerte wurden aus neuen Herausforderungscodes entfernt. Alte Codes bleiben lesbar, der darin enthaltene Name wird nicht mehr übernommen.
2. **Zeitstabiler Battle-Test:** Der Saisontest ermittelt Frühling/Sommer/Herbst/Winter dynamisch statt dauerhaft „Herbst“ zu erwarten.
3. **Accessibility:** Schlachtfeld und Boss-Fortschritt wurden expliziter beschriftet.
4. **Testhärtung:** Der Hilfe-Test prüft nun auch Browser-Konsole/CSP-Fehler.
5. **Dokumentationsdrift:** README und finales Audit müssen per Preflight dieselbe App-Version wie der Code tragen.

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
- Erstkontakt: versteht es Abschreiben → Abdecken → Erinnern → Vergleichen?
- normale Abfrage: versteht es Fehlerfeedback und „Weiter“?
- Abschluss: findet und versteht es die Ergebnisübersicht?
- Belohnung: versteht es, dass eine Schlacht freigeschaltet wurde?
- Schlacht: findet es Angriffsart, Vollbild und Ergebnis ohne Hilfe?
- Rückweg: kommt es selbständig zu Heute/Lernen zurück?
- kritisch: erster Fehlklick, Pause >5 Sekunden, Zurückspringen oder Nachfrage werden notiert.
