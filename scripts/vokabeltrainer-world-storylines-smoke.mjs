import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('js/world-story.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const ui=fs.readFileSync('js/ui.js','utf8');
const army=fs.readFileSync('js/army-ui.js','utf8');
const map=fs.readFileSync('js/campaign-map.js','utf8');
const doc=fs.readFileSync('docs/project/WORLD_STORYLINES_V1.md','utf8');
const decisions=fs.readFileSync('docs/project/DECISIONS.md','utf8');

const context=vm.createContext({window:{},Object,String,Number,Array,Math,Set,Map});
vm.runInContext(source,context,{filename:'world-story.js'});
const api=context.window.VTWorldStory;
const assert=(value,name)=>{if(!value)throw new Error('World storyline smoke failed: '+name);console.log('✓ '+name)};

assert(api&&api.CHAPTER_ORDER.length===6,'canonical story API exposes six ordered chapters');
for(const subject of ['english','latin','german','french']){
  for(const mode of ['adventure','battle']){
    const story=api.get(subject,mode);
    assert(!!story.title&&!!story.opening&&!!story.finale,subject+' '+mode+' has opening, title and finale');
    assert(Object.keys(story.chapters).length===6,subject+' '+mode+' has six chapters');
    for(const id of api.CHAPTER_ORDER){
      const chapter=story.chapters[id];
      assert(!!chapter?.title&&!!chapter?.text,subject+' '+mode+' '+id+' is narratively complete');
    }
    const final=api.chapter(subject,mode,'final',{completed:true});
    assert(final.finale===true&&final.text===story.finale,subject+' '+mode+' exposes its own final ending');
  }
}

assert(api.get('german','battle').chapters.outpost.title.includes('Holztor'),'German battle uses Wortreich story, not generic English fallback');
assert(api.get('english','battle').chapters.outpost.title.includes('Nebelvorposten'),'English battle keeps its own Northstar arc');
assert(api.get('latin','adventure').title.includes('Iter Romanum'),'Latin adventure has its own travel arc');
assert(api.get('french','battle').opening.includes('fiktional'),'French battle explicitly stays fictional');
assert(!/mastery|spacing|testReadiness|gradeQuiz|refreshMastery|setMastery|literacySkills\s*=/.test(source),'story model writes no academic state');
assert(index.includes('js/world-story.js?v=0.21.40'),'story model loads in app shell');
assert(sw.includes("'./js/world-story.js?v=0.21.40'"),'story model is cached offline');
assert(ui.includes("VTWorldStory?.chapter?.(state.activeSubject,'battle'"),'battle story reads canonical world story');
assert(army.includes("VTWorldStory?.current?.(subject,'adventure'"),'adventure hub reads canonical world story');
assert(map.includes("VTWorldStory?.chapter?.(st.subject,mode"),'campaign map reads canonical world story');
assert(army.includes("VTReadAloud?.button?.(narration"),'adventure story is readable aloud');
assert(map.includes("VTReadAloud?.button?.(storyText"),'map story is readable aloud');
assert(doc.includes('Opening')&&doc.includes('Kapitel 6')&&doc.includes('Finale'),'canonical story document defines complete arc');
assert(decisions.includes('D-20260929-004')&&decisions.includes('vollständige Storyline'),'story rule is locked as a project decision');

console.log('Vokabeltrainer world storyline smoke: passed');
