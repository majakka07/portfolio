/** HOMEPAGE HERO ORCHESTRATION
 * Native scrolling controls one GSAP timeline. WebGL is progressively enhanced;
 * the original SVG and CSS ocean remain visible if a GPU context is unavailable.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const hero=document.querySelector('.ocean-hero');
if(hero) {
  const stage=hero.querySelector('.ocean-stage');
  const pause=hero.querySelector('[data-motion-toggle]');
  const bloom=hero.querySelector('[data-bloom-toggle]');
  const status=hero.querySelector('.ocean-status');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const state={progress:0,bloom:false,paused:false,reduced:preference.matches,dirty:true};
  let cleanupScene=()=>{},timeline;
  const header=document.querySelector('.site-header');

  function updateLayout() {
    hero.style.setProperty('--hero-nav-height',`${header.offsetHeight}px`);
    ScrollTrigger.refresh();state.dirty=true;
  }
  const resize=new ResizeObserver(updateLayout);resize.observe(header);

  function setMotion() {
    timeline?.scrollTrigger?.kill();timeline?.kill();
    gsap.set([hero.querySelector('.ocean-copy'),hero.querySelector('.ocean-bottom')],{clearProps:'all'});
    gsap.set(hero.querySelector('.ocean-underwater'),{opacity:0});
    gsap.set(hero.querySelector('.ocean-deep-copy'),{autoAlpha:0});
    hero.classList.toggle('is-still',state.reduced||state.paused);
    hero.classList.toggle('is-animated',!state.reduced&&!state.paused);
    state.progress=0;state.dirty=true;
    pause.hidden=state.reduced;
    pause.setAttribute('aria-pressed',String(state.paused));
    pause.textContent=state.paused?'Enable motion':'Pause motion';
    bloom.disabled=state.paused||state.reduced;
    if(state.reduced||state.paused)return;
    timeline=gsap.timeline({
      scrollTrigger:{trigger:hero,start:()=>`top top+=${header.offsetHeight}`,end:'bottom bottom',scrub:.65,invalidateOnRefresh:true},
      defaults:{ease:'none'},
    });
    timeline.to(state,{progress:1,duration:1,onUpdate:()=>{state.dirty=true;hero.dataset.progress=state.progress.toFixed(3);}},0)
      .to('.ocean-copy',{autoAlpha:0,y:-48,duration:.22},.05)
      .to('.ocean-bottom',{autoAlpha:0,duration:.15},.1)
      .to('.ocean-underwater',{opacity:1,duration:.38},.35)
      .fromTo('.ocean-waterline',{yPercent:100,opacity:0},{yPercent:-170,opacity:1,duration:.28},.35)
      .to('.ocean-waterline',{opacity:0,duration:.12},.63)
      .to('.ocean-deep-copy',{autoAlpha:1,y:0,duration:.2},.7);
  }
  pause.addEventListener('click',()=>{state.paused=!state.paused;setMotion();});
  bloom.addEventListener('click',()=>{
    state.bloom=!state.bloom;state.dirty=true;
    bloom.setAttribute('aria-pressed',String(state.bloom));
    bloom.textContent=state.bloom?'Restore blue logo':'Bloom the logo';
  });
  const onPreference=()=>{state.reduced=preference.matches;setMotion();};
  preference.addEventListener('change',onPreference);
  setMotion();updateLayout();

  // Only the homepage requests the large Three.js module. Reduced-motion users
  // receive the original SVG immediately, without downloading the 3D renderer.
  if(!state.reduced) {
    import('./scene.js').then(({mountScene})=>{
      try {
        cleanupScene=mountScene(stage,state);
        status.textContent='Move over the logo. Let curiosity bloom.';
        bloom.hidden=false;
      } catch(error) {
        console.warn('The 3D hero is unavailable; the static logo remains visible.',error);
        stage.classList.remove('is-rendered');bloom.hidden=true;
        status.textContent='A little curiosity. A different perspective.';
      }
    }).catch(error=>{console.warn('Using the static hero fallback.',error);bloom.hidden=true;});
  } else {bloom.hidden=true;status.textContent='A quieter view. Reduced motion is enabled.';}

  function cleanup() {
    cleanupScene();timeline?.scrollTrigger?.kill();timeline?.kill();resize.disconnect();preference.removeEventListener('change',onPreference);
  }
  if(import.meta.hot)import.meta.hot.dispose(cleanup);
  window.addEventListener('pagehide',event=>{if(!event.persisted)cleanup();},{once:true});
}
