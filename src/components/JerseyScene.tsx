import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from 'three';
import { ASSETS } from '../lib/assets';
import { renderDesignTexture } from '../lib/textureRenderer';
import type { DesignConfig } from '../types/poc';

const isMesh = (object: Object3D): object is Mesh => (object as Mesh).isMesh;

const useDesignTexture = (design: DesignConfig) => {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let nextTexture: CanvasTexture | null = null;

    renderDesignTexture(design)
      .then((canvas) => {
        if (cancelled) {
          return;
        }

        nextTexture = new CanvasTexture(canvas);
        nextTexture.colorSpace = SRGBColorSpace;
        nextTexture.flipY = false;
        nextTexture.generateMipmaps = true;
        nextTexture.minFilter = LinearFilter;
        nextTexture.magFilter = LinearFilter;
        nextTexture.needsUpdate = true;
        setTexture((previous) => {
          previous?.dispose();
          return nextTexture;
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      nextTexture?.dispose();
    };
  }, [design]);

  return texture;
};

function JerseyModel({ design }: { design: DesignConfig }) {
  const gltf = useGLTF(ASSETS.model);
  const texture = useDesignTexture(design);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.72,
        metalness: 0,
        side: DoubleSide,
      }),
    [],
  );

  useEffect(() => {
    material.map = texture;
    material.needsUpdate = true;
  }, [material, texture]);

  useEffect(() => {
    scene.traverse((object) => {
      if (isMesh(object)) {
        object.material = material;
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [material, scene]);

  return <primitive object={scene} rotation={[0, 0, 0]} position={[0, -0.03, 0]} />;
}

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.6, 0.12]} />
      <meshStandardMaterial color="#e6ebf0" roughness={0.8} />
    </mesh>
  );
}

export function JerseyScene({ design }: { design: DesignConfig }) {
  return (
    <Canvas camera={{ position: [0, 0.14, 1.15], fov: 34 }} shadows dpr={[1, 2]}>
      <color attach="background" args={['#edf0f3']} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[2, 2, 2]} intensity={2.2} castShadow />
      <directionalLight position={[-2, 1, -1]} intensity={0.8} />
      <Suspense fallback={<SceneFallback />}>
        <JerseyModel design={design} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={0.65}
        maxDistance={1.8}
        target={[0, 0.03, 0]}
        rotateSpeed={0.7}
        zoomSpeed={0.7}
      />
    </Canvas>
  );
}

useGLTF.preload(ASSETS.model);
