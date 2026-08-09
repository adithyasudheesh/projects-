import { useLab } from '../context/LabContext';

/**
 * The entry point into the two independent analysis tracks. Switching
 * tabs swaps the entire dashboard — bench, reagents, notebook,
 * observation — for the other track's own state; nothing here is
 * shared except the selected unknown salt shown in the header.
 */
export default function ModeSwitcher() {
  const { mode, setMode, cation, anion } = useLab();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 p-1 lg:p-1.5">
      <button
        onClick={() => setMode('cation')}
        className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-md text-[11px] lg:text-xs font-medium transition-colors ${
          mode === 'cation'
            ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-400/40'
            : 'text-slate-400 border border-transparent hover:bg-white/5'
        }`}
      >
        Cation Analysis
        {cation.notebook.length > 0 && (
          <span className="text-[9px] lg:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200">
            {cation.notebook.length}
          </span>
        )}
      </button>
      <button
        onClick={() => setMode('anion')}
        className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-md text-[11px] lg:text-xs font-medium transition-colors ${
          mode === 'anion'
            ? 'bg-amber-500/25 text-amber-100 border border-amber-400/40'
            : 'text-slate-400 border border-transparent hover:bg-white/5'
        }`}
      >
        Anion Analysis
        {anion.notebook.length > 0 && (
          <span className="text-[9px] lg:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
            {anion.notebook.length}
          </span>
        )}
      </button>
    </div>
  );
}
