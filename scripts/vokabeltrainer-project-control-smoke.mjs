import fs from 'node:fs';

const read = path => fs.readFileSync(path,'utf8');
const fail = message => { throw new Error('Project control smoke failed: '+message); };
const match = (text,re,label) => {
  const m=text.match(re);
  if(!m) fail('cannot read '+label);
  return m[1];
};
const same = (actual,expected,label) => {
  if(actual!==expected) fail(`${label}: expected ${expected}, got ${actual}`);
};

const required=[
  'PROJECT_CONTROL.md',
  'PRODUCT_DNA.md',
  'VISUAL_DNA.md',
  'docs/project/DECISIONS.md',
  'docs/project/CURRENT_STATE.md',
  'docs/project/BACKLOG.md',
  'docs/project/TEST_MATRIX.md',
  'docs/project/CHANGE_TEMPLATE.md',
  'docs/project/CHAT_LIFECYCLE.md',
  'V1_ACCEPTANCE_TEST.md'
];
for(const path of required){
  if(!fs.existsSync(path)) fail('missing canonical file '+path);
}

const core=read('js/core.js');
const sw=read('sw.js');
const index=read('index.html');
const readme=read('README.md');
const state=read('docs/project/CURRENT_STATE.md');
const acceptance=read('V1_ACCEPTANCE_TEST.md');
const decisions=read('docs/project/DECISIONS.md');
const backlog=read('docs/project/BACKLOG.md');
const control=read('PROJECT_CONTROL.md');
const matrix=read('docs/project/TEST_MATRIX.md');

const version=match(core,/const VERSION = '([0-9]+\.[0-9]+\.[0-9]+)'/,'js/core.js VERSION');
same(match(sw,/const APP_VERSION='([0-9]+\.[0-9]+\.[0-9]+)'/,'sw.js APP_VERSION'),version,'service worker version');
same(match(index,/<title>Vokabeltrainer[^<]*v([0-9]+\.[0-9]+\.[0-9]+)<\/title>/,'index title version'),version,'index title version');
same(match(index,/id="versionBadge"[^>]*>v([0-9]+\.[0-9]+\.[0-9]+)<\/span>/,'visible version badge'),version,'visible version badge');
same(match(readme,/App-Version: \*\*v([0-9]+\.[0-9]+\.[0-9]+)\*\*/,'README current version'),version,'README version');
same(match(state,/- App-Version: \*\*v([0-9]+\.[0-9]+\.[0-9]+)\*\*/,'CURRENT_STATE version'),version,'CURRENT_STATE version');
same(match(acceptance,/Basis: v([0-9]+\.[0-9]+\.[0-9]+)/,'V1 acceptance basis'),version,'V1 acceptance basis');

const duplicates = (items,label) => {
  const seen=new Set();
  for(const id of items){
    if(seen.has(id)) fail('duplicate '+label+' '+id);
    seen.add(id);
  }
};
duplicates([...decisions.matchAll(/^### (D-[A-Za-z0-9-]+)\b/gm)].map(m=>m[1]),'Decision-ID');
duplicates([...backlog.matchAll(/^## (B-[0-9]+)\b/gm)].map(m=>m[1]),'Backlog-ID');

if(!control.includes('## 11. Definition von „fertig“ und „live“')) fail('Definition of Done missing from PROJECT_CONTROL');
if(!decisions.includes('D-20260927-009')) fail('operational Decision D-20260927-009 missing');
if(!matrix.includes('Project-Control-Konsistenz')) fail('Project-Control gate missing from TEST_MATRIX');
if(!control.includes('## 13. Chat-Lifecycle und Archivierung')) fail('Chat lifecycle missing from PROJECT_CONTROL');
if(!decisions.includes('D-20260928-003')) fail('chat lifecycle Decision D-20260928-003 missing');

console.log('Vokabeltrainer project control smoke passed');
console.log('✓ canonical governance files present');
console.log('✓ version '+version+' consistent across app and project status');
console.log('✓ Decision and Backlog IDs unique');
console.log('✓ Definition of Done, chat lifecycle and project-control gate present');
