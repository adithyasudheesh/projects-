import { TestTube } from './glassware/TestTube';
import { DRY_HEAT_EFFECTS } from '../engine/dryTests';
import type { BenchItem, DryHeatObservationId } from '../types/chemistry';

export function DryHeatTestView({ observation }: { observation: DryHeatObservationId }) {
  const syntheticItem: BenchItem = {
    uid: `dryheat-${observation}`,
    equipment: 'testTube',
    x: 0,
    y: 0,
    rotation: 0,
    liquidLevel: 0,
    liquidColor: 'rgba(200,200,200,0.3)',
    liquidGlow: 'rgba(200,200,200,0.3)',
    effects: DRY_HEAT_EFFECTS[observation],
    heated: true,
    saltLoaded: true,
    mixCount: 1,
    effectsStartedAt: Date.now(),
    crystallising: false,
  };
  return (
    <div className="scale-75 origin-left -my-3">
      <TestTube item={syntheticItem} width={40} height={110} />
    </div>
  );
}
