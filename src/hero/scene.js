/** REALTIME HERO SCENE
 * One renderer owns the logo, sky, water reflection, and underwater particles.
 * Scroll progress and bloom controls come from hero.js; the scene never intercepts scrolling.
 */
import * as THREE from 'three';
import { createLogo } from './logo.js';
import { createOcean } from './ocean.js';

export function mountScene(stage, state) {
  const mobile=stage.clientWidth<768;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
  renderer.domElement.setAttribute('aria-hidden','true');
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#88c1f2',.002);
  const camera=new THREE.PerspectiveCamera(40,1,.1,20000);
  scene.add(new THREE.HemisphereLight('#cde7fc','#315b76',1.3));
  const key=new THREE.DirectionalLight('#ffffff',2.2);key.position.set(-7,9,6);scene.add(key);
  const rim=new THREE.DirectionalLight('#cde7fc',1);rim.position.set(6,4,-3);scene.add(rim);
  const model=createLogo(mobile);scene.add(model.group);
  const ocean=createOcean(renderer,scene,mobile);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(4,4);
  const bloomTarget=new THREE.Vector3(-.9,.75,.25);
  const clock=new THREE.Clock();let elapsed=0,visible=true,disposed=false,hovering=false;
  let width=stage.clientWidth,height=stage.clientHeight;
  let renderedFrames=0;

  // Underwater motes are one draw call, restrained to the submerged part of the shot.
  const random=i=>{const v=Math.sin(i*127.1+23.7)*43758.5453;return v-Math.floor(v);};
  const positions=new Float32Array(160*3);
  for(let i=0;i<160;i++) {positions[i*3]=(random(i*3)-.5)*18;positions[i*3+1]=-2.7-random(i*3+1)*8;positions[i*3+2]=random(i*3+2)*12-4;}
  const particlesGeometry=new THREE.BufferGeometry();particlesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particlesMaterial=new THREE.PointsMaterial({color:'#cde7fc',size:.025,transparent:true,opacity:0,depthWrite:false});
  const particles=new THREE.Points(particlesGeometry,particlesMaterial);scene.add(particles);

  function resize() {
    width=stage.clientWidth;height=stage.clientHeight;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
    if(state.paused) render(0);
  }
  function pointerMove(event) {
    if(event.pointerType==='touch') return; // touch interaction uses the Bloom button; vertical swipes stay native.
    const rect=stage.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  }
  function pointerLeave() {pointer.set(4,4);hovering=false;}
  stage.addEventListener('pointermove',pointerMove,{passive:true});stage.addEventListener('pointerleave',pointerLeave);

  function render(delta) {
    if(disposed)return;
    const frozen=state.reduced||state.paused;
    if(!frozen)elapsed+=Math.min(delta,.05);
    const progress=state.reduced?0:state.progress;
    const depth=THREE.MathUtils.smoothstep(progress,.33,.78);
    const portrait=width/height<.9;
    model.group.position.set(portrait?0:1.6,.25+Math.sin(elapsed*.7)*.045+progress*1.5,0);
    model.group.rotation.set(-.025, -.12+Math.sin(elapsed*.4)*.025, -.08);
    model.group.scale.setScalar(portrait?.72:1);
    camera.position.set(0, .6-progress*5.8,portrait?11.4:10.2-progress*1.5);
    camera.lookAt(0,-.3-progress*4.4,0);
    model.group.updateMatrixWorld(true);camera.updateMatrixWorld();
    raycaster.setFromCamera(pointer,camera);
    const hits=progress<.25&&!frozen?raycaster.intersectObjects([model.blue,model.white],false):[];
    hovering=hits.length>0&&hits[0].object===model.blue;
    if(hovering)bloomTarget.copy(model.group.worldToLocal(hits[0].point.clone()));
    if(state.bloom)bloomTarget.set(-.7,.9,.23);
    const strength=(!frozen&&(hovering||state.bloom))?1:0;
    const damping=1-Math.exp(-Math.min(delta,.05)*5);
    model.uniforms.uBloom.value=THREE.MathUtils.lerp(model.uniforms.uBloom.value,strength,frozen?1:damping);
    model.uniforms.uBloomPoint.value.lerp(bloomTarget,damping);
    model.uniforms.uTime.value=elapsed;
    ocean.water.material.uniforms.time.value=elapsed*.3;
    ocean.water.visible=progress<.8;
    ocean.sky.visible=progress<.72;
    model.group.visible=progress<.66;
    scene.background=new THREE.Color().lerpColors(new THREE.Color('#88c1f2'),new THREE.Color('#030a18'),depth);
    scene.fog.color.copy(scene.background);scene.fog.density=.002+depth*.045;
    particlesMaterial.opacity=depth*.55;particles.position.y=Math.sin(elapsed*.2)*.07;
    renderer.render(scene,camera);renderedFrames++;
    stage.dataset.bloom=model.uniforms.uBloom.value.toFixed(3);
    stage.dataset.depth=depth.toFixed(3);
    stage.dataset.frames=String(renderedFrames);
  }
  function tick() {
    const delta=clock.getDelta();
    if(!visible||document.hidden)return;
    // Paused/reduced scenes render only when explicitly invalidated.
    if((state.paused||state.reduced)&&!state.dirty)return;
    render(delta);state.dirty=false;
  }
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;state.dirty=true;});observer.observe(stage);
  const resizer=new ResizeObserver(resize);resizer.observe(stage);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.classList.remove('is-rendered');state.contextLost=true;});
  render(0);stage.classList.add('is-rendered');renderer.setAnimationLoop(tick);
  state.flowerCount=model.flowerCount;

  // Deterministic inspection hooks are opt-in and used by the screenshot checks.
  if(new URLSearchParams(location.search).has('heroDebug')) {
    window.__heroDebug={state,renderer,scene,camera,model,render:(progress,bloom=false)=>{state.progress=progress;state.bloom=bloom;state.paused=false;model.uniforms.uBloom.value=bloom?1:0;render(0);state.paused=true;}};
  }
  return ()=>{
    disposed=true;renderer.setAnimationLoop(null);observer.disconnect();resizer.disconnect();
    stage.removeEventListener('pointermove',pointerMove);stage.removeEventListener('pointerleave',pointerLeave);
    const geometries=new Set(),materials=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(m=>materials.add(m));});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
    ocean.normals.dispose();ocean.environment.dispose();
    // Water owns its reflection target internally; renderer disposal releases its context.
    renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    delete window.__heroDebug;
  };
}
