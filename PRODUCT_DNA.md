# Vokabeltrainer – Product DNA

Stand: 21.09.2026

Diese Prinzipien sind die verbindliche Leitlinie für Produktentscheidungen vor und nach v1.
Neue Features werden gegen diese DNA geprüft. Wenn ein Wunsch davon abweicht, soll der
Konflikt transparent benannt und – soweit sinnvoll – mit aktueller Lern-, UX- oder
Barrierefreiheitsforschung gegengeprüft werden.

## Oberstes Produktprinzip

**Die fachlich korrekte Vokabelabfrage ist die Daseinsberechtigung der App.**

Alles andere – OCR, Bibliothek, ISBN, Lernpfade, Spacing, LRS-Hilfen, Kampagne, XP,
Eltern-/Lehrkraftbereiche, Statistik, Backups und Komfortfunktionen – ist Mittel zum Zweck,
damit die Vokabelabfrage zuverlässiger, wirksamer oder leichter nutzbar wird.

Daraus folgen verbindliche Konsequenzen:

- Eine falsche Sollantwort, falsche Wort↔Bedeutung-Zuordnung oder falsche Bewertung ist ein **Release-Blocker**.
- Die Abfrage muss immer exakt nachvollziehbar machen können, **welche Antwort erwartet und warum sie gewertet wurde**.
- Import-, OCR- und Bibliothekslogik dürfen niemals stillschweigend die fachliche Wahrheit der Abfrage verschlechtern.
- Bei Konflikten hat die Korrektheit der Abfrage Vorrang vor Komfort, Automatisierung, Gamification oder Featureumfang.
- Neue Funktionen werden daran gemessen, ob sie die Qualität der Vokabelabfrage verbessern oder zumindest nicht beeinträchtigen.

## Verbindliche Lernpipeline

Eine neu erfasste Vokabel ist **noch keine gelernte Vokabel**. Die App trennt deshalb
Datenerfassung, fachliche Prüfung und Erstaneignung ausdrücklich voneinander.

Die verbindliche Reihenfolge lautet:

**Erfassen → fachlich prüfen → kennenlernen → abrufen → verteilt wiederholen → nachhaltig meistern**

Für den Erstkontakt gilt:

- Nach OCR, Import oder Bibliotheksübernahme werden zuerst die exakten Wort↔Bedeutung-Paare geprüft.
- Standardmäßig schreibt das Kind jede neue Vokabel bewusst **von Hand auf Papier oder in ein beliebiges Heft** ab; die App setzt kein spezielles Vokabelheft voraus.
- Die Vorlage wird anschließend abgedeckt; die Wortform wird einmal aktiv aus dem Gedächtnis geschrieben.
- Danach wird mit der fachlich geprüften Wortform verglichen. Die App bewertet die Handschrift nicht automatisch.
- Kurze Blockwiederholungen unterbrechen lange Abschreibserien und fordern erneut aktiven Abruf.
- **Vorkenntnis-Ausnahme:** Der schriftliche Karteikartenmodus darf bereits vor diesem Abschreib-Erstkontakt genutzt werden. Wird eine fachlich geprüfte neue Vokabel dort ohne Hilfe und orthographisch korrekt aus dem Gedächtnis geschrieben, gilt das Wort als bereits bekannt; der Abschreibblock für dieses Wort entfällt und es geht direkt in die verteilte Wiederholung.
- Dieser Beweis erzeugt ausdrücklich **keine Mastery** und setzt das Wort nicht auf „nachhaltig gemeistert“. Die normalen Spacing- und Mastery-Kriterien gelten unverändert.
- Erst nach dem regulären Erstkontakt **oder** einem erfolgreichen Vorkenntnis-Beweis wird die Vokabel für den normalen adaptiven Lernpfad freigegeben.
- Wird die fachliche Wortform oder Bedeutung später geändert, verliert die betroffene Zuordnung ihre Erstkontakt-Freigabe.
- Bestehende, bereits verwendete Lernsets werden bei Einführung dieser Logik nicht rückwirkend gesperrt.

Der Erstkontakt erzeugt **keine künstliche Mastery und keine Schreibkompetenz**. Er dokumentiert
nur, dass die korrekte Wortform bewusst gesehen, handschriftlich verarbeitet und einmal aktiv
erinnert wurde. Nachhaltige Beherrschung bleibt ausschließlich Sache des anschließenden
Retrieval- und Spacing-Modells.

## Die 13 Prinzipien

1. **Lernwirkung vor Featuremenge**
   Jede Funktion muss der fachlich korrekten Vokabelabfrage, dem Lernen, der Orientierung
   oder der Motivation dienen. Kein Feature nur um seiner selbst willen. Die Abfrage hat
   bei Zielkonflikten Vorrang.

2. **Aktiver Abruf ist der Kern**
   Retrieval Practice ist der wichtigste Lernmechanismus. Wiedererkennen, Zuhören,
   Vokabeldusche und Wortblitz sind Unterstützung, aber kein Beweis für Beherrschung.

3. **Verteiltes Lernen statt kurzfristigem Pauken**
   Spacing und Successive Relearning bestimmen Wiederholungen. Ein Wort gilt erst nach
   erfolgreichen Abrufen über mehrere Tage als nachhaltig gemeistert.
   Der Karteikartenmodus visualisiert denselben Lernstand in fünf Leitner-Boxen
   (Neu → Im Lernen → Bekannt → Sicher → Nachhaltig gemeistert). Die Antwort wird
   geschrieben und automatisch bewertet; Selbstbewertung über „gewusst/nicht gewusst“
   ersetzt keinen Abruf. Eine falsche aktive Antwort setzt die Karte genau eine Box zurück.
   Eine richtige unabhängige Antwort kann sie höchstens eine Box weiterbewegen; die höheren
   Boxen bleiben zusätzlich an zeitlich verteilte Abrufe gebunden. Box 5 ist ausschließlich
   bei erfüllten Mastery-Kriterien erreichbar.

4. **Feedback direkt nach dem Abruf**
   Fehler werden konkret rückgemeldet und später erneut abgefragt. Falsche Antworten führen
   zu neuer Lerngelegenheit, nicht zu Bestrafung.

5. **Mastery bleibt fachlich und konservativ**
   XP, Legion/Kampagne und Belohnungen sind strikt vom fachlichen Fortschritt getrennt.
   100 % bedeutet: nach den Kriterien der App nachhaltig gemeistert, nicht objektiv
   'für immer gelernt'.

6. **Tagesziel beantwortet: Was muss ich heute lernen?**
   Testdatum, Testumfang, fällige Wiederholungen und schwache Wörter steuern das Tagespensum.
   Kurze, realistische Einheiten haben Vorrang vor langen Sessions.
   Als Richtgröße werden pro Tag **5–7 neue Vokabeln** eingeführt. Fällige und unsichere
   Wiederholungen ergänzen das Tagesziel normalerweise auf ungefähr **10–12 Vokabelkontakte**.
   Bei einem bekannten Testtermin wird das Pensum jedoch **täglich aus dem tatsächlichen
   Restlernstand neu berechnet**: Rückstand erhöht die Last, Vorsprung reduziert sie. Bei
   deutlichem Vorsprung sind kleinere 3er-Blöcke und etwa 8 Kontakte zulässig; bei Rückstand
   kann das Gesamtpensum vorübergehend bis etwa 14 Kontakte steigen. Mehr als **7 neue Wörter
   pro Tag** werden weiterhin nicht erzwungen. Wenn mindestens zwei Tage Vorlauf bestehen,
   bleibt der letzte Tag vor dem Test für Wiederholung reserviert. Neue Wörter am Tag vor
   dem Test werden als Spacing-Risiko gekennzeichnet; am Testtag selbst werden keine neuen
   Wörter eingeplant. Vorschau und Tagesplan müssen dieselbe Formel verwenden.

7. **Neue Wörter im Kontext, Wiederholung gemischt**
   Erstaneignung respektiert soweit sinnvoll Buch-/Unit-Reihenfolge und Zusammenhang.
   Wiederholung mischt bewusst, damit kein reines Reihenfolgenlernen entsteht.

8. **LRS und Barrierefreiheit sind Teil des Grunddesigns**
   Ruhige Oberfläche, gut lesbare Sans-Serif-Schrift, ausreichende Größe/Abstände,
   reduzierte Ablenkung, kurze Einheiten, Audio und multisensorische Optionen.
   Keine unbewiesenen 'Wunderschriften' oder Zeitdruck als Lernprinzip.

9. **Lernen fokussiert, Motivation außen herum**
   Während des Abrufs: möglichst wenig Ablenkung.
   Abenteuer, Legion/Kampagne, XP und Belohnungen: vor oder nach der Lernsequenz.
   Gamification darf Aufmerksamkeit nicht vom Lerninhalt wegziehen.
   Der Schlachtmodus ist ein eigener Erlebnisbereich und wird erst durch eine abgeschlossene
   Lerneinheit freigeschaltet. Ein vollständig abgeschlossener Kennenlern-/Abschreibblock zählt
   dabei ebenfalls als Lerneinheit. Kampfanimationen laufen niemals während einer Abfrage und
   verändern keinen fachlichen Mastery-Wert.
   Angriffsarten, Einheiten, Festungen, Jahreszeiten, Rang und Ausrüstung sind visuelle
   Motivation. Keine dieser Darstellungen darf die fachliche Bewertung oder Siegbedingung
   verfälschen; Festungen fallen ausschließlich an den definierten Lernfortschrittsschwellen.
   Bosskämpfe, Spezialangriffe, Story und Freundschaftsduelle folgen derselben Regel:
   Sie visualisieren vorhandenen Lernfortschritt und dürfen keine fachliche Leistung
   vortäuschen, ersetzen oder zufällig verändern.

10. **Globale Wissensbasis, getrennte Bedeutungen**
    Ein Lexem wird global gespeichert, Bedeutungen/Senses werden getrennt geführt.
    Lernfortschritt hängt an der Bedeutung und am Lernenden, nicht nur an der Zeichenfolge.
    Schulbuchform und akzeptierte Antworten bleiben set-/sense-spezifisch.

11. **Sprachen sind fachlich eigenständige Module**
    Englisch, Latein und später Französisch teilen technische Grundlagen, aber
    sprachspezifische Lernanforderungen werden explizit modelliert. Lateinische Formen,
    französische Akzente usw. werden nicht in ein Englisch-Schema gezwängt.

12. **Evidenz vor Gewohnheit**
    Größere Produktentscheidungen werden regelmäßig gegen aktuelle Lernforschung,
    UX-/Cognitive-Load-Forschung und Barrierefreiheitsstandards geprüft.
    Wenn Produktwunsch und Evidenz kollidieren, wird der Zielkonflikt offengelegt.

13. **Ohne Erklärung bedienbar**
    Der kritische Kind-Pfad muss selbsterklärend sein: Auf jedem Bildschirm ist klar,
    wo das Kind ist, was jetzt zu tun ist und wie es weitergeht. Der tägliche Einstieg
    zeigt eine dominante Hauptaktion; Verwaltung, Detailstatistik und alternative Wege
    werden nachgeordnet. Muss ein Erwachsener den nächsten Klick erklären, ist das ein
    UX-Release-Blocker und kein Fall für zusätzliche Hilfetexte.
    Auch im Elternbereich gilt eine klare Zieltrennung: **Steht ein Test an, ist
    „Test planen“ der normale Weg.** Dort werden Termin und konkrete Vokabeln direkt gewählt;
    diese Wörter werden automatisch zum Lernstoff des Kindes. **„Ohne Test lernen“** ist nur
    für zusätzlichen Lernstoff ohne konkreten Testtermin gedacht. Bibliothek, Lernbereich,
    Buchzuordnung und Import sind technische Ebenen im Hintergrund oder Verwaltungs-/
    Korrekturwege und dürfen kein Verständnis des Datenmodells voraussetzen.
    Auf Desktop wird die gleiche Informationsarchitektur als echter Workspace dargestellt:
    dauerhafte Seitennavigation, Tagesziel und freiwillige Übungen gleichzeitig sichtbar sowie
    mehrspaltige Eltern-/Verwaltungsansichten. Desktop ist keine bloß verbreiterte Mobilansicht.

---

## Rollenmodell

### Kind
Ziel: lernen, nicht administrieren.

**Harte Rollengrenze:** Der Kind-Modus enthält keine Anlage oder Bearbeitung von Lernbereichen,
keine OCR-/Paarfreigabe, keine Testumfangsplanung, keine Noteneingabe, keine Profil- oder
Lehrwerkverwaltung und keine Daten-/Backupfunktionen. Sind solche Vorarbeiten offen, sieht
das Kind nur einen verständlichen Status und keine administrative Handlungsaufforderung.

- Heute: eine klare Hauptaufgabe
- täglicher Lernweg ohne Einweisung durch Erwachsene bedienbar
- Lernmodus: fokussierter Abruf
- Fortschritt: verständlich und motivierend
- Kampagne/Belohnung: ergänzend
- nur aktive Fremdsprachen sichtbar
- keine unnötigen Verwaltungsfunktionen

### Eltern
Ziel: Orientierung, Unterstützung und Organisation – keine Überwachung.

Der Elternbereich ist ein bewusster Rollenwechsel und kein Untermenü des Kind-Modus.
Beim App-Start wird immer der Kind-Modus verwendet; Verwaltungsfunktionen werden erst
nach dem expliziten Wechsel in den Elternbereich sichtbar.

Dashboard soll insbesondere beantworten:

- Ist das Kind für den nächsten Test auf Kurs?
- Was ist noch offen?
- Welche Vokabeln/Bedeutungen sind instabil?
- Wo liegen Fehlerarten: Abruf, Schreibung, Hören, Kontext, Grammatik?
- Welche Lernbereiche/Units sind aktiv?
- Wie entwickelt sich nachhaltige Mastery?
- Welche Testchecks wurden durchgeführt?
- Welche Schulnoten wurden manuell hinterlegt?
- Welche Lehrwerke/ISBNs sind zugeordnet?
- LRS- und Profileinstellungen
- Import/Backup/Lehrwerkverwaltung

Darstellung bevorzugt aggregiert und handlungsorientiert, nicht als minutengenaue
Verhaltensüberwachung.

### Lehrkraft
Ziel: fachlich relevante Information zu Lektionen und Lernstoff.

Lehrkraftbereich soll perspektivisch liefern:

- Lehrwerk / ISBN / Ausgabe
- Unit / Theme / Lektion
- Vokabelliste und Reihenfolge
- erwartete Schulbuchform
- akzeptierte Bedeutungsvarianten
- ggf. Grammatik-/Forminformationen
- Umfang eines Tests oder einer Lektion
- anonymisierte bzw. freigegebene Lernschwierigkeiten auf Wort-/Lektionenebene

Persönliche Lerndaten, LRS-Status oder individuelle Leistungsdaten werden einer Lehrkraft
nicht automatisch zugänglich gemacht. Solche Daten benötigen eine bewusste Freigabe.

---

## Architekturprinzip für Rollen

Keine drei getrennten Datenwelten.

Eine gemeinsame Datenbasis:
- Lexem
- Sense/Bedeutung
- Lehrwerk/ISBN
- Unit/Lektion
- Lernset
- persönlicher Lernstand

Darauf drei unterschiedliche Views:
- Kind-View
- Eltern-View
- Lehrkraft-View

So bleiben Daten konsistent und die Oberfläche kann je Rolle radikal vereinfacht werden.

## Prüffrage für jedes neue Feature

1. Verbessert es nachweislich Lernen, Orientierung oder Motivation?
2. Erhöht es kognitive Last während des Abrufs?
3. Verfälscht es Mastery oder Lernfortschritt?
4. Ist es mit LRS/Barrierefreiheit vereinbar?
5. Gehört es in Kind-, Eltern- oder Lehrkraftbereich?
6. Ist die Datenstruktur global wiederverwendbar?
7. Gibt es aktuelle Forschung, die unsere Annahme bestätigt oder widerspricht?
8. Versteht ein Kind den nächsten Schritt ohne mündliche Erklärung?
