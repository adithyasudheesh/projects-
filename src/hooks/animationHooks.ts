import { useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useSpring } from 'framer-motion';

/**
 * Smoothly animates a numeric value toward `target` using spring physics
 * instead of jumping instantly. Used for liquid level / precipitate height
 * so glassware fills rise continuously rather than snapping on state change.
 */
export function useAnimatedNumber(
  target: number,
  config: { stiffness?: number; damping?: number; mass?: number } = {}
): number {
  const spring = useSpring(target, {
    stiffness: config.stiffness ?? 120,
    damping: config.damping ?? 20,
    mass: config.mass ?? 0.6,
  });
  const [value, setValue] = useState(target);

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useMotionValueEvent(spring, 'change', (v) => setValue(v));

  return value;
}

/**
 * Ticks via requestAnimationFrame and returns milliseconds elapsed since
 * `startedAt`, stopping once `cutoffMs` is reached (to avoid burning
 * frames forever on an effect that has long since settled). Returns null
 * when `startedAt` is null.
 */
export function useElapsed(startedAt: number | null, cutoffMs = 6000): number | null {
  const [elapsed, setElapsed] = useState<number | null>(startedAt == null ? null : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (startedAt == null) {
      setElapsed(null);
      return;
    }
    setElapsed(Date.now() - startedAt);
    const tick = () => {
      const next = Date.now() - startedAt;
      setElapsed(next);
      if (next < cutoffMs) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [startedAt, cutoffMs]);

  return elapsed;
}

/**
 * Returns a MotionValue (degrees) that briefly swirls (a few oscillating
 * keyframes settling back to 0) each time `mixCount` increases — used for
 * the "gentle circular motion after mixing" effect. Deliberately does NOT
 * remount the liquid element, so colour-transition animations on the same
 * element aren't interrupted by the swirl replaying.
 */
export function useSwirl(mixCount: number) {
  const rotate = useMotionValue(0);
  useEffect(() => {
    if (mixCount === 0) return;
    const controls = animate(rotate, [0, 7, -5, 3, -1, 0], { duration: 1.1, ease: 'easeInOut' });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixCount]);
  return rotate;
}

/**
 * Returns { x, y } MotionValues that briefly jitter (a small, fast
 * shake) each time `mixCount` increases — a subtle "bench vibration"
 * cue that a vessel was just poured into / mixed.
 */
export function useJitter(mixCount: number) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    if (mixCount === 0) return;
    const cx = animate(x, [0, -1.5, 1.5, -1, 1, 0], { duration: 0.4, ease: 'easeInOut' });
    const cy = animate(y, [0, 1, -1, 0.5, -0.5, 0], { duration: 0.4, ease: 'easeInOut' });
    return () => {
      cx.stop();
      cy.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixCount]);
  return { x, y };
}
