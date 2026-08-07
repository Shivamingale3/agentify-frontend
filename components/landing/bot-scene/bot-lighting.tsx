"use client";

import * as THREE from "three";

// brand violet, marketing-only — see components/landing/bot-scene/bot-head.tsx
// for why the bot's own glow keeps a brand accent while the rest of the page
// stays strictly monochrome.
const ACCENT_COLOR = new THREE.Color("#7c5cff");

/** Static three-point lighting rig for the bot head, plus the accent kicker. */
export default function BotLighting() {
  return (
    <>
      <ambientLight intensity={0.18} color={"#9aa6d6"} />
      {/* rim — cool cyan-white from upper-back-right */}
      <directionalLight
        position={[3, 4, -3]}
        intensity={1.4}
        color={"#dfeef9"}
      />
      {/* key — soft warm-white from front-left */}
      <directionalLight
        position={[-2.5, 1.5, 3]}
        intensity={0.7}
        color={"#fff3e0"}
      />
      {/* accent violet — kicks the brain material over the bloom threshold.
          Keep the falloff tight: parts drift right past this light while
          exploded, and a wider/hotter one blows their inner faces to white. */}
      <pointLight
        position={[0, 0.35, 0]}
        intensity={2.6}
        color={ACCENT_COLOR}
        distance={1.9}
        decay={2}
      />
    </>
  );
}
