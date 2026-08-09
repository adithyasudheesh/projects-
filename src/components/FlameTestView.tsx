import { motion } from 'framer-motion';

export function FlameTestView({
  colorHex,
  colorName,
  applicable,
}: {
  colorHex: string;
  colorName: string;
  applicable: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <svg width="56" height="72" viewBox="0 0 56 72" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="ftCore" cx="50%" cy="75%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="40%" stopColor={colorHex} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Bunsen burner base */}
        <rect x="20" y="58" width="16" height="10" rx="1.5" fill="#3f3f46" />
        <rect x="25" y="40" width="6" height="20" fill="#52525b" />
        {applicable ? (
          [0, 1, 2].map((i) => (
            <motion.ellipse
              key={i}
              cx={28 + (i - 1) * 3}
              cy={44}
              rx={7 - i}
              ry={16 - i * 2}
              fill="url(#ftCore)"
              style={{ transformOrigin: '28px 52px' }}
              initial={{ scaleY: 0.85, opacity: 0.75 }}
              animate={{
                scaleY: [0.85, 1.2, 0.9, 1.3, 0.85],
                scaleX: [1, 0.85, 1.1, 0.9, 1],
                opacity: [0.75, 1, 0.8, 1, 0.75],
              }}
              transition={{ duration: 0.55 + i * 0.12, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
            />
          ))
        ) : (
          <ellipse cx="28" cy="44" rx="5" ry="14" fill="rgba(140,170,255,0.5)" />
        )}
      </svg>
      <div>
        <div
          className="w-6 h-6 rounded-full border border-white/30 mb-1"
          style={{ background: colorHex, boxShadow: applicable ? `0 0 12px ${colorHex}` : 'none' }}
        />
        <div className="text-[11px] text-slate-200">{colorName}</div>
      </div>
    </div>
  );
}
