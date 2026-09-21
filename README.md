# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Aktueller Stand

App-Version: **v0.18.5**

Das Projekt wurde am 20.09.2026 aus `JohannasGartenwelt/vokabeltrainer` in dieses eigenständige Repository migriert. Produktentscheidungen richten sich verbindlich nach [PRODUCT_DNA.md](PRODUCT_DNA.md).

Die produktive Family-Sync-Infrastruktur nutzt dasselbe Supabase-Projekt wie Johanna's Gartenwelt. Die kanonische Backend-/Recovery-Quelle liegt im Repository `JohannasGartenwelt` unter `supabase/`; dieses Repository enthält nur die Vokabeltrainer-spezifischen Anwendungssourcen und lokale Referenzmigrationen.

## v0.18.5 – feste Camden-Town-Lehrwerksbibliothek

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
