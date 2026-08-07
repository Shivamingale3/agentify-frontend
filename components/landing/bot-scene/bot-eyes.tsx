"use client";
"use no memo"; // this file mutates Three.js objects imperatively inside
// useMemo/useFrame — the idiomatic react-three-fiber pattern, but not a pure
// function of props/state in the sense React Compiler assumes. Opt out
// rather than fight the compiler on code that intentionally reaches outside
// React's render model.

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bucketAssembly } from "@/lib/bot/parts";
import { scrollState } from "@/lib/bot/scroll-state";

/**
 * The source GLB ships with hollow eye sockets — its "Eyes" parts are the
 * housing and brow ridge, not the eyeballs. These are the lenses that sit
 * inside them: two emissive pods that light up as step 3 ("persona") seats
 * the eye housing.
 *
 * Rendered as a sibling of the flipped model group, so these coordinates are
 * already in camera-facing space (+Z toward the viewer).
 */

/**
 * Socket centres, measured by isolating the face meshes and reading the holes
 * off the render. The face surface sits at z ~= 0.43, so the pods have to come
 * forward to roughly the socket mouth — sunk any deeper and you see straight
 * past them into the hollow interior of the skull.
 */
const EYE_X = 0.142;
const EYE_Y = 0.468;
/** just inside the socket mouth: deep enough to sit in the recess, shallow
 *  enough that the hollow interior stays hidden behind the pod */
const EYE_Z = 0.3;

/** socket aperture is ~0.08; the pod narrows into the recess so it can sit
 *  slightly under that and still seal the opening from the camera's angle */
const EYE_RADIUS = 0.066;
/** barely squashed — a near-sphere reads as an eyeball, not a pasted-on disc */
const EYE_SCALE: [number, number, number] = [1, 0.94, 0.8];
/** sockets splay outward, so toe the pods out to match */
const EYE_YAW = 0.2;

const EYE_STEP = 4;

export default function BotEyes() {
  const groupRef = useRef<THREE.Group>(null);
  const podRefs = useRef<(THREE.Mesh | null)[]>([]);
  const reduced = useRef(false);

  // one material shared by both pods, so a single write drives them together
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#120a2e"),
        emissive: new THREE.Color("#7c5cff"),
        emissiveIntensity: 0,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
    []
  );

  const geometry = useMemo(
    () => new THREE.SphereGeometry(EYE_RADIUS, 24, 24),
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;

    // same curve the eye housing rides, so the lenses are lit on the fully
    // assembled hero head, go dark as it comes apart, and relight on step 3
    const lit = bucketAssembly(EYE_STEP, scrollState.progress, reduced.current);

    g.visible = lit > 0.001;

    // pods swell into their sockets as the housing seats. Scale the pods
    // themselves, not the group — the sockets are offset from the origin, so
    // scaling the group would drag them toward the centre of the head.
    const s = 0.55 + lit * 0.45;
    for (const pod of podRefs.current) {
      if (pod) {
        pod.scale.set(EYE_SCALE[0] * s, EYE_SCALE[1] * s, EYE_SCALE[2] * s);
      }
    }

    // Keep the emissive modest: crank it and the material's shading washes out
    // entirely, so the pod flattens into a pasted-on disc instead of reading as
    // a sphere sitting in a socket. Bloom does the rest.
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.12 * lit;
    material.emissiveIntensity = lit * 1.15 * pulse;
    material.opacity = lit;
  });

  return (
    <group ref={groupRef}>
      {[-1, 1].map((side, i) => (
        <mesh
          key={side}
          ref={(el) => {
            podRefs.current[i] = el;
          }}
          geometry={geometry}
          material={material}
          position={[EYE_X * side, EYE_Y, EYE_Z]}
          rotation={[0, EYE_YAW * side, 0]}
          scale={EYE_SCALE}
        />
      ))}
    </group>
  );
}
