# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Aktueller Stand

App-Version: **v0.17.1**

Das Projekt wurde am 20.09.2026 aus `JohannasGartenwelt/vokabeltrainer` in dieses eigenständige Repository migriert. Produktentscheidungen richten sich verbindlich nach [PRODUCT_DNA.md](PRODUCT_DNA.md).

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
