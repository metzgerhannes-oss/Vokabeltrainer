'use strict';

(function(){
  function qrSvg(value){
    const text=String(value||'');
    if(!text||typeof window.qrcode!=='function')return '';
    const qr=window.qrcode(0,'M');
    qr.addData(text,'Byte');
    qr.make();
    return qr.createSvgTag({cellSize:5,margin:10,scalable:true});
  }

  function render(target,value,label='QR-Code'){
    const el=typeof target==='string'?document.querySelector(target):target;
    if(!el)return false;
    const svg=qrSvg(value);
    if(!svg){el.innerHTML='<span class="muted-line">QR-Code konnte nicht erzeugt werden.</span>';return false}
    el.innerHTML=svg;
    el.setAttribute('role','img');
    el.setAttribute('aria-label',label);
    return true;
  }

  async function copyText(value,success='Kopiert.'){
    const text=String(value||'');
    try{
      await navigator.clipboard.writeText(text);
      if(typeof toast==='function')toast(success,'good');
      return true;
    }catch(_e){
      const ta=document.createElement('textarea');
      ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();
      const ok=document.execCommand?.('copy');ta.remove();
      if(typeof toast==='function')toast(ok?success:'Kopieren nicht möglich.',ok?'good':'subtle');
      return !!ok;
    }
  }

  async function shareUrl(url,title,text){
    if(navigator.share){
      try{await navigator.share({title:title||'',text:text||'',url:String(url||'')});return true}
      catch(e){if(e?.name==='AbortError')return false}
    }
    return copyText(url,'Link kopiert.');
  }

  window.VTQr={render,svg:qrSvg,copyText,shareUrl};
})();