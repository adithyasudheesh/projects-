import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BenchItem, PrecipitateTexture } from '../../types/chemistry';
import { hasEffect } from './types';
import { useAnimatedNumber, useElapsed } from '../../hooks/animationHooks';
import { hashString, mulberry32 } from './random';

interface EffectsLayerProps {
  item: BenchItem;
  width: number;
  height: number;
  /** y-coordinate of the liquid surface, for placing steam/condensation
   *  relative to the actual liquid rather than the vessel bounding box. */
  liquidTop?: number;
}

/** How each precipitate texture actually looks as it forms and settles.
 *  Grounded in real behavior: silver halides coagulate into curdy
 *  clumps; hydroxide/"lake" precipitates are voluminous and gelatinous;
 *  Ni-DMG is famously bulky/flocculent; ferro/ferricyanides and metal
 *  sulphides are so finely divided they stay a colloidal haze; most
 *  crystalline salts are simply granular and settle promptly; a few
 *  (like SrSO₄) are granular but slow to even start forming. */
const TEXTURE_PARAMS: Record<
  PrecipitateTexture,
  {
    count: number;
    minR: number;
    maxR: number;
    fallDuration: number;
    onsetDelay: number;
    suspensionOpacity: number;
    bandRatio: number;
    drift: number;
    clumpy: boolean;
    stiffness: number;
    damping: number;
  }
> = {
  granular: {
    count: 14,
    minR: 1.1,
    maxR: 2.0,
    fallDuration: 1.3,
    onsetDelay: 0,
    suspensionOpacity: 0.22,
    bandRatio: 0.2,
    drift: 3,
    clumpy: false,
    stiffness: 90,
    damping: 15,
  },
  gelatinous: {
    count: 10,
    minR: 3.0,
    maxR: 5.0,
    fallDuration: 2.6,
    onsetDelay: 0,
    suspensionOpacity: 0.55,
    bandRatio: 0.4,
    drift: 8,
    clumpy: true,
    stiffness: 45,
    damping: 14,
  },
  flocculent: {
    count: 9,
    minR: 3.5,
    maxR: 6.0,
    fallDuration: 3.0,
    onsetDelay: 0,
    suspensionOpacity: 0.5,
    bandRatio: 0.48,
    drift: 10,
    clumpy: true,
    stiffness: 40,
    damping: 13,
  },
  colloidal: {
    count: 18,
    minR: 0.8,
    maxR: 1.4,
    fallDuration: 3.6,
    onsetDelay: 0,
    suspensionOpacity: 0.6,
    bandRatio: 0.14,
    drift: 5,
    clumpy: false,
    stiffness: 50,
    damping: 16,
  },
  curdy: {
    count: 11,
    minR: 2.4,
    maxR: 4.0,
    fallDuration: 1.7,
    onsetDelay: 0,
    suspensionOpacity: 0.32,
    bandRatio: 0.28,
    drift: 4,
    clumpy: true,
    stiffness: 75,
    damping: 15,
  },
  slow: {
    count: 12,
    minR: 1.3,
    maxR: 2.1,
    fallDuration: 1.4,
    onsetDelay: 1.6,
    suspensionOpacity: 0.25,
    bandRatio: 0.2,
    drift: 3,
    clumpy: false,
    stiffness: 90,
    damping: 15,
  },
};

export function EffectsLayer({ item, width, height, liquidTop }: EffectsLayerProps) {
  const cx = width / 2;
  const bubbling = hasEffect(item, 'bubbles') || hasEffect(item, 'co2Gas');
  const smoking = hasEffect(item, 'smoke');
  const brownFumes = hasEffect(item, 'brownFumes');
  const whiteFumes = hasEffect(item, 'whiteFumes');
  const milky = hasEffect(item, 'milky');
  const precipitateEffect = item.effects.find((e) => e.id === 'precipitate');
  const precipitate = !!precipitateEffect || milky;
  const texture = TEXTURE_PARAMS[precipitateEffect?.texture ?? 'granular'];
  const crystals = hasEffect(item, 'crystals');
  const heated = item.heated || hasEffect(item, 'heat');
  const surfaceY = liquidTop ?? height - 24;

  const elapsed = useElapsed(item.effectsStartedAt, 6000);
  const mixKey = item.mixCount;

  // Stable-per-pour randomisation for bubbles/particles/crystals so
  // parameters don't reshuffle on every animation-frame re-render.
  const rand = useMemo(
    () => mulberry32(hashString(item.uid) + mixKey * 7919),
    [item.uid, mixKey]
  );

  const bubbleConfigs = useMemo(
    () =>
      Array.from({ length: 12 }).map(() => ({
        cx: 10 + rand() * (width - 20),
        r: 1.2 + rand() * 2.2,
        wobble: 2 + rand() * 4,
        duration: 1.1 + rand() * 1.1,
        delay: rand() * 1.4,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rand, width]
  );

  // Precipitate particle configs, shaped by texture: bigger/irregular
  // for clumpy textures (curdy, gelatinous, flocculent), fine dust for
  // granular/colloidal ones, with per-particle timing offset so they
  // don't all appear in perfect lockstep.
  const precipConfigs = useMemo(
    () =>
      Array.from({ length: texture.count }).map(() => ({
        cx: 8 + rand() * (width - 16),
        r: texture.minR + rand() * (texture.maxR - texture.minR),
        delay: texture.onsetDelay + rand() * (texture.clumpy ? 0.9 : 0.6),
        drift: (rand() - 0.5) * 2 * texture.drift,
        squash: 0.55 + rand() * 0.45,
        rot: rand() * 60,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rand, width, texture]
  );

  const crystalConfigs = useMemo(
    () =>
      Array.from({ length: 7 }).map(() => ({
        cx: 10 + rand() * (width - 20),
        size: 3 + rand() * 4,
        delay: rand() * 1.8,
        rot: rand() * 90,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rand, width]
  );

  // Dense-at-first, tapering-off gas evolution: bubble count decays
  // over the first ~4s of a reaction, then holds at a low simmer.
  const decayProgress = Math.min(1, (elapsed ?? 0) / 4000);
  const activeBubbleCount = bubbling ? Math.max(4, Math.round(12 - 8 * decayProgress)) : 0;

  const suspensionOpacity = useAnimatedNumber(precipitate ? texture.suspensionOpacity : 0, {
    stiffness: texture.stiffness,
    damping: texture.damping,
  });
  const interiorHeight = height * 0.55;
  const bandHeight = useAnimatedNumber(precipitate ? interiorHeight * texture.bandRatio : 0, {
    stiffness: texture.stiffness * 0.8,
    damping: texture.damping,
  });

  const gasColor = brownFumes
    ? 'rgba(150, 90, 50, 0.85)'
    : whiteFumes
      ? 'rgba(255,255,255,0.85)'
      : 'rgba(255,255,255,0.78)';

  const smokeColor = item.effects.find((e) => e.id === 'smoke')?.meta ?? 'rgba(200,200,210,0.4)';

  // Precipitates take on the reaction's own colour (already computed
  // into the vessel's liquid colour/glow) rather than a fixed white —
  // a lead iodide precipitate should read as yellow, copper
  // ferrocyanide as chocolate brown, and so on. The glow variant is a
  // touch more saturated, which reads better for small particles than
  // the softer liquid wash.
  const precipitateFill = milky ? 'rgba(255, 250, 235, 0.92)' : item.liquidGlow || item.liquidColor;
  const bandFill = milky ? 'rgba(250,250,235,0.9)' : item.liquidColor;

  return (
    <>
      {/* --- Gas bubbles: variable size, wobble, dense-then-sparse --- */}
      {bubbling &&
        bubbleConfigs.slice(0, activeBubbleCount).map((b, i) => (
          <motion.g
            key={`bg-${mixKey}-${i}`}
            initial={{ x: 0 }}
            animate={{ x: [0, b.wobble, -b.wobble, b.wobble * 0.5, 0] }}
            transition={{ duration: b.duration, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          >
            <motion.circle
              cx={b.cx}
              r={b.r}
              fill={gasColor}
              initial={{ cy: height - 16, opacity: 0 }}
              animate={{ cy: 16, opacity: [0, 0.9, 0.9, 0] }}
              transition={{ duration: b.duration, repeat: Infinity, delay: b.delay, ease: 'easeOut' }}
            />
          </motion.g>
        ))}

      {/* --- Precipitate: particles appear and settle according to the
          texture's real behavior — quick dense granules, a slow
          gelatinous cloud, bulky floaty flocs, a persistent colloidal
          haze, or curdy irregular clumps. --- */}
      {precipitate &&
        precipConfigs.map((p, i) =>
          texture.clumpy ? (
            <motion.ellipse
              key={`p-${mixKey}-${i}`}
              cx={p.cx}
              rx={p.r}
              ry={p.r * p.squash}
              fill={precipitateFill}
              style={{ transformOrigin: `${p.cx}px ${height * 0.32}px`, rotate: p.rot }}
              initial={{ cy: height * 0.3, opacity: 0, x: 0 }}
              animate={{
                cy: [height * 0.3, height * 0.3, height - 16],
                opacity: [0, 1, 0.9],
                x: [0, p.drift, -p.drift * 0.6],
              }}
              transition={{ duration: texture.fallDuration, delay: p.delay, times: [0, 0.15, 1], ease: 'easeIn' }}
            />
          ) : (
            <motion.circle
              key={`p-${mixKey}-${i}`}
              cx={p.cx}
              r={p.r}
              fill={precipitateFill}
              initial={{ cy: height * 0.32, opacity: 0, x: 0 }}
              animate={{
                cy: [height * 0.32, height * 0.32, height - 16],
                opacity: [0, 1, 0.85],
                x: [0, p.drift, 0],
              }}
              transition={{ duration: texture.fallDuration, delay: p.delay, times: [0, 0.15, 1], ease: 'easeIn' }}
            />
          )
        )}

      {precipitate && (
        <motion.rect
          x={7}
          y={height * 0.3}
          width={width - 14}
          height={interiorHeight}
          fill={bandFill}
          initial={{ opacity: 0 }}
          animate={{ opacity: suspensionOpacity }}
        />
      )}

      {precipitate && bandHeight > 0.3 && (
        <rect x={7} y={height - 16 - bandHeight} width={width - 14} height={bandHeight} fill={bandFill} />
      )}

      {/* --- Crystal formation: progressive growth with a sparkle --- */}
      {crystals &&
        crystalConfigs.map((c, i) => (
          <g key={`c-${mixKey}-${i}`}>
            <motion.rect
              x={c.cx - c.size / 2}
              y={height - 15 - c.size / 2}
              width={c.size}
              height={c.size}
              fill="rgba(235,245,255,0.92)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="0.5"
              style={{ transformOrigin: `${c.cx}px ${height - 15}px` }}
              initial={{ scale: 0, rotate: c.rot, opacity: 0 }}
              animate={{ scale: 1, rotate: c.rot + 45, opacity: 1 }}
              transition={{ duration: 1.1, delay: c.delay, ease: 'easeOut' }}
            />
            <motion.circle
              cx={c.cx}
              cy={height - 15}
              r={c.size * 0.9}
              fill="url(#sparkleGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.9, 0] }}
              transition={{ duration: 1.6, delay: c.delay + 1.1, repeat: Infinity, repeatDelay: 1.4 }}
            />
          </g>
        ))}

      {/* --- Fume/smoke plumes --- */}
      {(smoking || brownFumes || whiteFumes) &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.circle
            key={`s-${mixKey}-${i}`}
            cx={cx + (i - 2.5) * 5}
            fill={brownFumes ? 'rgba(120, 70, 30, 0.5)' : whiteFumes ? 'rgba(235,235,240,0.55)' : smokeColor}
            r={5 + i}
            initial={{ cy: 10, opacity: 0 }}
            animate={{ cy: -36, opacity: [0, 0.7, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
          />
        ))}

      {/* --- Heating: flicker flame, convection, steam, condensation --- */}
      {heated && (
        <>
          <motion.ellipse
            cx={cx}
            cy={height - 4}
            rx={width / 2 - 4}
            ry={6}
            fill="url(#heatGlow)"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          {[0, 1, 2].map((i) => (
            <motion.ellipse
              key={`flame-${i}`}
              cx={cx + (i - 1) * 5}
              cy={height + 6}
              rx={5 - i}
              ry={9 - i * 1.5}
              fill="url(#flameCore)"
              style={{ transformOrigin: `${cx + (i - 1) * 5}px ${height + 10}px` }}
              initial={{ scaleY: 0.8, scaleX: 1, opacity: 0.7 }}
              animate={{
                scaleY: [0.8, 1.15, 0.9, 1.25, 0.85],
                scaleX: [1, 0.85, 1.1, 0.9, 1],
                opacity: [0.7, 0.95, 0.75, 1, 0.7],
              }}
              transition={{ duration: 0.6 + i * 0.15, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
            />
          ))}

          {item.liquidLevel > 0 &&
            [0, 1].map((i) => (
              <motion.path
                key={`conv-${i}`}
                d={`M ${cx + (i - 0.5) * 10} ${height - 20} Q ${cx + (i - 0.5) * 14} ${(surfaceY + height) / 2} ${cx + (i - 0.5) * 10} ${surfaceY + 4}`}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                fill="none"
                initial={{ x: 0, opacity: 0.15 }}
                animate={{ x: [0, 3, -3, 0], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2.2 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}

          {item.liquidLevel > 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <motion.circle
                key={`steam-${i}`}
                cx={cx + (i - 1.5) * 6}
                r={2 + (i % 2)}
                fill="rgba(255,255,255,0.5)"
                initial={{ cy: surfaceY - 4, opacity: 0 }}
                animate={{ cy: surfaceY - 40, opacity: [0, 0.5, 0], scale: [0.6, 1.6] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
              />
            ))}

          {Array.from({ length: 3 }).map((_, i) => (
            <motion.circle
              key={`condensation-${i}`}
              cx={8 + i * ((width - 16) / 2)}
              cy={11}
              r={1.1}
              fill="rgba(255,255,255,0.7)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0], cy: [11, 14, 16] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.9, ease: 'easeInOut' }}
            />
          ))}
        </>
      )}
    </>
  );
}
