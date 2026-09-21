import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const core=read('js/core.js');
const app=read('js/app.js');
const sw=read('sw.js');
const css=read('css/app.css');
const learning=read('js/learning.js');
const quiz=read('js/quiz-engine.js');
const model=read('js/model.js');
const focusUi=read('js/focus-ui.js');
const ui=read('js/ui.js');
const help=read('js/help.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const dna=read('PRODUCT_DNA.md');
const allJs=fs.readdirSync('js').filter(x=>x.endsWith('.js')).map(x=>read('js/'+x)).join('\n');

const passed=[];
const assert=(value,name)=>{if(!value)throw new Error('Preflight smoke failed: '+name);passed.push(name)};

const version=core.match(/const VERSION\s*=\s*'([^']+)'/)?.[1]||'';
assert(version==='0.12.0','core version is v0.12.0');
assert(html.includes('Beta v'+version),'document title matches app version');
assert(app.includes("sw.js?v="+version),'service-worker registration uses current version');
assert(sw.includes("APP_VERSION='"+version+"'"),'service-worker app version matches');

const csp=html.match(/Content-Security-Policy" content="([^"]+)"/)?.[1]||'';
assert(csp&&!csp.includes("'unsafe-inline'")&&!csp.includes("'unsafe-eval'"),'CSP stays free of unsafe-inline and unsafe-eval');
assert(csp.includes("object-src 'none'")&&csp.includes("base-uri 'none'"),'CSP blocks objects and base injection');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert(new Set(ids).size===ids.length,'static HTML IDs are unique');
assert(html.includes('class="skip-link" href="#mainContent"')&&html.includes('id="mainContent" tabindex="-1"'),'skip link and focusable main landmark exist');
assert((html.match(/aria-hidden="true">[⌂✦▤▥⚙]/g)||[]).length===5,'decorative navigation glyphs are hidden from assistive tech');

const answerFields=[...learning.matchAll(/<input id="answerField"[^>]*>/g)].map(m=>m[0]);
assert(answerFields.length>=5&&answerFields.every(x=>/aria-label="[^"]+"/.test(x)),'all dynamic answer fields have accessible names');

assert(css.includes(':focus-visible')&&css.includes('outline:3px solid'),'visible keyboard focus is defined');
assert(css.includes('min-height:44px'),'primary pointer targets have a 44px minimum height');
assert(css.includes('prefers-reduced-motion:reduce'),'reduced-motion preference is respected');
assert(css.includes('.lrs-mode .eyebrow{text-transform:none'),'LRS mode avoids forced uppercase helper labels');
assert(ui.includes("function showView(id){$$('.view').forEach")&&ui.includes("$$('.nav-btn[data-view]').forEach"),'view navigation iterates element lists');
assert(focusUi.includes("cardExtras=function(){return ''}"),'retrieval diagnostics are removed before answering');
assert(['gradeText=function','gradeChoice=function','gradeGrammar=function'].every(x=>focusUi.includes(x)),'all evaluated feedback paths use focused overrides');
assert(!/setTimeout\s*\(\s*\(\)\s*=>\s*nextStudy/.test(focusUi),'focused feedback never auto-advances');
assert(focusUi.includes('id="grammarRuleHelp" class="notice subtle hidden"'),'Latin grammar help is opt-in');
assert(!html.includes('id="sessionProgress"')&&!focusUi.includes('progress.max='),'retrieval has no dynamic progress bar');
assert(focusUi.includes("pill.textContent='Aufgabe '+(session.index+1)"),'focused learning keeps stable task orientation');
assert(focusUi.includes("$$('[data-answer],.chunk').forEach"),'focused answer controls iterate element lists');
assert(!/(?<!\$)\$\([^)]*\)\.(?:forEach|find|map|filter|some|every|reduce)\s*\(/.test(allJs),'single-element selector is never used with array collection methods');
assert(learning.includes('opts.orthographyOk===false')&&learning.includes('w.errorProfile.spelling'),'orthographic errors remain a separate learning signal');
assert(html.indexOf('js/quiz-engine.js?v='+version)>html.indexOf('js/model.js?v='+version)&&html.indexOf('js/quiz-engine.js?v='+version)<html.indexOf('js/learning.js?v='+version),'quiz engine loads between model and learning logic');
assert(sw.includes("'./js/quiz-engine.js?v="+version+"'"),'quiz engine is part of the offline app shell');
assert(quiz.includes('function makeQuizQuestion(')&&quiz.includes('Object.freeze')&&quiz.includes('function gradeQuizQuestion('),'quiz engine creates immutable questions and grades centrally');
assert(learning.includes('setCurrentQuizQuestion(w,sub)')&&learning.includes('gradeQuizQuestion(q,answer)'),'core learning path uses the central question snapshot and grader');
assert(focusUi.includes('gradeQuizQuestion(q,answer)'),'focused-learning overrides use the same central grader');
assert(quiz.includes("issues.push('sense-mismatch')")&&quiz.includes("issues.push('set-mismatch')"),'quiz integrity gate rejects set/sense identity drift');
assert(!/split\(\/\\s\*\[\/;,\]/.test(model),'answer comparison never invents alternatives by punctuation splitting');
assert(model.includes('setNeedsPairReview')&&learning.includes('setNeedsPairReview'),'unreviewed OCR sets are blocked from learning');
assert(model.includes('setNeedsFirstContact')&&learning.includes('startFirstContact')&&learning.includes("mode:'firstContact'"),'new vocabulary must pass the first-contact phase before ordinary learning');

assert(html.includes('id="helpBtn"')&&html.includes('id="helpPopover"'),'central help and shared help popover exist');
assert((html.match(/data-help="/g)||[]).length>=10,'main views expose contextual help at the important concepts');
assert(help.includes("document.addEventListener('mouseover'")&&help.includes("document.addEventListener('focusin'")&&help.includes("document.addEventListener('click'"),'context help supports mouse, keyboard focus and touch/click');
assert(help.includes('function openAppHelp()')&&help.includes('So funktioniert der Vokabeltrainer'),'central help provides a short orientation');
const learnMarkup=html.slice(html.indexOf('id="learnView"'),html.indexOf('id="dashboardView"'));
assert(!learnMarkup.includes('data-help='),'focused retrieval view contains no contextual-help distractions');
assert(css.includes('body.learning-focus .help-popover{display:none!important}'),'open help cannot cover focused retrieval');


assert(manifest.start_url==='./'&&manifest.scope==='./','manifest remains repository-path safe');
assert(manifest.display==='standalone'&&manifest.lang==='de','manifest standalone mode and language are explicit');

const refs=[...html.matchAll(/(?:src|href)="((?:css|js)\/[^"]+\?v=[^"]+)"/g)].map(m=>m[1]);
for(const ref of refs)assert(sw.includes("'./"+ref+"'"),'app-shell caches '+ref);

assert(dna.includes('Die fachlich korrekte Vokabelabfrage ist die Daseinsberechtigung der App.')&&dna.includes('Release-Blocker'),'top product DNA keeps vocabulary correctness as release gate');
assert(dna.includes('LRS und Barrierefreiheit sind Teil des Grunddesigns')&&dna.includes('Lernen fokussiert, Motivation außen herum'),'product DNA accessibility and focus guardrails remain present');
assert(dna.includes('Erfassen → fachlich prüfen → kennenlernen → abrufen')&&dna.includes('Vokabelheft'),'product DNA requires first contact and handwriting before retrieval');

console.log('Vokabeltrainer preflight smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
