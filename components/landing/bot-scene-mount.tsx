"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { installScrollListener } from "@/lib/bot/scroll-state";

// Three.js / R3F is client-only and its <Canvas> must NOT run during SSR
// (it touches `window`/`WebGL`). Load it with `ssr: false` so the HTML body
// paints first and the WebGL canvas hydrates behind it on the client.
const BotScene = dynamic(() => import("./bot-scene/bot-scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * The one client island the landing page needs at the top level: it owns the
 * WebGL canvas and the scroll signal the canvas reads from.
 *
 * Split out of landing-page.tsx so that file can be a Server Component —
 * `ssr: false` and `useEffect` are both client-only, and having them inline
 * forced the entire page (header, all 8 step cards, the footer) into the
 * browser bundle.
 *
 * `aria-hidden`: the scene is decoration. Everything it depicts is already
 * stated in the step copy, so exposing it to assistive tech adds noise.
 */
export default function BotSceneMount() {
  useEffect(() => installScrollListener(), []);

  return (
    <div aria-hidden className="fixed inset-0 z-0 h-screen w-full">
      <BotScene />
    </div>
  );
}
