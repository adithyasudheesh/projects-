/** Deterministic pseudo-random helpers so per-particle animation
 *  parameters (bubble size, wobble phase, etc.) stay stable across
 *  the many re-renders a running animation causes, instead of
 *  reshuffling every frame (which reads as flicker/jitter). Reseed
 *  by passing a new seed (e.g. when a new pour starts) to get fresh
 *  variation. */
export function mulberry32(seed: number) {
  let s = seed | 0;
  return function random() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}
