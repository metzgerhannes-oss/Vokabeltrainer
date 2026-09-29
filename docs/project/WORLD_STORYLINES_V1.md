# Welt-Storylines V1

**Status:** LOCKED für v0.21.40  
**Decision:** D-20260929-004  
**Bezug:** D-20260929-001, D-20260929-002, PRODUCT_DNA.md, VISUAL_DNA.md, B-017

## Grundsatz

Jedes unterstützte Fach besitzt zwei eigenständige Motivationswelten: **Abenteuer** und **Kampf**.
Beide Welten haben einen vollständigen erzählerischen Bogen vom Einstieg bis zum Jahresfinale.
Die Story ist reine Präsentation. Sie darf Mastery, Spacing, Testbereitschaft, Bewertung,
Tagesziel, Anzahl der Tagesaktionen oder fachliche Evidenz niemals verändern.

Der fachliche Jahresfortschritt bestimmt nur, welches Storykapitel sichtbar wird. Beim Wechsel
zwischen Abenteuer und Kampf bleibt Stufe N auf Stufe N; fachliche Daten werden nicht
zurückgesetzt oder umgerechnet.

## Verbindliche Struktur jeder Welt

1. **Opening** – Warum beginnt die Reise/Kampagne?
2. **Kapitel 1** – erste Station / erster Außenposten
3. **Kapitel 2** – Erweiterung der Welt
4. **Kapitel 3** – neues Hindernis bzw. neue Entdeckung
5. **Kapitel 4** – Wendepunkt / besondere Figur oder Erkenntnis
6. **Kapitel 5** – Vorbereitung des Abschlusses
7. **Kapitel 6** – Jahresziel
8. **Finale** – Abschluss und Rückblick auf den eigenen Lernweg

Alle Storytexte sind vorlesbar. Kampfwelten verwenden ausschließlich fiktionale Gegner und
fiktionale Konflikte. Reale Länder, Völker, Religionen oder historische Konfliktparteien
dürfen nicht als Feindbilder auftreten.

## 1. Englisch

### Abenteuer – The Northstar Expedition

**Leitidee:** Eine unvollständige Karte führt das Expeditionsteam über sechs Stationen zum
Goldenen Horizont. Lernen macht die Karte Schritt für Schritt lesbar.

**Bogen:** Basislager → Aussichtspunkt → Flussquerung → Höhenstation → Sternwarte →
Goldener Horizont.

**Finale:** Die vollständig lesbare Karte wird zum Tagebuch des Lernjahres.

### Kampf – The Northstar Campaign

**Leitidee:** Die Nordstern-Garde zieht gegen sechs vollständig fiktionale Festungen der
Nebelwacht. Jede Spielaktion wird ausschließlich durch bereits erreichten Lernfortschritt
freigeschaltet.

**Bogen:** Nebelvorposten → Wachturm → Grenzfestung → Felsenzitadelle → Hauptfestung →
Festung am Nordstern.

**Finale:** Die eroberten Festungen bleiben als sichtbare Chronik des Lernjahres.

## 2. Latein

### Abenteuer – Iter Romanum · Die Karte der sechs Wege

**Leitidee:** Eine junge Reisegruppe ergänzt eine alte mediterrane Karte anhand von
lateinischen Textspuren, Formen und Bedeutungen.

**Bogen:** Via Prima → Forum → Aquädukt → Bibliothek → Hafen → Magna Via.

**Finale:** Aus einzelnen Sprachspuren ist eine lesbare Karte des Lernjahres geworden.

### Kampf – Legio Lucis · Die sechs Kastelle

**Leitidee:** Eine vollständig fiktionale Legion des Lichtzeichens sichert eine Route gegen
die Schattenstandarte. Keine realen historischen Gegner.

**Bogen:** Castra Prima → Turris Vigiliae → Castellum Limitis → Castellum Montis →
Castellum Provinciae → Castrum Magnum.

**Finale:** Die sechs Kastelle bilden das sichtbare Protokoll der Jahresentwicklung.

## 3. Deutsch

### Abenteuer – Die Reise zum Wortschatz-Horizont

**Leitidee:** Der Fuchs findet eine Karte mit sechs goldenen Blättern. Buchstaben, Wörter,
Silben, Sätze und Geschichten lassen die Blätter nacheinander erscheinen.

**Bogen:** Buchstabenpfad → Wörterbrücke → Silbenwald → Leseturm → Geschichtenhain →
Wortschatz-Horizont.

**Finale:** Die Karte zeigt, wie aus einzelnen Buchstaben ein ganzer Wortschatz gewachsen ist.

### Kampf – Das Wortreich · Die Krone der sechs Burgen

**Leitidee:** Die Wortkrone ist in sechs Zeichen geteilt. Der Fuchs führt das Ritterheer zu
sechs Burgen, die jeweils ein Kronenzeichen bewahren.

**Bogen:** Holztor von Fuchshain → Wachturm der Silben → Mauerburg → Höhenburg →
Königsburg → Jahresfestung.

**Finale:** Die Wortkrone wird zum Symbol des selbst erworbenen Wissens. Sie ist keine Beute.

## 4. Französisch

### Abenteuer – Voyage Français · Le Carnet des Lumières

**Leitidee:** In einem Reisetagebuch fehlen sechs Seiten. Jeder erreichte Ort füllt eine
weitere Seite mit Sprache und Erinnerungen.

**Bogen:** Gare Claire → Pont des Mots → Belle Place → Jardin des Sons →
Rive des Histoires → Horizon Français.

**Finale:** Das vollständige Reisetagebuch dokumentiert das Lernjahr.

### Kampf – Les Compagnons de Lumière · Die sechs Festungen

**Leitidee:** Die Gefährten des Lichts sammeln sechs Lichtzeichen aus vollständig fiktionalen
Festungen der Garde des Brumes. Keine realen Kriegsgegner oder historischen Konflikte.

**Bogen:** Fort Clair → Tour Lumière → Bastion des Fleurs → Citadelle Verte →
Fort du Soleil → Grande Forteresse.

**Finale:** Die sechs Lichtzeichen machen den eigenen Lernweg sichtbar.

## Runtime

Kanonische Runtime-Daten liegen in `js/world-story.js`.

Die Story wird verwendet in:

- Abenteuer-Hub: aktuelles Kapitel + Vorlesen
- Kampagnen-/Reisekarte: Kapitel je Ziel + Vorlesen
- Kampfansicht: kampfspezifisches Kapitel + bestehende Funktion „Geschichte hören“
- Jahresfinale: eigenes Finale nach Abschluss der letzten Stufe

Kein Storymodul darf fachliche Lernwerte schreiben.
