import { motion } from 'framer-motion';

/**
 * Small recap illustration for the observation panel / notebook —
 * mirrors FlameTestView / BoraxBeadView in size and style. Shows the
 * paper ball at the tube's mouth, brown/black with rising fumes when
 * positive, unchanged and fume-free when negative.
 */
export function PaperBallTestView({ positive }: { positive: boolean }) {
  const ballColor = positive ? '#3f2a1a' : '#e8e2d0';
  const ballGlow = 'rgba(120, 70, 30, 0.6)';

  return (
    <div className="flex items-center gap-3">
      <svg width="56" height="72" viewBox="0 0 56 72" style={{ overflow: 'visible' }}>
        <path
          d="M 20 42 L 20 16 Q 28 9 36 16 L 36 42"
          fill="none"
          stroke="rgba(200,230,255,0.5)"
          strokeWidth="2"
        />
        <path
          d="M 20 42 L 20 60 Q 28 66 36 60 L 36 42 Z"
          fill="rgba(140,170,255,0.12)"
          stroke="rgba(200,230,255,0.35)"
          strokeWidth="1.5"
        />
        {positive &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={28 + (i - 1) * 5}
              r={4 + i}
              fill="rgba(120, 70, 30, 0.5)"
              initial={{ cy: 12, opacity: 0 }}
              animate={{ cy: -16, opacity: [0, 0.7, 0], scale: [0.6, 1.4, 1.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
            />
          ))}
        <motion.circle
          cx="28"
          cy="14"
          r="7"
          fill={ballColor}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          initial={{ scale: 0.85 }}
          animate={{ scale: [0.85, 1, 0.92, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: positive ? `drop-shadow(0 0 6px ${ballGlow})` : 'none' }}
        />
      </svg>
      <div>
        <div
          className="w-6 h-6 rounded-full border border-white/30 mb-1"
          style={{ background: ballColor, boxShadow: positive ? `0 0 10px ${ballGlow}` : 'none' }}
        />
        <div className="text-[11px] text-slate-200">
          {positive ? 'Brown/black paper ball' : 'No colour change'}
        </div>
      </div>
    </div>
  );
}
