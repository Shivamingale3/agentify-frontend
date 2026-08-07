/**
 * Single Web Audio "clack" — fires when a part snaps into place.
 * Gated behind a user-gesture (button activation on landing) and
 * prefers-reduced-motion. No autoplay; safe to call defensively.
 */
let ctx: AudioContext | null = null;

const ensureCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (ctx && ctx.state === "suspended") ctx.resume();
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
};

let lastFired = 0;
export const playClack = () => {
  // throttle — don't rapid-fire on scrub
  const now = performance.now();
  if (now - lastFired < 80) return;
  lastFired = now;

  if (typeof window !== "undefined") {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
  }

  const ac = ensureCtx();
  if (!ac) return;

  const t = ac.currentTime;

  // short noise burst through a lowpass for the mechanical "clack"
  const buf = ac.createBuffer(1, 1024, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 60);
  }

  const src = ac.createBufferSource();
  src.buffer = buf;

  const filt = ac.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 1800;
  filt.Q.value = 0.6;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

  src.connect(filt).connect(gain).connect(ac.destination);
  src.start(t);
  src.stop(t + 0.12);
};

/** a one-shot "ping" for the finale skull-open + "ship" moment */
export const playPing = () => {
  if (typeof window !== "undefined") {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
  }
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(620, t);
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.65);
};