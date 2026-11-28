# Viktorianisches Wimmeldorf – Umsetzung v1

Designfreigabe 28.11.2026: die original generierte detailreiche viktorianische Weihnachtsdorf-Illustration (1672×941), warme Gaslaternen, verschneite Ziegel-/Fachwerkhäuser, Markt, Stall, Bahnhof, Teich und Weihnachtsbaum. Keine Neuzeichnung in vereinfachtem 3D.

## Produkt
- Eigene Ansicht via „Dorf ansehen“, Rückweg zum Kalender, keine Änderung am täglichen Rätselablauf.
- 24 unregelmäßige Aufdeckungsflächen, nicht 24 neue Bilder. Sichtbar ausschließlich nach gelöstem Kapitel UND serverseitig freigeschaltetem Datum. Vor dem 1. Dezember Schneenebel. Datum aus /calendar-state.json (Europe/Berlin), Spielstand winterdorf-2026-live. Keine Demo-Freischaltung in Produktion.
- Gesamtansicht, Zoom 1–3×, verschieben mit Touch, „Neuste Entdeckung“, aufgedeckte Hotspots mit kleinen wiederholbaren Animationen. Bei reduzierter Bewegung statische Darstellung.
- 4 Viertel in 6 Schritten, Karte wächst auch bei nachgeholten Tagen; Finale bleibt abhängig von allen 23 Vorgängern.
- Bild als village.webp (Originalgröße, ca. 858 KB), relativ zu village.html. Kein zusätzlicher Dienst, keine Datenbank.

| Tag | Entdeckung | Koordinaten (1000×563) | Effekt |
|---|---|---|---|
| 1 | Spielzeugmacher | 90,248 | Fensterlicht |
| 2 | Riesen-Zahnrad | 175,225 | Funken |
| 3 | Spielzeugeisenbahn | 265,272 | Dampf |
| 4 | Wichtelunterhose | 80,340 | flatternder Bildausschnitt |
| 5 | Schneeballschlacht | 208,348 | Schneeballflug |
| 6 | Pups-Schlitten | 238,449 | Pupswolke, Ton |
| 7 | Gaslaterne | 57,77 | Licht |
| 8 | Rodelwiese | 294,105 | Schneeflug |
| 9 | Giebelhaus | 405,168 | Rauch |
| 10 | Dampflok | 462,66 | Dampf |
| 11 | Musikpavillon | 365,252 | Sternchen |
| 12 | Alte Brücke | 453,318 | Licht |
| 13 | Eis-Rutscher | 664,407 | Wackler |
| 14 | Entenparade | 771,408 | Wackler |
| 15 | Schneemann | 796,475 | Karottenwackler |
| 16 | Rentier | 910,395 | Wackler |
| 17 | Rentierstall | 936,283 | Pups, Ton |
| 18 | Zuckerbäckerei | 785,262 | Geschenkewackler |
| 19 | Geschenketurm | 702,310 | Wackler |
| 20 | Kapelle | 791,148 | Fensterlicht |
| 21 | Rathausuhr | 643,126 | Sternchen |
| 22 | Hirsch | 938,75 | Sternchen |
| 23 | Weihnachtssänger | 576,234 | Licht |
| 24 | Weihnachtsbaum | 562,151 | Sternenfinale |

## Integration / Abnahme
1. Bilddatei und village.html unter adventskalender/village/ bereitstellen. Lokale vollständige Designvorschau mit Tagesschieber ist getrennt von Produktion.
2. Worker-Routen /village/ und /village/village.webp hinzufügen; Kalenderbutton dorthin verlinken. Keine Änderung an Datumssperre oder Video-Routen.
3. Prüfen: Fortschritt 0, 1, 6, 12, 23, 24; zukünftige Hotspots unsichtbar; Bildauflösung, Zoom, Rückkehr, Ton-Stummschaltung; iPhone und Desktop.
4. Wimmelbild-Effekte sind bewusst kleine 2D-Overlays und Bildausschnittbewegungen, keine komplett neu gezeichneten Charakter-Cutscenes. Weitere individuelle Bewegungen nach visueller Abnahme.
5. Veröffentlichung erst nach bestätigtem Bildtransfer und erfolgreichem Browsercheck. Die 24 Kapitelvideos bleiben unabhängig.

Status: Design freigegeben; lokaler klickbarer Prototyp mit Originalgrafik erstellt und Chromium-Mobiltest durchgeführt (0/6/24, Zoom, Hotspots, keine JS-Fehler). Bildtransfer aus der lokalen ChatGPT-Dateiumgebung in GitHub steht aus.
