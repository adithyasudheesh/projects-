import { motion } from 'framer-motion';
import { useLab } from '../context/LabContext';

/** Animated pour: a small reagent bottle tilts to pour, a continuous
 *  curved stream flows (with a natural side-to-side wobble) into the
 *  vessel, and a few droplets fall at the very end. */
export default function PourStreamView() {
  const { pourStream } = useLab();
  if (!pourStream) return null;

  const { fromX, fromY, toX, toY, color, glow, seed } = pourStream;
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const wobble = 4 + seed * 6;
  const times = [0, 0.12, 0.5, 0.85, 1];

  return (
    <svg
      key={pourStream.startedAt}
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      style={{ zIndex: 35, overflow: 'visible' }}
    >
      {/* Source bottle: tilts into pour position, holds, then rights itself */}
      <motion.g
        style={{ transformOrigin: `${fromX}px ${fromY + 8}px` }}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: [0, -55, -58, -55, 0], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 1.3, times, ease: 'easeInOut' }}
      >
        <rect
          x={fromX - 6}
          y={fromY - 10}
          width={12}
          height={20}
          rx={2.5}
          fill={color}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={1}
        />
        <rect
          x={fromX - 3}
          y={fromY - 16}
          width={6}
          height={7}
          fill={color}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={1}
        />
      </motion.g>

      {/* Continuous wobbling stream */}
      <motion.path
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1, 1, 0.2],
          opacity: [0, 1, 1, 1, 0],
          d: [
            `M ${fromX} ${fromY} Q ${midX - wobble} ${midY} ${toX} ${toY}`,
            `M ${fromX} ${fromY} Q ${midX + wobble} ${midY} ${toX} ${toY}`,
            `M ${fromX} ${fromY} Q ${midX - wobble * 0.6} ${midY} ${toX} ${toY}`,
            `M ${fromX} ${fromY} Q ${midX + wobble * 0.6} ${midY} ${toX} ${toY}`,
            `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`,
          ],
        }}
        transition={{ duration: 1.3, ease: 'easeInOut', times }}
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      />

      {/* Droplets riding the stream */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.circle
          key={`ride-${i}`}
          r={2.4}
          fill={color}
          initial={{ cx: fromX, cy: fromY, opacity: 0 }}
          animate={{
            cx: [fromX, midX, toX],
            cy: [fromY, midY, toY],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 0.9, delay: 0.15 + i * 0.14, ease: 'easeIn' }}
        />
      ))}

      {/* End-of-pour splash droplets */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.circle
          key={`splash-${i}`}
          r={1.8}
          fill={color}
          initial={{ cx: toX, cy: toY - 4, opacity: 0 }}
          animate={{ cx: toX + (i - 1.5) * 3, cy: [toY - 4, toY + 6], opacity: [0, 1, 0] }}
          transition={{ duration: 0.45, delay: 0.9 + i * 0.07, ease: 'easeIn' }}
        />
      ))}
    </svg>
  );
}
