import { useLab } from '../context/LabContext';

/**
 * The hint line and quick-test buttons that sit below the bench.
 * Deliberately NOT inside LabBench's absolutely-positioned canvas —
 * that canvas fills a fixed-height box shared with ReactionAnimation's
 * overlay, so anything else sharing that box gets squeezed to fit
 * within it rather than getting the space it actually needs. This
 * lives in normal document flow instead, so it always gets its own
 * room and can never overlap or clip the bench above it.
 */
export default function BenchToolbar() {
  const { mode, performPreliminaryExam, performDryHeatTest, performFlameTest, performBoraxBeadTest, openReport } =
    useLab();

  return (
    <div className="mt-2.5 space-y-2">
      <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed">
        {mode === 'cation'
          ? 'Drag to move · Click to pour · Right-click to rotate · Drag the spirit lamp under a vessel to heat it'
          : 'Drag to move · Click to pour · Right-click to rotate · Drag the spirit lamp to heat, then the paper ball to the mouth of the tube'}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {mode === 'cation' && (
          <>
            <span className="text-[10px] lg:text-[11px] text-slate-500 uppercase tracking-wide shrink-0">
              Analysis:
            </span>
            <button
              onClick={performPreliminaryExam}
              className="px-2.5 py-1.5 text-[11px] lg:text-xs rounded-md bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/25"
            >
              Preliminary exam
            </button>
            <button
              onClick={performDryHeatTest}
              className="px-2.5 py-1.5 text-[11px] lg:text-xs rounded-md bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/25"
            >
              Dry heating test
            </button>
            <button
              onClick={performFlameTest}
              className="px-2.5 py-1.5 text-[11px] lg:text-xs rounded-md bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/25"
            >
              Flame test
            </button>
            <button
              onClick={performBoraxBeadTest}
              className="px-2.5 py-1.5 text-[11px] lg:text-xs rounded-md bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/25"
            >
              Borax bead test
            </button>
          </>
        )}
        <button
          onClick={openReport}
          className="px-2.5 py-1.5 text-[11px] lg:text-xs rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30"
        >
          Lab report
        </button>
      </div>
    </div>
  );
}
