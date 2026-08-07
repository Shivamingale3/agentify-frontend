"use client";

import { Grid, ContactShadows } from "@react-three/drei";

/** Floor grid + contact shadow — the ground plane the bot head hovers over. */
export default function BotEnvironment() {
  return (
    <>
      {/* single thin plane of order out of nothing. Greyscale, not
          violet-tinted: the design system's surfaces are monochrome
          (--card #0b0b0b, --secondary #161616) and the accent is reserved
          for the bot's own glow. */}
      <Grid
        cellSize={0.4}
        cellThickness={0.5}
        cellColor="#161616"
        sectionSize={2.4}
        sectionThickness={0.8}
        sectionColor="#2a2a2a"
        fadeDistance={14}
        fadeStrength={1.2}
        infiniteGrid
        followCamera={false}
        position={[0, -1.6, 0]}
      />

      <ContactShadows
        position={[0, -1.59, 0]}
        opacity={0.55}
        scale={6}
        blur={2.6}
        far={3}
        color="#000000"
      />
    </>
  );
}
