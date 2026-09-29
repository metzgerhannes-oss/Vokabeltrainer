'use strict';

(() => {
  const CHAPTER_ORDER=Object.freeze(['outpost','tower','wall','citadel','capital','final']);

  const STORYLINES=Object.freeze({
    english:Object.freeze({
      adventure:Object.freeze({
        title:'The Northstar Expedition',
        companion:'Das Expeditionsteam',
        opening:'Im alten Basislager liegt eine unvollständige Karte. Sechs Markierungen führen durch Wälder, über Flüsse und bis zu einem goldenen Horizont. Mit jedem sicher gelernten Abschnitt wird ein neuer Teil der Route lesbar.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Das versiegelte Basislager',text:'Die erste Kartenrolle ist mit unbekannten Wörtern beschriftet. Sobald du die ersten Lernziele sicher erreichst, öffnet sich das Lager und die Expedition kann beginnen.'}),
          tower:Object.freeze({title:'Kapitel 2 · Der Aussichtspunkt',text:'Vom hohen Aussichtspunkt erkennt das Team einen schmalen Pfad durch den Wald. Neue Wörter machen Wegzeichen verständlich und zeigen die nächste Richtung.'}),
          wall:Object.freeze({title:'Kapitel 3 · Die Flussquerung',text:'Ein breiter Fluss trennt die Expedition vom nächsten Gebiet. Nur die richtig gelesenen Hinweise auf der Karte zeigen, an welcher Stelle der Übergang sicher ist.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Die verlassene Höhenstation',text:'Auf der Höhe wartet eine alte Forschungsstation mit einem beschädigten Sternenplan. Das Team setzt die Hinweise zusammen und entdeckt darin die Koordinaten der letzten Route.'}),
          capital:Object.freeze({title:'Kapitel 5 · Die Sternwarte',text:'In der Sternwarte wird klar, dass die Karte nicht zu einem Schatz, sondern zu einem besonderen Aussichtspunkt führt. Der letzte Abschnitt verlangt alles Wissen, das auf der Reise gesammelt wurde.'}),
          final:Object.freeze({title:'Kapitel 6 · Der Goldene Horizont',text:'Die Expedition erreicht den höchsten Punkt der Route. Von hier aus sind alle zurückgelegten Etappen sichtbar – jede davon steht für Wissen, das wirklich behalten wurde.'})
        }),
        finale:'Die Nordstern-Expedition ist vollständig. Die Karte ist jetzt kein Rätsel mehr, sondern das sichtbare Tagebuch des ganzen Lernjahres.'
      }),
      battle:Object.freeze({
        title:'The Northstar Campaign',
        companion:'Die Nordstern-Garde',
        opening:'Jenseits der Nordstern-Grenze stehen sechs vollständig fiktionale Festungen der Nebelwacht. Die Garde rückt nur vor, wenn echte Lernziele erreicht sind; kein Kampf verändert den fachlichen Lernstand.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Der Nebelvorposten',text:'Ein kleiner Vorposten blockiert die erste Route. Die Nordstern-Garde sammelt sich, während dein Lernfortschritt die erste Angriffschance freischaltet.'}),
          tower:Object.freeze({title:'Kapitel 2 · Der graue Wachturm',text:'Der Turm sendet Lichtzeichen an die nächste Festung. Mit jedem sicheren Lerntag rückt die Garde näher und erkennt die Schwachstellen der Verteidigung.'}),
          wall:Object.freeze({title:'Kapitel 3 · Die Grenzfestung',text:'Hinter der langen Mauer beginnt das Kerngebiet der Nebelwacht. Neue Einheiten erscheinen nur als sichtbares Zeichen deines bereits erreichten Jahresfortschritts.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Die Zitadelle im Fels',text:'Vor der Zitadelle wartet ein fiktionaler Torwächter. Die Garde kann nur weiterziehen, wenn das nächste echte Lernziel abgeschlossen ist.'}),
          capital:Object.freeze({title:'Kapitel 5 · Die Hauptfestung',text:'Die Nebelwacht zieht sich in ihre größte Festung zurück. Alles, was bisher gelernt wurde, zeigt sich jetzt in Größe und Ausrüstung der eigenen Garde.'}),
          final:Object.freeze({title:'Kapitel 6 · Die Festung am Nordstern',text:'Die letzte Festung markiert das Jahresziel. Der Angriff ist nur die Spielinszenierung für den Fortschritt, der im Lernen längst tatsächlich erreicht wurde.'})
        }),
        finale:'Die Nordstern-Garde hat ihre Kampagne abgeschlossen. Die eroberten Festungen bleiben als Chronik des Lernjahres sichtbar.'
      })
    }),
    latin:Object.freeze({
      adventure:Object.freeze({
        title:'Iter Romanum · Die Karte der sechs Wege',
        companion:'Die junge Reisegruppe',
        opening:'In einer kleinen Schreibstube wird eine alte Reisekarte gefunden. Sechs Orte sind eingezeichnet, doch viele Beschriftungen fehlen. Die Reisegruppe folgt den Spuren durch eine mediterrane, zivile Welt.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Via Prima',text:'Die erste Straße führt aus der Stadt hinaus. Ein verwitterter Wegstein trägt die ersten Hinweise, die mit wachsendem Lateinwissen wieder verständlich werden.'}),
          tower:Object.freeze({title:'Kapitel 2 · Das Forum',text:'Auf dem Forum entdeckt die Gruppe eine Tafel mit Namen, Formen und kurzen Botschaften. Die passenden Bedeutungen weisen zur nächsten Station.'}),
          wall:Object.freeze({title:'Kapitel 3 · Das Aquädukt',text:'Am Aquädukt fehlt ein Teil der Wegbeschreibung. Die Gruppe ordnet die gefundenen Hinweise und kann dadurch die Route jenseits des Tals bestimmen.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Die Bibliothek',text:'In einer stillen Bibliothek liegt ein Reisebericht, dessen wichtigste Stellen nur mit gefestigtem Wissen verstanden werden. Darin wird erstmals der große Zielort erwähnt.'}),
          capital:Object.freeze({title:'Kapitel 5 · Der Hafen',text:'Im Hafen treffen viele Wege zusammen. Die Gruppe erkennt, dass alle bisherigen Fundstücke Teile derselben Karte sind und setzt sie für die letzte Reise zusammen.'}),
          final:Object.freeze({title:'Kapitel 6 · Magna Via',text:'Die große Straße führt zum Aussichtspunkt am Ende der Reise. Von dort lassen sich alle Orte des Jahres wie Stationen einer einzigen zusammenhängenden Entdeckung sehen.'})
        }),
        finale:'Das Iter Romanum ist vollendet. Aus einzelnen Vokabeln, Formen und Textspuren ist eine lesbare Karte des gesamten Lernjahres geworden.'
      }),
      battle:Object.freeze({
        title:'Legio Lucis · Die sechs Kastelle',
        companion:'Die Legion des Lichtzeichens',
        opening:'Eine vollständig fiktionale Legion schützt eine friedliche Provinzroute. Sechs Kastelle der Schattenstandarte versperren den Weg. Reale Völker oder historische Gegner spielen keine Rolle.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Castra Prima',text:'Das erste Marschlager liegt vor einem gesperrten Pass. Die Legion formiert sich erst, wenn der erste Lernabschnitt tatsächlich abgeschlossen ist.'}),
          tower:Object.freeze({title:'Kapitel 2 · Turris Vigiliae',text:'Ein hoher Wachturm beobachtet die Straße. Mit jedem gefestigten Lerntag erkennt die Legion mehr von der Route und rückt geordnet weiter.'}),
          wall:Object.freeze({title:'Kapitel 3 · Castellum Limitis',text:'Das Grenzkastell schützt den Übergang in die nächste Region. Die sichtbare Formation wächst ausschließlich aus bereits erreichtem Jahresfortschritt.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Castellum Montis',text:'Vor dem Bergkastell wartet der fiktionale Custos Portae. Nicht Kampfgeschick, sondern das abgeschlossene Lernziel gibt die nächste Aktion frei.'}),
          capital:Object.freeze({title:'Kapitel 5 · Castellum Provinciae',text:'Die Schattenstandarte sammelt sich im größten Kastell. Die Legion zeigt nun die Ausrüstung, die über das Lernjahr Schritt für Schritt freigeschaltet wurde.'}),
          final:Object.freeze({title:'Kapitel 6 · Castrum Magnum',text:'Das große Kastell bildet den Abschluss der Route. Die letzte Schlacht visualisiert nur den Lernfortschritt, den das Kind zuvor fachlich erworben hat.'})
        }),
        finale:'Die sechs Kastelle sind gesichert. Die Marschroute bleibt als sichtbares Protokoll eines ganzen Lernjahres bestehen.'
      })
    }),
    german:Object.freeze({
      adventure:Object.freeze({
        title:'Die Reise zum Wortschatz-Horizont',
        companion:'Der Fuchs',
        opening:'Im Fuchsbau findet der Fuchs eine leere Karte mit sechs goldenen Blättern. Jedes Blatt wird erst sichtbar, wenn Buchstaben, Wörter und Sätze sicherer werden. So beginnt eine ruhige Reise durch die Wortwelt.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Der Buchstabenpfad',text:'Zwischen den Bäumen hängen Zeichen, die noch keinen Weg ergeben. Der Fuchs erkennt nach und nach Laute und Buchstaben und findet dadurch den ersten Pfad.'}),
          tower:Object.freeze({title:'Kapitel 2 · Die Wörterbrücke',text:'Eine alte Holzbrücke trägt viele einzelne Wörter. Nur die Wörter, die sicher erkannt und geschrieben werden, fügen sich zu stabilen Brettern für den Weg über den Bach.'}),
          wall:Object.freeze({title:'Kapitel 3 · Der Silbenwald',text:'Im dichten Wald teilen sich lange Wörter in gut erkennbare Silben. Der Fuchs folgt ihrem Rhythmus und entdeckt dahinter einen neuen Abschnitt der Karte.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Der Leseturm',text:'Im Leseturm liegen kurze Nachrichten und erste Sätze. Mit jedem verstandenen Text wird ein neues Fenster hell und zeigt den Weg zum Geschichtenhain.'}),
          capital:Object.freeze({title:'Kapitel 5 · Der Geschichtenhain',text:'Im Hain verbinden sich Wörter zu kleinen Geschichten. Der Fuchs sammelt die letzten goldenen Blätter und erkennt, wohin die Karte von Anfang an geführt hat.'}),
          final:Object.freeze({title:'Kapitel 6 · Der Wortschatz-Horizont',text:'Auf einer weiten Lichtung leuchten alle sechs Blätter der Karte. Der Fuchs blickt zurück auf Buchstaben, Wörter, Sätze und Geschichten, die im Laufe des Jahres sicher geworden sind.'})
        }),
        finale:'Die Wortreise ist vollendet. Die Karte bleibt als Erinnerung daran, wie aus einzelnen Buchstaben ein ganzer Wortschatz gewachsen ist.'
      }),
      battle:Object.freeze({
        title:'Das Wortreich · Die Krone der sechs Burgen',
        companion:'Der Fuchs und das Ritterheer',
        opening:'Im Wortreich ist die goldene Wortkrone in sechs Zeichen geteilt. Jede Burg bewahrt eines davon. Der Fuchs führt das wachsende Ritterheer durch das Reich, doch jede Belagerung wird ausschließlich durch echten Lernfortschritt freigeschaltet.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Das Holztor von Fuchshain',text:'Am Rand des Wortreichs versperrt ein großes Holztor den Weg. Hinter dem Tor liegt das erste Kronenzeichen, das nach dem ersten sicheren Lernabschnitt erreicht werden kann.'}),
          tower:Object.freeze({title:'Kapitel 2 · Der Wachturm der Silben',text:'Vom Turm aus bewacht die Nebelwache den Weg zur nächsten Burg. Das Ritterheer wächst sichtbar, während neue Wörter und Silben sicherer werden.'}),
          wall:Object.freeze({title:'Kapitel 3 · Die Mauerburg',text:'Die Mauerburg schützt das dritte Kronenzeichen. Der Fuchs entdeckt einen alten Schriftstein, der zeigt, dass alle sechs Zeichen gemeinsam eine Krone bilden.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Die Höhenburg',text:'Hoch über dem Worttal wartet der Torwächter der Höhenburg. Erst ein abgeschlossenes Lernziel öffnet die nächste Belagerungsaktion und den Weg zum vierten Zeichen.'}),
          capital:Object.freeze({title:'Kapitel 5 · Die Königsburg',text:'In der Königsburg liegt das fünfte Zeichen. Nun ist erkennbar, dass die Krone nicht einem Gegner gehört: Sie steht für das Wissen, das im ganzen Jahr gesammelt wurde.'}),
          final:Object.freeze({title:'Kapitel 6 · Die Jahresfestung',text:'Die letzte Festung bewahrt das sechste Zeichen. Wenn sie erreicht wird, setzt der Fuchs alle Zeichen zur Wortkrone zusammen – als sichtbares Symbol des eigenen Lernwegs.'})
        }),
        finale:'Die Wortkrone ist vollständig. Der Fuchs und das Ritterheer kehren nicht mit fremder Beute zurück, sondern mit einem Symbol für das selbst erworbene Wissen.'
      })
    }),
    french:Object.freeze({
      adventure:Object.freeze({
        title:'Voyage Français · Le Carnet des Lumières',
        companion:'Die junge Reisegruppe',
        opening:'In einem alten Reisetagebuch fehlen sechs Seiten. Jede Seite gehört zu einem besonderen Ort. Die Gruppe reist durch eine freundliche, vollständig fiktionale französisch inspirierte Welt und füllt das Tagebuch mit jedem erreichten Lernziel.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Gare Claire',text:'Am kleinen Bahnhof beginnt die Reise. Auf der ersten leeren Seite erscheinen die Wörter für Begrüßung, Wege und erste Begegnungen.'}),
          tower:Object.freeze({title:'Kapitel 2 · Pont des Mots',text:'Eine helle Brücke führt über den Fluss. Auf ihren Schildern tauchen bekannte Wörter in neuen Zusammenhängen auf und weisen den Weg zur nächsten Stadt.'}),
          wall:Object.freeze({title:'Kapitel 3 · Belle Place',text:'Auf dem großen Platz sammelt die Gruppe Geräusche, Sätze und kleine Beobachtungen. Die dritte Tagebuchseite wird zu einer lebendigen Erinnerung an den Ort.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Jardin des Sons',text:'Im Garten führen Klangspuren zu versteckten Wegmarken. Wer genau hört und versteht, entdeckt die Route zum Geschichtenviertel.'}),
          capital:Object.freeze({title:'Kapitel 5 · Rive des Histoires',text:'Am Ufer erzählen kurze Texte von den bisher besuchten Orten. Die Gruppe erkennt, dass alle fünf Seiten zusammen auf ein letztes Reiseziel hinweisen.'}),
          final:Object.freeze({title:'Kapitel 6 · Horizon Français',text:'Am Ende der Route wird die sechste Seite gefüllt. Das Tagebuch zeigt nun die gesamte Reise und wie viel Sprache unterwegs wirklich verstanden wurde.'})
        }),
        finale:'Le Carnet des Lumières ist vollständig. Jede Seite bleibt als Erinnerung an einen Abschnitt des Lernjahres erhalten.'
      }),
      battle:Object.freeze({
        title:'Les Compagnons de Lumière · Die sechs Festungen',
        companion:'Die Gefährten des Lichts',
        opening:'Sechs vollständig fiktionale Festungen der Garde des Brumes liegen auf dem Weg zum Turm des Lichts. Die Gefährten kämpfen gegen keine realen Länder oder Völker; jede Aktion ist reine Spielinszenierung eines zuvor erreichten Lernziels.',
        chapters:Object.freeze({
          outpost:Object.freeze({title:'Kapitel 1 · Fort Clair',text:'Die Gefährten erreichen Fort Clair, wo das erste Lichtzeichen verborgen ist. Das Tor öffnet sich erst für die Spielaktion, wenn das erste echte Lernziel erreicht wurde.'}),
          tower:Object.freeze({title:'Kapitel 2 · Tour Lumière',text:'Vom hohen Turm sendet die Garde des Brumes falsche Wegzeichen. Die Gefährten erkennen den richtigen Pfad durch das Wissen, das im Lernen bereits gefestigt wurde.'}),
          wall:Object.freeze({title:'Kapitel 3 · Bastion des Fleurs',text:'Hinter der Bastion liegt das dritte Lichtzeichen. Die Gruppe wächst sichtbar, ohne dass ihre Ausrüstung jemals die fachliche Bewertung beeinflusst.'}),
          citadel:Object.freeze({title:'Kapitel 4 · Citadelle Verte',text:'Die grüne Zitadelle wird von einer vollständig fiktionalen Nebelwache geschützt. Ein abgeschlossenes Tagesziel gibt den nächsten Vorstoß frei.'}),
          capital:Object.freeze({title:'Kapitel 5 · Fort du Soleil',text:'Im Sonnenfort finden die Gefährten das fünfte Lichtzeichen und erfahren, dass alle Zeichen gemeinsam den Weg zum letzten Turm markieren.'}),
          final:Object.freeze({title:'Kapitel 6 · Grande Forteresse',text:'Die letzte Festung bewahrt das sechste Zeichen. Nach der abschließenden Spielaktion leuchten alle Zeichen zusammen und machen den gesamten Lernweg sichtbar.'})
        }),
        finale:'Die sechs Lichtzeichen sind vereint. Die Gefährten haben keine reale Welt erobert, sondern eine fiktionale Reise abgeschlossen, die den eigenen Lernfortschritt sichtbar macht.'
      })
    })
  });

  function normalizeSubject(subject){
    const value=String(subject||'english');
    return STORYLINES[value]?value:'english';
  }
  function normalizeMode(mode){
    return mode==='adventure'?'adventure':'battle';
  }
  function get(subject,mode){
    const safeSubject=normalizeSubject(subject),safeMode=normalizeMode(mode);
    return STORYLINES[safeSubject][safeMode];
  }
  function chapter(subject,mode,id='outpost',{completed=false}={}){
    const story=get(subject,mode),safeId=CHAPTER_ORDER.includes(id)?id:'outpost';
    if(completed&&safeId==='final')return {title:'Finale · '+story.title,text:story.finale,finale:true};
    return {...story.chapters[safeId],id:safeId,finale:false};
  }
  function stageChapterId(level){
    return CHAPTER_ORDER[Math.max(0,Math.min(CHAPTER_ORDER.length-1,(Number(level)||1)-1))];
  }
  function current(subject,mode,{fortress=null,stage=1}={}){
    const id=CHAPTER_ORDER.includes(fortress?.id)?fortress.id:stageChapterId(stage);
    return chapter(subject,mode,id,{completed:!!fortress?.capturedAt});
  }
  function narration(subject,mode,opts={}){
    const story=get(subject,mode),part=current(subject,mode,opts);
    return [story.opening,part.title,part.text,part.finale?'':'Ziel der Reise: '+story.title+'.'].filter(Boolean).join(' ');
  }

  window.VTWorldStory={STORYLINES,CHAPTER_ORDER,get,chapter,current,stageChapterId,narration};
})();
