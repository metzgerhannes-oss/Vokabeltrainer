# Vokabeltrainer – Product DNA

Stand: 23.09.2026

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
Datenerfassung, fachliche Prüfung und Lernen ausdrücklich voneinander.

Die verbindliche Reihenfolge lautet:

**Erfassen → fachlich prüfen → direkt lernen / aktiv abrufen → verteilt wiederholen → nachhaltig meistern**

Für neue Vokabeln gilt:

- Nach OCR, Import oder Bibliotheksübernahme werden zuerst die exakten Wort↔Bedeutung-Paare geprüft.
- **Sobald die Paare fachlich freigegeben sind, stehen die Vokabeln unmittelbar im normalen Lernpfad zur Verfügung.**
- Handschriftliches **Abschreiben ist keine Freigabesperre und kein Pflicht-Einstieg**. Es ist eine freiwillige zusätzliche Lerneinheit wie Karteikarten, Wortblitz oder Vokabeldusche.
- Die Abschreib-Einheit bleibt bewusst lernwirksam aufgebaut: anschauen und von Hand schreiben → Vorlage abdecken → aus dem Gedächtnis schreiben → mit der geprüften Wortform vergleichen.
- Die App setzt dafür kein spezielles Vokabelheft voraus. Wurden die Wörter bereits in der Schule oder zu Hause in ein Vokabelheft übertragen, kann das Kind die Abschreib-Einheit vollständig überspringen.
- Ein abgeschlossener Abschreibblock darf separat dokumentiert und als Lerneinheit belohnt werden, verändert aber nicht rückwirkend die fachliche Lernfreigabe.
- Karteikarten benötigen keinen „Vorkenntnis-Beweis“ mehr: Sie sind wie der adaptive Lernpfad sofort für alle fachlich freigegebenen Wörter nutzbar.
- Wird die fachliche Wortform oder Bedeutung später geändert, muss die Wort↔Bedeutung-Zuordnung erneut geprüft werden; der Lernpfad bleibt damit an die fachliche Korrektheit gebunden.

Die Abschreib-Einheit erzeugt **keine künstliche Mastery und keine automatisch nachgewiesene
Schreibkompetenz**. Nachhaltige Beherrschung bleibt ausschließlich Sache des Retrieval- und
Spacing-Modells über mehrere unabhängige Abrufe und Tage.

## Die 15 Prinzipien

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

4. **Support ist nicht Mastery**
   Erkennen, Hören, Wortbausteine, Wortblitz, Vokabeldusche, Abschreiben und Handschrift
   dürfen das Lernen unterstützen, aber eine Vokabel nicht eigenständig als sicher oder
   gemeistert markieren. Ein Fortschritt im Karteikasten setzt produktiven, eigenständigen
   Abruf voraus. Wortbausteine werden als gezielte Rechtschreibhilfe behandelt, nicht als
   allgemeines Multimedia-Prinzip.

5. **Audio ohne Lösungsverrat**
   Ist die Fremdsprachenlösung die gesuchte Antwort, darf sie vor der Bewertung nicht
   vorgelesen werden. Ist die fremdsprachliche Form bereits sichtbar, darf Audio auf
   Knopfdruck verfügbar sein. Hör- und Diktataufgaben sind ausdrücklich als solche
   gekennzeichnet. Nach einem Fehler darf die richtige Fremdsprachenform direkt gehört
   werden; automatisches Vorlesen bleibt abschaltbar.

6. **Feedback direkt nach dem Abruf**
   Fehler werden konkret rückgemeldet und später erneut abgefragt. Falsche Antworten führen
   zu neuer Lerngelegenheit, nicht zu Bestrafung.

7. **Mastery bleibt fachlich und konservativ**
   XP, Legion/Kampagne und Belohnungen sind strikt vom fachlichen Fortschritt getrennt.
   100 % bedeutet: nach den Kriterien der App nachhaltig gemeistert, nicht objektiv
   'für immer gelernt'.

8. **Tagesziel beantwortet: Was muss ich heute lernen?**
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

9. **Neue Wörter im Kontext, Wiederholung gemischt**
   Erstaneignung respektiert soweit sinnvoll Buch-/Unit-Reihenfolge und Zusammenhang.
   Wiederholung mischt bewusst, damit kein reines Reihenfolgenlernen entsteht.

10. **LRS und Barrierefreiheit sind Teil des Grunddesigns**
   Ruhige Oberfläche, gut lesbare Sans-Serif-Schrift, ausreichende Größe/Abstände,
   reduzierte Ablenkung, kurze Einheiten sowie gezielte Audio-, Handschrift- und Wortbausteinoptionen.
   Keine unbewiesenen 'Wunderschriften' oder Zeitdruck als Lernprinzip.

11. **Lernen fokussiert, Motivation außen herum**
   Während des Abrufs: möglichst wenig Ablenkung.
   Abenteuer, Legion/Kampagne, XP und Belohnungen: vor oder nach der Lernsequenz.
   Gamification darf Aufmerksamkeit nicht vom Lerninhalt wegziehen.
   Der Schlachtmodus ist ein eigener Erlebnisbereich außerhalb der Abfrage. Jede konkret
   geplante Vokabelprüfung erzeugt genau eine Testfestung; die Festung steht für diesen
   Testumfang und diesen Termin. Ihre Verteidigung wird beim Entstehen aus den verbleibenden
   sinnvollen Lerntagen berechnet (100 Basispunkte je geplantem Angriffstag, maximal 14 Tage).
   Das vollständig abgeschlossene Tagesziel schaltet pro Fach und Kalendertag höchstens eine
   Aktion frei. Freiwillige Einheiten wie Abschreiben, Karteikarten, „Alle Vokabeln“,
   „Unsichere üben“, Wortblitz oder Vokabeldusche zählen nicht zum Tagesziel und erzeugen
   keine zusätzliche Kampfaktion.
   Jeder Tagesangriff verursacht garantierten Basisschaden; die aktuelle Testbereitschaft
   liefert einen begrenzten Stärkebonus. So lohnt sich jeder Lerntag, während verteiltes,
   gefestigtes Lernen sichtbar stärkere Angriffe erzeugt. Angriffsarten ändern nur die
   Darstellung und niemals die fachliche Bewertung.
   Die Testfestung bleibt jederzeit anschaubar; nach verbrauchter Tagesaktion ist nur der
   Angriff gesperrt. Wird die Festung vor dem Test erobert, entsteht keine neue Festung:
   weitere Tagesziele schalten stattdessen einen Sicherungseinsatz für dieselbe Festung frei.
   Ein verpasster Tag verursacht keine Strafe und Angriffe werden nicht angespart.
   Rang, Einheiten und Ausrüstung bilden weiterhin den langfristigen Schuljahresfortschritt
   ab. Das reale Testergebnis kann die eroberte Festung später als Auszeichnung ergänzen,
   verändert aber weder rückwirkend die Eroberung noch den Mastery-Wert. Kampfanimationen,
   Bossdarstellung, Story und Freundschaftsduelle dürfen fachliche Leistung niemals
   vortäuschen, ersetzen oder zufällig verändern.

12. **Globale Wissensbasis, getrennte Bedeutungen**
    Ein Lexem wird global gespeichert, Bedeutungen/Senses werden getrennt geführt.
    Lernfortschritt hängt an der Bedeutung und am Lernenden, nicht nur an der Zeichenfolge.
    Schulbuchform und akzeptierte Antworten bleiben set-/sense-spezifisch.

13. **Sprachen sind fachlich eigenständige Module**
    Englisch, Latein und später Französisch teilen technische Grundlagen, aber
    sprachspezifische Lernanforderungen werden explizit modelliert. Lateinische Formen,
    französische Akzente usw. werden nicht in ein Englisch-Schema gezwängt.

14. **Evidenz vor Gewohnheit**
    Größere Produktentscheidungen werden regelmäßig gegen aktuelle Lernforschung,
    UX-/Cognitive-Load-Forschung und Barrierefreiheitsstandards geprüft.
    Wenn Produktwunsch und Evidenz kollidieren, wird der Zielkonflikt offengelegt.

15. **Ohne Erklärung bedienbar**
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
