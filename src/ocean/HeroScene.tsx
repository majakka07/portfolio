import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, Group, PMREMGenerator } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { disposeModel } from './model';

/** Render the complete supplied asset: no hidden meshes or changed transforms.
 * Demand rendering keeps this static hero from running an animation loop. */
function HeroModel({
  onReady,
  onError,
}: {
  onReady: () => void;
  onError: () => void;
}) {
  const [model, setModel] = useState<Group | null>(null);
  const { camera, size, gl, scene, invalidate } = useThree();

  useEffect(() => {
    // The logo is centered at y=4.61 in the supplied Blender scene.
    camera.position.set(0, 5.85, size.width < 600 ? 10 : 7.5);
    camera.lookAt(0, 4.61, 0);
    invalidate();
  }, [camera, size.width, invalidate]);

  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    let disposed = false;
    let asset: Group | undefined;
    new GLTFLoader().load(
      '/models/underwater.glb',
      (gltf) => {
        asset = gltf.scene;
        if (disposed) {
          disposeModel(asset);
          return;
        }
        setModel(asset);
        onReady();
      },
      undefined,
      () => {
        if (!disposed) onError();
      },
    );
    return () => {
      disposed = true;
      gl.domElement.removeEventListener('webglcontextlost', lost);
      if (asset) disposeModel(asset);
      scene.environment = null;
      environment.dispose();
      generator.dispose();
      room.dispose();
    };
  }, [gl, scene, onReady, onError]);

  return model ? <primitive object={model} dispose={null} /> : null;
}

export default function HeroScene(props: {
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 5.85, 7.5], fov: 46, near: 0.1, far: 150 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <color attach="background" args={['#88c1f2']} />
      <ambientLight intensity={1.2} color="#cde7fc" />
      <directionalLight position={[3, 12, 6]} intensity={3} />
      <HeroModel {...props} />
    </Canvas>
  );
}
