import { motion } from 'framer-motion';

function Bead({ label, colorHex }: { label: string; colorHex: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="36" height="52" style={{ overflow: 'visible' }}>
        <path d="M 18 4 L 18 30" stroke="#a1a1aa" strokeWidth="2" />
        <motion.circle
          cx="18"
          cy="38"
          r="9"
          fill={colorHex}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
          initial={{ scale: 0.85 }}
          animate={{ scale: [0.85, 1, 0.9, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${colorHex})` }}
        />
      </svg>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}

export function BoraxBeadView({
  hotHex,
  hotName,
  coldHex,
  coldName,
}: {
  hotHex: string;
  hotName: string;
  coldHex: string;
  coldName: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <Bead label={`Hot — ${hotName}`} colorHex={hotHex} />
      <Bead label={`Cold — ${coldName}`} colorHex={coldHex} />
    </div>
  );
}
