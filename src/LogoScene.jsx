import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import shapeData from './logo-shape.json';

// Three continuous, procedural floral surfaces. No external textures or requests.
const floralShader = /* glsl */`
uniform float uProgress;
uniform float uTime;
varying vec3 vLogoPosition;
float petal(vec2 p, float petals, float twist) {
  float r = length(p);
  float angle = atan(p.y, p.x) + twist * r;
  float edge = .34 + .20 * pow(.5 + .5 * cos(angle * petals), 1.6);
  return 1.0 - smoothstep(edge - .06, edge + .06, r);
}
vec3 floral(vec2 uv) {
  // Daisy: a field of scalloped ivory petals and powder-blue centers.
  vec2 daisyP = fract(uv * 2.1 + .5) - .5;
  float daisy = petal(daisyP, 9., .2);
  float center = 1.0 - smoothstep(.075, .12, length(daisyP));
  vec3 daisyColor = mix(vec3(.20,.41,.47), vec3(.96,.85,.72), daisy);
  daisyColor = mix(daisyColor, vec3(.55,.76,.95), center);
  // Rose: continuous nested, twisting petal ridges.
  vec2 roseP = fract(uv * 1.5 + vec2(.15,.35)) - .5;
  float r = length(roseP);
  float a = atan(roseP.y, roseP.x);
  float rose = .5 + .5 * sin(r * 39. - a * 3. + sin(a * 5.) * .65);
  vec3 roseColor = mix(vec3(.40,.18,.29), vec3(.94,.61,.65), smoothstep(.05,.95,rose));
  roseColor = mix(roseColor, vec3(.97,.78,.71), .2 * smoothstep(.25,.6,r));
  // Hydrangea: soft four-petal florets with tiny contrasting hearts.
  vec2 hydP = fract(uv * 3.2 + .5) - .5;
  float hyd = petal(hydP, 4., .65);
  float veins = .5 + .5 * cos(length(hydP) * 52.);
  vec3 hydColor = mix(vec3(.24,.31,.51), mix(vec3(.62,.54,.84),vec3(.66,.83,.96),veins*.45),hyd);
  hydColor = mix(hydColor, vec3(.94,.88,.69), 1.-smoothstep(.025,.065,length(hydP)));
  vec3 color = mix(daisyColor, roseColor, smoothstep(.20,.37,uProgress));
  color = mix(color, hydColor, smoothstep(.47,.65,uProgress));
  return mix(color, vec3(.2462,.5333,.8879), smoothstep(.76,1.,uProgress));
}
float relief(vec2 uv) {
  vec3 c = floral(uv);
  return dot(c, vec3(.3,.5,.2)) * (1. - smoothstep(.76,1.,uProgress));
}
`;

function createFloralMaterial(uniforms) {
  const material = new THREE.MeshPhysicalMaterial({ color: '#88C1F2', roughness: .32, metalness: .08, clearcoat: .55, clearcoatRoughness: .28 });
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLogoPosition;\nuniform float uProgress;\nuniform float uTime;');
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vLogoPosition = position;
      float pulse = (1.0 - smoothstep(.78, 1., uProgress));
      float angle = atan(position.y, position.x);
      float ripple = sin(angle * 7. + uTime * 1.8) * .016 * pulse;
      transformed.xy *= 1.0 + ripple;
      transformed.z += sin(position.x * 5. + position.y * 4. + uTime * 2.) * .014 * pulse;
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\n' + floralShader);
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = floral(vLogoPosition.xy * .78);');
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', `
      #include <normal_fragment_begin>
      // Analytic surface relief follows each morphing floral pattern.
      vec2 uv = vLogoPosition.xy * .78;
      float h = relief(uv);
      vec2 gradient = vec2(relief(uv + vec2(.003,0.)) - h, relief(uv + vec2(0.,.003)) - h) / .003;
      if (abs(vNormal.z) > .5) normal = normalize(normal + vec3(-gradient * .075, 0.));
    `);
  };
  material.customProgramCacheKey = () => 'floral-logo-v1';
  return material;
}

function LogoModel({ elapsed, playing, active, reduced, rotation, viewReset, interaction, replay, onReady, onPhase, onFinish, onProgress }) {
  const group = useRef();
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => { if (active) invalidate(); }, [active, playing, interaction, replay, viewReset, invalidate]);
  const lastPhase = useRef(-1);
  const lastFrame = useRef(null);
  const uniforms = useMemo(() => ({ uProgress: { value: reduced ? 1 : 0 }, uTime: { value: 0 } }), []);
  const geometry = useMemo(() => {
    const points = shapeData.outline.map(([x,y]) => new THREE.Vector3(x, -y, 0));
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    const outline = new THREE.Shape(curve.getPoints(600).map(p => new THREE.Vector2(p.x,p.y)));
    const outer = new THREE.ExtrudeGeometry(outline, { depth: 3.8, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .65, bevelThickness: .65, curveSegments: 24 });
    outer.computeBoundingBox();
    const center = outer.boundingBox.getCenter(new THREE.Vector3());
    outer.translate(-center.x,-center.y,-center.z);
    outer.scale(.065,.065,.065);
    const parsed = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${shapeData.whitePath}" fill="white"/></svg>`);
    const shapes = parsed.paths.flatMap(path => SVGLoader.createShapes(path)).map(source => {
      // Reflect paths before extrusion, preserving front-face winding and normals.
      const shape = new THREE.Shape(source.getPoints(48).map(p => new THREE.Vector2(p.x, -p.y)));
      shape.holes = source.holes.map(hole => new THREE.Path(hole.getPoints(48).map(p => new THREE.Vector2(p.x, -p.y))));
      return shape;
    });
    const inner = new THREE.ExtrudeGeometry(shapes, { depth: .18, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2, curveSegments: 36 });
    inner.translate(-center.x,-center.y,0);
    inner.scale(.065,.065,.065);
    inner.computeVertexNormals();
    return { outer, inner };
  }, []);
  const material = useMemo(() => createFloralMaterial(uniforms), [uniforms]);
  useEffect(() => { onReady(); }, []);
  useEffect(() => {
    // Pointer targets are owned by the DOM stage so touch scrolling remains native.
    if (group.current) group.current.rotation.set(0,0,0);
  }, [viewReset]);
  useEffect(() => () => { geometry.outer.dispose(); geometry.inner.dispose(); material.dispose(); }, [geometry, material]);
  useEffect(() => { lastFrame.current = null; }, [playing, active]);
  useFrame((_, delta) => {
    if (!active) return;
    const now = performance.now();
    const elapsedDelta = lastFrame.current === null ? 0 : (now - lastFrame.current) / 1000;
    lastFrame.current = now;
    if (playing) elapsed.current = Math.min(8, elapsed.current + elapsedDelta);
    const p = elapsed.current / 8;
    uniforms.uProgress.value = p;
    uniforms.uTime.value = elapsed.current;
    const phase = p < .30 ? 0 : p < .57 ? 1 : p < 1 ? 2 : 3;
    if (phase !== lastPhase.current) { lastPhase.current = phase; onPhase(phase); }
    onProgress(p);
    if (p >= 1 && playing) onFinish();
    const pulse = (1 - THREE.MathUtils.smoothstep(p,.78,1)) * Math.sin(p * Math.PI * 8) * .018;
    group.current.scale.setScalar(1 + pulse);
    const drift = (1 - THREE.MathUtils.smoothstep(p,.78,1)) * .12;
    const targetX = rotation.current.x + Math.sin(p * Math.PI * 2) * drift;
    const targetY = rotation.current.y + Math.sin(p * Math.PI * 3) * drift;
    const smoothing = reduced ? 1 : 1 - Math.exp(-delta * 9);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x,targetX,smoothing);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y,targetY,smoothing);
    if (playing || Math.abs(group.current.rotation.x - targetX) > .0001 || Math.abs(group.current.rotation.y - targetY) > .0001) invalidate();
  });
  return <group ref={group}>
    <mesh geometry={geometry.outer} material={material}/>
    <mesh geometry={geometry.inner} position={[0,0,.205]}><meshPhysicalMaterial color="#ffffff" roughness={.24} metalness={.02} clearcoat={.65}/></mesh>
    <mesh geometry={geometry.inner} position={[0,0,-.22]}><meshPhysicalMaterial color="#ffffff" roughness={.24} metalness={.02} clearcoat={.65}/></mesh>
  </group>;
}

export default function LogoScene(props) {
  return <Canvas camera={{ position: [0,0,8.8], fov: 36 }} dpr={[1,1.5]} frameloop={props.active ? 'demand' : 'never'} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={<span>Dein Browser unterstützt die 3D-Ansicht nicht.</span>} onCreated={({gl}) => {gl.domElement.setAttribute('aria-hidden','true');gl.setClearColor(0x3e4246,0);}}>
    <ambientLight intensity={1.3}/>
    <directionalLight position={[-3,4,5]} intensity={3.2} color="#fff1e5"/>
    <directionalLight position={[4,-1,3]} intensity={1.6} color="#b6dfff"/>
    <directionalLight position={[0,3,-4]} intensity={2.5} color="#88c1f2"/>
    <LogoModel {...props}/>
  </Canvas>;
}