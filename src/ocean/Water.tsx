import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, ShaderMaterial } from 'three';
import { sceneTime } from './journey';

/** Two-sided surface remains visible through the dive. Procedural waves avoid
 * another large normal texture and an expensive screen-space transmission pass. */
export function Water() {
  const material = useRef<ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current)
      material.current.uniforms.uTime.value = sceneTime(clock.elapsedTime);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[800, 800, 180, 180]} />
      <shaderMaterial
        ref={material}
        side={DoubleSide}
        transparent
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
          uniform float uTime;
          varying vec3 vWorld;
          void main() {
            vec3 p = position;
            p.z += sin(p.x * .8 + uTime * .45) * .045;
            p.z += sin(p.y * 1.3 - uTime * .32) * .025;
            vec4 world = modelMatrix * vec4(p, 1.);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec3 vWorld;
          void main() {
            vec2 p = vWorld.xz;
            float wave = sin(p.x * 3. + sin(p.y * 2. + uTime * .35))
              * sin(p.y * 3.5 - uTime * .3 + sin(p.x));
            float fine = sin(p.x * 18. + p.y * 9. + uTime) * .5 + .5;
            float glint = pow(max(0., wave), 12.) * (.3 + fine * .7);
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float fresnel = pow(1. - abs(viewDir.y), 3.);
            vec3 deep = vec3(.035, .19, .28);
            vec3 sky = vec3(.53, .76, .95);
            vec3 color = mix(deep, sky, fresnel * .85);
            color += glint * vec3(.38, .62, .7);
            if (!gl_FrontFacing) color = mix(vec3(.04, .24, .33), sky, glint * .55);
            float submerged = smoothstep(-.3, .8, -cameraPosition.y);
            vec3 under = vec3(.003, .025, .045) + glint * vec3(.015, .045, .06);
            color = mix(color, under, submerged);
            color = mix(color, vec3(.001, .003, .009), submerged * (1. - exp(-length(cameraPosition - vWorld) * .035)));
            gl_FragColor = vec4(color, .98);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}
