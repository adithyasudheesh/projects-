import { motion, AnimatePresence } from 'framer-motion';
import { useLab } from '../context/LabContext';
import { SALTS } from '../data/salts';
import { FlameTestView } from './FlameTestView';
import { BoraxBeadView } from './BoraxBeadView';
import { DryHeatTestView } from './DryHeatTestView';
import { PaperBallTestView } from './PaperBallTestView';

export default function ObservationPanel() {
  const { mode, lastReaction, currentExperiment, reactionHistory, saltRevealed, selectedSalt } = useLab();

  // History entries have the salt's name baked into the string at the
  // moment they're recorded (e.g. "Ammonium Acetate + Conc. HCl: ...").
  // While a challenge round is unsolved, redact every occurrence of it
  // rather than hiding history altogether — the reagent/observation
  // half of each entry is still exactly the information the person is
  // meant to be working from.
  const saltName = SALTS[selectedSalt].name;
  const displayHistory = saltRevealed
    ? reactionHistory
    : reactionHistory.map((h) => h.split(saltName).join('Unknown Sample'));

  return (
    <div className="flex flex-col border-b border-white/10">
      <div className="px-3.5 lg:px-4 py-2.5 lg:py-3 border-b border-white/10">
        <h2 className="text-xs lg:text-sm font-semibold text-cyan-200 tracking-wide uppercase">
          Observation
        </h2>
        <p className="text-[10px] lg:text-[11px] text-slate-400 mt-0.5">
          {saltRevealed ? currentExperiment : 'Unknown Sample Analysis'} · {mode === 'cation' ? 'Cation' : 'Anion'} track
        </p>
      </div>
      <div className="p-3.5 lg:p-4 min-h-[110px]">
        <AnimatePresence mode="wait">
          {lastReaction ? (
            <motion.div
              key={lastReaction.testLabel + lastReaction.observation}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[10px] lg:text-[11px] px-2 py-0.5 rounded-full border ${
                    lastReaction.match
                      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {lastReaction.testLabel}
                </span>
                {lastReaction.reagentLabel && (
                  <span className="text-[10px] lg:text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    {lastReaction.reagentLabel}
                  </span>
                )}
              </div>

              {lastReaction.visual && lastReaction.visual.kind === 'flame' && (
                <FlameTestView
                  colorHex={lastReaction.visual.colorHex}
                  colorName={lastReaction.visual.colorName}
                  applicable={lastReaction.visual.applicable}
                />
              )}
              {lastReaction.visual && lastReaction.visual.kind === 'borax' && (
                <BoraxBeadView
                  hotHex={lastReaction.visual.hotHex}
                  hotName={lastReaction.visual.hotName}
                  coldHex={lastReaction.visual.coldHex}
                  coldName={lastReaction.visual.coldName}
                />
              )}
              {lastReaction.visual && lastReaction.visual.kind === 'dryHeat' && (
                <DryHeatTestView observation={lastReaction.visual.observation} />
              )}
              {lastReaction.visual && lastReaction.visual.kind === 'paperBall' && (
                <PaperBallTestView positive={lastReaction.visual.positive} />
              )}

              <div className="text-xs lg:text-sm text-slate-100 leading-relaxed">
                {lastReaction.observation}
              </div>
              <div className="text-[11px] lg:text-xs text-cyan-300/90 italic border-l-2 border-cyan-400/40 pl-2.5">
                {lastReaction.inference}
              </div>
              {(lastReaction.ionicEquation || lastReaction.balancedEquation) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-lg bg-black/25 border border-white/10 p-2.5 space-y-1"
                >
                  {lastReaction.ionicEquation && (
                    <div className="text-[10px] lg:text-[11px] font-mono text-amber-200 break-all">
                      <span className="text-slate-500">Net ionic: </span>
                      {lastReaction.ionicEquation}
                    </div>
                  )}
                  {lastReaction.balancedEquation && (
                    <div className="text-[10px] lg:text-[11px] font-mono text-slate-300 break-all">
                      <span className="text-slate-500">Balanced: </span>
                      {lastReaction.balancedEquation}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] lg:text-xs text-slate-500 italic leading-relaxed"
            >
              Run a preliminary exam, a dry/flame/borax test, or pour a reagent to begin.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {displayHistory.length > 0 && (
        <div className="px-3.5 lg:px-4 pb-2.5 max-h-24 overflow-y-auto">
          <div className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-wide mb-1">
            History
          </div>
          {displayHistory.slice(0, 6).map((h, i) => (
            <div key={i} className="text-[10px] lg:text-[11px] text-slate-400 leading-tight truncate">
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
