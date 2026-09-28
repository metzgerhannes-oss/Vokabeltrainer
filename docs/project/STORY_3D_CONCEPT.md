# 3D-Storyszenen – Konzept und technische Projektierung

Stand: 28.09.2026  
Status: **APPROVED_BACKLOG / noch nicht implementieren**  
Backlog: **B-013**  
Decision: **D-20260928-004**  
Verbindliche Leitplanken: `PRODUCT_DNA.md` P9, `VISUAL_DNA.md` §§ 4–9

## 1. Ziel

3D wird im Vokabeltrainer **nicht** zur allgemeinen Spielengine und nicht zum Lerninterface.
Es dient ausschließlich wenigen, kurzen, hochwertigen Story- und Übergangsmomenten im
Spielbereich.

Der normale Kampf bleibt 2D/2.5D in Phaser. 3D soll nur dort eingesetzt werden, wo eine
kurze Kamerafahrt, räumliche Enthüllung oder Inszenierung deutlich mehr Wirkung erzielt als
eine 2D-Sequenz.

Leitidee:

> **Phaser erzählt den Kampf. 3D inszeniert besondere Momente.**

Die 3D-Szene darf niemals Mastery, Testbereitschaft, Tagesziel, Battle-Ticket, Schaden oder
andere fachliche Werte berechnen oder verändern. Sie visualisiert ausschließlich einen bereits
durch die App bestimmten Zustand.

## 2. Geeignete Storymomente

### S1 – Festungsenthüllung
**Trigger:** Ein Test erhält erstmals eine sichtbare Testfestung.  
**Dauerziel:** 4–6 Sekunden.

Ablauf:
1. ruhige Landschaft / Weg im Vordergrund
2. kurze Kamerafahrt entlang der Marschroute
3. Festung erscheint hinter Hügel, Wald oder Felskante
4. Banner / Fahnen bewegen sich leicht
5. Kamerastopp auf klarer Zielansicht
6. Übergang zurück in die Armee-/Kampagnenansicht

Ziel: Das Kind versteht unmittelbar: **Das ist mein nächstes Ziel.**

### S2 – Festung erobert
**Trigger:** Testfestung wird erstmals bezwungen.  
**Dauerziel:** 4–7 Sekunden.

Ablauf:
1. Außenansicht der bereits beschädigten Festung
2. Tor öffnet sich bzw. eigenes Banner wird sichtbar
3. kurze Kamerafahrt Richtung Tor / Hof
4. warmes Licht statt Explosion
5. Ergebnistext erscheint erst nach Ende der Bewegung

Keine Gewaltinszenierung, keine sichtbaren Verletzungen, keine zerstörerische Nahaufnahme.

### S3 – Rang- oder Ausrüstungsaufstieg
**Trigger:** langfristiger Schuljahresfortschritt schaltet sichtbar neue Ausrüstung frei.  
**Dauerziel:** 3–5 Sekunden.

Ablauf:
1. Avatar / Einheit in ruhiger Hero-Pose
2. Kamera fährt leicht um die Figur
3. neues Ausrüstungsteil wird sichtbar
4. dezenter Licht-/Metalleffekt
5. Rückkehr zur Armeeansicht

Der Effekt belohnt **langfristigen Fortschritt**, nicht einzelne zufällige Aktionen.

### S4 – Neues Kampagnengebiet
**Trigger:** Übergang zu einer neuen größeren Kampagnenetappe.  
**Dauerziel:** 5–8 Sekunden.

Beispiele:
- neues Tal / Gebirge
- Küstenregion
- neue römische Provinz
- großer Fluss / Pass / Brücke
- Jahreszeitenwechsel als Kampagnenübergang

Die Kamera verbindet altes Gebiet und neues Ziel räumlich, ohne lange Cutscene.

### S5 – Jahresfestung / Schuljahresfinale
**Trigger:** langfristiges Jahresziel erreicht bzw. Finale sichtbar.  
**Dauerziel:** 8–12 Sekunden, bewusst die längste Ausnahme.

Möglicher Ablauf:
1. Blick über die gesamte Kampagnenlandschaft
2. Armee / Legion zieht im Vordergrund weiter
3. Kamera steigt leicht an
4. Jahresfestung erscheint
5. Abschlussbanner / Jahreserfolg
6. ruhiger Ausklang

Dies ist der einzige Moment, der klar „Finale“ wirken darf.

## 3. Nicht vorgesehen

3D wird ausdrücklich **nicht** eingesetzt für:

- aktive Vokabelabfragen
- Tageslernraum
- reguläre Wiederholungen
- normale Menünavigation
- jede einzelne Battle-Aktion
- dauerhafte frei begehbare 3D-Welt
- Echtzeit-Kampfsteuerung
- Loot-/Zufallssysteme
- lange Dialogsequenzen
- zwingende Storysequenzen ohne Skip-Möglichkeit

Damit bleibt die Lern-App schnell, ruhig und technisch beherrschbar.

## 4. Technische Architektur

### 4.1 Renderer-Trennung

Geplant ist ein eigenes Modul, beispielsweise:

`js/story-3d/story-scene-controller.js`  
`js/story-3d/story-scene-renderer.js`  
`js/story-3d/story-scene-assets.js`

Der Controller erhält nur einen **fertigen Darstellungszustand** aus der bestehenden App.

Beispiel:

```js
{
  sceneId: "fortress-reveal",
  subject: "english",
  campaignStage: "citadel",
  fortressId: "test_2026_10_14",
  heroStage: 3,
  armyStage: 4,
  season: "autumn",
  outcome: null,
  replayAllowed: true
}
```

Nicht an das 3D-Modul übergeben werden:

- Vokabelantworten
- Mastery-Berechnungen
- Scheduler-Entscheidungen
- Battle-Schadensberechnung
- sensible Profilinformationen, die für die Szene nicht benötigt werden

### 4.2 Rendering

Erster Kandidat: **Three.js** mit lokal ausgelieferten Modulen.

Assetformat:
- bevorzugt **glTF / GLB**
- Texturen möglichst komprimiert und für mobile Nutzung optimiert
- wiederverwendbare Modelle statt einer vollständigen Einzeldatei pro Szene
- getrennte Varianten für Low/Medium/High Quality nur, wenn Messungen dies rechtfertigen

Produktiv keine CDN-Pflicht. Engine und notwendige Loader werden lokal versioniert.

### 4.3 Szene als State Machine

Jede Storyszene folgt demselben Ablauf:

`idle → preload → enter → storyBeat → resolve → exit → return`

Pflicht:
- definierter Rücksprung in die bestehende App
- mehrfaches Öffnen darf keinen doppelten fachlichen Trigger auslösen
- Rendering darf abbrechen, ohne Datenzustand zu beschädigen
- bei Fehler sofortiger Fallback auf 2D/Standbild

## 5. Kamera und Bewegung

Ziel ist keine frei steuerbare 3D-Kamera, sondern kontrollierte filmische Bewegung.

Erlaubte Mittel:
- Dolly / sanfte Vorwärtsfahrt
- leichter Orbit um Avatar oder Festung
- Crane-Up für Enthüllungen
- sehr dezenter Kamerashake bei einem bereits fachlich bestimmten Ereignis
- Tiefenstaffelung mit Vorder-, Mittel- und Hintergrund

Nicht verwenden:
- hektische Handkamera
- schnelle 360°-Rotationen
- Motion-Blur als notwendiges Stilmittel
- starke Zoomsprünge
- dauerhaft bewegte Kamera hinter UI-Text

Alle Bewegungen müssen mit `prefers-reduced-motion` eine ruhige Alternative besitzen.

## 6. Art Direction

3D muss zur bestehenden `VISUAL_DNA.md` passen und darf keinen Fremdstil erzeugen.

### Allgemein
- stilisiert statt fotorealistisch
- klare Silhouetten
- warme, lesbare Beleuchtung
- reduzierte Materialkomplexität
- freundliche Abenteuerwelt
- keine düstere Gewaltästhetik
- keine grellen Arcade-/Neonfarben

### Englisch
- Naturgrün, Beige, Blau, Stein
- freundliche mittelalterlich inspirierte Kampagnenwelt
- Banner, Burgen, Wege, Hügel, Brücken

### Latein
- mediterrane Landschaft
- Sand, Terrakotta, Bronze, Olivgrün
- Kastell, Straße, Aquädukt, Signa
- keine bloß umgefärbte Englisch-Szene

### Französisch
Falls später Storymomente entstehen, eher räumliche Reise-/Ortsszenen als Kampf:
- Bahnhof
- Brücke
- Stadtplatz
- Flussufer
- Ankunft an einer neuen Etappe

### Deutsch Grundschule
Kein 3D-Battle. Falls überhaupt eingesetzt, nur sehr zurückhaltende Fuchs-/Lernwelt-Momente
und nur nach eigener späterer Entscheidung.

## 7. Asset-Pipeline

Vorgesehener Workflow:

1. Konzept / Storyboard
2. Modellierung und Rigging in Blender
3. Export als GLB
4. technische Optimierung
5. Import in isolierte Three.js-Szene
6. mobile Qualitätsprüfung
7. Fallback-Bild / optional vorgerendertes Video erzeugen
8. erst danach Integration in die App

Bevorzugt:
- modulare Burgteile
- wiederverwendbare Bäume/Felsen
- einheitliche Banner-Sockets
- austauschbare Wappen/Materialvarianten
- wenige, gut animierte Figuren statt großer 3D-Menschenmassen

## 8. 3D vs. vorgerendertes Video

Vor jeder produktiven 3D-Szene wird geprüft, ob echtes 3D einen Mehrwert gegenüber Video bietet.

**Echtzeit-3D bevorzugen**, wenn:
- Avatar/Ausrüstung dynamisch variiert
- Festungsstufe sichtbar variieren soll
- Jahreszeit oder Banner datengetrieben wechseln
- dieselbe Szene mehrfach mit unterschiedlichen Zuständen genutzt wird

**Vorgerendertes Video bevorzugen**, wenn:
- Szene immer identisch ist
- maximale Bildqualität wichtiger ist als Dynamik
- Geräteperformance sonst problematisch wäre
- die Asset-/Shader-Komplexität für wenige Sekunden unverhältnismäßig wäre

Damit ist Three.js kein Dogma, sondern ein Werkzeug für variable Storymomente.

## 9. Performance- und Ladeziele

Diese Werte sind Zielbudgets für den späteren Spike und müssen praktisch gemessen werden:

- Ziel: flüssige Darstellung auf aktuellen iPhones
- Mindestziel: stabile **30 FPS** während der eigentlichen Storybewegung
- bevorzugt: **60 FPS**, sofern ohne sichtbare Qualitätsverluste erreichbar
- Three.js-/Story-JS nur bei Bedarf laden, nicht im Lernstart
- Ziel für initiales 3D-JS-Paket: **≤ 750 KB komprimiert**
- Ziel für normale Storyszene beim Erstladen: **≤ 6 MB** komprimierte Szenenassets
- Jahresfinale als Ausnahme: höheres Budget nur nach praktischer Prüfung
- Auflösung / Pixel Ratio adaptiv begrenzen
- Partikel, Schatten und Postprocessing stufenweise reduzierbar

3D-Assets sollen nicht alle in den initialen Service-Worker-Shell-Cache aufgenommen werden.
Sie werden bei Bedarf geladen und anschließend lokal gecacht. Ohne vorhandenes Asset muss die
App weiterhin vollständig funktionieren.

## 10. Fallbackstrategie

Reihenfolge:

1. Three.js-Echtzeitszene
2. vorgerenderte Kurzsequenz, falls für diese Szene vorhanden
3. hochwertiges statisches / leicht animiertes 2D-Keyvisual
4. unmittelbare Rückkehr zur normalen Armee-/Ergebnisansicht

Ein fehlgeschlagener 3D-Start ist **kein Fehler des Lernablaufs**.

## 11. Bedienung

Jede Szene braucht:

- sichtbare oder spätestens nach kurzer Einblendung verfügbare Aktion **„Überspringen“**
- eindeutigen Rückweg
- optional **„Nochmal ansehen“**, aber niemals als Pflicht
- keine Interaktion, die das fachliche Ergebnis verändert
- keine versteckten Belohnungen innerhalb der Cutscene

Bei reduzierter Bewegung:
- keine längeren Kamerafahrten
- statische oder sehr langsam überblendete Keyframes
- keine starken Shakes

## 12. Daten- und Sicherheitsgrenze

Story-3D ist ein Darstellungsmodul.

Es darf:
- Scene-ID lesen
- visuelle Fortschrittsstufe lesen
- Fachwelt lesen
- festgelegtes Ergebnis darstellen

Es darf nicht:
- Lernfortschritt schreiben
- Mastery verändern
- Tests abschließen
- Noten interpretieren
- neue Battle-Aktionen erzeugen
- Family-Sync-Zustände verändern

## 13. Test- und Abnahmekriterien für einen späteren Spike

Zielgerät mindestens:
- iPhone-Viewport etwa 390×844
- Desktop ≥ 1100 px

Pflichtprüfungen:
- Szene startet nur im vorgesehenen Spielkontext
- Lernmodus lädt kein 3D-JS
- 3D-Fehler verändert keinen fachlichen Zustand
- Skip funktioniert jederzeit zuverlässig
- Ende kehrt exakt zum vorgesehenen Screen zurück
- kein doppelter Trigger nach Reload / Back / Replay
- `prefers-reduced-motion` wird eingehalten
- 30-FPS-Mindestziel im definierten Testgerät
- keine UI-Überlagerungen
- Fallback funktioniert offline
- 3D-Assets werden nicht unnötig beim App-Start geladen

## 14. Projektphasen

### Phase 0 – jetzt
**Nur Projektierung. Keine Implementierung.**

Ergebnis:
- dieses Konzept
- Backlog B-013
- Architekturgrenze in D-20260928-004

### Phase 1 – späterer Technik-Spike
Eine einzige Szene: **Festungsenthüllung Englisch**.

Ziel:
- Three.js lokal einbinden
- eine stylisierte Festung
- Landschaft + Kamera
- 4–6 Sekunden
- Skip + Reduced Motion + Fallback
- Performance messen

### Phase 2 – visuelle Abnahme
Nur weiter, wenn die Szene gegenüber 2D erkennbaren Mehrwert bietet.

Entscheidung:
- Three.js fortführen
- auf Video wechseln
- 3D verwerfen

### Phase 3 – Wiederverwendbares Storysystem
Erst nach erfolgreichem Spike:
- gemeinsame Camera-Rigs
- wiederverwendbare Umgebungsassets
- Avatar-/Banner-Varianten
- Story-Scene-Registry

### Phase 4 – besondere Szenen
Danach gezielt:
- Festung erobert
- Rangaufstieg
- neues Kampagnengebiet
- Jahresfinale

## 15. Offene Entscheidungen für später

Vor Implementierung bewusst erneut entscheiden:

- Three.js vs. vorgerendertes Video für die erste Szene
- genauer Blender-/Asset-Workflow
- Texture Compression
- Schattenmodell / Beleuchtung
- Qualitätspresets
- Download-/Cache-Strategie für große Assets
- ob Avatar-Rig und Battle-Avatar dieselbe Assetbasis verwenden
- ob Jahresfinale datengetrieben oder bewusst fest inszeniert wird

Diese Punkte werden **nicht** jetzt vorentschieden, solange kein gemessener 3D-Prototyp vorliegt.

## 16. Zusammenfassung

3D ist ein optionaler **Cinematic Layer** oberhalb der bestehenden App.

- Lernen bleibt 2D und fokussiert.
- Battle bleibt Phaser 2D/2.5D.
- Three.js darf später besondere Storymomente inszenieren.
- Fachliche Logik bleibt außerhalb des Renderers.
- Jede Szene ist kurz, überspringbar und besitzt einen sicheren Fallback.
- Ein einziger Festungsenthüllungs-Spike entscheidet später, ob das Konzept technisch und
  visuell weiterverfolgt wird.
