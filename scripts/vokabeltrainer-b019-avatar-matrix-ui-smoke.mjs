import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('B-019 avatar matrix failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTMenuAvatarArt?.atlasReady===true);

  const result=await page.evaluate(async()=>{
    const subjects=['english','latin','french','german'];
    const styles=['male','female','neutral'];
    const rows={english:{female:0,neutral:1},latin:{male:2,female:3,neutral:4},french:{male:5,female:6,neutral:7},german:{male:8,female:8,neutral:8}};
    const out=[];
    for(const subject of subjects){
      for(const style of styles){
        for(let stage=1;stage<=6;stage++){
          const direct=window.VTMenuAvatarArt.get(subject,style,stage);
          const sprite=window.VTMenuAvatarArt.getSprite(subject,style,stage);
          out.push({subject,style,stage,direct,sprite,expectedRow:rows[subject]?.[style]});
        }
      }
    }
    return {
      out,
      readySubjects:window.VTMenuAvatarArt.readySubjects,
      readyStyles:window.VTMenuAvatarArt.readyStyles
    };
  });

  for(const subject of ['english','latin','french','german']){
    assert(result.readySubjects[subject]===true,subject+' is fully artwork-ready');
    for(const style of ['male','female','neutral']){
      assert(result.readyStyles[subject+':'+style]===true,subject+'/'+style+' is artwork-ready');
    }
  }

  for(const item of result.out){
    const hasDirect=typeof item.direct==='string'&&item.direct.startsWith('blob:');
    const hasSprite=!!item.sprite&&typeof item.sprite.url==='string'&&item.sprite.url.startsWith('blob:');
    assert(hasDirect||hasSprite,`${item.subject}/${item.style}/stage-${item.stage} has a real image asset`);
    if(item.subject==='english'&&item.style==='male'){
      assert(hasDirect,`English male stage ${item.stage} keeps dedicated full-body artwork`);
    }else{
      assert(hasSprite,`${item.subject}/${item.style}/stage-${item.stage} uses approved atlas artwork`);
      assert(item.sprite.col===item.stage-1,`${item.subject}/${item.style}/stage-${item.stage} maps to the matching progression column`);
      assert(item.sprite.row===item.expectedRow,`${item.subject}/${item.style}/stage-${item.stage} maps to the correct subject/style atlas row`);
      assert(item.sprite.cols===6&&item.sprite.rows===9,'atlas geometry stays 6x9');
    }
  }

  const germanRows=result.out.filter(x=>x.subject==='german').map(x=>x.sprite?.row);
  assert(germanRows.every(x=>x===8),'all German profile variants consistently use the approved fox row');

  const latin=result.out.filter(x=>x.subject==='latin');
  assert(latin.every(x=>!x.direct),'Latin never uses the English dedicated portrait series');

  assert(errors.length===0,'avatar matrix produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer B-019 avatar matrix: passed');
  console.log('✓ 4 subjects × 3 styles × 6 stages covered');
  console.log('✓ English male dedicated portraits preserved');
  console.log('✓ English female/neutral, Latin, French and German use approved atlas rows');
  console.log('✓ German always resolves to fox artwork');
}finally{
  await browser.close();
}
