"use client";
"use no memo"; // this file mutates Three.js objects imperatively inside
// useMemo/useFrame — the idiomatic react-three-fiber pattern, but not a pure
// function of props/state in the sense React Compiler assumes. Opt out
// rather than fight the compiler on code that intentionally reaches outside
// React's render model.

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { stepRange } from "@/lib/bot/parts";
import { scrollState } from "@/lib/bot/scroll-state";

/**
 * Step-8 finale: a swarm of points collapses upward out of the open
 * cranium and forms a single bright trajectory. The actual `</>` text +
 * "Copy embed" CTA live in the HTML overlay (HTML renders crisp text);
 * this 3D component is purely the energy/particle trail that visually
 * pairs the open head to the script ribbon above.
 */
const PARTICLE_COUNT = 220;

// was hardcoded as 7/8 here vs. stepRange(8) elsewhere — those used to be the
// same fraction, but the 3-beat rework (explode/disperse/steps) shifted where
// step 8 actually starts, and this literal never got updated. Sourcing both
// ends from stepRange keeps the particle burst locked to the same moment
// BotHead triggers the finale ping.
const [FINALE_START] = stepRange(8);

export default function ShipEmitter() {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // start packed tightly inside a small sphere at the brain core
      const r = Math.random() * 0.15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 0.4;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  useFrame(() => {
    const p = scrollState.progress;
    const local = Math.max(0, Math.min(1, (p - FINALE_START) / (1 - FINALE_START)));
    const pts = pointsRef.current;
    const mat = matRef.current;
    const ring = ringRef.current;
    if (!pts || !mat || !ring) return;

    mat.opacity = local;
    mat.size = 0.04 + local * 0.05;

    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = seeds[i];
      const rise = local * (1.6 + s * 1.2);
      const lateral = Math.sin(s * 12.5 + p * 6) * local * 0.4;
      const lateral2 = Math.cos(s * 9.3 + p * 5) * local * 0.4;
      arr[i * 3] = lateral;
      arr[i * 3 + 1] = 0.4 + rise;
      arr[i * 3 + 2] = lateral2;
    }
    attr.needsUpdate = true;

    // expanding ring at the base as the bot "ships"
    ring.scale.setScalar(0.2 + local * 2.4);
    const ringMat = ring.material as THREE.MeshBasicMaterial;
    ringMat.opacity = 0.5 * (1 - local);
  });

  return (
    <group position={[0, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={matRef}
          color={"#7c5cff"}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <ringGeometry args={[0.4, 0.45, 64]} />
        <meshBasicMaterial
          color={"#7c5cff"}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
