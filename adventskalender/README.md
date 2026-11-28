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

## Interaktive Alpenlandschaft
Das Blender-Skript erzeugt echte Geometrie für 24 Fachwerkhäuser mit individuellen Türen, Bergkulisse, verschneiten Wald, gepflasterte Wege, Kirche, Eisfläche, Brücke, Weihnachtsbaum, Geschenke und Laternen. Wiederholte kleine Landschaftselemente werden nach Material zu Meshes zusammengefasst. Die Webanwendung animiert Schnee, Rauch, Lichter und Türen in Echtzeit. Der GLB-Workflow prüft alle 24 Türscharniere, Landschaftsobjekte und eine Größenobergrenze von 20 MiB vor der Veröffentlichung. Optionale MP4-Renderings werden nur manuell ausgelöst. Der bisherige SVG-Modus bleibt als Fallback erhalten.

## Blender-Kino (neue Animationsgeneration)
`cinema/animate.py` erzeugt 24 individuelle animierte Szenen mit einem hierarchisch gelenkigen Wichtel, Kamera- und Objekt-Keyframes, gerundeten Meshes, Materialien, Lichtern, Effekten und Sternbelohnung. Blender 4.5 LTS exportiert jeweils eine GLB-Datei samt Animation und Kamera; die App spielt die exportierten Tracks per AnimationMixer ab. Keine Videos, kein externer Animationsdienst. Der Workflow veröffentlicht das Manifest und die 24 Dateien gemeinsam erst nach einer vollständigen Dateiprüfung. Vorhandene Szenen dienen nur als beschrifteter Fallback, bis das Bundle verfügbar ist. Jeder Clip wird erst beim Öffnen geladen und beim Verlassen freigegeben. Test- und Echtspielstand bleiben getrennt. Keine Änderungen an Badminton oder dem Hauptzweig.
