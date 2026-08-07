"use client";
"use no memo"; // this file mutates Three.js objects imperatively inside
// useMemo/useFrame — the idiomatic react-three-fiber pattern, but not a pure
// function of props/state in the sense React Compiler assumes. Opt out
// rather than fight the compiler on code that intentionally reaches outside
// React's render model.

import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

// matches app/globals.css's --background (pure AMOLED black)
export const FOG_COLOR = new THREE.Color("#000000");

/** camera distance at a wide desktop frame, and at a narrow portrait one */
const CAM_Z_WIDE = 4.6;
const CAM_Z_NARROW = 7.7;
const ASPECT_WIDE = 1.4;
const ASPECT_NARROW = 0.45;

/**
 * The perspective camera's fov is *vertical*, so a tall narrow viewport keeps
 * the head the same height while collapsing the horizontal room around it —
 * the exploded cloud ends up flung off both edges. Dolly back as the frame
 * narrows, and keep the fog just behind the subject so pulling back doesn't
 * wash the head out.
 */
export default function ResponsiveCamera() {
  const size = useThree((s) => s.size);
  const scene = useThree((s) => s.scene);

  const aspect = size.width / Math.max(size.height, 1);
  const t = THREE.MathUtils.clamp(
    (aspect - ASPECT_NARROW) / (ASPECT_WIDE - ASPECT_NARROW),
    0,
    1
  );
  const z = THREE.MathUtils.lerp(CAM_Z_NARROW, CAM_Z_WIDE, t);

  useEffect(() => {
    // start the fog just past the head so only the floor grid gets eaten by it
    scene.fog = new THREE.Fog(FOG_COLOR, z + 0.7, z + 12);
  }, [scene, z]);

  return (
    <PerspectiveCamera
      makeDefault
      fov={32}
      position={[0, 0.4, z]}
      near={0.1}
      far={50}
    />
  );
}
