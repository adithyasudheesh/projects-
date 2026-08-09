import { motion } from 'framer-motion';
import { GlassDefs } from './GlassDefs';
import { LiquidSurface } from './LiquidSurface';
import { EffectsLayer } from './EffectsLayer';
import { hasEffect, type GlasswareProps } from './types';
import { useAnimatedNumber, useElapsed, useSwirl } from '../../hooks/animationHooks';

export function Beaker({ item, width = 80, height = 90 }: GlasswareProps) {
  const level = useAnimatedNumber(item.liquidLevel);
  const rotate = useSwirl(item.mixCount);
  const swirlElapsed = useElapsed(item.mixCount > 0 ? item.effectsStartedAt : null, 3000);
  const swirling = swirlElapsed != null && swirlElapsed < 2600;

  const liquidH = (height - 18) * level;
  const liquidTop = height - 8 - liquidH;
  const bodyPath = `M 6 10 L 6 ${height - 12} Q ${width / 2} ${height - 2} ${width - 6} ${height - 12} L ${width - 6} 10`;
  const liquidPath =
    level > 0.003
      ? `M 8 ${liquidTop} Q ${width / 2} ${liquidTop - 3} ${width - 8} ${liquidTop} L ${width - 8} ${height - 12} Q ${width / 2} ${height - 2} 8 ${height - 12} Z`
      : '';

  return (
    <svg width={width} height={height + 8} viewBox={`-3 -3 ${width + 6} ${height + 14}`} style={{ overflow: 'visible' }}>
      <GlassDefs />
      <motion.ellipse
        cx={width / 2}
        cy={height + 4}
        rx={width / 2 - 2}
        ry={5}
        fill="url(#shadowGrad)"
        animate={swirling ? { rx: [width / 2 - 2, width / 2, width / 2 - 3, width / 2 - 2] } : {}}
        transition={{ duration: 0.5, repeat: swirling ? 2 : 0 }}
      />
      <path d={`M 2 6 L 10 10 M ${width - 2} 6 L ${width - 10} 10`} stroke="rgba(200,230,255,0.5)" strokeWidth="1.5" fill="none" />
      <path d={bodyPath} fill="url(#glassWall)" stroke="rgba(200,230,255,0.55)" strokeWidth="1" />
      {level > 0.003 && (
        <motion.g style={{ rotate, transformOrigin: `${width / 2}px ${height - 14}px` }}>
          <motion.path
            d={liquidPath}
            animate={{ fill: item.liquidColor }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 5px ${item.liquidGlow})` }}
          />
          <LiquidSurface
            cx={width / 2}
            width={width - 16}
            y={liquidTop}
            color={item.liquidColor}
            glow={item.liquidGlow}
            animate={hasEffect(item, 'bubbles')}
            swirling={swirling}
          />
        </motion.g>
      )}
      <EffectsLayer item={item} width={width} height={height} liquidTop={liquidTop} />
      <path d={bodyPath} fill="url(#glassShine)" opacity="0.45" />
      <ellipse cx={width / 2} cy={10} rx={width / 2 - 6} ry={3} fill="none" stroke="url(#rimGrad)" strokeWidth="2" />
      <path d="M 14 20 L 14 30 M 14 35 L 14 45 M 14 50 L 14 60" stroke="rgba(200,230,255,0.3)" strokeWidth="0.8" />
      <path d={bodyPath} fill="none" stroke="rgba(180,220,255,0.35)" strokeWidth="2.5" opacity="0.3" />
    </svg>
  );
}
