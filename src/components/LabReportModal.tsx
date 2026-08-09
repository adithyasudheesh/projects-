import { AnimatePresence, motion } from 'framer-motion';
import { useLab } from '../context/LabContext';
import { SALTS } from '../data/salts';
import { buildLabReport, type LabReport } from '../engine/reportGenerator';
import type { NotebookEntry } from '../types/chemistry';

export default function LabReportModal() {
  const { reportOpen, closeReport, selectedSalt, cation, anion, saltRevealed } = useLab();
  const salt = SALTS[selectedSalt];
  const cationReport = buildLabReport(salt, cation.notebook);
  const anionReport = buildLabReport(salt, anion.notebook);

  return (
    <AnimatePresence>
      {reportOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeReport}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-cyan-400/20 bg-black shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/95 backdrop-blur">
              <div>
                <h2 className="text-sm font-semibold text-cyan-200">Laboratory Report</h2>
                <p className="text-[10px] text-slate-400">Independent cation and anion analysis</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-[11px] px-2.5 py-1.5 rounded bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20"
                >
                  Print
                </button>
                <button
                  onClick={closeReport}
                  className="text-[11px] px-2.5 py-1.5 rounded bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500/30"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 space-y-5 text-sm">
              <section className="rounded-xl bg-emerald-500/10 border border-emerald-400/25 p-3">
                <div className="text-[10px] uppercase tracking-wide text-emerald-300 mb-1">
                  Unknown Sample
                </div>
                {saltRevealed ? (
                  <>
                    <div className="text-base font-semibold text-emerald-100">
                      {salt.name} <span className="font-mono text-emerald-300/80">({salt.formula})</span>
                    </div>
                    <div className="text-[11px] text-emerald-200/70 mt-1">{salt.description}</div>
                  </>
                ) : (
                  <div className="text-[11px] text-emerald-200/70 italic">
                    Identity hidden — this is an active challenge round. Solve or reveal it to see the report
                    fully.
                  </div>
                )}
              </section>

              <TrackReport
                title="Cation Analysis"
                accent="cyan"
                report={cationReport}
                sections={[
                  { title: 'Preliminary Examination', entries: cationReport.preliminary, emptyText: 'Not yet performed.' },
                  {
                    title: 'Dry Tests (Heating / Flame / Borax Bead)',
                    entries: cationReport.dryTests,
                    emptyText: 'Not yet performed.',
                  },
                  { title: 'Confirmatory Tests', entries: cationReport.wetTests, emptyText: 'No reagents tested yet.' },
                ]}
              />

              <TrackReport
                title="Anion Analysis"
                accent="amber"
                report={anionReport}
                sections={[
                  { title: 'Confirmatory Tests', entries: anionReport.wetTests, emptyText: 'No reagents tested yet.' },
                ]}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TrackReport({
  title,
  accent,
  report,
  sections,
}: {
  title: string;
  accent: 'cyan' | 'amber';
  report: LabReport;
  sections: { title: string; entries: NotebookEntry[]; emptyText: string }[];
}) {
  const headingColor = accent === 'cyan' ? 'text-cyan-300' : 'text-amber-300';
  const borderColor = accent === 'cyan' ? 'border-cyan-400/20' : 'border-amber-400/20';

  return (
    <section className={`rounded-xl border ${borderColor} bg-white/[0.02] p-3 space-y-4`}>
      <h3 className={`text-xs font-semibold uppercase tracking-wide ${headingColor}`}>{title}</h3>

      {sections.map((s) => (
        <ReportSection key={s.title} title={s.title} entries={s.entries} emptyText={s.emptyText} />
      ))}

      <div>
        <h4 className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Equations Used</h4>
        {report.equations.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">
            No confirmatory equations recorded yet on this track.
          </p>
        ) : (
          <div className="space-y-2">
            {report.equations.map((eq, i) => (
              <div key={i} className="rounded-lg bg-black/30 border border-white/10 p-2">
                <div className="text-[10px] text-slate-500 mb-1">{eq.label}</div>
                <div className="text-[10px] font-mono text-amber-200 break-all">{eq.ionic}</div>
                <div className="text-[10px] font-mono text-slate-400 break-all mt-0.5">{eq.balanced}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Confirmed on this track</h4>
        {report.matched.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">None recorded yet.</p>
        ) : (
          <ul className="list-disc list-inside space-y-0.5">
            {report.matched.map((m) => (
              <li key={m.step} className="text-[11px] text-slate-300">
                {m.testLabel}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ReportSection({
  title,
  entries,
  emptyText,
}: {
  title: string;
  entries: { step: number; reagent: string; observation: string; inference: string; matched: boolean }[];
  emptyText: string;
}) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">{title}</h4>
      {entries.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.step}
              className={`rounded-lg p-2 border ${
                e.matched ? 'bg-emerald-500/[0.06] border-emerald-400/20' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="text-[10px] text-slate-400 mb-0.5">{e.reagent}</div>
              <div className="text-[11px] text-slate-200">{e.observation}</div>
              <div className="text-[10px] text-cyan-300/80 italic mt-0.5">{e.inference}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
