'use strict';

let activeCleanup=null;

export async function startFortressReveal({mount,subject='english',reducedMotion=false,onComplete,onSkip,onError}={}){
  if(!(mount instanceof HTMLElement))throw new Error('Story 3D mount missing');
  activeCleanup?.();
  try{
    const mod=await import('./story-scene-renderer.js?v=0.21.58');
    const session=await mod.renderFortressReveal({mount,subject,reducedMotion,onComplete,onSkip,onError});
    activeCleanup=()=>session?.destroy?.();
    return session;
  }catch(error){
    mount.dataset.story3d='fallback';
    mount.innerHTML='<div class="story3d-fallback" role="img" aria-label="Festung am Horizont"><span class="story3d-fallback-sky"></span><span class="story3d-fallback-hill"></span><span class="story3d-fallback-castle">♜</span></div>';
    onError?.(error);
    return {renderer:'fallback',destroy(){mount.replaceChildren();delete mount.dataset.story3d}};
  }
}

export function stopStory3D(){activeCleanup?.();activeCleanup=null}

if(typeof window!=='undefined')window.VTStory3D={startFortressReveal,stopStory3D,version:'0.21.58-spike.1'};
