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

Kindergeräte werden später über einen kurzlebigen Einmal-Code/QR-Code an genau ein Profil gebunden. Der Einmal-Code ist 15 Minuten gültig und danach unbrauchbar.

## Offline-first

IndexedDB bleibt die primäre Laufzeit-Datenbank der App. Lernen funktioniert ohne Verbindung. Änderungen werden lokal gespeichert und bei verfügbarer Verbindung synchronisiert.

Jedes Cloud-Dokument besitzt eine eigene Revisionsnummer. Uploads verwenden die zuletzt bekannte Basisrevision. Wenn Cloud und Gerät dasselbe Dokument unabhängig geändert haben, wird nicht blind überschrieben, sondern ein Konflikt gemeldet.

## Backend

Die Tabellen liegen im privaten Supabase-Schema und haben RLS aktiviert. Direkter Tabellenzugriff für `anon` und `authenticated` ist entzogen. Die Browser-App verwendet nur eng begrenzte RPC-Endpunkte mit dem öffentlichen Publishable Key und zusätzlichen Familien-/Geräte-Credentials.

Die öffentlichen RPC-Wrapper sind `SECURITY INVOKER`; privilegierte Implementierungen liegen im nicht exponierten `private`-Schema.

## Ausbaustufen

1. Familien-Datenmodell, Dokument-Splitting, Revisionen und Eltern-Gerät.
2. Kindergerät per Einmal-Code/QR an ein Profil binden.
3. Eigenständige installierbare Eltern-App und Entfernen der Verwaltungsfunktionen aus der Kinder-App.
4. Geräteverwaltung, Widerruf, Konfliktoberfläche und Familien-Backup.
5. Lehrkraft-Oberfläche mit ausdrücklich freigegebenen, minimalen Lerninformationen.
