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
assert((nav.match(/<button\b/g)||[]).length===4,'Kindernavigation hat genau vier Hauptbereiche');
for(const label of ['Heute','Lernen','Armee','Erfolge'])assert(nav.includes('>'+label+'</button>'),'Kindernavigation enthält '+label);
for(const admin of ['Vokabeln','Einstellungen','Fortschritt & Noten'])assert(!nav.includes(admin),'Administration fehlt in Kindernavigation: '+admin);

assert(html.includes('id="parentAreaBtn"')&&html.includes('id="childModeBtn"'),'expliziter Rollenwechsel existiert');
assert(html.includes('id="profileBtn"')&&html.includes('aria-haspopup="dialog"'),'aktives Lernprofil ist als direkter Profilwechsler erkennbar');
assert(html.includes('id="parentView"'),'Elternbereich existiert');
assert(html.includes('id="practiceView"'),'eigener kindgerechter Lernbereich existiert');
assert(html.includes('id="childProgressView"'),'eigener kindgerechter Erfolgsbereich existiert');
for(const id of ['practiceCardsBtn','practiceWeakBtn','practiceAllBtn','practiceSpecialBtn'])assert(html.includes('id="'+id+'"'),'Lernen enthält den Einstieg '+id);
assert(!html.includes('id="moreView"'),'altes gemischtes Mehr-Menü ist entfernt');
assert(!/id="homeView"[\s\S]*?id="practiceView"/.exec(html)?.[0].includes('id="campaignCard"'),'Start enthält keine Kampagne');
assert(/id="practiceView"[\s\S]*?id="childProgressView"/.exec(html)?.[0].includes('id="cardboxOverviewCard"'),'Karteikasten liegt im Lernbereich');
assert(/id="practiceView"[\s\S]*?id="childProgressView"/.exec(html)?.[0].includes('id="testCheckCard"'),'Testcheck liegt im Lernbereich');
assert(!/id="childProgressView"[\s\S]*?id="armyView"/.exec(html)?.[0].includes('id="campaignCard"'),'Erfolge enthalten keine Kampagne');
assert(/id="armyView"[\s\S]*?id="campaignMapView"/.exec(html)?.[0].includes('id="campaignCard"'),'Kampagne liegt ausschließlich im Armeebereich');
assert(html.indexOf('id="setList"')>html.indexOf('id="parentView"'),'Lernsets liegen im Elternbereich');
assert(html.indexOf('id="libraryView"')>html.indexOf('id="parentView"'),'Bibliothek liegt hinter Elternbereich');
assert(html.indexOf('id="parentTestPlanBtn"')<html.indexOf('id="parentLibraryBtn"'),'Test planen steht vor Lernen ohne Test');
assert(html.includes('<strong>Vokabeln vorbereiten</strong>')&&html.includes('<small>Ohne festen Testtermin</small>'),'Elternbereich benennt den no-test Lernweg eindeutig');

assert(ui.includes("let appRole='child'"),'App startet im Kind-Modus');
assert(ui.includes("PARENT_VIEW_IDS.has(id)&&!isParentMode()"),'Admin-Views sind im Kind-Modus gesperrt');
assert(ui.includes('function openParentGate('),'Elternbereich braucht bewussten Rollenwechsel');
assert(ui.includes('function isPairedChildDevice()'),'gekoppeltes Kindergerät hat eine eigene Rollensperre');
assert(ui.includes("if(isPairedChildDevice()){toast('Der Elternbereich ist auf diesem Kindergerät gesperrt."),'gekoppeltes Kindergerät kann Elternbereich nicht lokal öffnen');
assert(ui.includes('function openProfileSwitcher()'),'Profilwechsler hat einen eigenen Dialog');
assert(ui.includes("$('#profileBtn').onclick=openProfileSwitcher"),'Profilname in der Kopfleiste öffnet den Profilwechsler');
assert(ui.includes('state.activeLearnerId=next.id'),'Profilwechsel setzt das aktive Lernprofil');
assert(ui.includes("$('#parentAreaBtn').onclick=()=>openParentGate()"),'Elternschalter ist gebunden');
assert(ui.includes("$('#childModeBtn').onclick=exitParentMode"),'Rückkehr zum Kindermodus ist gebunden');
assert(css.includes('.parent-mode .bottom-nav{display:none!important}'),'Kindernavigation verschwindet im Elternbereich');

assert(model.includes("Die neuen Wörter werden noch von einem Erwachsenen geprüft."),'OCR-Prüfung wird dem Kind nicht als Aufgabe gegeben');
assert(model.includes("Der nächste Test wird noch von einem Erwachsenen vorbereitet."),'Testumfang wird dem Kind nicht als Aufgabe gegeben');
assert(model.includes("Heute ist noch nichts vorbereitet. Bitte einen Erwachsenen um Hilfe."),'fehlender Lernstoff führt nicht zur Lernset-Anlage durch das Kind');
assert(learning.includes("Diese Wörter werden noch von einem Erwachsenen geprüft."),'Erstkontakt öffnet im Kind-Modus keine Paarprüfung');
assert(!ui.includes('id="setDate"'),'allgemeine Lernstoffdetails enthalten kein konkurrierendes Testdatum');
assert(ui.includes('automatisch als Lernstoff'),'Testplanung erklärt die automatische Lernstoffübernahme');

assert(dna.includes('Harte Rollengrenze'),'PRODUCT_DNA schreibt Rollentrennung fest');
assert(dna.includes('bewusster Rollenwechsel'),'Elternbereich ist als eigener Modus definiert');
assert(dna.includes('„Test planen“ der normale Weg'),'PRODUCT_DNA hält Testplanung als Standardweg bei bekanntem Test fest');

console.log('OK: child/parent role separation');
