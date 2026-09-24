import { webkit } from 'playwright';
import { readFile } from 'node:fs/promises';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Parent documentation smoke failed: '+m)};

async function pdfFromClick(selector,minPages,label){
  const [download]=await Promise.all([page.waitForEvent('download'),page.click(selector)]);
  const path=await download.path();assert(path,label+' download has no local file');
  const bytes=await readFile(path);
  assert(bytes.subarray(0,8).toString('latin1').startsWith('%PDF-1.'),label+' is not a PDF');
  assert(bytes.length>5000,label+' PDF is unexpectedly small: '+bytes.length);
  const text=bytes.toString('latin1'),pages=(text.match(/\/Type \/Page\b/g)||[]).length;
  assert(pages>=minPages,label+' PDF has too few pages: '+pages);
  assert(download.suggestedFilename().toLowerCase().endsWith('.pdf'),label+' filename is not .pdf');
  return {bytes:bytes.length,pages,filename:download.suggestedFilename()};
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof state==='object'&&typeof enterParentMode==='function'&&typeof window.VTParentDocs?.open==='function');
  await page.evaluate(()=>enterParentMode('parentView'));
  await page.waitForSelector('#parentView.active');

  assert(await page.locator('.parent-primary-action').count()===2,'parent home prioritizes exactly two frequent preparation actions');
  assert(await page.locator('.parent-compact-action').count()===2,'secondary parent functions are visually grouped below the primary actions');
  assert(!(await page.locator('#parentHelpDisclosure').getAttribute('open')),'help and background stay collapsed by default to reduce visual load');
  await page.click('#parentHelpDisclosure > summary');

  assert(await page.locator('#parentGuideOpenBtn').isVisible(),'parent guide entry is visible');
  assert(await page.locator('#parentGuidePdfBtn').isVisible(),'parent guide PDF action is visible');
  assert(await page.locator('#parentPedagogyOpenBtn').isVisible(),'pedagogical documentation entry is visible');
  assert(await page.locator('#parentPedagogyPdfBtn').isVisible(),'pedagogical PDF action is visible');

  await page.click('#parentGuideOpenBtn');
  await page.waitForSelector('#modal[open] .parent-doc-reader');
  const guideText=await page.locator('.parent-doc-reader').innerText();
  assert(guideText.includes('Der einfachste Ablauf'),'guide renders its workflow');
  assert(guideText.includes('Vokabeln per Foto erfassen'),'guide explains OCR');
  assert(guideText.includes('Backup und Wiederherstellung'),'guide explains backup');
  await page.click('#modal button[value="cancel"]');
  await page.waitForFunction(()=>!document.querySelector('#modal')?.open);

  const guidePdf=await pdfFromClick('#parentGuidePdfBtn',3,'parent guide');

  await page.click('#parentPedagogyOpenBtn');
  await page.waitForSelector('#modal[open] .parent-doc-reader');
  const pedagogyText=await page.locator('.parent-doc-reader').innerText();
  assert(pedagogyText.includes('Warum aktiver Abruf im Mittelpunkt steht'),'pedagogy explains retrieval');
  assert(pedagogyText.includes('nachhaltig gemeistert'),'pedagogy explains mastery');
  assert(pedagogyText.includes('LRS-orientierte Gestaltung'),'pedagogy explains LRS-oriented design');

  const pedagogyPdf=await pdfFromClick('#parentDocPdfBtn',6,'pedagogical documentation');
  await page.click('#modal button[value="cancel"]');

  assert(errors.length===0,'browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer parent documentation UI smoke: passed');
  console.log('✓ guide and pedagogical documentation are readable in the parent area');
  console.log('✓ local PDF exports are valid multi-page PDF files');
  console.log(JSON.stringify({guidePdf,pedagogyPdf}));
}finally{
  await browser.close();
}
