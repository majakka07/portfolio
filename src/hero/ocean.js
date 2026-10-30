/** TWO ENVIRONMENT LAYERS: atmospheric sky + reflective ocean.
 * Water normals are generated locally; there are no remote texture dependencies.
 */
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export function createOcean(renderer, scene, mobile) {
  const sun = new THREE.Vector3(-.7,.55,-.7).normalize();
  // Art-directed cloudless sky: a saturated zenith and a luminous ocean horizon.
  const sky = new THREE.Mesh(new THREE.SphereGeometry(10000,32,16),new THREE.ShaderMaterial({
    side:THREE.BackSide, depthWrite:false,
    uniforms:{uSun:{value:sun}},
    vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 uSun;varying vec3 vDirection;
      void main(){vec3 dir=normalize(vDirection);float h=pow(max(dir.y,0.),.18);
        vec3 color=mix(vec3(.65,.84,.98),vec3(.015,.19,.85),h);
        float sunDot=max(dot(dir,uSun),0.);
        color+=vec3(1.,.88,.67)*pow(sunDot,80.)*.65;
        color+=vec3(1.)*pow(sunDot,900.)*2.;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  scene.add(sky);

  // A tileable height field creates gentle normal variation across the water surface.
  const size=128, bytes=new Uint8Array(size*size*4);
  const height=(x,y)=>Math.sin(x/size*Math.PI*8+y/size*Math.PI*4)*.5+Math.sin(x/size*Math.PI*18-y/size*Math.PI*12)*.22+Math.cos(y/size*Math.PI*26)*.1;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const normal=new THREE.Vector3((height(x-1,y)-height(x+1,y))*1.5,(height(x,y-1)-height(x,y+1))*1.5,1).normalize();
    const i=(y*size+x)*4;bytes[i]=(normal.x*.5+.5)*255;bytes[i+1]=(normal.y*.5+.5)*255;bytes[i+2]=(normal.z*.5+.5)*255;bytes[i+3]=255;
  }
  const normals=new THREE.DataTexture(bytes,size,size,THREE.RGBAFormat);
  normals.wrapS=normals.wrapT=THREE.RepeatWrapping;
  normals.magFilter=normals.minFilter=THREE.LinearFilter;normals.needsUpdate=true;
  const water=new Water(new THREE.PlaneGeometry(2000,2000), {
    textureWidth: mobile?256:512, textureHeight:mobile?256:512,
    waterNormals:normals, sunDirection:sun, sunColor:0xffffff, waterColor:0x137bcc,
    distortionScale:1.2, side:THREE.DoubleSide, fog:true,
  });
  water.rotation.x=-Math.PI/2;water.position.y=-2.4;
  water.material.uniforms.size.value=5;
  scene.add(water);
  const generator=new THREE.PMREMGenerator(renderer);
  const environmentScene=new THREE.Scene();environmentScene.add(sky.clone());
  const environment=generator.fromScene(environmentScene,.03);
  scene.environment=environment.texture;
  generator.dispose();
  return {water,sky,normals,environment};
}
