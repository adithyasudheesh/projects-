import { motion, AnimatePresence } from 'framer-motion';
import { useLab } from '../context/LabContext';
import { TypewriterText } from './TypewriterText';

export default function Notebook() {
  const { mode, notebook, resetExperiment, openReport } = useLab();
  const latestStep = notebook.length > 0 ? notebook[notebook.length - 1].step : -1;

  return (
    <div className="flex flex-col lg:h-full">
      <div className="px-3.5 lg:px-4 py-2.5 lg:py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xs lg:text-sm font-semibold text-cyan-200 tracking-wide uppercase">
            {mode === 'cation' ? 'Cation Notebook' : 'Anion Notebook'}
          </h2>
          <p className="text-[10px] lg:text-[11px] text-slate-400 mt-0.5">
            {notebook.length} {notebook.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <div className="flex gap-2">
          {notebook.length > 0 && (
            <button
              onClick={openReport}
              className="text-[10px] lg:text-[11px] px-2.5 py-1.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30"
            >
              Report
            </button>
          )}
          <button
            onClick={resetExperiment}
            className="text-[10px] lg:text-[11px] px-2.5 py-1.5 rounded-md bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500/30"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="lg:flex-1 max-h-[50vh] lg:max-h-none overflow-y-auto p-2.5 lg:p-3 space-y-2">
        <AnimatePresence initial={false}>
          {notebook.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] lg:text-xs text-slate-500 italic p-2 leading-relaxed"
            >
              Observations will be recorded here as you run tests.
            </motion.div>
          ) : (
            notebook
              .slice()
              .reverse()
              .map((entry) => (
                <motion.div
                  key={entry.step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className={`rounded-lg border p-2.5 lg:p-3 ${
                    entry.matched
                      ? 'bg-emerald-500/[0.06] border-emerald-400/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-[10px] lg:text-[11px] font-mono text-cyan-300 shrink-0">
                      Step {entry.step}
                    </span>
                    <span className="text-[9px] lg:text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 truncate">
                      {entry.testLabel}
                    </span>
                  </div>
                  <div className="text-[11px] lg:text-xs text-slate-200 font-medium">
                    {entry.reagent}
                  </div>
                  <div className="text-[10px] lg:text-[11px] text-slate-300 mt-1 min-h-[2.2em] leading-relaxed">
                    {entry.step === latestStep ? (
                      <TypewriterText text={entry.observation} />
                    ) : (
                      entry.observation
                    )}
                  </div>
                  <div className="text-[10px] lg:text-[11px] text-cyan-300/80 italic mt-1.5 border-l-2 border-cyan-400/30 pl-2">
                    {entry.inference}
                  </div>
                  {(entry.ionicEquation || entry.balancedEquation) && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                      {entry.ionicEquation && (
                        <div className="text-[9px] lg:text-[10px] font-mono text-amber-200/90 break-all">
                          {entry.ionicEquation}
                        </div>
                      )}
                      {entry.balancedEquation && (
                        <div className="text-[9px] lg:text-[10px] font-mono text-slate-400 break-all">
                          {entry.balancedEquation}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
