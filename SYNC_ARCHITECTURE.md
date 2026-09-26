# Familien- und Geräte-Synchronisation

## Zielbild

Der Vokabeltrainer trennt künftig konsequent zwischen Kinderoberfläche und Elternoberfläche. Beide arbeiten auf demselben Familien-Datenbestand, können aber auf unterschiedlichen Geräten installiert sein.

## Datenmodell

Die Synchronisation ist dokumentbasiert und bewusst feiner als bei Johanna's Gartenwelt:

- `shared`: gemeinsame Vokabel- und Lehrwerksbibliothek
- `profile/<profil-id>/setup`: vom Elternbereich verwaltete Profildaten, Lernsets, Lehrwerke, Testplanung und Noten
- `profile/<profil-id>/progress`: persönlicher Lernstand, Fehlerprofile, Wiederholungen, XP, Kampagne und Lernaktivität

Dadurch kollidiert das Lernen eines Kindes nicht mit einer gleichzeitig vorgenommenen Änderung im Elternbereich.

## Geräte

Jedes Gerät erhält eine eigene zufällige Geräte-ID und ein eigenes Gerätegeheimnis.

- `parent`: darf alle Familiendokumente lesen und schreiben.
- `child`: darf die gemeinsame Bibliothek und das eigene Setup lesen, aber ausschließlich den eigenen Fortschritt schreiben.

Das Familien-Passwort/PIN wird nicht gespeichert. Für die Einrichtung wird lokal `SHA-256(familyId + "|" + PIN)` gebildet; serverseitig wird auch dieser abgeleitete Wert nur als bcrypt-Hash gespeichert.

Kindergeräte werden über einen kurzlebigen Einmal-Link/QR-Code an genau ein Profil gebunden. Weitere Eltern-Geräte können ebenfalls über einen eigenen kurzlebigen Einmal-Link/QR-Code aufgenommen werden, ohne die wiederverwendbare Familien-PIN offenzulegen. Beide Invite-Typen sind 15 Minuten gültig und danach unbrauchbar.

## Offline-first

IndexedDB bleibt die primäre Laufzeit-Datenbank der App. Lernen funktioniert ohne Verbindung. Änderungen werden lokal gespeichert und bei verfügbarer Verbindung synchronisiert.

Jedes Cloud-Dokument besitzt eine eigene Revisionsnummer. Uploads verwenden die zuletzt bekannte Basisrevision. Wenn Cloud und Gerät dasselbe Dokument unabhängig geändert haben, wird nicht blind überschrieben, sondern ein Konflikt gemeldet.

## Deep-Audit-Invarianten ab v0.19.15

- Ein Gerätebeitritt oder Familienwechsel gilt lokal erst als abgeschlossen, wenn die neuen Dokumente vollständig geladen, durch die zentrale State-Härtung gelaufen und dauerhaft gespeichert wurden. Scheitert einer dieser Schritte, werden vorheriger Datenstand und vorherige lokale Verbindung wiederhergestellt.
- Direkte QR-/Link-Beitritte und manuelle Beitritte bieten vor einer möglichen Datenübernahme dieselbe Backup-Möglichkeit.
- Nicht dauerhaft gespeicherte Remote-Änderungen dürfen weder im sichtbaren Arbeitsspeicher noch in den internen Sync-Snapshots als übernommen gelten.
- Ein vollständiger Backup-Restore im aktiven Familienverbund darf vorhandene Profile nicht implizit verschwinden lassen. Zulässige Restores werden anschließend vollständig als lokale Änderungen zur Synchronisierung vorgemerkt.
- Die derzeitige Dokumentrevision kennt noch keine Profil-Tombstones. Deshalb werden vollständige Profil-Löschung und globaler App-Reset im aktiven Family-Sync bewusst gesperrt, statt auf einzelnen Geräten einen scheinbar erfolgreichen, aber cloudseitig unvollständigen Löschvorgang zu erzeugen.
- Profil-Setup umfasst neben Name, Klassenstufe und LRS-Darstellung auch `avatarStyle` und `autoSpeakCorrection`.

## Backend

Die Tabellen liegen im privaten Supabase-Schema und haben RLS aktiviert. Direkter Tabellenzugriff für `anon` und `authenticated` ist entzogen. Die Browser-App verwendet nur eng begrenzte RPC-Endpunkte mit dem öffentlichen Publishable Key und zusätzlichen Familien-/Geräte-Credentials.

Die öffentlichen RPC-Wrapper sind `SECURITY INVOKER`; privilegierte Implementierungen liegen im nicht exponierten `private`-Schema.

## Ausbaustufen

1. Familien-Datenmodell, Dokument-Splitting, Revisionen und Eltern-Gerät.
2. Kindergerät per Einmal-Code/QR an ein Profil binden.
3. Eigenständige installierbare Eltern-App und Entfernen der Verwaltungsfunktionen aus der Kinder-App.
4. Geräteverwaltung, Widerruf, Konfliktoberfläche und Familien-Backup.
5. Lehrkraft-Oberfläche mit ausdrücklich freigegebenen, minimalen Lerninformationen.

## Gerätebeitritt und Familienwechsel

- Der erste Elternstand legt einen Familienverbund an.
- Jedes weitere Eltern-Gerät kann bevorzugt per einmaligem 15-Minuten-QR-Code/Link beitreten; Familien-ID und Familien-PIN bleiben als manueller Fallback erhalten. Eine zweite Familie ist dafür nicht erforderlich.
- Die lokale Verbindung eines Eltern-Geräts kann gewechselt werden, ohne lokale Lern- oder Vokabeldaten zu löschen.
- Kindergeräte erhalten beim Erstbeitritt die Dokumente strikt in der Reihenfolge `shared` → `profile/<id>/setup` → `profile/<id>/progress`, damit die Vokabelbibliothek vor Set- und Fortschrittsreferenzen vorhanden ist.
