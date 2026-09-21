import fs from 'node:fs';

function assert(condition,message){
  if(!condition){
    console.error('FAIL:',message);
    process.exit(1);
  }
}

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('css/app.css','utf8');
const ui=fs.readFileSync('js/ui.js','utf8');
const dna=fs.readFileSync('PRODUCT_DNA.md','utf8');

const nav=html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0]||'';
const navButtons=[...nav.matchAll(/<button\b/g)].length;
assert(navButtons===3,'Kindernavigation muss genau drei Hauptaktionen haben');
assert(nav.includes('>Heute</button>'),'Navigation braucht Heute');
assert(nav.includes('>Lernen</button>'),'Navigation braucht Lernen');
assert(nav.includes('>Mehr</button>'),'Navigation braucht Mehr');
assert(!nav.includes('Vokabeln')&&!nav.includes('Fortschritt'),'Verwaltung darf nicht in der Hauptnavigation stehen');

const progress=html.indexOf('id="progressDisclosure"');
const campaign=html.indexOf('id="campaignCard"');
const learning=html.indexOf('id="learningDisclosure"');
const optional=html.indexOf('id="optionalLearningCard"');
assert(progress>=0&&campaign>progress,'Fortschritt/Kampagne müssen nachgeordnet sein');
assert(learning>=0&&optional>learning,'Weitere Lernarten müssen nachgeordnet sein');
assert(html.includes('id="moreView"'),'Mehr-Ansicht fehlt');
for(const id of ['moreLibraryBtn','moreLearningBtn','moreProgressBtn','moreSettingsBtn']){
  assert(html.includes(`id="${id}"`),`${id} fehlt`);
}
assert(css.includes('v0.13.0 Guided child shell'),'Guided-shell CSS fehlt');
assert(css.includes('grid-template-columns:repeat(3,1fr)'),'Navigation ist nicht auf drei Spalten reduziert');
assert(ui.includes("['libraryView','dashboardView','settingsView'].includes(id)?'moreView':id"),'Mehr-Navigation bleibt in Unteransichten nicht aktiv');
assert(ui.includes("if(id==='homeView')$$('.home-disclosure').forEach"),'Startseite wird beim Zurückkehren nicht aufgeräumt');
assert(dna.includes('13. **Ohne Erklärung bedienbar**'),'UX-Release-Kriterium fehlt in PRODUCT_DNA');

console.log('OK: guided child shell');
