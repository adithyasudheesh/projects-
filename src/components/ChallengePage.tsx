import { useLab } from '../context/LabContext';
import EquipmentShelf from './EquipmentShelf';
import LabBench from './LabBench';
import BenchToolbar from './BenchToolbar';
import ReagentShelf from './ReagentShelf';
import Notebook from './Notebook';
import ObservationPanel from './ObservationPanel';
import ReactionAnimation from './ReactionAnimation';
import ModeSwitcher from './ModeSwitcher';
import GroupAnalysisPanel from './GroupAnalysisPanel';
import ChallengeGuessPanel from './ChallengeGuessPanel';

/** A distinct page from the ordinary lab: a random, unidentified salt
 *  is loaded and its name is hidden everywhere in the UI (see the
 *  `saltRevealed` gate consumed by ObservationPanel, ReagentShelf, and
 *  LabReportModal) until the person solves it or gives up. Reuses the
 *  same bench/shelves/notebook as the lab — the challenge is about
 *  what you conclude from the same tools, not a different toolset. */
export default function ChallengePage() {
  const { goToLab, challengeStats } = useLab();

  return (
    <div className="min-h-dvh lg:h-dvh w-full flex flex-col bg-black text-slate-100 overflow-x-hidden lg:overflow-hidden">
      <header className="px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 border-b border-amber-400/20 bg-black/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br from-amber-500/30 to-rose-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-sm">
            🎯
          </div>
          <div className="min-w-0">
            <h1 className="text-sm lg:text-base font-semibold tracking-tight truncate text-amber-100">
              Salt Identification Challenge
            </h1>
            <p className="text-[10px] lg:text-xs text-slate-400 leading-tight truncate">
              Unknown sample · analyse it, then guess
            </p>
          </div>
        </div>
        <ModeSwitcher />
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] lg:text-[11px] text-slate-400 font-mono">
            Solved {challengeStats.solved}/{challengeStats.rounds}
          </span>
          <button
            onClick={goToLab}
            className="text-[11px] lg:text-xs px-3 py-1.5 lg:py-2 rounded-md bg-white/5 text-slate-200 border border-white/15 hover:bg-white/10"
          >
            Exit to Lab
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row lg:flex-1 lg:min-h-0">
        <aside className="w-full lg:w-52 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/50 backdrop-blur-md flex flex-col lg:overflow-y-auto">
          <EquipmentShelf />
        </aside>

        <main className="w-full lg:flex-[3] flex flex-col min-w-0 p-3 lg:p-4 gap-3 lg:overflow-y-auto">
          <div className="relative w-full min-h-[42vh] sm:min-h-[46vh] lg:min-h-[300px] lg:flex-1">
            <LabBench />
            <ReactionAnimation />
          </div>
          <BenchToolbar />
          <GroupAnalysisPanel />
          <ChallengeGuessPanel />
          <ReagentShelf />
        </main>

        <aside className="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/50 backdrop-blur-md flex flex-col lg:overflow-y-auto">
          <ObservationPanel />
          <div className="lg:flex-1 lg:min-h-0">
            <Notebook />
          </div>
        </aside>
      </div>
    </div>
  );
}
