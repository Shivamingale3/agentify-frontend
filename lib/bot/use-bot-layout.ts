"use client";
"use no memo"; // this file mutates Three.js objects imperatively inside
// useMemo/useFrame — the idiomatic react-three-fiber pattern, but not a pure
// function of props/state in the sense React Compiler assumes. Opt out
// rather than fight the compiler on code that intentionally reaches outside
// React's render model.

import { useMemo } from "react";
import * as THREE from "three";
import {
  PART_BUCKETS,
  type PartBucket,
  EXPLODE_SHAPE,
  GOLDEN_ANGLE,
  RING_Z_SPREAD,
  seedTriple,
} from "@/lib/bot/parts";

export type BucketRefs = Record<string, THREE.Object3D[]>;
export type RestPose = { pos: THREE.Vector3; rot: THREE.Euler };

export type BotLayout = {
  buckets: BucketRefs;
  /** world units per root-local unit */
  unit: number;
  /** head centre, in root-local units */
  centre: THREE.Vector3;
};

/**
 * Clone + tint the emissive materials of a "brain" or "eyes" part, and return
 * the clones so the per-frame glow ramp doesn't have to re-traverse.
 *
 * The source GLB shares a single material ("Head") across all 42 meshes, so
 * mutating it in place would light up the entire head. Clone per-mesh first.
 */
function brightenPartMaterial(
  obj: THREE.Object3D,
  accent: THREE.Color
): THREE.MeshStandardMaterial[] {
  const out: THREE.MeshStandardMaterial[] = [];
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map((m) => {
      const mat = (m as THREE.MeshStandardMaterial).clone();
      mat.emissive = accent;
      mat.emissiveIntensity = 0.0;
      mat.needsUpdate = true;
      out.push(mat);
      return mat;
    });
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  });
  return out;
}

/**
 * Buckets every part of the bot's GLTF scene by name pattern, snapshots each
 * one's authored rest pose, and precomputes where it sits in the exploded
 * cloud and on the holding ring.
 *
 * Single responsibility: derive layout from `scene` + `accent`. BotHead's
 * useFrame loop consumes the result every frame but doesn't compute any of
 * it — this is the one place that scene traversal and bucket math happen.
 */
export function useBotLayout(
  scene: THREE.Group,
  accent: THREE.Color
): BotLayout {
  return useMemo<BotLayout>(() => {
    const map: BucketRefs = {};
    const collected: THREE.Object3D[] = [];

    scene.traverse((obj) => {
      if (obj === scene) return;
      // the GLB pairs every transform node (e.g. "Brain_low") with a mesh
      // child of the same name ("Brain_low_Head_0"). Both match the bucket
      // pattern; only the outermost match per chain should be animated.
      if (obj.parent && obj.parent.userData.bucketKey) return;
      for (const bucket of PART_BUCKETS) {
        if (bucket.pattern.test(obj.name)) {
          (map[bucket.key] ||= []).push(obj);
          obj.userData.bucketKey = bucket.key;
          obj.userData.bucket = bucket;
          collected.push(obj);
          break;
        }
      }
    });

    if (collected.length === 0) {
      return { buckets: map, unit: 1, centre: new THREE.Vector3() };
    }

    // --- pristine rest pose ------------------------------------------------
    // useGLTF caches the parsed scene globally by URL, and useFrame mutates
    // these transforms in place. On a remount the "current" transform is
    // wherever the last frame left it, so capture the authored pose once and
    // stash it on the scene, then restore before measuring below.
    let restPose = scene.userData.__restPose as
      | Map<string, RestPose>
      | undefined;
    if (!restPose) {
      restPose = new Map<string, RestPose>();
      for (const obj of collected) {
        restPose.set(obj.uuid, {
          pos: obj.position.clone(),
          rot: obj.rotation.clone(),
        });
      }
      scene.userData.__restPose = restPose;
    }
    for (const obj of collected) {
      const rest = restPose.get(obj.uuid);
      if (rest) {
        obj.position.copy(rest.pos);
        obj.rotation.copy(rest.rot);
      }
      obj.userData.rest = rest;
    }

    // --- exploded layout ---------------------------------------------------
    // Every bucketed node is a direct child of the same parent (the GLB's
    // RootNode), so their transforms share one coordinate space. That space is
    // scaled ~0.00485x relative to world by the Sketchfab export wrapper, so
    // spreads authored in world units get divided by it on the way in.
    const root = collected[0].parent as THREE.Object3D;
    root.updateWorldMatrix(true, true);
    const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const rootScale = new THREE.Vector3();
    root.getWorldScale(rootScale);
    const unit = rootScale.x || 1;

    // A part's local position isn't its visual centre (most sit at 0,0,0 with
    // the offset baked into the geometry), so measure real bounding boxes and
    // explode radially outward from the head's centre.
    const box = new THREE.Box3();
    const centre = new THREE.Vector3();
    const span = new THREE.Vector3();
    const centres = new Map<string, THREE.Vector3>();
    const sizes = new Map<string, number>();
    const hull = new THREE.Box3().makeEmpty();
    for (const obj of collected) {
      box.setFromObject(obj);
      if (box.isEmpty()) continue;
      box.getCenter(centre).applyMatrix4(rootInv);
      centres.set(obj.uuid, centre.clone());
      sizes.set(obj.uuid, box.getSize(span).length());
      hull.expandByPoint(centre);
    }
    const headCentre = hull.getCenter(new THREE.Vector3());

    // Slot order drives the golden-angle spread, and consecutive slots land
    // ~137.5 degrees apart. Ordering by size descending therefore throws the
    // handful of big plates to opposite sides of the ring; ordering by name
    // (or traversal order) lets them clump into one corner while the 20 tiny
    // mechanism pieces pad out the rest. Name is the tiebreak so the layout
    // stays stable across reloads.
    const slotted = [...collected].sort((a, b) => {
      const d = (sizes.get(b.uuid) ?? 0) - (sizes.get(a.uuid) ?? 0);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    });

    const dir = new THREE.Vector3();
    slotted.forEach((obj, i) => {
      const bucket = obj.userData.bucket as PartBucket;
      const [rx, ry, rz] = seedTriple(obj, 1);
      const c = centres.get(obj.uuid);
      if (c) dir.copy(c).sub(headCentre);
      else dir.set(0, 0, 0);
      // parts sitting exactly on the centre line get a random direction
      if (dir.lengthSq() < 1e-8) dir.set(rx, ry, rz);
      dir.normalize();

      const bias = bucket.bias ?? [0, 0, 0];
      obj.userData.explode = new THREE.Vector3(
        dir.x * EXPLODE_SHAPE[0] * bucket.spread + bias[0] + rx * bucket.jitter,
        dir.y * EXPLODE_SHAPE[1] * bucket.spread + bias[1] + ry * bucket.jitter,
        dir.z * EXPLODE_SHAPE[2] * bucket.spread + bias[2] + rz * bucket.jitter
      ).divideScalar(unit);

      // --- holding-ring slot ---
      // Golden-angle around the view axis distributes every part evenly with
      // no clumping, and the radial band staggers them so they don't all sit
      // on one circle. Resolved to actual world units per frame, since the
      // ring has to track the visible frame.
      const angle = i * GOLDEN_ANGLE;
      obj.userData.ringCos = Math.cos(angle);
      obj.userData.ringSin = Math.sin(angle);
      obj.userData.ringBand = (i * 0.6180339887) % 1;
      obj.userData.ringZ = rz * RING_Z_SPREAD;
      // The node origin is NOT the visible centre — most parts sit at local
      // (0,0,0) with the offset baked into the geometry. Park the measured
      // centre on the ring, or a plate whose origin is on the ring can still
      // have its body hanging over the middle of frame.
      obj.userData.partCentre = (c ?? headCentre).clone();
      // Push big parts further out in proportion to their own size: parking
      // every centre on the same ring still lets a wide plate reach its inner
      // edge back over the assembly. Y gets less padding — vertical room is
      // the scarce axis, and overshooting the top edge costs more than it buys.
      const size = sizes.get(obj.uuid) ?? 0;
      obj.userData.ringPadX = size * 0.4;
      obj.userData.ringPadY = size * 0.25;

      const [tx, ty, tz] = seedTriple(obj, 7);
      const spin = bucket.spin ?? [0, 0, 0];
      obj.userData.tumble = new THREE.Euler(
        tx * spin[0],
        ty * spin[1],
        tz * spin[2]
      );
      // gentle idle bob while floating, also in world units
      obj.userData.drift = 0.035 / unit;
      obj.userData.phase = (rx + 1) * Math.PI;

      if (
        (bucket.key === "brain" || bucket.key === "eyes") &&
        !obj.userData.emissiveMats
      ) {
        obj.userData.emissiveMats = brightenPartMaterial(obj, accent);
      }
    });

    return { buckets: map, unit, centre: headCentre };
  }, [scene, accent]);
}
