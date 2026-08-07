"use client";

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * N8AO and SMAA both threw a glBlitFramebuffer GL_INVALID_OPERATION every
 * frame in this three/postprocessing combo (their internal depth/stencil
 * read+write attachments resolved to the same image) — dropped both.
 * `multisampling` on EffectComposer gives MSAA in their place.
 */
export default function BotPostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.7}
      />
      <Noise opacity={0.025} premultiply blendFunction={BlendFunction.ADD} />
      <Vignette eskil={false} offset={0.32} darkness={0.7} />
    </EffectComposer>
  );
}
