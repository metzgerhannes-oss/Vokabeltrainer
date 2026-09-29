import fs from 'node:fs';
import vm from 'node:vm';

const assert=(value,name)=>{if(!value)throw new Error('B-018 free-writing smoke failed: '+name);console.log('✓ '+name)};
const moduleSource=fs.readFileSync('js/german-foundation.js','utf8');
const css=fs.readFileSync('css/app.css','utf8');

assert(moduleSource.includes('FREE_WRITING_LETTERS'),'free-writing alphabet is explicit');
for(const glyph of ['A','M','G','J','P','Q','Y','Ä','Ö','Ü'])assert(moduleSource.includes("upper:'"+glyph+"'"),'catalog contains '+glyph);
assert(moduleSource.includes('Dachgeschoss')&&moduleSource.includes('Erdgeschoss')&&moduleSource.includes('Keller'),'school lineature names all three writing zones');
assert(moduleSource.includes('drawPrimarySchoolLineature'),'lineature is drawn by a dedicated canvas helper');
assert(moduleSource.includes("if(run.freePractice){renderFreeWritingFinish();return}"),'free practice exits before completed-stage progress mutation');
assert(moduleSource.includes('Diese Aufgabe erzeugt keinen Mastery- oder Testfortschritt.'),'free-writing UI states the progress boundary');
assert(css.includes('.foundation-lineature-legend')&&css.includes('.foundation-lineature-canvas'),'lineature styling is present');
assert(css.includes('.foundation-free-letter-grid')&&css.includes('.foundation-free-case-row'),'manual letter and case selection are responsive UI elements');
assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'small-display selector keeps compact touch layout');

const drawStart=moduleSource.indexOf('function renderFreeWritingDraw');
const drawEnd=moduleSource.indexOf('function renderDraw',drawStart);
const freeDraw=moduleSource.slice(drawStart,drawEnd);
assert(drawStart>=0&&drawEnd>drawStart,'free-writing renderer is isolated');
assert(!freeDraw.includes("bump(")&&!freeDraw.includes('saveProgress(')&&!freeDraw.includes('completedStages'),'free-writing renderer cannot mutate foundation evidence');

const sandbox={window:{},console,setTimeout:()=>0,clearTimeout:()=>{},Date,Math,Set};
vm.createContext(sandbox);
vm.runInContext(moduleSource,sandbox,{filename:'js/german-foundation.js'});
const api=sandbox.window.VTGermanFoundation;
assert(!!api?.freeWritingTasks&&!!api?.freeWritingCatalog,'free-writing helpers are exported for verification');

const onlyLower=api.freeWritingTasks(['A'],'lower');
assert(onlyLower.length===1&&onlyLower[0].glyph==='a','single lowercase selection produces only a');
const pair=api.freeWritingTasks(['M'],'pair');
assert(pair.length===2&&pair.map(x=>x.glyph).join('')==='Mm','pair mode produces M and m only');
const group=api.freeWritingTasks(['A','E','M','S'],'lower');
assert(group.map(x=>x.glyph).join(',')==='a,e,m,s','group selection produces only a, e, m, s');
const descenders=api.freeWritingTasks(['G','J','P','Q','Y'],'lower').map(x=>x.glyph).join('');
assert(descenders==='gjpqy','letters with descenders are available for lineature practice');

console.log('B-018 free-writing smoke: passed');
