import { useLab } from '../context/LabContext';
import { SALTS } from '../data/salts';
import { CATION_GROUPS } from '../data/groups';
import { METALS } from '../data/ions';

/** Guided, sequential Group I–VI cation separation (see data/groups.ts
 *  for the underlying chemistry). Only ever shown on the cation track
 *  — group separation has no anion equivalent. Each group must be
 *  tested (or ruled out) before the next one unlocks; a positive
 *  result stops the sequence there, since that's genuinely how the
 *  procedure works — once a cation precipitates out in its group, the
 *  remaining groups have nothing left to test.
 *
 *  Ammonium deliberately isn't special-cased here even though it's
 *  outside the six-group scheme (see data/groups.ts) — branching the
 *  UI on "is this ammonium" before any testing happens would leak the
 *  answer through the component's structure alone during a hidden
 *  Challenge round. Instead it just runs negative on every group like
 *  any other non-member, and only the generic "nothing matched"
 *  message after Group VI mentions ammonium as a possibility — earned
 *  by actually testing all six, not given away up front. */
export default function GroupAnalysisPanel() {
  const { mode, selectedSalt, notebook, groupIndex, performGroupTest, advanceGroup, saltRevealed } = useLab();

  if (mode !== 'cation') return null;

  const salt = SALTS[selectedSalt];
  const group = CATION_GROUPS[groupIndex];
  const testLabel = `${group.label} Separation`;
  const pastEntry = [...notebook].reverse().find((e) => e.testLabel === testLabel);
  const tested = !!pastEntry;
  const positive = pastEntry?.matched ?? false;
  const isLastGroup = groupIndex === CATION_GROUPS.length - 1;
  const isSoluble = group.id === 'VI';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 lg:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs lg:text-sm font-semibold text-cyan-200 uppercase tracking-wide">
          Group Analysis
        </h3>
        <span className="text-[10px] lg:text-[11px] text-slate-500">
          {saltRevealed ? METALS[salt.metal].name : 'Unidentified cation'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATION_GROUPS.map((g, i) => {
          const state = i < groupIndex ? 'done' : i === groupIndex ? 'current' : 'upcoming';
          return (
            <span
              key={g.id}
              className={`text-[10px] lg:text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap ${
                state === 'done'
                  ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
                  : state === 'current'
                  ? 'bg-cyan-500/20 text-cyan-100 border-cyan-400/40'
                  : 'bg-white/5 text-slate-500 border-white/10'
              }`}
            >
              {g.label}
            </span>
          );
        })}
      </div>

      <div className="rounded-lg bg-black/30 border border-white/10 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs lg:text-sm font-medium text-slate-100">{group.label}</span>
          <span className="text-[10px] lg:text-[11px] font-mono text-slate-400">{group.reagentLabel}</span>
        </div>
        <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed">{group.medium}</p>

        {!tested && (
          <button
            onClick={() => performGroupTest(group.id)}
            className="w-full mt-1 text-[11px] lg:text-xs px-3 py-2 rounded-md bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/25"
          >
            {isSoluble ? 'Check Group VI (soluble group)' : `Test with ${group.reagentLabel}`}
          </button>
        )}

        {tested && (
          <div className="space-y-2">
            <p className={`text-[11px] lg:text-xs leading-relaxed ${positive ? 'text-emerald-300' : 'text-slate-300'}`}>
              {positive ? group.positiveObservation : group.negativeObservation}
            </p>
            {positive ? (
              <p className="text-[10px] lg:text-[11px] text-cyan-300/90 italic leading-relaxed">
                Group identified — use the confirmatory reagents below to pin down exactly which cation
                within {group.label}.
              </p>
            ) : !isLastGroup ? (
              <button
                onClick={advanceGroup}
                className="w-full text-[11px] lg:text-xs px-3 py-2 rounded-md bg-white/5 text-slate-200 border border-white/15 hover:bg-white/10"
              >
                Proceed to {CATION_GROUPS[groupIndex + 1].label}
              </button>
            ) : (
              <p className="text-[10px] lg:text-[11px] text-amber-300/90 italic leading-relaxed">
                No match in any of the six groups. Ammonium (NH₄⁺) sits outside this scheme entirely and
                is tested separately — try the Preliminary exam, or pour NaOH and heat on the bench.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
