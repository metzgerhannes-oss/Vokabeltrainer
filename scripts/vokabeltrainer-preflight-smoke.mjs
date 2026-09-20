import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const core=read('js/core.js');
const app=read('js/app.js');
const sw=read('sw.js');
const css=read('css/app.css');
const learning=read('js/learning.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const dna=read('PRODUCT_DNA.md');

const passed=[];
const assert=(value,name)=>{if(!value)throw new Error('Preflight smoke failed: '+name);passed.push(name)};

const version=core.match(/const VERSION\s*=\s*'([^']+)'/)?.[1]||'';
assert(version==='0.10.0','core version is v0.10.0');
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

assert(manifest.start_url==='./'&&manifest.scope==='./','manifest remains repository-path safe');
assert(manifest.display==='standalone'&&manifest.lang==='de','manifest standalone mode and language are explicit');

const refs=[...html.matchAll(/(?:src|href)="((?:css|js)\/[^"]+\?v=[^"]+)"/g)].map(m=>m[1]);
for(const ref of refs)assert(sw.includes("'./"+ref+"'"),'app-shell caches '+ref);

assert(dna.includes('LRS und Barrierefreiheit sind Teil des Grunddesigns')&&dna.includes('Lernen fokussiert, Motivation außen herum'),'product DNA accessibility and focus guardrails remain present');

console.log('Vokabeltrainer preflight smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
