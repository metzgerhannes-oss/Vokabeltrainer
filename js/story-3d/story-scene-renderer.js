'use strict';

import * as THREE from '../vendor/three-r186.module.js';

function subjectPalette(subject){
  if(subject==='latin')return {sky:0xc9d8df,ground:0x777653,stone:0xb2a184,accent:0x9b4836};
  if(subject==='french')return {sky:0xc7d7e6,ground:0x6f866d,stone:0xb7afa3,accent:0x5f7392};
  if(subject==='german')return {sky:0xd7ddc5,ground:0x66764f,stone:0x9f9580,accent:0x6d7b43};
  return {sky:0xbdd0dc,ground:0x657857,stone:0x989284,accent:0x45688d};
}

function disposeObject(root){
  root.traverse?.(obj=>{
    obj.geometry?.dispose?.();
    if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose?.());
    else obj.material?.dispose?.();
  });
}

export async function renderFortressReveal({mount,subject='english',reducedMotion=false,onComplete,onSkip}={}){
  const palette=subjectPalette(subject);
  mount.replaceChildren();
  mount.dataset.story3d='three';
  mount.dataset.story3dSubject=subject;

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  renderer.setSize(mount.clientWidth||960,mount.clientHeight||540,false);
  renderer.setClearColor(palette.sky,1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.append(renderer.domElement);

  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog(palette.sky,18,52);
  const camera=new THREE.PerspectiveCamera(48,(mount.clientWidth||960)/(mount.clientHeight||540),0.1,120);
  camera.position.set(-8,5.8,17);
  camera.lookAt(2,3,0);

  scene.add(new THREE.HemisphereLight(0xfff3d7,0x4a5847,2.2));
  const sun=new THREE.DirectionalLight(0xffe1a3,2.4);sun.position.set(-6,12,8);scene.add(sun);

  const groundMat=new THREE.MeshStandardMaterial({color:palette.ground,roughness:1});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,50),groundMat);
  ground.rotation.x=-Math.PI/2;ground.position.set(8,0,-4);scene.add(ground);

  const hillMat=new THREE.MeshStandardMaterial({color:new THREE.Color(palette.ground).multiplyScalar(0.8),roughness:1});
  for(let i=0;i<7;i++){
    const hill=new THREE.Mesh(new THREE.SphereGeometry(5.5+i%3,24,12),hillMat.clone());
    hill.scale.y=0.38;hill.position.set(-14+i*7,-1.15,-7-(i%2)*3);scene.add(hill);
  }

  const fortress=new THREE.Group();fortress.position.set(7.5,0,-5.5);scene.add(fortress);
  const stone=new THREE.MeshStandardMaterial({color:palette.stone,roughness:0.95});
  const dark=new THREE.MeshStandardMaterial({color:new THREE.Color(palette.stone).multiplyScalar(0.7),roughness:1});
  const accent=new THREE.MeshStandardMaterial({color:palette.accent,roughness:0.8});

  const keep=new THREE.Mesh(new THREE.BoxGeometry(7.4,4.2,3.4),stone);keep.position.y=2.2;fortress.add(keep);
  for(const x of [-4.7,4.7]){
    const tower=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.8,5.6,12),stone.clone());tower.position.set(x,2.8,0);fortress.add(tower);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.75,1.5,12),accent.clone());roof.position.set(x,6.35,0);fortress.add(roof);
  }
  const gate=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.5,0.35),dark);gate.position.set(0,1.25,1.85);fortress.add(gate);
  const flagPole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,3.4,8),dark);flagPole.position.set(0,6.1,0);fortress.add(flagPole);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.9,0.95),accent);flag.position.set(0.95,7.1,0);fortress.add(flag);

  fortress.scale.setScalar(0.82);
  fortress.rotation.y=-0.28;

  const overlay=document.createElement('div');overlay.className='story3d-overlay';
  overlay.innerHTML='<div><small>Nächstes Ziel</small><strong>Die Testfestung</strong></div><button type="button" class="story3d-skip">Überspringen</button>';
  mount.append(overlay);
  const skip=overlay.querySelector('.story3d-skip');

  let raf=0,stopped=false,completed=false,frames=0,last=performance.now(),fpsSamples=[];
  const duration=reducedMotion?900:5200;
  const start=performance.now();
  mount.dataset.reducedMotion=String(!!reducedMotion);

  const finish=(skipped=false)=>{
    if(completed)return;
    completed=true;
    mount.dataset.story3dState=skipped?'skipped':'complete';
    if(skipped)onSkip?.();else onComplete?.();
  };
  skip.addEventListener('click',()=>{finish(true)});

  function resize(){
    const w=Math.max(1,mount.clientWidth||960),h=Math.max(1,mount.clientHeight||540);
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  }
  const ro=new ResizeObserver(resize);ro.observe(mount);

  function loop(now){
    if(stopped)return;
    const dt=Math.max(1,now-last);last=now;frames++;if(frames>8)fpsSamples.push(1000/dt);
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,3);
    if(reducedMotion){
      camera.position.set(-1.5,5.2,15.5);
    }else{
      camera.position.x=-8+7.2*eased;
      camera.position.y=5.8+0.6*Math.sin(eased*Math.PI);
      camera.position.z=17-2.1*eased;
    }
    camera.lookAt(4.6,3.0,-3.2);
    flag.rotation.y=Math.sin(now*0.002)*0.08;
    renderer.render(scene,camera);
    if(t<1)raf=requestAnimationFrame(loop);
    else{
      const avg=fpsSamples.length?fpsSamples.reduce((a,b)=>a+b,0)/fpsSamples.length:0;
      mount.dataset.story3dAvgFps=avg.toFixed(1);
      finish(false);
    }
  }
  raf=requestAnimationFrame(loop);

  return {
    renderer:'three',
    destroy(){
      stopped=true;cancelAnimationFrame(raf);ro.disconnect();
      disposeObject(scene);renderer.dispose();mount.replaceChildren();
      delete mount.dataset.story3d;delete mount.dataset.story3dState;
    }
  };
}
