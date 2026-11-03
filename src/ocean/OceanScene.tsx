import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Color,
  FogExp2,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  ShaderMaterial,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Water } from './Water';
import { disposeModel } from './model';
import { journey, sampleJourney, frozenProgress, sceneTime } from './journey';

function UnderwaterModel({
  onReady,
  onError,
}: {
  onReady: () => void;
  onError: () => void;
}) {
  const [model, setModel] = useState<Group | null>(null);
  useEffect(() => {
    let cancelled = false;
    let loaded: Group | undefined;
    new GLTFLoader().load(
      '/models/underwater.glb',
      (gltf) => {
        loaded = gltf.scene;
        if (cancelled) {
          disposeModel(loaded);
          return;
        }
        // Keep the supplied logo's geometry and supplied moss artwork exactly intact.
        // Replace Blender's bounded water cube and flat floor with horizon-sized shaders.
        loaded.traverse((object) => {
          if (!(object instanceof Mesh)) return;
          if (object.name === 'Cube') object.visible = false;
          if (object.name === 'Mesh_0') {
            object.position.set(0, 1.1, 0);
            const material = object.material as MeshStandardMaterial;
            material.envMapIntensity = 1.25;
          }
          if (object.name === 'Plane') {
            object.visible = false;
          }
        });
        setModel(loaded);
        onReady();
      },
      undefined,
      () => {
        if (!cancelled) onError();
      },
    );
    return () => {
      cancelled = true;
      if (loaded) disposeModel(loaded);
    };
  }, [onReady, onError]);
  return model ? <primitive object={model} dispose={null} /> : null;
}

/** Remove context-loss listeners before R3F releases its renderer on pause. */
function RendererLifecycle({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

function CameraRig() {
  const { scene, gl } = useThree();
  const playhead = useRef(journey.progress);
  const eye = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  const sky = useMemo(() => new Color('#88c1f2'), []);
  const ocean = useMemo(() => new Color('#030a18'), []);
  const background = useMemo(() => new Color(), []);
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.fog = new FogExp2('#030a18', 0.04);
    return () => {
      scene.environment = null;
      environment.dispose();
      generator.dispose();
      room.dispose();
    };
  }, [scene, gl]);
  useFrame(({ camera }, delta) => {
    playhead.current =
      frozenProgress ??
      MathUtils.damp(
        playhead.current,
        journey.progress,
        5,
        Math.min(delta, 0.25),
      );
    const roll = sampleJourney(playhead.current, eye, target);
    // Portrait screens get more distance, rather than cropping the logo.
    if (window.innerWidth < 600)
      eye.z += (1 - MathUtils.smoothstep(playhead.current, 0, 0.25)) * 2;
    camera.position.copy(eye);
    camera.lookAt(target);
    camera.rotateZ(roll);
    const submerged = MathUtils.smoothstep(-eye.y, -0.3, 0.8);
    background.copy(sky).lerp(ocean, submerged);
    scene.background = background;
    if (scene.fog instanceof FogExp2) {
      scene.fog.color.copy(background);
      scene.fog.density = MathUtils.lerp(0.009, 0.055, submerged);
    }
    document.documentElement.style.setProperty('--dive', submerged.toFixed(3));
    document.documentElement.style.setProperty(
      '--journey-progress',
      playhead.current.toFixed(4),
    );
    const depth = document.querySelector('[data-depth]');
    if (depth)
      depth.textContent = `${Math.max(0, Math.round(-eye.y))
        .toString()
        .padStart(2, '0')} m`;
  });
  return null;
}

function MarineSnow() {
  const positions = useMemo(() => {
    // Deterministic seed: identical placement in screenshots and on every visit.
    let seed = 17;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    return new Float32Array(
      Array.from({ length: 240 * 3 }, (_, i) =>
        i % 3 === 0
          ? (random() - 0.5) * 30
          : i % 3 === 1
            ? -random() * 11
            : 8 - random() * 40,
      ),
    );
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#88c1f2"
        size={0.025}
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function Seabed() {
  const material = useRef<ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current)
      material.current.uniforms.uTime.value = sceneTime(clock.elapsedTime);
  });
  return (
    <mesh position={[0, -12, -8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[180, 180]} />
      <shaderMaterial
        ref={material}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
      varying vec2 vPosition;
      varying vec3 vWorld;
      void main() { vPosition = position.xy; vWorld = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
    `}
        fragmentShader={`
      uniform float uTime;
      varying vec2 vPosition;
      varying vec3 vWorld;
      void main() {
        vec2 p = vPosition * 1.8;
        float ripple = sin(p.x * 2. + sin(p.y * 1.4 + uTime * .18))
          * sin(p.y * 2.3 + sin(p.x * 1.2 - uTime * .15));
        float caustic = pow(1. - abs(ripple), 18.);
        float pool = exp(-length(vPosition - vec2(0., 10.)) * .028);
        vec3 color = mix(vec3(.002, .007, .015), vec3(.012, .045, .06), pool);
        color += caustic * .035 * pool * vec3(.53, .76, .95);
        color = mix(color, vec3(.001, .003, .009), 1. - exp(-length(cameraPosition - vWorld) * .045));
        gl_FragColor = vec4(color, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}
      />
    </mesh>
  );
}

function LightRays() {
  return (
    <group>
      {[-8, -4, 5, 10].map((x, i) => (
        <mesh key={x} position={[x, -5, -8 - i * 3]} rotation={[0, 0, -0.23]}>
          <coneGeometry args={[1.1, 14, 12, 1, true]} />
          <meshBasicMaterial
            color="#88c1f2"
            transparent
            opacity={0.025}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function OceanScene({
  onReady,
  onError,
  active = true,
}: {
  onReady: () => void;
  onError: () => void;
  active?: boolean;
}) {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return (
    <Canvas
      frameloop={visible && active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.3, 7], fov: 46, near: 0.05, far: 600 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <RendererLifecycle onError={onError} />
      <CameraRig />
      <ambientLight intensity={1.3} color="#cde7fc" />
      <directionalLight position={[3, 12, 6]} intensity={3} color="#ffffff" />
      <UnderwaterModel onReady={onReady} onError={onError} />
      <Water />
      <Seabed />
      <MarineSnow />
      <LightRays />
    </Canvas>
  );
}
