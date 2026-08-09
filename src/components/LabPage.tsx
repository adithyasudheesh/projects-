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
import { FlaskConical } from 'lucide-react';

/** The ordinary lab: pick any known salt and analyse it freely. */
export default function LabPage() {
  const { goToChallenge, challengeStats } = useLab();

  return (
    <div className="min-h-dvh lg:h-dvh w-full flex flex-col bg-black text-slate-100 overflow-x-hidden lg:overflow-hidden">
      <header className="px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 border-b border-white/10 bg-black/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br from-cyan-500/30 to-emerald-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 lg:w-[18px] lg:h-[18px] text-cyan-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm lg:text-base font-semibold tracking-tight truncate">
              Virtual Chemistry Laboratory
            </h1>
            <p className="text-[10px] lg:text-xs text-slate-400 leading-tight truncate">
              Interactive salt analysis simulation
            </p>
          </div>
        </div>
        <ModeSwitcher />
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-[10px] lg:text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Lab online
            </span>
            <span className="text-slate-600">|</span>
            <span>Drag to move · Click to pour · Right-click to rotate</span>
          </div>
          <button
            onClick={goToChallenge}
            className="flex items-center gap-1.5 text-[11px] lg:text-xs px-3 py-1.5 lg:py-2 rounded-md bg-amber-500/15 text-amber-200 border border-amber-400/30 hover:bg-amber-500/25"
          >
            <span aria-hidden="true">🏆</span>
            <span className="hidden sm:inline">Challenge</span>
            {challengeStats.rounds > 0 && (
              <span className="text-[9px] font-mono opacity-70">
                {challengeStats.solved}/{challengeStats.rounds}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row lg:flex-1 lg:min-h-0">
        <aside className="w-full lg:w-52 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/50 backdrop-blur-md flex flex-col lg:overflow-y-auto">
          <EquipmentShelf />
        </aside>

        <main className="w-full lg:flex-[3] flex flex-col min-w-0 p-3 lg:p-4 gap-3 lg:overflow-y-auto">
          <div className="relative w-full min-h-[46vh] sm:min-h-[50vh] lg:min-h-[320px] lg:flex-1">
            <LabBench />
            <ReactionAnimation />
          </div>
          <BenchToolbar />
          <GroupAnalysisPanel />
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
