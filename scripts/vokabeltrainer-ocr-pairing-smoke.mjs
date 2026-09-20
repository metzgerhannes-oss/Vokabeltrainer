import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,Blob,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{location:{href:'https://example.test/Vokabeltrainer/index.html'}},
  navigator:{},
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/translation.js','js/io.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const result=vm.runInContext(`
(()=>{
  state=defaultState();state.activeSubject='english';
  const header='level\\tpage_num\\tblock_num\\tpar_num\\tline_num\\tword_num\\tleft\\ttop\\twidth\\theight\\tconf\\ttext';
  const row=(word,left,top,width=100,height=20,conf=95)=>['5','1','1','1',String(top),String(top),String(left),String(top),String(width),String(height),String(conf),word].join('\\t');
  const tsv=[
    header,
    row('Vocabulary',80,0,180),
    row('Unit',80,25,90),
    row('Test',80,50,80),
    row('look',100,100,120),row('schauen',1500,100,210),
    row('write',100,140,120),row('schreiben',1500,140,230),
    row('house',100,180,130),row('Haus',1500,180,130)
  ].join('\\n');
  const parsed=tesseractTsvToVocabulary(tsv,'english');
  if(parsed.rows.length!==3)throw new Error('expected 3 OCR pairs, got '+parsed.rows.length+' '+JSON.stringify(parsed.rows));
  const pairs=parsed.rows.map(r=>r.term+'='+r.translation);
  if(!pairs.includes('look=schauen')||!pairs.includes('write=schreiben')||!pairs.includes('house=Haus'))throw new Error('wide right column paired incorrectly: '+pairs.join(' | '));
  return pairs;
})()
`,context,{filename:'ocr-wide-column-runtime'});

const io=fs.readFileSync('js/io.js','utf8');
const translation=fs.readFileSync('js/translation.js','utf8');
if(/right=right\.filter\(g=>g\.minX<divider\+/.test(io))throw new Error('OCR safety smoke failed: aggressive right-column x cutoff returned');
if(!translation.includes("row.include=false"))throw new Error('OCR safety smoke failed: automatic repairs are still preselected');

console.log('Vokabeltrainer OCR pairing safety smoke: passed');
for(const pair of result)console.log('✓ '+pair);
console.log('✓ wide German column is preserved');
console.log('✓ automatic dictionary/repair rows require explicit confirmation');
