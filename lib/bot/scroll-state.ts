import { TOTAL_STEPS } from "@/lib/bot/parts";

/**
 * Module-level scroll progress signal.
 *
 * Page writes here on rAF. R3F's useFrame reads from this object directly —
 * no React re-renders triggered for the 3D scene on scroll. Overlay text
 * animates through Framer Motion's `useScroll` independently.
 *
 * `progress` is page scroll in [0, 1].
 * `velocity` is signed scroll delta smoothed a touch, used for parallax.
 */
export const scrollState = {
  progress: 0,
  velocity: 0,
};

let ticking = false;
let lastY = 0;

const onScroll = () => {
  const y = window.scrollY || window.pageYOffset;
  // Deliberately NOT (scrollHeight - innerHeight): that includes whatever
  // trailing content (footer, etc.) follows the assembly track, which would
  // leave progress < 1 by the time the reader has scrolled through all
  // TOTAL_STEPS sections — the finale would trigger a step early and the
  // last part would never fully snap in. Each step section is exactly
  // 100vh, so the track's scrollable range is fixed at (TOTAL_STEPS - 1)
  // viewport heights regardless of what surrounds it.
  const range = (TOTAL_STEPS - 1) * window.innerHeight || 1;
  scrollState.velocity = Math.max(-1, Math.min(1, (y - lastY) * 0.01));
  scrollState.progress = Math.max(0, Math.min(1, y / range));
  lastY = y;
  ticking = false;
};

let installed = false;

export const installScrollListener = () => {
  if (!installed) {
    installed = true;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(onScroll);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }
};
