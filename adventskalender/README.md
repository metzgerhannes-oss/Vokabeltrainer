# Das verlorene Weihnachtslicht – Advent 2026

Eigenständiges Webprojekt. Keine Änderungen an der Vokabeltrainer-Anwendung oder am Badminton-Repository.

## Spielen
index.html über einen lokalen statischen Webserver oder einen eigenen statischen Hosting-Pfad öffnen. Vor dem 1. Dezember 2026 ist der Kalender gesperrt. Mit ?demo=1 können Erwachsene alle 24 Rätsel testen; der Testspielstand ist getrennt. Der normale Spielstand ist lokal im Browser gespeichert. Die Datumssperre dient der spielerischen Führung, nicht dem Schutz vor technischen Manipulationen.

Die integrierte SVG-Dorfansicht funktioniert ohne Bibliotheken und ohne gerenderte Medien. Die Kamera zoomt zum Haus, nach der Lösung öffnet sich die Tür und die Fenster leuchten. Nummern sind auch über große Schaltflächen erreichbar.

## Blender
Vorgesehen für Blender 4.2/4.5 LTS. Aus diesem Ordner auf einem Rechner mit Blender ausführen:

`blender -b -t 4 --python blender/create_village.py -- --scene-only`

Erzeugt die bearbeitbare Datei renders/winterdorf.blend mit 24 Häusern, Bäumen, Schnee, Licht, Kamera und Türscharnieren.

`blender -b -t 4 --python blender/create_village.py -- --day 1`

Rendert eine ca. 3 Sekunden lange Kamerafahrt und Türanimation. Für alle Tage statt --day 1 das Argument --all verwenden. Die erzeugten renders/door-XX.mp4 und renders/manifest.json neben index.html bereitstellen. Nur tatsächlich gerenderte Clips werden im Kalender geladen.

## Prüfstatus
24 eindeutige Türchen und Rätsel mit je 3 verschiedenen Antworten, JavaScript-Syntax geprüft. Blender-Rendering und Browser-End-to-End-Test stehen aus. Keine gerenderten Blender-Dateien enthalten. Kein Release und keine zusätzlichen GitHub-Actions eingerichtet.
