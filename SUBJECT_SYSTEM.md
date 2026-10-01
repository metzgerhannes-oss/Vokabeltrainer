# Vokabeltrainer – generisches Fachsystem

Fachlich zuletzt geprüft: 01.10.2026 · Gültig für aktuellen Stand: ja

Punkt 2 des Pre-v1-Fahrplans macht Fremdsprachen zu Konfiguration statt Sonderlogik.

## Grundsatz

Ein neues Fach wird in `SUBJECT_META` beschrieben. Datenmodell, Profile, Lehrwerke, Lernsets, Tests, Lernfortschritt und Navigation dürfen nicht auf feste Fachlisten wie `['english','latin']` angewiesen sein.

Konfiguriert werden pro Fach:

- sichtbarer Name und Kürzel
- Aliasnamen für CSV/Import
- BCP-47-Sprachcode für Sprachausgabe
- Tesseract-Sprachcode für OCR
- Import-/Lexemprofil
- optionale Capabilities, z. B. Latein-Grammatik
- Kampagnenbeschriftung und Ränge

## Aktueller Stand

**Englisch**, **Latein**, **Deutsch** und **Französisch** sind produktiv aktiv.

**Französisch** ist ab v0.21.53 fachlich freigeschaltet. Der frühere OCR-Blocker ist beseitigt:
`ocr/lang/fra.traineddata` liegt lokal im Projekt und ist auf den offiziellen
`tesseract-ocr/tessdata_fast`-Stand `87416418657359cb625c412a48b6e1d6d41c29bd`
gepinnt (Git-Blob `d9e2b2160be0d1ca3b8f1bf2730fae476ef3b4a6`, 1.130.365 Byte).

Für Französisch sind verbindlich:

- `speechLang: fr-FR`
- `ocrLang: fra` mit lokaler OCR-Ressource
- moderne Importlogik statt Latein-Sonderbehandlung
- französische Funktionswörter für OCR-/Textheuristik
- Akzente bleiben Teil der Lexemidentität und der fachlich richtigen Zielschreibung
- produktive französische Zielantworten nutzen `strictTermOrthography`: Akzente und Apostrophe werden nicht still als richtig gewertet; typografische Apostrophvarianten werden technisch normalisiert
- schulbuchseitige Formen/Varianten werden ausschließlich über explizite `acceptedTerms`/Sense-Daten akzeptiert; die Bewertung erfindet keine Varianten durch Slash-, Komma- oder Flexionsheuristiken
- Groß-/Kleinschreibung bleibt bei Französisch tolerant, sofern sie nicht fachlich als eigener Zielunterschied modelliert ist
- `fr-FR` wird für Lernwort-Audio, Hören, Diktat und Korrektur-Audio verwendet
- normale Retrieval-/Spacing-/Mastery-Logik bleibt fachübergreifend; Französisch erhält keine künstliche Sonder-Mastery
- Lehrwerk/ISBN, Tests, Notenskala, Bibliothek und Lernstände verwenden dasselbe generische Datenmodell
- `Voyage Français` und die fiktionale Festungswelt sind über die gemeinsame Weltwahl verfügbar

Explizit unbekannte Fachwerte aus Importen werden verworfen statt still zu Englisch umgedeutet. Fehlende Fachangaben dürfen weiterhin auf das aktuell gewählte Fach zurückfallen.

## Deutsch vor v1.0

**Deutsch ist ein verpflichtender Bestandteil des v1.0-Scopes.** Es nutzt die gemeinsame Fachinfrastruktur, ist fachlich aber kein gewöhnliches Fremdsprachen-Vokabelmodul.

Paket-B-Stand ab v0.21.33:

- sichtbarer Fachname: `Deutsch`
- `speechLang: de-DE`
- `ocrLang: deu`
- eigene Capability für Schriftspracherwerb / native Literacy
- eigene Kompetenzdimensionen gemäß `docs/project/DEUTSCH_GRUNDSCHULE_1_4_EVIDENZKONZEPT.md`
- gemeinsame Infrastruktur für Profile, Tests, Sync, Audio und Spielanbindung nur dort wiederverwenden, wo sie fachlich passt
- erste native Aufgabentypen für Hören/Erkennen und Lernwort-Schreiben sind aktiv; Buchstaben, Laut–Schrift, weiterführendes Lesen und Satzproduktion folgen in Paket C/D
- eigene Spielwelt `Das Wortreich` gemäß `docs/project/DEUTSCH_WORTREICH_V1.md`

Deutsch darf nicht dadurch „generisch“ gemacht werden, dass fremdsprachige Übersetzungs-Mastery unverändert auf Lesen, Schreiben oder Rechtschreibung übertragen wird. Deshalb speichert Paket B eigene Literacy-Evidenz pro Lernwort (`recognized`, `decoded`, `fluency`, `meaning`, `phonologicalSpelling`, `orthographicSpelling`, `dictation`, `sentenceUse`).

## Capabilities statt Fachabfragen

Sprachspezifische Funktionen werden als Fähigkeit modelliert:

- `hybridDictionary`: aktuell Englisch
- `latinGrammar`: Latein
- `extraIdentity`: Latein, wenn Zusatzformen ein Lexem disambiguieren
- `strictTermOrthography`: Französisch, wenn produktive Zielantworten Akzente/Apostrophe exakt erhalten müssen

Dadurch muss z. B. Französisch nicht mit neuen `if (subject === 'french')`-Blöcken ergänzt werden.

## Pädagogische Leitplanke

Retrieval Practice bleibt fachübergreifend der Kern. Forschung zeigt den Nutzen von Retrieval auch beim Lernen französischer L3-Vokabeln; die Fachgenerik verändert daher nicht Mastery, Spacing oder die konservative Bewertung, sondern nur sprachspezifische Ein-/Ausgabe. Siehe u. a. die Studie zu Retrieval Practice bei französischen L3-Wörtern: https://doi.org/10.1016/j.lingua.2022.103294

## Aktivierungs-Check für ein neues Fach

1. `SUBJECT_META` ergänzen.
2. Offline-OCR-Sprachdatei bereitstellen.
3. Sprachausgabe-Code verifizieren.
4. Import-Smoke-Test mit typischer Lehrwerksseite.
5. Fach aktivieren.
6. CI muss ohne neue fachnamenspezifische Verzweigungen bestehen.

Für Französisch ist dieser Aktivierungs-Check in v0.21.53 erfüllt: lokales `fra`-OCR,
`fr-FR`-Audio, französischer OCR-/Import-Smoke, fachliche Bewertung und reguläre
Profilaktivierung werden gemeinsam durch die Release-CI geschützt.
