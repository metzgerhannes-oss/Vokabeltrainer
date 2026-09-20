# Vokabeltrainer

Eigenständige Web-App für adaptives Vokabellernen mit Spaced Retrieval, konservativer Mastery-Logik und LRS-Unterstützung.

## Aktueller Stand

App-Version: **v0.10.0**

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
