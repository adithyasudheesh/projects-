import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  REAGENTS,
  CATION_REAGENT_ORDER,
  ANION_REAGENT_ORDER,
  SHARED_REAGENT_ORDER,
  REAGENT_CATEGORIES,
} from '../data/reagents';
import { SALTS, SALT_ORDER } from '../data/salts';
import { useLab } from '../context/LabContext';
import type { ReagentCategory } from '../types/chemistry';

export default function ReagentShelf() {
  const { mode, selectedReagent, selectReagent, selectedSalt, selectSalt, saltRevealed } = useLab();
  const [category, setCategory] = useState<ReagentCategory | 'all'>('all');

  const trackOrder = mode === 'cation' ? CATION_REAGENT_ORDER : ANION_REAGENT_ORDER;
  const visibleReagents = [...SHARED_REAGENT_ORDER, ...trackOrder].filter(
    (id) => category === 'all' || REAGENTS[id].category === category
  );

  return (
    <div className="mt-1 shrink-0 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-3 lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-xs lg:text-sm font-semibold text-cyan-200 tracking-wide uppercase">
          {mode === 'cation' ? 'Cation Reagents' : 'Anion Reagents'}
        </h2>
        {saltRevealed ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] lg:text-[11px] text-slate-400">Salt:</span>
            <select
              value={selectedSalt}
              onChange={(e) => selectSalt(e.target.value as typeof selectedSalt)}
              className="text-[10px] lg:text-[11px] bg-zinc-900 text-slate-100 border border-white/10 rounded px-2 py-1.5"
            >
              {SALT_ORDER.map((id) => (
                <option key={id} value={id}>
                  {SALTS[id].name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-[10px] lg:text-[11px] text-amber-300/80 italic">
            Sample identity hidden — analyse to find out
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <button
          onClick={() => setCategory('all')}
          className={`text-[10px] lg:text-[11px] px-2.5 py-1 rounded-full border ${
            category === 'all'
              ? 'bg-cyan-500/25 text-cyan-100 border-cyan-400/40'
              : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {REAGENT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`text-[10px] lg:text-[11px] px-2.5 py-1 rounded-full border ${
              category === c.id
                ? 'bg-cyan-500/25 text-cyan-100 border-cyan-400/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {visibleReagents.map((id, idx) => {
          const r = REAGENTS[id];
          const selected = selectedReagent === id;
          return (
            <motion.button
              key={id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.015 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectReagent(selected ? null : id)}
              className="relative shrink-0 snap-start w-[72px] h-[88px] lg:w-20 lg:h-24 rounded-lg border transition-colors flex flex-col items-center justify-end pb-2"
              style={{
                background: selected
                  ? `linear-gradient(180deg, ${r.color} 0%, rgba(30,40,55,0.7) 100%)`
                  : 'rgba(20,28,40,0.7)',
                borderColor: selected ? r.glow : 'rgba(255,255,255,0.1)',
                boxShadow: selected ? `0 0 12px ${r.glow}` : 'none',
              }}
              title={r.description}
            >
              <div
                className="absolute top-2 left-2 right-2 h-11 lg:h-12 rounded-md"
                style={{
                  background: `linear-gradient(180deg, ${r.color} 0%, ${r.glow} 100%)`,
                  boxShadow: `inset 0 0 8px ${r.glow}`,
                }}
              />
              <div className="text-[9px] lg:text-[10px] font-medium text-slate-100 text-center leading-tight mt-1 px-1">
                {r.name}
              </div>
              <div className="text-[8px] lg:text-[9px] text-slate-400">{r.formula}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
