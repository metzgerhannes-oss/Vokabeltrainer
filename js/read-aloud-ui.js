'use strict';

(() => {
  let token=0;
  let speaking=false;

  function voiceScore(voice){
    const name=(String(voice?.name||'')+' '+String(voice?.voiceURI||'')).toLowerCase();
    let score=0;
    for(const [key,value] of [['premium',120],['enhanced',110],['neural',100],['natural',95],['siri',90],['google',72],['microsoft',68],['anna',54],['petra',52],['helena',50],['katja',48],['markus',46]]){
      if(name.includes(key))score=Math.max(score,value);
    }
    if(voice?.localService)score+=8;
    if(voice?.default)score+=2;
    for(const bad of ['compact','novelty','whisper','zarvox','trinoids'])if(name.includes(bad))score-=140;
    return score;
  }

  function preferredVoice(lang='de-DE'){
    if(!('speechSynthesis' in window))return null;
    const prefix=String(lang||'de-DE').split('-')[0].toLowerCase();
    const voices=(speechSynthesis.getVoices?.()||[]).filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));
    return [...voices].sort((a,b)=>voiceScore(b)-voiceScore(a))[0]||null;
  }

  function setSpeaking(on){
    speaking=!!on;
    document.documentElement.classList.toggle('read-aloud-speaking',speaking);
  }

  function speak(text,{lang='de-DE',rate}={}){
    const value=String(text||'').replace(/\s+/g,' ').trim();
    if(!value)return false;
    if(!('speechSynthesis' in window)){
      if(typeof toast==='function')toast('Vorlesen wird auf diesem Gerät nicht unterstützt.','subtle');
      return false;
    }
    const myToken=++token;
    speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(value);
    utterance.lang=lang;
    utterance.rate=rate??((typeof readingSupportEnabled==='function'&&readingSupportEnabled()) ? .82 : .92);
    utterance.pitch=1;
    const voice=preferredVoice(lang);if(voice)utterance.voice=voice;
    utterance.onstart=()=>{if(myToken===token)setSpeaking(true)};
    const done=()=>{if(myToken===token)setSpeaking(false)};
    utterance.onend=done;utterance.onerror=done;
    speechSynthesis.speak(utterance);
    return true;
  }

  function stop(){
    token+=1;
    if('speechSynthesis' in window)speechSynthesis.cancel();
    setSpeaking(false);
  }

  function textForButton(button){
    const direct=button.dataset.readText;
    if(direct)return direct;
    const ids=String(button.dataset.readTargets||button.dataset.readTarget||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(ids.length)return ids.map(id=>document.getElementById(id)?.textContent||'').join('. ');
    const container=button.closest('[data-read-aloud-scope]');
    return container?.dataset.readAloudScope||container?.textContent||'';
  }

  function escAttr(value){
    return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function button(text,label='Vorlesen',extraClass=''){
    const value=String(text||'').trim();
    if(!value)return '';
    return '<button type="button" class="read-aloud-btn '+escAttr(extraClass)+'" data-read-text="'+escAttr(value)+'" aria-label="'+escAttr(label)+'">🔊</button>';
  }

  function currentView(){return document.querySelector('.view.active')}

  function pageText(view){
    if(!view)return '';
    const safe=view.querySelectorAll('[data-page-read]');
    if(safe.length)return [...safe].map(el=>el.dataset.pageRead||el.textContent||'').join('. ');
    return [...view.querySelectorAll('h1,h2,h3,.eyebrow,button:not(.read-aloud-btn)')]
      .filter(el=>!el.closest('[data-read-exclude]')&&!el.disabled)
      .map(el=>el.textContent||'')
      .join('. ');
  }

  function syncPageButton(){
    const btn=document.querySelector('#germanPageReadBtn');
    if(!btn)return;
    const view=currentView();
    const german=typeof state==='object'&&state?.activeSubject==='german';
    const child=typeof isParentMode==='function'?!isParentMode():true;
    const safeView=!!view&&view.id!=='learnView'&&view.id!=='parentView'&&!view.id?.startsWith('parent');
    btn.classList.toggle('hidden',!(german&&child&&safeView));
  }

  function bind(){
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('.read-aloud-btn,[data-read-aloud-button]');
      if(button){
        event.preventDefault();event.stopPropagation();
        if(speaking){stop();return}
        speak(textForButton(button),{lang:button.dataset.readLang||'de-DE'});
        return;
      }
      if(event.target.closest?.('#germanPageReadBtn')){
        event.preventDefault();
        if(speaking){stop();return}
        speak(pageText(currentView()),{lang:'de-DE'});
      }
    });
    new MutationObserver(syncPageButton).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    syncPageButton();
  }

  window.VTReadAloud={speak,stop,button,preferredVoice,syncPageButton,pageText};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();