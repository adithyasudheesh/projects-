import type { GlasswareProps } from './types';
import { REAGENTS } from '../../data/reagents';

/** Paper ball (FeSO₄-soaked pellet) apparatus. Colour reflects
 *  item.paperBallState, set once by the physics pass in
 *  engine/physics.ts when it's carried to the mouth of a heated,
 *  fuming vessel — brown/black if nitrate is present, unchanged
 *  otherwise. Transitions smoothly rather than snapping. */
export function PaperBallItem({ item, width, height }: GlasswareProps) {
  const w = width ?? 22;
  const h = height ?? 22;
  const positive = item.paperBallState === 'positive';
  const fill = positive ? '#2b1a10' : REAGENTS.paperBallReagent.color;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <circle
        cx={w / 2}
        cy={h / 2}
        r={Math.min(w, h) / 2 - 1}
        fill={fill}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
        style={{
          filter: positive ? 'drop-shadow(0 0 6px rgba(120,70,30,0.75))' : 'none',
          transition: 'fill 1.8s ease, filter 1.8s ease',
        }}
      />
    </svg>
  );
}
