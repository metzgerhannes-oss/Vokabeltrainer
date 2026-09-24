# Vokabeltrainer – Pädagogische Dokumentation für Eltern und Schulpädagogen

**Stand:** v0.18.40 · 24.09.2026

## 1. Worum es bei der App geht

Der Vokabeltrainer ist für schulisches Fremdsprachenlernen entwickelt. Sein Kernziel ist nicht, möglichst viele Übungsformen anzubieten, sondern **Vokabeln fachlich korrekt, aktiv und über mehrere Tage hinweg lernbar zu machen**.

Die App verbindet fünf Aufgaben:

1. Lernstoff zuverlässig erfassen.
2. Wort und Bedeutung vor dem Lernen fachlich prüfen.
3. aktive Abrufe statt bloßes Wiederlesen in den Mittelpunkt stellen.
4. Wiederholungen über mehrere Tage verteilen.
5. Eltern und Kindern verständlich zeigen, was heute zu tun ist und wie sicher der Lernstoff bereits ist.

Motivationselemente wie Armee, Legion, Festungen und XP liegen bewusst außerhalb der eigentlichen Abfrage. Sie dürfen den fachlichen Lernstand nicht verändern.

## 2. Für wen die App gedacht ist

### Kinder

Kinder sollen möglichst ohne Verwaltungsaufgaben lernen können. Der Kindbereich besteht aus vier klaren Bereichen:

- **Heute** – das für heute berechnete Lernpensum
- **Üben** – freiwillige zusätzliche Übungen
- **Fortschritt** – Karteikasten, Mastery und Testbereitschaft
- **Armee** – Motivation und Belohnung außerhalb der Lernabfrage

Während einer konkreten Abrufaufgabe werden Navigation und zusätzliche Informationen reduziert. Die Aufmerksamkeit soll beim Wort, bei der eigenen Antwort und beim Feedback bleiben.

### Eltern

Eltern übernehmen die organisatorischen Aufgaben:

- Vokabeln erfassen oder fotografieren
- OCR-Ergebnisse prüfen
- Testtermine und Testumfang festlegen
- Profile und Lehrwerke verwalten
- Lernstand und offene Wörter einsehen
- Einstellungen anpassen
- Backups und optionalen Familien-Sync verwalten

Der Elternbereich soll Orientierung geben, nicht minutengenaue Verhaltensüberwachung.

### Schulpädagogen

Die Dokumentation richtet sich ausdrücklich auch an Lehrkräfte und andere Schulpädagogen, damit die Lernlogik nachvollziehbar ist. Ein eigenes Lehrkraftportal ist im aktuellen Stand **noch nicht implementiert**.

Für schulische Zusammenarbeit sind bereits relevant:

- eindeutige Schulbuchform
- getrennte Bedeutungen eines Wortes
- akzeptierte Varianten
- Unit-/Lektionsbezug
- Testumfang
- nachvollziehbare Ergebnisübersichten
- CSV-Export

Persönliche Lerndaten werden einer Lehrkraft nicht automatisch freigegeben.

## 3. Der Grundablauf

Der fachliche Ablauf lautet:

**Erfassen → prüfen → aktiv abrufen → sofort Rückmeldung erhalten → später erneut abrufen → über Tage festigen**

### Schritt 1: Lernstoff erfassen

Vokabeln können unter anderem über:

- Foto/OCR
- manuelle Eingabe
- CSV
- vorhandene Lehrwerks-/Vokabelbibliothek

übernommen werden.

### Schritt 2: Wort↔Bedeutung fachlich prüfen

OCR darf niemals selbst festlegen, was die korrekte Sollantwort ist.

Nach einem Fotoimport werden die erkannten Paare deshalb zunächst als **ungeprüft** behandelt. Ein Erwachsener sieht exakt, welches Wort welcher Bedeutung zugeordnet ist, und gibt diese Paare erst anschließend für das Lernen frei.

Wird eine bereits freigegebene Wortform oder Bedeutung später relevant verändert, kann die Freigabe erneut erforderlich werden.

### Schritt 3: Lernen

Nach der Freigabe sind die Wörter sofort lernbar. Ein vorheriges Abschreiben ist **keine Pflicht**.

Die App versucht, neue Wörter zügig vom Kennenlernen in aktiven Abruf zu überführen.

### Schritt 4: Feedback

Nach einer Antwort zeigt die App unmittelbar:

- ob die Antwort richtig war
- was eingegeben wurde
- welche Antwort erwartet wurde
- bei Bedarf, warum die Bewertung so ausfiel
- bei schriftlichen Karteikarten die Bewegung im Karteikasten

Ein Fehler führt nicht zu zehn unmittelbaren Wiederholungen desselben Wortes. Das Wort wird nach mehreren dazwischenliegenden Aufgaben wieder aufgenommen und später erneut verteilt eingeplant.

### Schritt 5: Verteilte Wiederholung

Wörter kehren an späteren Tagen wieder. Gute Leistungen vergrößern den Abstand. Fehler verkürzen ihn wieder.

Dadurch soll nicht nur kurzfristig vor einem Test eine hohe Trefferquote entstehen, sondern ein stabilerer Abruf über Zeit.

## 4. Warum aktiver Abruf im Mittelpunkt steht

Unter **aktivem Abruf** versteht die App Aufgaben, bei denen die gesuchte Antwort nicht sichtbar ist und aus dem Gedächtnis erzeugt werden muss.

Beispiel:

> Fenster → ________

Das Kind muss selbst „window“ produzieren.

Retrieval-Practice-Forschung zeigt in vielen Lernkontexten Vorteile aktiven Abrufs gegenüber bloßem Wiederlesen oder erneutem Anschauen. Auch für Fremdsprachenvokabular und schulische Rechtschreibung gibt es entsprechende Befunde.

Die App leitet daraus nicht ab, dass jede Form von Wiederlesen oder Zuhören nutzlos wäre. Solche Aktivitäten werden vielmehr als **Unterstützung** eingesetzt. Für die Aussage „dieses Wort ist sicher beherrscht“ verlangt die App aber produktive Leistungen.

## 5. Welche Übungen zählen für den fachlichen Fortschritt?

| Lernform | Zweck | Direkter Mastery-Kredit? |
|---|---|---:|
| Aktiver Abruf Fremdsprache | Wort selbst erinnern | Ja |
| Bedeutungsabruf | Bedeutung selbst erinnern | Ja |
| Rechtschreibung / Diktat | Wortform selbst schreiben | Ja |
| Kontext-Lückensatz | Wort im Zusammenhang produzieren | Ja |
| Schriftliche Karteikarten | selbst schreiben, automatisch prüfen | Ja |
| Erkennen / Multiple Choice | Einstieg, Entlastung, Unterstützung | Nein |
| Hören / Wiedererkennen | Lautform kennenlernen | Nein |
| Wortbausteine | gezielte orthografische/morphologische Hilfe | Nein |
| Handschrift | Einprägen und Vergleichen | Nein |
| Abschreiben | zusätzliche Schreib-/Einprägeeinheit | Nein |
| Wortblitz | Leseflüssigkeit / schneller Zugriff | Nein |
| Vokabeldusche | Wiederbegegnung / Audio | Nein |
| Übungstest | Simulation und Diagnose | verändert Mastery nicht |
| Latein-Formen | gesondertes Grammatiktraining | getrennte Grammatikwerte |

Bei adaptiven Einheiten können unterstützende und produktive Aufgaben gemischt sein. Nur die produktiven Bestandteile verändern die nachhaltige Mastery.

## 6. Der sichtbare Karteikasten

Die App verwendet fünf leicht verständliche Stufen:

1. **Neu**
2. **Im Lernen**
3. **Bekannt**
4. **Sicher**
5. **Nachhaltig gemeistert**

Wichtig ist: Die sichtbare Box ist nicht einfach ein Zähler.

Eine richtige Antwort kann höchstens eine Stufe weiterführen. Wiederholungen am selben Tag können die höheren Boxen nicht beliebig „hochdrücken“. Für hohe Stufen verlangt die App zusätzlich erfolgreiche Abrufe an verschiedenen Tagen.

Eine falsche aktive Antwort bewegt die Karte höchstens eine Stufe zurück.

## 7. Was „nachhaltig gemeistert“ bedeutet

„Nachhaltig gemeistert“ ist eine **Definition innerhalb der App**, keine Aussage, ein Wort werde nie wieder vergessen.

Aktuell verlangt das Modell unter anderem:

- ausreichende Leistungen beim aktiven Abruf
- ausreichende Leistungen bei der Rechtschreibung
- mindestens fünf unabhängige erfolgreiche Abrufe
- erfolgreiche Abrufe an mindestens drei Tagen
- einen Abstand von mindestens drei Tagen innerhalb der Erfolgshistorie
- mindestens zwei sogenannte Cold-Recall-Tage
- ein Wiederholungsintervall von mindestens sieben Tagen
- zusätzliche Kontextfestigung, wenn dort wiederholt Fehler auftreten

XP, Schlachten, Multiple Choice, Anhören oder Abschreiben können diese Kriterien nicht ersetzen.

## 8. Spaced Practice: Warum Wörter nicht immer sofort wiederkommen

Eine umfangreiche Meta-Analyse zum Zweitsprachenlernen fand für verteiltes Lernen einen mittleren bis großen Vorteil; längere Abstände waren insbesondere bei verzögerten Tests günstiger als sehr kurze Abstände.

Daraus folgt für die App:

- Wiederholungen werden über Zeit verteilt.
- Ein Wort darf nach einem Fehler kurzfristig erneut erscheinen.
- Höhere Sicherheit erfordert aber erfolgreiche Abrufe an späteren Tagen.
- Ein Testtermin beeinflusst das Pensum, hebt die Spacing-Logik aber nicht vollständig auf.

Die konkrete Terminformel der App ist eine **evidenzinformierte Heuristik**, nicht die Behauptung eines wissenschaftlich optimalen individuellen Gedächtnismodells.

## 9. Tagesziel und Testplanung

Wenn ein Testtermin bekannt ist, berechnet die App das Tagespensum aus:

- verbleibenden neuen Vokabeln
- fälligen Wiederholungen
- Testdatum
- aktuellem Lernstand

Als Grundidee werden eher kleine Blöcke geplant. Neue Wörter werden begrenzt; bei Rückstand kann die Tageslast steigen, aber nicht unbegrenzt.

Wenn das verbleibende Zeitfenster für sauberes verteiltes Lernen zu knapp wird, zeigt die App ein Risiko an, statt rechnerisch so zu tun, als sei der Lernplan weiterhin ideal.

Am Testtag selbst werden keine neuen Wörter mehr eingeplant.

## 10. Testbereitschaft

Die Testbereitschaft ist eine **Lernstandskennzahl**, keine Notenprognose.

Ein Wort kann als testbereit gelten, bevor es die strengere Stufe „nachhaltig gemeistert“ erreicht. Voraussetzung sind dennoch aktive Abruf- und Rechtschreibleistungen sowie zeitlich verteilte Erfolge.

Das ist sinnvoll, weil schulische Tests häufig in einem kürzeren Zeitraum stattfinden als langfristige Gedächtnisfestigung.

Pädagogisch sollten deshalb zwei Aussagen getrennt gelesen werden:

- **testbereit** = für den bevorstehenden Test nach dem App-Modell ausreichend gefestigt
- **nachhaltig gemeistert** = strengere, längerfristige App-Kriterien erfüllt

## 11. Warum Abschreiben freiwillig ist

Handschrift und wiederholtes Schreiben können Aufmerksamkeit auf die Wortform lenken. Sie sind deshalb als freiwillige Lernhilfe vorhanden.

Sie ersetzen aber keinen Abruf aus dem Gedächtnis.

Untersuchungen zu schulischem Wortlernen und L2-Vokabellernen zeigen Vorteile von Retrieval Practice gegenüber bloßem Wiederanschauen bzw. wiederholtem Schreiben, besonders für spätere Tests. Bei Fünftklässlern zeigte sich für Rechtschreibung ein Vorteil von Retrieval Practice gegenüber Kopieren, wenn unmittelbares korrektives Feedback gegeben wurde.

Deshalb gilt in der App:

- Abschreiben kann sinnvoll sein.
- Es darf übersprungen werden, wenn das Kind die Wörter z. B. bereits in der Schule übertragen hat.
- Abschreiben ist kein Freigabetor.
- Abschreiben macht ein Wort nicht automatisch „sicher“.

## 12. Rechtschreibung und Wortbausteine

Bei orthografischen Schwierigkeiten reicht es nicht, nur die Bedeutung eines Wortes zu kennen.

Die App kann deshalb Fehlerprofile nutzen und gezielte Rechtschreib-/Wortbausteinübungen anbieten.

Wortbausteine sind für einzelne Wörter und geeignete kurze Wortgruppen gedacht. Ganze Sätze werden nicht künstlich in Bausteine zerlegt.

Morphologische Instruktion zeigt in einer aktuellen Meta-Analyse kleine bis moderate positive Effekte auf Lesen und Rechtschreibung, besonders bei direkt trainierten Wörtern. Die Evidenz ist jedoch heterogen. Die App verwendet diese Übungen deshalb gezielt, nicht als universelle Methode für jedes Wort.

## 13. Kontext

Kontexttraining kommt nicht an die Stelle der elementaren Wort↔Bedeutung-Verbindung. Es ergänzt sie.

Sobald ein Wort grundsätzlich bekannt ist, kann es in kurzen Sätzen oder wechselnden Zusammenhängen erneut abgerufen werden.

Eine 2026 veröffentlichte Meta-Analyse zu kontextueller Vielfalt berichtet insgesamt einen positiven Effekt auf Wortlernen. Daraus leitet die App ab, Kontexte zu variieren, ohne die Grundvokabel unter zu viel Zusatzinformation zu verstecken.

## 14. Audio und Vorlesen

Audio ist in der App möglichst nah am Fremdsprachenwort verfügbar.

Es gelten zwei unterschiedliche Fälle.

### Fremdsprachenwort ist bereits sichtbar

Beispiel:

> window → ?

„window“ darf vorgelesen werden, weil das Wort ohnehin zu sehen ist.

### Fremdsprachenwort ist die gesuchte Antwort

Beispiel:

> Fenster → ?

Vor der Antwort darf „window“ **nicht** vorgelesen werden. Sonst würde Audio die Aufgabe lösen.

Nach der Bewertung steht die Aussprache sofort zur Verfügung. Optional kann eine richtige Lösung nach einem Fehler automatisch vorgelesen werden.

Forschung zu kombiniertem schriftlichem und gesprochenem Input unterstützt den Nutzen von Audio für Wortform-/Bedeutungsverknüpfung und Aussprache. Daraus folgt jedoch nicht, dass jede Aufgabe gleichzeitig Text, Bild, Ton und Animation benötigt.

### Technische Grenze

Die App nutzt die Sprachsynthese des Geräts. Die verfügbare Stimme hängt von Browser und Betriebssystem ab. Insbesondere Latein ist daher keine professionell kuratierte Aussprachedatenbank.

## 15. Multiple Choice und unterstützte Aufgaben

Multiple Choice ist nützlich, wenn ein Wort neu ist oder ein freier Abruf wiederholt scheitert. Kinder können dadurch erfolgreich in das Lernen einsteigen.

Aber Wiedererkennen ist leichter als selbstständiges Produzieren.

Daher gilt:

- Multiple Choice darf unterstützen.
- Multiple Choice darf diagnostisch Hinweise liefern.
- Multiple Choice allein macht kein Wort „gemeistert“.
- Nach Unterstützung soll später wieder ein produktiver Abruf folgen.

Das entspricht auch Befunden, dass jüngere Lernende von stärker geführtem Retrieval profitieren können.

## 16. LRS-orientierte Gestaltung

Die App verwendet den Begriff LRS-Unterstützung im Sinn einer **zugänglicheren Lernoberfläche**, nicht als Therapie.

Gestaltungsprinzipien:

- gut lesbare Sans-Serif-Schrift
- einstellbare Schriftgröße
- einstellbare Abstände
- kurze fokussierte Einheiten
- möglichst wenig Ablenkung während des Abrufs
- kein Zeitdruck als Mastery-Bedingung
- Audio auf Wunsch
- Reduced Motion
- Handschrift und Wortbausteine als optionale Hilfen
- große mobile Bedienflächen

### Keine „Wunderschrift“

Spezielle sogenannte Dyslexie-Schriften werden nicht als Lernintervention eingesetzt. Studien zu OpenDyslexic und zu „dyslexia-friendly“ Letterforms zeigen keinen verlässlichen Vorteil der speziellen Buchstabenform für Lesegeschwindigkeit oder Genauigkeit.

Lesbarkeit, individuelle Einstellbarkeit, ausreichende Größe, sinnvolle Abstände und eine ruhige Informationshierarchie werden deshalb höher gewichtet.

## 17. „Multisensorisch“ – mit Vorsicht verwendet

Es ist plausibel, verschiedene Repräsentationen eines Wortes sinnvoll zu verbinden: sehen, hören, schreiben und sprechen können unterschiedliche Informationen liefern.

Der Begriff „multisensorisch“ allein ist aber kein Wirksamkeitsnachweis.

Eine Meta-Analyse zu Orton-Gillingham-basierten Ansätzen fand keine statistisch signifikanten Vorteile für zentrale Lese-/Schreiboutcomes; die Autoren betonen den Bedarf an besserer Forschung.

Deshalb enthält die App keine Funktion nur deshalb, weil sie „multisensorisch“ klingt. Jede Übung soll einen konkreten Zweck erfüllen:

- Audio → Lautform
- Handschrift → Aufmerksamkeit auf die Buchstabenfolge
- Wortbausteine → orthografische/morphologische Struktur
- Kontext → flexible Bedeutungsverwendung
- Retrieval → Gedächtnisabruf

## 18. Sofortiges Feedback

Feedback folgt unmittelbar auf eine Antwort.

Das ist besonders wichtig, wenn ein Kind eine falsche Wortform abgerufen hat. Die App soll verhindern, dass eine falsche Lösung unkommentiert weiterverwendet wird.

Die Ergebnisansicht bleibt anschließend nachvollziehbar und zeigt die vollständige Einheit.

Meta-analytische Forschung zu computervermitteltem Feedback beim L2-Vokabellernen berichtet insgesamt deutliche positive Effekte. Für Rechtschreibung bei Fünftklässlern war unmittelbares korrektives Feedback in der oben genannten Retrieval-Studie entscheidend für den Vorteil gegenüber Kopieren.

## 19. Gamification: Armee, Legion und Festungen

Die Spielschicht soll Motivation erzeugen, aber nicht definieren, was fachlich richtig ist.

Deshalb sind zwei Systeme getrennt:

### Lernsystem

bestimmt:

- Mastery
- Karteikasten
- Wiederholungsdatum
- Testbereitschaft

### Spielsystem

zeigt:

- Armee/Legion
- Rang
- Ausrüstung
- Festungen
- tägliche Kampfaktion
- Animationen und Story

Ein abgeschlossenes Tagesziel kann genau eine Aktion freischalten. Freiwilliges Zusatzüben erzeugt keine unbegrenzten Kampfbelohnungen.

Ein verpasster Tag wird nicht bestraft.

## 20. Elternbereich und Kindergerät

Der Elternbereich ist eine bewusste Rollenebene.

Auf einem normalen Familien-/Elterngerät kann ein Erwachsener dorthin wechseln.

Ein über den Familienverbund als **Kindergerät** registriertes Gerät sperrt den Elternbereich dagegen auch lokal. Das Kind soll nicht über die Oberfläche Lernstoff, Testplanung oder Verwaltungsdaten ändern können.

Serverseitig ist diese Trennung zusätzlich im Sync-Modell hinterlegt: Ein Kindergerät darf nur seinen eigenen Lernfortschritt schreiben.

## 21. Daten, Offline-Nutzung und Familien-Sync

Die App ist in erster Linie lokal nutzbar.

- App-Daten liegen primär in IndexedDB.
- OCR läuft im Browser.
- OCR-Fotos werden nicht zur Erkennung an einen externen OCR-Anbieter gesendet.
- App-Shell und einmal benötigte OCR-/Wörterbuchressourcen können offline gecacht werden.
- Backups können lokal exportiert und wieder eingespielt werden.

Optional kann ein Familienverbund über Supabase genutzt werden.

Dabei gilt:

- Geräte erhalten eigene Gerätegeheimnisse.
- Kinder- und Elterngeräte haben unterschiedliche Rechte.
- Änderungen werden mit Revisionsnummern synchronisiert.
- Konflikte sollen nicht still überschrieben werden.
- Die App enthält im geprüften Stand keine Werbe- oder Analytics-SDKs.

Der Familien-Sync ist **keine Ende-zu-Ende-verschlüsselte Messengerarchitektur** und wird auch nicht als solche beworben.

## 22. Was Eltern aus „Fortschritt“ ablesen sollten

Sinnvolle Fragen sind:

- Welche Wörter sind heute fällig?
- Wie viele Wörter sind für den nächsten Test bereits testbereit?
- Welche Wörter sind noch instabil?
- Liegen Schwierigkeiten eher beim Abruf oder bei der Schreibweise?
- Ist der Lernplan zeitlich noch realistisch?
- Wurde über mehrere Tage gelernt oder nur kurzfristig?

Weniger sinnvoll ist es, XP oder tägliche Aktivität als Leistungsnote zu lesen.

## 23. Was Pädagogen beachten sollten

Die App ist besonders transparent, wenn die in der Schule erwartete Form bekannt ist.

Hilfreich sind daher:

- klarer Testumfang
- eindeutige Unit-/Lektionsangabe
- bekannte zulässige Synonyme
- erwartete Schreibvarianten
- bei Latein erforderliche Zusatzformen
- klare Regeln zu Satzzeichen/Orthografie bei ganzen Sätzen

Je präziser die schulische Erwartung hinterlegt ist, desto fairer kann die automatische Bewertung arbeiten.

Bei abweichender Lehrkraftpraxis sollte die App an diese Erwartung angepasst werden – nicht umgekehrt.

## 24. Grenzen der Interpretation

Der Vokabeltrainer ist evidenzinformiert, aber kein wissenschaftliches Messinstrument.

Insbesondere gilt:

- „100 %“ bedeutet 100 % nach den definierten App-Kriterien.
- Testbereitschaft ist keine garantierte Testleistung.
- Mastery ist keine Aussage „für immer gelernt“.
- LRS-Einstellungen sind keine Diagnose und keine Lerntherapie.
- ein automatischer Fehlerwert ersetzt keine pädagogische Beobachtung.
- Motivation durch Spielmechanik beweist keine Lernwirkung.
- TTS ersetzt keine professionelle Ausspracheaufnahme.
- individuelle Lernwege können von den App-Heuristiken abweichen.

## 25. Zentrale Forschungsgrundlagen

### Aktiver Abruf

Kang, S. H. K., Gollan, T. H. & Pashler, H. (2013).  
*Don't just repeat after me: retrieval practice is better than imitation for foreign vocabulary learning.*  
https://doi.org/10.3758/s13423-013-0450-z

Goossens, N. A. M. C. et al. (2014).  
*The benefit of retrieval practice over elaborative restudy in primary school vocabulary learning.*  
https://doi.org/10.1016/j.jarmac.2014.05.003

### Spacing

Kim, S. K. & Webb, S. (2022).  
*The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis.*  
https://doi.org/10.1111/lang.12479

### Rechtschreibung / Retrieval / Feedback

da Silva, F. V., Ekuni, R. & Jaeger, A. (2023).  
*Retrieval practice benefits for spelling performance in fifth-grade children.*  
https://doi.org/10.1080/09658211.2023.2248420

*Comparing the merits of word writing and retrieval practice for L2 vocabulary learning* (2020).  
https://doi.org/10.1016/j.system.2020.102206

Li, R. (2023).  
*Investigating effects of computer-mediated feedback on L2 vocabulary learning.*  
https://doi.org/10.1016/j.compedu.2023.104763

### Audio / schriftlich + gesprochen

Uchihara, T. (2022).  
*Does Mode of Input Affect How Second Language Learners Create Form–Meaning Connections and Pronounce Second Language Words?*  
https://doi.org/10.1111/modl.12775

### Kontext

Chen, S., Miller, R. T. & Ke, S. (2026).  
*The effect of contextual diversity on L1 and L2 word learning: A systematic review and meta-analysis.*  
https://doi.org/10.1017/S0142716426100691

### Wortstruktur / Morphologie

Colenbrander, D. et al. (2024).  
*The Effects of Morphological Instruction on Literacy Outcomes for Children in English-Speaking Countries: A Systematic Review and Meta-Analysis.*  
https://doi.org/10.1007/s10648-024-09953-3

### LRS-/Multisensory-Einordnung

Stevens, E. A. et al. (2021).  
*Current State of the Evidence: Examining the Effects of Orton-Gillingham Reading Interventions...*  
https://pmc.ncbi.nlm.nih.gov/articles/PMC8497161/

Wery, J. J. & Diliberto, J. A.  
*The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy.*  
https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233/

British Dyslexia Association – Dyslexia Friendly Style Guide  
https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide

### Barrierefreiheit

WCAG 2.2  
https://www.w3.org/TR/WCAG22/

Apple Human Interface Guidelines – Accessibility / Buttons  
https://developer.apple.com/design/human-interface-guidelines/accessibility

---

## 26. Kurzfassung

Der Vokabeltrainer folgt einer einfachen Priorität:

**Das Kind soll die richtige Vokabel selbst erinnern können – nicht nur erkennen, dass sie bekannt aussieht.**

Dafür kombiniert die App:

- fachlich geprüften Lernstoff
- aktiven Abruf
- unmittelbares Feedback
- verteilte Wiederholung
- gezielte Hilfen bei Schwierigkeiten
- transparenten Fortschritt
- einen getrennten Motivationsbereich

Eltern übernehmen Organisation und Qualitätskontrolle. Kinder bekommen einen möglichst klaren Lernweg. Pädagogen können die Lernlogik nachvollziehen und schulische Sollformen sauber abbilden.

Die App soll Lernen unterstützen, nicht Unterricht, Förderung oder professionelle Diagnostik ersetzen.
