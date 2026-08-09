import { memo } from 'react';
import { TestTube } from './glassware/TestTube';
import { Beaker } from './glassware/Beaker';
import { ConicalFlask } from './glassware/ConicalFlask';
import { SpiritLamp } from './glassware/SpiritLamp';
import { PaperBallItem } from './glassware/PaperBallItem';
import type { GlasswareProps } from './glassware/types';
import { VESSELS } from './glassware/types';

export type { GlasswareProps };
export { VESSELS };

function GlasswareInner(props: GlasswareProps) {
  const { item, compact } = props;
  const scale = compact ? 0.5 : 1;
  const node = (() => {
    switch (item.equipment) {
      case 'testTube':
        return <TestTube {...props} />;
      case 'beaker':
        return <Beaker {...props} />;
      case 'conicalFlask':
        return <ConicalFlask {...props} />;
      case 'spiritLamp':
        return <SpiritLamp {...props} />;
      case 'paperBall':
        return <PaperBallItem {...props} />;
      default:
        return null;
    }
  })();
  if (compact) {
    return (
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
        {node}
      </div>
    );
  }
  return node;
}

// Glassware only ever visually depends on a handful of fields on
// `item` (equipment/liquidLevel/liquidColor/liquidGlow/heated/effects).
// Position (x, y), rotation, and uid change on every drag frame but
// never change what Glassware renders, so a custom comparator that
// ignores them keeps the (fairly expensive, animation-heavy) SVG tree
// from re-rendering while a piece of glassware is simply being moved
// around the bench.
function areEqual(prev: GlasswareProps, next: GlasswareProps) {
  if (prev.compact !== next.compact || prev.width !== next.width || prev.height !== next.height) {
    return false;
  }
  const a = prev.item;
  const b = next.item;
  if (a === b) return true;
  return (
    a.equipment === b.equipment &&
    a.liquidLevel === b.liquidLevel &&
    a.liquidColor === b.liquidColor &&
    a.liquidGlow === b.liquidGlow &&
    a.heated === b.heated &&
    a.effects === b.effects &&
    a.mixCount === b.mixCount &&
    a.effectsStartedAt === b.effectsStartedAt &&
    a.crystallising === b.crystallising &&
    a.paperBallState === b.paperBallState
  );
}

export default memo(GlasswareInner, areEqual);
