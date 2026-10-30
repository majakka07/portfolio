/** ORIGINAL LOGO GEOMETRY + LOCAL FLORAL MATERIAL
 * The silhouette is traced from the supplied SVG; the white S keeps its vector path.
 * Both the moss finish and instanced flowers use the same soft object-space mask.
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import shapeData from './logo-shape.json';

const SCALE = .065;
const maskShader = `
uniform vec3 uBloomPoint;
uniform float uBloom;
uniform float uTime;
varying vec3 vLogoPosition;
float bloomMask(vec3 p) {
  float d = distance(p.xy, uBloomPoint.xy);
  return (1. - smoothstep(.22, 1.05, d)) * uBloom;
}
float grain(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
`;

// Seeded randomness keeps flower placement identical on every load and screenshot.
function randomFactory(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; const [xj, yj] = polygon[j];
    if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function createLogo(mobile = false) {
  const points = shapeData.outline.map(([x,y]) => new THREE.Vector3(x,-y,0));
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
  const shape = new THREE.Shape(curve.getPoints(360).map(p => new THREE.Vector2(p.x,p.y)));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 6, bevelEnabled: true, bevelSize: 1.7, bevelThickness: 1.7,
    bevelSegments: 8, steps: 1, curveSegments: 32,
  });
  geometry.computeBoundingBox();
  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.translate(-center.x,-center.y,-center.z);
  geometry.scale(SCALE,SCALE,SCALE);

  const uniforms = {
    uBloomPoint: { value: new THREE.Vector3(-.9,.75,.25) },
    uBloom: { value: 0 }, uTime: { value: 0 },
  };
  const material = new THREE.MeshPhysicalMaterial({
    color: '#88C1F2', roughness: .17, metalness: .12,
    clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: .75,
  });
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLogoPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLogoPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + maskShader)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float moss = grain(vLogoPosition.xy * 230.);
        vec3 mossColor = mix(vec3(.035,.12,.012), vec3(.32,.48,.07), moss);
        diffuseColor.rgb = mix(diffuseColor.rgb, mossColor, bloomMask(vLogoPosition));`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor,.92,bloomMask(vLogoPosition));');
  };
  material.customProgramCacheKey = () => 'pointer-moss-v1';
  const blue = new THREE.Mesh(geometry,material);

  const parsed = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${shapeData.whitePath}" fill="white"/></svg>`);
  const whiteShapes = parsed.paths.flatMap(path => SVGLoader.createShapes(path)).map(path => {
    const reflected = new THREE.Shape(path.getPoints(36).map(p => new THREE.Vector2(p.x,-p.y)));
    reflected.holes = path.holes.map(hole => new THREE.Path(hole.getPoints(36).map(p => new THREE.Vector2(p.x,-p.y))));
    return reflected;
  });
  const whiteGeometry = new THREE.ExtrudeGeometry(whiteShapes, {
    depth: .6, bevelEnabled: true, bevelSize: .35, bevelThickness: .35, bevelSegments: 4,
  });
  whiteGeometry.translate(-center.x,-center.y,4.9);
  whiteGeometry.scale(SCALE,SCALE,SCALE);
  const white = new THREE.Mesh(whiteGeometry,new THREE.MeshPhysicalMaterial({ color:'#ffffff', roughness:.22, clearcoat:.8, envMapIntensity:1.3 }));
  const group = new THREE.Group(); group.add(blue,white);

  // Test candidate positions against the outer contour and white S before placing flowers.
  const random = randomFactory(7031);
  const context = document.createElement('canvas').getContext('2d');
  const whitePath = new Path2D(shapeData.whitePath);
  const seeds = [];
  for (let attempts = 0; seeds.length < (mobile ? 140 : 260) && attempts < 12000; attempts++) {
    const x = 5 + random()*60, y = 6 + random()*57;
    if (!insidePolygon(x,y,shapeData.outline) || [[0,0],[1.3,0],[-1.3,0],[0,1.3],[0,-1.3]].some(([dx,dy])=>context.isPointInPath(whitePath,x+dx,y+dy))) continue;
    seeds.push(new THREE.Vector3((x-center.x)*SCALE,(-y-center.y)*SCALE,.335));
  }

  function flowerMaterial(color) {
    const mat = new THREE.MeshStandardMaterial({color,roughness:.7,metalness:0,side:THREE.DoubleSide});
    mat.onBeforeCompile = shader => {
      Object.assign(shader.uniforms,uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uBloomPoint;\nuniform float uBloom;\nuniform float uTime;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec3 seed = instanceMatrix[3].xyz;
          float reveal = (1. - smoothstep(.22,1.05,distance(seed.xy,uBloomPoint.xy))) * uBloom;
          transformed *= smoothstep(.02,.75,reveal);
          transformed.z += sin(uTime*1.4+seed.x*9.)*.006*reveal;`);
    };
    mat.customProgramCacheKey = () => 'instanced-bloom-v1';
    return mat;
  }
  const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,5),flowerMaterial('#ffffff'),seeds.length*5);
  const hearts = new THREE.InstancedMesh(new THREE.SphereGeometry(1,7,5),flowerMaterial('#f1d78c'),seeds.length);
  const leaves = new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),flowerMaterial('#7c9960'),seeds.length*2);
  const dummy = new THREE.Object3D(); const color = new THREE.Color();
  seeds.forEach((seed,i) => {
    const size = .65+random()*.65, turn=random()*Math.PI*2;
    for(let j=0;j<5;j++) {
      const angle=turn+j*Math.PI*.4;
      dummy.position.copy(seed).add(new THREE.Vector3(Math.cos(angle)*.039*size,Math.sin(angle)*.039*size,.03));
      dummy.rotation.set(.08,0,angle-Math.PI*.5);dummy.scale.set(.027*size,.061*size,.016*size);dummy.updateMatrix();
      petals.setMatrixAt(i*5+j,dummy.matrix);
      petals.setColorAt(i*5+j,color.set(i%3 ? '#fff9e8' : '#f3a6cf'));
    }
    dummy.position.copy(seed).add(new THREE.Vector3(0,0,.06));dummy.rotation.set(0,0,0);dummy.scale.setScalar(.021*size);dummy.updateMatrix();hearts.setMatrixAt(i,dummy.matrix);
    for(let j=0;j<2;j++) {
      dummy.position.copy(seed).add(new THREE.Vector3((j-.5)*.08,.025,.006));dummy.rotation.set(0,.3,j?-.8:.8);dummy.scale.set(.025*size,.085*size,.014);dummy.updateMatrix();leaves.setMatrixAt(i*2+j,dummy.matrix);
    }
  });
  petals.frustumCulled = hearts.frustumCulled = leaves.frustumCulled = false;
  group.add(leaves,petals,hearts);
  return { group, blue, white, uniforms, flowerCount:seeds.length };
}
