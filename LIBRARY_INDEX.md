# Vokabeltrainer – globale Bibliothek und Laufzeitindex

Stand: 20.09.2026 · App v0.9.19

## Ziel

Vokabeln, Bedeutungen, Lehrwerke und Lektionen werden nur einmal fachlich gespeichert und anschließend von mehreren Lernprofilen wiederverwendet. Der Bibliotheksindex ist dabei **keine zweite Datenbank**, sondern eine ausschließlich zur Laufzeit erzeugte Such- und Verknüpfungsschicht.

Die persistente Wahrheit bleibt:

- `vocabulary[]` – globale Lexeme
- `vocabulary[].senses[]` – getrennte Bedeutungen
- `books[]` – Lehrwerke mit ISBN-13
- `bookVocabulary[]` – Zuordnung Lehrwerk + Abschnitt/Unit + Sense
- `sets[]` / `setVocabulary[]` – lernerspezifische Lernsets und deren lokale Formulierungen
- `learnerVocabulary[]` – ausschließlich persönlicher Lernstand

## Laufzeitindex

`js/library.js` baut aus diesen Arrays einen nicht enumerierbaren `_libraryIndex`. Er wird deshalb weder in Backups noch in IndexedDB gespeichert und kann jederzeit vollständig neu erzeugt werden.

Indiziert werden unter anderem:

- Fach + Lexem
- Schreib- und Formvarianten
- Sense und Bedeutungsvarianten
- ISBN-13
- Lehrwerkstitel, Verlag und Ausgabe
- Abschnitt / Unit
- Buchspezifische Wort- und Bedeutungsformulierungen
- Verwendungen in Lernsets

Lernfortschritt, Fehlerprofile und Mastery-Werte werden ausdrücklich **nicht** in den globalen Suchindex aufgenommen.

## Suche

Die Bibliothek kann über folgende Informationen durchsucht werden:

- Fremdsprachenwort
- Schreibvariante
- deutsche Bedeutung und akzeptierte Synonyme
- ISBN
- Lehrwerkstitel
- Abschnitt / Unit
- Lernsetbezeichnung

Zusätzlich stehen Filter für Lehrwerk, Unit und Verwendung zur Verfügung.

## Wiederverwendung beim Import

Beim Foto-/OCR-Import wird zuerst der aktuelle Kontext berücksichtigt:

1. ausgewähltes Lernset
2. zugeordnetes Lehrwerk / ISBN
3. Abschnitt / Unit
4. globale Bibliothek
5. erst danach lokales Wörterbuch oder neue Anlage

Wenn ein Buch für eine bekannte Bedeutung nur eine andere Formulierung verwendet, wird diese lokale Formulierung mit dem bestehenden Sense verknüpft. Dadurch entsteht **kein neuer Lernstand**.

Ist nicht eindeutig, ob eine Formulierung dieselbe oder eine neue Bedeutung darstellt, entscheidet die App weiterhin nicht automatisch. Die bestehende Auswahl „gleiche Bedeutung“ oder „neue Bedeutung“ bleibt verpflichtend.

## Mehrere Lernprofile

Wählt ein weiteres Lernprofil dieselbe ISBN, können bekannte Units und Vokabelzuordnungen übernommen werden. Dabei werden Lexeme und Senses wiederverwendet, während für das neue Profil eigene Einträge in `learnerVocabulary[]` entstehen.

## Aktuelle Reichweite von „global“

In v0.9.19 bedeutet „global“: gemeinsam innerhalb des lokalen App-Datenbestands und über alle dort angelegten Lernprofile hinweg.

Eine echte geräte- oder haushaltsübergreifende zentrale Bibliothek benötigt später eine Synchronisations-/Backend-Schicht. Das jetzige Datenmodell und die Trennung von Bibliotheksdaten und Lernständen sind dafür vorbereitet, führen aber noch keine personenbezogenen Lerndaten in einen gemeinsamen Cloud-Bestand über.

## CI-Schutz

`scripts/vokabeltrainer-library-index-smoke.mjs` prüft insbesondere:

- ISBN-Auflösung
- Wiedererkennung von Schreibvarianten
- Suche nach ISBN, Unit und Bedeutung
- Filter nach Lehrwerk und Abschnitt
- Wiederverwendung einer buchlokalen Formulierung
- keine automatische Sense-Entscheidung bei Unklarheit
- Wiederverwendung eines bekannten Lehrwerks durch ein zweites Lernprofil
- keine Lernfortschrittsdaten im globalen Suchdokument
- keine Persistierung des Laufzeitindex
