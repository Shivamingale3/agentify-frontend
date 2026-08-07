"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import BotHead from "./bot-head";
import ShipEmitter from "./ship-emitter";
import ResponsiveCamera, { FOG_COLOR } from "./responsive-camera";
import BotLighting from "./bot-lighting";
import BotEnvironment from "./bot-environment";
import BotPostProcessing from "./post-processing";

/**
 * Composition root for the 3D bot: wires the Canvas, camera, lighting,
 * environment, the head itself, and post-processing together. Each of those
 * is its own file — this one only assembles them.
 */
export default function BotScene() {
  return (
    <Canvas
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      dpr={[1, 1.5]}
      onCreated={({ scene, gl }) => {
        scene.background = FOG_COLOR;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Suspense fallback={null}>
        <ResponsiveCamera />
        <BotLighting />

        <BotHead />
        <ShipEmitter />

        <BotEnvironment />

        <Preload all />
      </Suspense>

      <BotPostProcessing />
    </Canvas>
  );
}
