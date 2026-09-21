import fs from 'node:fs';

function assert(condition,message){
  if(!condition){console.error('FAIL:',message);process.exit(1);}
}
const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('js/ui.js','utf8');
const model=fs.readFileSync('js/model.js','utf8');
const learning=fs.readFileSync('js/learning.js','utf8');
const css=fs.readFileSync('css/app.css','utf8');
const dna=fs.readFileSync('PRODUCT_DNA.md','utf8');

const nav=html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0]||'';
assert((nav.match(/<button\b/g)||[]).length===3,'Kindernavigation hat genau drei Hauptaktionen');
for(const label of ['Heute','Lernen','Erfolge'])assert(nav.includes('>'+label+'</button>'),'Kindernavigation enthält '+label);
for(const admin of ['Vokabeln','Einstellungen','Fortschritt & Noten'])assert(!nav.includes(admin),'Administration fehlt in Kindernavigation: '+admin);

assert(html.includes('id="parentAreaBtn"')&&html.includes('id="childModeBtn"'),'expliziter Rollenwechsel existiert');
assert(html.includes('id="parentView"'),'Elternbereich existiert');
assert(html.includes('id="childProgressView"'),'eigene kindgerechte Fortschrittsansicht existiert');
assert(!html.includes('id="moreView"'),'altes gemischtes Mehr-Menü ist entfernt');
assert(html.indexOf('id="setList"')>html.indexOf('id="parentView"'),'Lernsets liegen im Elternbereich');
assert(html.indexOf('id="libraryView"')>html.indexOf('id="parentView"'),'Bibliothek liegt hinter Elternbereich');

assert(ui.includes("let appRole='child'"),'App startet im Kind-Modus');
assert(ui.includes("PARENT_VIEW_IDS.has(id)&&!isParentMode()"),'Admin-Views sind im Kind-Modus gesperrt');
assert(ui.includes('function openParentGate()'),'Elternbereich braucht bewussten Rollenwechsel');
assert(ui.includes("$('#parentAreaBtn').onclick=openParentGate"),'Elternschalter ist gebunden');
assert(ui.includes("$('#childModeBtn').onclick=exitParentMode"),'Rückkehr zum Kindermodus ist gebunden');
assert(css.includes('.parent-mode .bottom-nav{display:none!important}'),'Kindernavigation verschwindet im Elternbereich');

assert(model.includes("Die neuen Wörter werden noch von einem Erwachsenen geprüft."),'OCR-Prüfung wird dem Kind nicht als Aufgabe gegeben');
assert(model.includes("Der nächste Test wird noch von einem Erwachsenen vorbereitet."),'Testumfang wird dem Kind nicht als Aufgabe gegeben');
assert(model.includes("Heute ist noch nichts vorbereitet. Bitte einen Erwachsenen um Hilfe."),'fehlender Lernstoff führt nicht zur Lernset-Anlage durch das Kind');
assert(learning.includes("Diese Wörter werden noch von einem Erwachsenen geprüft."),'Erstkontakt öffnet im Kind-Modus keine Paarprüfung');

assert(dna.includes('Harte Rollengrenze'),'PRODUCT_DNA schreibt Rollentrennung fest');
assert(dna.includes('bewusster Rollenwechsel'),'Elternbereich ist als eigener Modus definiert');

console.log('OK: child/parent role separation');
