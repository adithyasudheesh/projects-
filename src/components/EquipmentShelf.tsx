import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EQUIPMENT, SHELF_EQUIPMENT_ORDER } from '../data/equipment';
import { useLab } from '../context/LabContext';
import Glassware from './Glassware';
import type { BenchItem, EquipmentId } from '../types/chemistry';

function makePreview(id: EquipmentId): BenchItem {
  return {
    uid: `preview-${id}`,
    equipment: id,
    x: 0,
    y: 0,
    rotation: 0,
    liquidLevel: 0,
    liquidColor: 'rgba(180, 220, 255, 0.35)',
    liquidGlow: 'rgba(180, 220, 255, 0.5)',
    effects: [],
    heated: false,
    saltLoaded: false,
    mixCount: 0,
    effectsStartedAt: null,
    crystallising: false,
  };
}

export default function EquipmentShelf() {
  const { addEquipmentToBench, benchItems, mode } = useLab();

  // Vessels and the spirit lamp are shared apparatus (both analyses
  // need to hold and heat a sample); the paper ball is specific to the
  // anion-side nitrate test, so it only shows up on that dashboard.
  const visible = SHELF_EQUIPMENT_ORDER.filter((id) => id !== 'paperBall' || mode === 'anion');

  // SHELF_EQUIPMENT_ORDER never changes at runtime, so the preview bench
  // items (used only for the static glassware thumbnails) only need
  // to be built once instead of on every render.
  const previews = useMemo(
    () =>
      Object.fromEntries(SHELF_EQUIPMENT_ORDER.map((id) => [id, makePreview(id)])) as Record<
        EquipmentId,
        BenchItem
      >,
    []
  );

  return (
    <div className="flex flex-col lg:h-full">
      <div className="px-3.5 lg:px-4 py-2.5 lg:py-3 border-b border-white/10">
        <h2 className="text-xs lg:text-sm font-semibold text-cyan-200 tracking-wide uppercase">
          Equipment
        </h2>
        <p className="text-[10px] lg:text-[11px] text-slate-400 mt-0.5">Click to add to bench</p>
      </div>
      <div
        className="flex-1 min-w-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible overflow-y-hidden lg:overflow-y-auto gap-2 p-2.5 lg:p-3 snap-x snap-mandatory lg:snap-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {visible.map((id, idx) => {
          const item = EQUIPMENT[id];
          const onBench = benchItems.filter((b) => b.equipment === id).length;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.03, x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => addEquipmentToBench(id)}
              className="shrink-0 snap-start w-60 lg:w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 transition-colors text-left"
            >
              <div className="flex items-end justify-center h-14 w-12 shrink-0">
                <Glassware item={previews[id]} compact />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs lg:text-sm font-medium text-slate-100">
                  {item.name}
                </div>
                <div className="text-[10px] lg:text-[11px] text-slate-400 truncate leading-tight">
                  {item.description}
                </div>
              </div>
              {onBench > 0 && (
                <span className="text-[9px] lg:text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 shrink-0">
                  {onBench}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
