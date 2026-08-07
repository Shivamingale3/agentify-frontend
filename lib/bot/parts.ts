import * as THREE from "three";

/**
 * Each "part bucket" is matched by a regex (anchored at start of node name,
 * case-insensitive). Buckets are tested in array order and the first match
 * wins, so narrower patterns must come first — `mech` before `sides`/`shell`
 * so "BottomSideRot_low" isn't grabbed by /^BottomSide_/.
 *
 * ORDER IS BY MEASURED DEPTH, INNERMOST FIRST. The node names lie about this:
 * everything matching /Rot/ ("SideRot", "TopRot", "BottomSideRot") sounds like
 * outer cranium but is actually the hinge/actuator layer sitting *under* the
 * shell — measured mean radius 0.30-0.39 against the outer plates' 0.45-0.56.
 * Bucketing those by name put them dead last, so a swarm of small mechanical
 * bits flew in after the head had already closed up. Likewise "TopInner_low"
 * is one of the outermost pieces despite the name.
 *
 * Mean radius from the head centroid, measured off the assembled model:
 *   core  0.21-0.26   brain 0.37   mech 0.30-0.39   eyes 0.35-0.42
 *   face  0.38-0.47   sides 0.37-0.38   shell 0.45-0.56
 *
 * The scroll track runs in three beats:
 *
 *   [0 .. EXPLODE_BAND)             the finished head comes apart into a cloud
 *   [EXPLODE_BAND .. DISPERSE_END)  that cloud migrates onto a holding ring
 *   [DISPERSE_END .. 1]             TOTAL_STEPS segments, each flying one
 *                                   bucket back in off the ring
 *
 * The middle beat matters twice over. Without it parts stall a few centimetres
 * off their sockets and "assembly" is an imperceptible nudge. And the holding
 * position has to be an explicit ring rather than a scaled-up explode vector:
 * scaling the radial burst leaves parts pushed along Z still sitting dead
 * centre on screen, and parts whose centroid coincides with the head's barely
 * move at all — either way they hang over the assembly point and hide it.
 */
export type PartBucket = {
  key: string;
  step: number;
  pattern: RegExp;
  /** how far this bucket drifts off the chassis when exploded, in world units */
  spread: number;
  /** directional bias in world units, added on top of the radial direction */
  bias?: [number, number, number];
  /** per-object random scatter, world units */
  jitter: number;
  /** per-object tumble while exploded, radians */
  spin?: [number, number, number];
};

export const PART_BUCKETS: PartBucket[] = [
  // — 1 — the cradle and its wiring harness: the innermost structure.
  {
    key: "core",
    step: 1,
    pattern: /^Brain(Holder|Wire)/i,
    spread: 0.34,
    bias: [0, -0.22, 0],
    jitter: 0.06,
    spin: [0.3, 0.25, 0.15],
  },

  // — 2 — the brain orb drops into the cradle. Enclosed by every plate that
  // follows, so it has to seat before the shell closes.
  {
    key: "brain",
    step: 2,
    pattern: /^Brain_/i,
    spread: 0.44,
    bias: [0, 0.34, 0],
    jitter: 0.05,
    spin: [0.25, 0.5, 0.4],
  },

  // — 3 — hinge / actuator layer. Must precede every outer plate.
  {
    key: "mech",
    step: 3,
    pattern: /^(TopRot|SideRot|BottomSideRot)/i,
    spread: 0.52,
    bias: [0, 0.06, -0.1],
    jitter: 0.1,
    spin: [0.5, 0.45, 0.5],
  },

  // — 4 — eye housing + visor. Gets the accent emissive treatment.
  {
    key: "eyes",
    step: 4,
    pattern: /^Eyes/i,
    spread: 0.6,
    bias: [0, 0.04, 0.24],
    jitter: 0.07,
    spin: [0.4, 0.55, 0.25],
  },

  // — 5 — inner face shell and jaw.
  {
    key: "face",
    step: 5,
    pattern: /^(Inside_face|inside_|Mouth)/i,
    spread: 0.68,
    bias: [0, -0.1, 0.3],
    jitter: 0.08,
    spin: [0.35, 0.5, 0.3],
  },

  // — 6 — side and lower plates, plus the ear.
  {
    key: "sides",
    step: 6,
    pattern: /^(side_|sideRight|BottomSide(Right)?_|Ear)/i,
    spread: 0.76,
    bias: [0.1, -0.04, -0.08],
    jitter: 0.09,
    spin: [0.4, 0.5, 0.35],
  },

  // — 7 — outer cranium and rear plates close over everything.
  {
    key: "shell",
    step: 7,
    pattern: /^(Top_|TopInner|Back_|BackBottom)/i,
    spread: 0.86,
    bias: [0, 0.18, -0.1],
    jitter: 0.11,
    spin: [0.5, 0.6, 0.45],
  },
];

export const TOTAL_STEPS = 8;

/** end of the "come apart" beat */
export const EXPLODE_BAND = 0.1;
/** end of the "migrate to the ring" beat; step 1 starts here */
export const DISPERSE_END = 0.2;

/**
 * The holding ring, as fractions of the visible frame half-extents at the
 * head's depth. Parts wait on an ellipse between the MIN and MAX bands so the
 * centre of frame stays completely clear for the assembly.
 *
 * FLOOR values are absolute world-unit fallbacks: on a narrow phone frame the
 * fractional radius alone would put the ring inside the head's own silhouette
 * (~0.45 world units), so clamp up regardless of how tight the frame gets.
 */
export const RING_X_BAND: [number, number] = [0.54, 0.76];
export const RING_Y_BAND: [number, number] = [0.54, 0.8];
export const RING_X_FLOOR = 0.92;
export const RING_Y_FLOOR = 0.86;
/** front/back scatter on the ring — kept small, since depth does nothing to
 *  clear the assembly point on screen and large +Z just looms into camera */
export const RING_Z_SPREAD = 0.28;

/**
 * How far the exploded cloud is allowed to spread on each axis. The frame is
 * much wider than it is tall (and the head nearly fills it vertically), so
 * squash Y and let X breathe — otherwise parts sail off the top and bottom.
 */
export const EXPLODE_SHAPE: [number, number, number] = [1.3, 0.46, 0.85];

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

export const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const stepRange = (step: number): [number, number] => {
  const span = (1 - DISPERSE_END) / TOTAL_STEPS;
  return [DISPERSE_END + (step - 1) * span, DISPERSE_END + step * span];
};

export const localProgress = (step: number, global: number): number => {
  const [start, end] = stepRange(step);
  if (end - start <= 0) return clamp01(global - start);
  return clamp01((global - start) / (end - start));
};

/**
 * 0 while the head is still coming apart (parts sit on their radial burst
 * vectors), 1 once they have fully migrated onto the holding ring. Used to
 * blend between the two "away" targets.
 */
export const disperseProgress = (global: number): number => {
  if (global <= EXPLODE_BAND) return 0;
  return easeInOutCubic(
    clamp01(
      (global - EXPLODE_BAND) / Math.max(DISPERSE_END - EXPLODE_BAND, 1e-6)
    )
  );
};

/** golden angle — spreads N parts evenly around the ring with no clumping */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * How seated a step's parts are: 1 = locked onto the chassis, 0 = out at the
 * hold distance.
 *
 * Shared by every piece that has to move with a step — the GLB parts and the
 * eye pods alike — so they stay in lockstep across all three beats.
 */
export const bucketAssembly = (
  step: number,
  global: number,
  reduced = false
): number => {
  if (reduced) return 1;
  if (global < EXPLODE_BAND) {
    return 1 - easeInOutCubic(clamp01(global / EXPLODE_BAND));
  }
  // easeOutCubic, not easeOutBack: back-easing overshoots past the socket and
  // snaps back, which reads as the part missing its slot.
  return easeOutCubic(localProgress(step, global));
};

/**
 * Deterministic [-1, 1] triple derived from an object's uuid, so a given part
 * always scatters and tumbles the same way across reloads.
 */
export const seedTriple = (
  obj: THREE.Object3D,
  salt = 0
): [number, number, number] => {
  let h = (2166136261 ^ salt) >>> 0;
  const id = obj.uuid;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const f = (n: number) => {
    const x = Math.sin(h * 0.0001 + n * 12.9898) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  };
  return [f(1), f(2), f(3)];
};
