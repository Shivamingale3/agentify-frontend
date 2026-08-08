"use client";
"use no memo"; // this file mutates Three.js objects imperatively inside
// useMemo/useFrame — the idiomatic react-three-fiber pattern, but not a pure
// function of props/state in the sense React Compiler assumes. Opt out
// rather than fight the compiler on code that intentionally reaches outside
// React's render model.

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  PART_BUCKETS,
  RING_X_BAND,
  RING_Y_BAND,
  RING_X_FLOOR,
  RING_Y_FLOOR,
  bucketAssembly,
  disperseProgress,
  localProgress,
  stepRange,
} from "@/lib/bot/parts";
import { scrollState } from "@/lib/bot/scroll-state";
import { playClack, playPing } from "@/lib/bot/audio";
import { useBotLayout, type RestPose } from "@/lib/bot/use-bot-layout";
import BotEyes from "./bot-eyes";

/**
 * Meshopt-compressed (EXT_meshopt_compression + KHR_mesh_quantization): 3.2 MB
 * → 985 KB, ~730 KB over the wire. Meshopt rather than Draco because three
 * ships the decoder locally, so it bundles with the scene chunk instead of
 * costing an extra CDN round-trip before a single vertex can be read.
 *
 * The node names the PART_BUCKETS regexes match are preserved exactly — do not
 * run gltf-transform's blanket `optimize` on this asset, as its `join`/`dedup`
 * passes merge and rename nodes, which silently breaks the assembly buckets.
 */
const MODEL_URL = "/models/agentify-head.glb";

const OFFSET_VEC = new THREE.Vector3();
const RING_VEC = new THREE.Vector3();

const FINALE_TRIGGER_AT = stepRange(8)[0];
const FINALE_RESET_BELOW = stepRange(7)[0];

/**
 * Drives the bot head's scroll-linked assembly: every frame, moves each
 * bucketed part between its exploded/ring position and its seated rest pose.
 * Layout (which parts belong to which bucket, where they explode/park to) is
 * computed once by useBotLayout — this component only animates and renders.
 */
export default function BotHead() {
  const { scene } = useGLTF(MODEL_URL, false, true) as unknown as {
    scene: THREE.Group;
  };

  const accent = useMemo(() => new THREE.Color("#7c5cff"), []);
  const groupRef = useRef<THREE.Group>(null);
  const finaleTriggered = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  const { buckets, unit, centre } = useBotLayout(scene, accent);

  // track per-bucket step progress so each part fires exactly one clack as it
  // seats onto the chassis
  const lastLocalProgress = useRef<Record<string, number>>({});

  useFrame((state) => {
    const p = scrollState.progress;
    const time = state.clock.elapsedTime;

    // The exploded cloud is authored against a wide desktop frame. On a
    // portrait phone the horizontal half-extent shrinks to ~0.6 world units,
    // so the same spread would fling parts off both sides — squeeze X and let
    // the cloud grow into the vertical space the tall frame gives back.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const spreadX = Math.min(1, Math.max(0.42, aspect / 1.6));
    const spreadY = Math.min(1.12, Math.max(0.85, 0.62 / Math.max(aspect, 0.3)));

    // 0 while the head is still bursting apart, 1 once every un-seated part has
    // migrated onto the holding ring.
    const disperse = disperseProgress(p);

    // Size the ring off the *visible* frame at the head's depth, so it tracks
    // the responsive camera and stays clear of the assembly on any viewport.
    const cam = state.camera as THREE.PerspectiveCamera;
    const halfH =
      Math.abs(cam.position.z) * Math.tan((cam.fov * Math.PI) / 360);
    const halfW = halfH * aspect;

    for (const bucket of PART_BUCKETS) {
      const objs = buckets[bucket.key];
      if (!objs || objs.length === 0) continue;

      const stepLocal = localProgress(bucket.step, p);
      const assembly = bucketAssembly(bucket.step, p, reduced.current);

      const lastLocal = lastLocalProgress.current[bucket.key] ?? 0;
      if (lastLocal < 0.92 && stepLocal >= 0.92 && !reduced.current) {
        playClack();
      }
      lastLocalProgress.current[bucket.key] = stepLocal;

      const away = 1 - assembly;

      for (const obj of objs) {
        const rest = obj.userData.rest as RestPose | undefined;
        const explode = obj.userData.explode as THREE.Vector3 | undefined;
        if (!rest || !explode) continue;

        // burst target: the radial come-apart vector
        OFFSET_VEC.set(explode.x * spreadX, explode.y * spreadY, explode.z);

        if (disperse > 0.001) {
          // Ring target, resolved as an absolute placement of the part's
          // measured centre and then expressed as an offset. It has to be
          // absolute: adding a ring *offset* to each part's rest position
          // would scatter them by however far apart their rest poses already
          // are, leaving parts near the centre still near the centre.
          const band = obj.userData.ringBand as number;
          const rx =
            Math.max(
              halfW *
                (RING_X_BAND[0] + (RING_X_BAND[1] - RING_X_BAND[0]) * band),
              RING_X_FLOOR
            ) + (obj.userData.ringPadX as number);
          const ry =
            Math.max(
              halfH *
                (RING_Y_BAND[0] + (RING_Y_BAND[1] - RING_Y_BAND[0]) * band),
              RING_Y_FLOOR
            ) + (obj.userData.ringPadY as number);
          RING_VEC.set(
            centre.x + ((obj.userData.ringCos as number) * rx) / unit,
            centre.y + ((obj.userData.ringSin as number) * ry) / unit,
            centre.z + (obj.userData.ringZ as number) / unit
          ).sub(obj.userData.partCentre as THREE.Vector3);
          OFFSET_VEC.lerp(RING_VEC, disperse);
        }

        OFFSET_VEC.multiplyScalar(away);

        if (away > 0.002) {
          // slow drift so the cloud feels suspended rather than frozen
          const drift = (obj.userData.drift as number) * away;
          const ph = obj.userData.phase as number;
          OFFSET_VEC.x += Math.sin(time * 0.55 + ph) * drift;
          OFFSET_VEC.y += Math.cos(time * 0.47 + ph * 1.3) * drift;
          OFFSET_VEC.z += Math.sin(time * 0.41 + ph * 0.7) * drift;
        }

        obj.position.copy(rest.pos).add(OFFSET_VEC);

        const tumble = obj.userData.tumble as THREE.Euler;
        obj.rotation.set(
          rest.rot.x + tumble.x * away,
          rest.rot.y + tumble.y * away,
          rest.rot.z + tumble.z * away
        );
      }

      // emissive ramp for brain & eyes — uses the material clones captured at
      // bucket time, so no per-frame traversal
      if (bucket.key === "brain" || bucket.key === "eyes") {
        const glow = Math.max(0, assembly - 0.15) * 0.7;
        for (const obj of objs) {
          const mats = obj.userData.emissiveMats as
            | THREE.MeshStandardMaterial[]
            | undefined;
          if (!mats) continue;
          for (const m of mats) m.emissiveIntensity = glow;
        }
      }
    }

    // ---- FINALE (Step 8): the bot "ships" ----
    // NOTE: the GLB's bundled clip is deliberately not played here — it drives
    // the same node transforms this component writes every frame, so the two
    // fight and the clip never reads cleanly. The finale is carried by the
    // ping plus ShipEmitter's particle burst instead.
    if (p > FINALE_TRIGGER_AT && !finaleTriggered.current) {
      finaleTriggered.current = true;
      if (!reduced.current) playPing();
    } else if (p < FINALE_RESET_BELOW && finaleTriggered.current) {
      finaleTriggered.current = false;
    }

    // idle slow orbit — only when reading, never during heavy scroll
    if (groupRef.current && Math.abs(scrollState.velocity) < 0.04) {
      groupRef.current.rotation.y = Math.sin(time * 0.12) * 0.08;
      groupRef.current.rotation.x = Math.sin(time * 0.09 + 1.5) * 0.04;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      {/* the source asset faces -Z (eyes/mouth away from the camera, the
          "Back" plates toward it) — flip it 180° so the face reads on
          camera. This must be a separate static group: the idle-orbit
          above writes groupRef's rotation.y as an absolute value every
          frame, which would stomp a rotation set directly on groupRef. */}
      <group rotation={[0, Math.PI, 0]}>
        <primitive object={scene} />
      </group>
      {/* the model ships with hollow eye sockets — these fill them */}
      <BotEyes />
    </group>
  );
}

useGLTF.preload(MODEL_URL, false, true);
