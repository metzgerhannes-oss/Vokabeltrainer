'use strict';

const HELP_TOPICS=Object.freeze({
  dailyGoal:{title:'Tagesziel',text:'Die App stellt automatisch fällige, unsichere und bei einem nahen Test besonders wichtige Vokabeln zusammen. Du musst die Wörter für heute nicht selbst auswählen.'},
  testCheck:{title:'Testcheck',text:'Eine Prüfungssimulation für den festgelegten Testumfang. Sie zeigt die aktuelle Testbereitschaft, verändert aber weder Lernstufen noch Wiederholungsintervalle und vergibt keine XP.'},
  testReady:{title:'Testbereit',text:'Ein Wort gilt als testbereit, wenn aktiver Abruf und Schreibung bereits ausreichend sicher sind. Das ist bewusst weniger streng als „nachhaltig gemeistert“.'},
  mastery:{title:'Nachhaltig gemeistert',text:'„Gemeistert“ bedeutet mehr als einmal richtig: aktiver Abruf, korrekte Schreibung, Erfolge an mehreren Tagen, zeitlicher Abstand und wiederholter Abruf ohne Hilfe.'},
  due:{title:'Heute fällig',text:'Diese Vokabeln haben ihr nächstes Wiederholungsdatum erreicht. Sie werden im Tagesziel bevorzugt berücksichtigt.'},
  streak:{title:'Lernserie',text:'Zeigt die aktuelle Folge direkt aufeinanderfolgender Lerntage. Sie ist Motivation – kein Teil der fachlichen Mastery.'},
  xp:{title:'XP',text:'XP sind reine Motivationspunkte. Sie können durch Aktivität steigen, machen eine Vokabel aber niemals automatisch „gemeistert“.'},
  stable:{title:'Langzeitstabil',text:'Diese Wörter haben bereits einen längeren Wiederholungsabstand und mehr unabhängige Erfolge als Fehler. „Langzeitstabil“ ist eine Zwischeninformation und nicht identisch mit Mastery.'},
  campaign:{title:'Kampagne',text:'Armee, Rang, Ausrüstung und Festungen visualisieren deinen fachlichen Fortschritt. Die Kampagne beeinflusst die Lernbewertung nicht.'},
  optionalModes:{title:'Weitere Lernarten',text:'Zusätzliche Übungen für bestimmte Teilfähigkeiten. Das Tagesziel bleibt der empfohlene Hauptweg; Extras sind freiwillig.'},
  library:{title:'Vokabelbibliothek',text:'Jedes Wort wird im lokalen App-Datenbestand möglichst nur einmal gespeichert. Mehrere Profile und Lehrwerke können dasselbe Wort nutzen; der persönliche Lernstand bleibt trotzdem getrennt.'},
  book:{title:'Lehrwerk',text:'Ein Lehrwerk wird über seine ISBN eindeutig erkannt. Ist dieselbe ISBN schon bekannt, können vorhandene Units und Vokabeln wiederverwendet werden.'},
  unit:{title:'Abschnitt / Unit',text:'Der Abschnitt verbindet eine Vokabel mit ihrer konkreten Lektion im Lehrwerk. So kann die App Inhalte eines bekannten Buches gezielt wiederfinden.'},
  usage:{title:'Verwendung',text:'Zeigt, in welchen Lernsets ein global gespeichertes Wort verwendet wird. Das Wort selbst muss dafür nicht mehrfach angelegt werden.'},
  backup:{title:'Backup',text:'Die Lerndaten liegen lokal auf diesem Gerät. Ein JSON-Backup sichert Profile, Lehrwerke, Lernsets, Lernstände, Noten und Testchecks und ist deshalb vor größeren Änderungen sinnvoll.'},
  profile:{title:'Lernprofil',text:'Jedes Profil hat eigene Fächer, Lernstände, Einstellungen, Noten und Testpläne. Die gemeinsame Vokabelbibliothek kann trotzdem von mehreren Profilen genutzt werden.'},
  lrs:{title:'LRS-Modus',text:'Der LRS-Modus verkürzt Einheiten, nutzt häufiger Audio und multisensorische Hilfen und hält die Darstellung ruhiger. Die fachlichen Mastery-Kriterien werden dadurch nicht abgesenkt.'},
  isbn:{title:'ISBN',text:'Die ISBN ist die eindeutige Kennung des Lehrwerks. Du kannst sie eingeben oder den Barcode bzw. die Nummer fotografieren.'},
  sense:{title:'Bedeutungen',text:'Echte unterschiedliche Bedeutungen eines Wortes werden getrennt gelernt und haben getrennte Lernstände. Synonyme derselben Bedeutung gehören dagegen zusammen.'},
  synonyms:{title:'Akzeptierte Synonyme',text:'Hier gehören nur gleichbedeutende Formulierungen hinein. Eine wirklich andere Wortbedeutung wird als eigene Bedeutung angelegt.'}
});

function helpEscape(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function helpIcon(topic,label=''){
  const item=HELP_TOPICS[topic];if(!item)return '';
  return `<button type="button" class="help-tip" data-help="${helpEscape(topic)}" aria-label="Hilfe: ${helpEscape(item.title)}">${label?helpEscape(label):'?'}</button>`;
}
function openAppHelp(){
  const parent=typeof isParentMode==='function'&&isParentMode();
  if(parent){
    modal('<div class="eyebrow">Elternbereich</div><h2>Lernen vorbereiten & begleiten</h2><div class="help-overview"><div><strong>1 · Lernstoff</strong><span>Vokabeln importieren, Wort-Bedeutungs-Paare prüfen und Lernsets verwalten.</span></div><div><strong>2 · Testplanung</strong><span>Termin, Umfang und Abfrageformat festlegen. Daraus berechnet die App das Tagespensum.</span></div><div><strong>3 · Begleitung</strong><span>Fortschritt, Testchecks, Noten, Profile, LRS-Einstellungen, Lehrwerke und Sicherung liegen nur hier.</span></div></div><div class="modal-actions"><button value="ok" class="primary">Verstanden</button></div>');
    return;
  }
  modal('<div class="eyebrow">Kurze Orientierung</div><h2>So funktioniert dein Vokabeltrainer</h2><div class="help-overview"><div><strong>1 · Heute</strong><span>Hier steht immer genau das, was als Nächstes dran ist.</span></div><div><strong>2 · Lernen</strong><span>Damit startest du direkt deine nächste Lernaufgabe.</span></div><div><strong>3 · Erfolge</strong><span>Hier siehst du deinen Fortschritt und deine Kampagne.</span></div></div><div class="notice subtle top-space"><strong>Du musst nichts verwalten.</strong> Neue Wörter, Testpläne und Einstellungen werden im Elternbereich vorbereitet.</div><div class="modal-actions"><button value="ok" class="primary">Verstanden</button></div>');
}

let helpTrigger=null,helpSticky=false;
function helpPopover(){return document.getElementById('helpPopover')}
function positionHelpPopover(trigger){
  const pop=helpPopover();if(!pop||pop.hidden||!trigger)return;
  const r=trigger.getBoundingClientRect(),gap=8,margin=12;
  pop.style.maxWidth=Math.min(340,window.innerWidth-margin*2)+'px';
  pop.style.left=Math.max(margin,Math.min(r.left,window.innerWidth-pop.offsetWidth-margin))+'px';
  let top=r.bottom+gap;
  if(top+pop.offsetHeight>window.innerHeight-margin)top=Math.max(margin,r.top-pop.offsetHeight-gap);
  pop.style.top=top+'px';
}
function showHelpPopover(trigger,sticky=false){
  if(!trigger||document.body.classList.contains('learning-focus'))return;
  const item=HELP_TOPICS[trigger.dataset.help],pop=helpPopover();if(!item||!pop)return;
  if(helpTrigger&&helpTrigger!==trigger){helpTrigger.removeAttribute('aria-describedby');helpTrigger.setAttribute('aria-expanded','false')}
  helpTrigger=trigger;helpSticky=sticky;
  pop.innerHTML=`<strong>${helpEscape(item.title)}</strong><span>${helpEscape(item.text)}</span>`;
  pop.hidden=false;trigger.setAttribute('aria-describedby','helpPopover');trigger.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>positionHelpPopover(trigger));
}
function hideHelpPopover(force=false){
  if(helpSticky&&!force)return;
  const pop=helpPopover();if(pop)pop.hidden=true;
  if(helpTrigger){helpTrigger.removeAttribute('aria-describedby');helpTrigger.setAttribute('aria-expanded','false')}
  helpTrigger=null;helpSticky=false;
}
function initHelpUi(){
  document.getElementById('helpBtn')?.addEventListener('click',openAppHelp);
  document.addEventListener('mouseover',e=>{const t=e.target.closest?.('.help-tip');if(t)showHelpPopover(t,false)});
  document.addEventListener('mouseout',e=>{const t=e.target.closest?.('.help-tip');if(t&&!t.contains(e.relatedTarget))hideHelpPopover(false)});
  document.addEventListener('focusin',e=>{const t=e.target.closest?.('.help-tip');if(t)showHelpPopover(t,helpSticky&&helpTrigger===t)});
  document.addEventListener('focusout',e=>{const t=e.target.closest?.('.help-tip');if(t&&!helpSticky)hideHelpPopover(false)});
  document.addEventListener('click',e=>{
    const t=e.target.closest?.('.help-tip');
    if(t){e.preventDefault();e.stopPropagation();const same=helpTrigger===t&&helpSticky;if(same)hideHelpPopover(true);else showHelpPopover(t,true);return}
    if(helpTrigger)hideHelpPopover(true);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&helpTrigger){e.stopPropagation();hideHelpPopover(true)}});
  window.addEventListener('resize',()=>helpTrigger?positionHelpPopover(helpTrigger):null);
  window.addEventListener('scroll',()=>hideHelpPopover(true),{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initHelpUi,{once:true});else initHelpUi();
