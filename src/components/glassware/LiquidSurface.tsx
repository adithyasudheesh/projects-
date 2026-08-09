import { motion } from 'framer-motion';

export function LiquidSurface({
  cx,
  width,
  y,
  color,
  glow,
  animate,
  swirling = false,
}: {
  cx: number;
  width: number;
  y: number;
  color: string;
  glow: string;
  animate: boolean;
  swirling?: boolean;
}) {
  const halfW = width / 2;
  return (
    <g>
      {/* Meniscus: a soft shaded band just under the rim where liquid
          climbs the glass slightly, giving the surface real depth. */}
      <path
        d={`M ${cx - halfW} ${y} Q ${cx} ${y + 4} ${cx + halfW} ${y} L ${cx + halfW} ${y + 3} Q ${cx} ${y + 7} ${cx - halfW} ${y + 3} Z`}
        fill="url(#meniscusShade)"
        opacity={0.5}
      />
      {/* Primary surface line */}
      <motion.path
        d={`M ${cx - halfW} ${y} Q ${cx} ${y - 3} ${cx + halfW} ${y}`}
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: animate ? [0.6, 1, 0.6] : 0.85 }}
        transition={{ duration: 1.5, repeat: animate ? Infinity : 0 }}
        style={{ filter: `drop-shadow(0 0 3px ${glow})` }}
      />
      {/* Ripple rings: brief outward-fading arcs triggered by swirling
          (post-pour mixing) for a "liquid surface ripple" effect. */}
      {swirling &&
        [0, 1, 2].map((i) => (
          <motion.ellipse
            key={i}
            cx={cx}
            cy={y}
            rx={4}
            ry={1.4}
            fill="none"
            stroke={color}
            strokeWidth="1"
            initial={{ opacity: 0.6, rx: 4, ry: 1.4 }}
            animate={{ opacity: 0, rx: halfW * 0.95, ry: 3.2 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
          />
        ))}
    </g>
  );
}
