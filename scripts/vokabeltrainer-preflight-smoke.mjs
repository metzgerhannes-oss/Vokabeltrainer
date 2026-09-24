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
const readme=read('README.md');
const finalAudit=read('FINAL_AUDIT.md');
const allJs=fs.readdirSync('js').filter(x=>x.endsWith('.js')).map(x=>read('js/'+x)).join('\n');

const passed=[];
const assert=(value,name)=>{if(!value)throw new Error('Preflight smoke failed: '+name);passed.push(name)};

const version=core.match(/const VERSION\s*=\s*'([^']+)'/)?.[1]||'';
assert(/^0\.\d+\.\d+$/.test(version),'core version uses semantic pre-1.0 version');
assert(html.includes('Beta v'+version),'document title matches app version');
assert(html.includes('id="versionBadge"')&&html.includes('>v'+version+'</span>'),'header shows the exact running app version');
assert(app.includes("sw.js?v="+version),'service-worker registration uses current version');
assert(sw.includes("APP_VERSION='"+version+"'"),'service-worker app version matches');
assert(readme.includes('App-Version: **v'+version+'**'),'README version matches app version');
assert(finalAudit.includes('App v'+version),'FINAL_AUDIT version matches app version');

const csp=html.match(/Content-Security-Policy" content="([^"]+)"/)?.[1]||'';
assert(csp&&!csp.includes("'unsafe-inline'")&&!csp.includes("'unsafe-eval'"),'CSP stays free of unsafe-inline and unsafe-eval');
assert(csp.includes("object-src 'none'")&&csp.includes("base-uri 'none'"),'CSP blocks objects and base injection');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert(new Set(ids).size===ids.length,'static HTML IDs are unique');
assert(html.includes('class="skip-link" href="#mainContent"')&&html.includes('id="mainContent" tabindex="-1"'),'skip link and focusable main landmark exist');
const primaryNav=html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0]||'';
assert((primaryNav.match(/<span aria-hidden="true">/g)||[]).length===4,'decorative primary-navigation glyphs are hidden from assistive tech');

const answerFields=[...learning.matchAll(/<input id="answerField"[^>]*>/g)].map(m=>m[0]);
assert(answerFields.length>=5&&answerFields.every(x=>/aria-label="[^"]+"/.test(x)),'all dynamic answer fields have accessible names');

assert(css.includes(':focus-visible')&&css.includes('outline:3px solid'),'visible keyboard focus is defined');
assert(css.includes('min-height:44px'),'primary pointer targets have a 44px minimum height');
assert(css.includes('prefers-reduced-motion:reduce'),'reduced-motion preference is respected');
assert(css.includes('.lrs-mode .eyebrow{text-transform:none'),'LRS mode avoids forced uppercase helper labels');
assert(ui.includes("document.querySelectorAll('.view').forEach")&&ui.includes("document.querySelectorAll('.nav-btn[data-view]').forEach"),'view navigation iterates element lists');
assert(ui.includes('function isPairedChildDevice()')&&ui.includes("s.role==='child'"),'paired child-device role is recognized in UI');
assert(ui.includes("Der Elternbereich ist auf diesem Kindergerät gesperrt."),'paired child device has an explicit administration guard');
assert(html.includes('id="campaignMapBtn"')&&html.includes('id="campaignMapView"')&&html.includes('id="campaignMapBoard"'),'child campaign exposes the dynamic field-map view');
assert(html.includes('css/campaign-map.css?v='+version)&&html.includes('js/campaign-map.js?v='+version),'campaign map CSS and module use the running app version');
assert(html.includes('id="parentGuideOpenBtn"')&&html.includes('id="parentPedagogyOpenBtn"'),'parent area exposes guide and pedagogical documentation');
assert(html.includes('id="parentGuidePdfBtn"')&&html.includes('id="parentPedagogyPdfBtn"'),'parent documentation exposes direct PDF actions');
assert(html.includes('js/parent-docs.js?v=0.18.48'),'parent documentation module is loaded');
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
assert(learning.includes("gradeChoice(b,w,b.dataset.answer,q.targets,'recognition',false,q)")&&focusUi.includes('questionSnapshot||currentQuizQuestion'),'choice grading is bound to the exact rendered question snapshot');
assert(app.includes("addEventListener('controllerchange'")&&app.includes('location.reload()'),'installed app reloads once when a new service worker takes control');
assert(focusUi.includes('gradeQuizQuestion(q,answer)'),'focused-learning overrides use the same central grader');
assert(quiz.includes("issues.push('sense-mismatch')")&&quiz.includes("issues.push('set-mismatch')"),'quiz integrity gate rejects set/sense identity drift');
assert(!/split\(\/\\s\*\[\/;,\]/.test(model),'answer comparison never invents alternatives by punctuation splitting');
assert(model.includes('setNeedsPairReview')&&learning.includes('setNeedsPairReview'),'unreviewed OCR sets are blocked from learning');
assert(!model.includes('setNeedsFirstContact')&&learning.includes('startCopyPractice')&&learning.includes("mode:'firstContact'"),'copying is retained as an optional unit without gating ordinary learning');

assert(html.includes('id="helpBtn"')&&html.includes('id="helpPopover"'),'central help and shared help popover exist');
const childHomeMarkup=html.slice(html.indexOf('id="homeView"'),html.indexOf('id="childProgressView"'));
assert(!childHomeMarkup.includes('data-help="'),'child home is self-explanatory without contextual-help clutter');
assert((html.match(/data-help="/g)||[]).length>=5,'contextual help remains available in parent and administration views');
assert(help.includes("document.addEventListener('mouseover'")&&help.includes("document.addEventListener('focusin'")&&help.includes("document.addEventListener('click'"),'context help supports mouse, keyboard focus and touch/click');
assert(help.includes('function openAppHelp()')&&help.includes('So funktioniert dein Vokabeltrainer')&&help.includes('Lernen vorbereiten & begleiten'),'central help provides separate child and parent orientation');
const learnMarkup=html.slice(html.indexOf('id="learnView"'),html.indexOf('id="parentView"'));
assert(!learnMarkup.includes('data-help='),'focused retrieval view contains no contextual-help distractions');
assert(css.includes('body.learning-focus .help-popover{display:none!important}'),'open help cannot cover focused retrieval');


assert(manifest.start_url==='./'&&manifest.scope==='./','manifest remains repository-path safe');
assert(manifest.display==='standalone'&&manifest.lang==='de','manifest standalone mode and language are explicit');
assert(manifest.orientation==='any','installed app supports both portrait and landscape');

const refs=[...html.matchAll(/(?:src|href)="((?:css|js)\/[^"]+\?v=[^"]+)"/g)].map(m=>m[1]);
for(const ref of refs)assert(sw.includes("'./"+ref+"'"),'app-shell caches '+ref);

assert(dna.includes('Die fachlich korrekte Vokabelabfrage ist die Daseinsberechtigung der App.')&&dna.includes('Release-Blocker'),'top product DNA keeps vocabulary correctness as release gate');
assert(dna.includes('LRS und Barrierefreiheit sind Teil des Grunddesigns')&&dna.includes('Lernen fokussiert, Motivation außen herum'),'product DNA accessibility and focus guardrails remain present');
assert(dna.includes('Erfassen → fachlich prüfen → direkt lernen / aktiv abrufen')&&dna.includes('Abschreiben ist keine Freigabesperre')&&dna.includes('Vokabelheft'),'product DNA keeps copying optional and direct learning available after verification');

console.log('Vokabeltrainer preflight smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
