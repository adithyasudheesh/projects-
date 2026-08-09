import type { NotebookEntry, Salt } from '../types/chemistry';

export interface LabReport {
  salt: Salt;
  preliminary: NotebookEntry[];
  dryTests: NotebookEntry[];
  wetTests: NotebookEntry[];
  matched: NotebookEntry[];
  equations: { ionic: string; balanced: string; label: string }[];
}

export function buildLabReport(salt: Salt, notebook: NotebookEntry[]): LabReport {
  const preliminary = notebook.filter((e) => e.testKind === 'preliminary');
  const dryTests = notebook.filter((e) => e.testKind === 'dryHeat' || e.testKind === 'flame' || e.testKind === 'borax');
  const wetTests = notebook.filter((e) => e.testKind === 'cation' || e.testKind === 'anion');
  const matched = notebook.filter((e) => e.matched);

  const seen = new Set<string>();
  const equations: { ionic: string; balanced: string; label: string }[] = [];
  for (const entry of matched) {
    if (entry.ionicEquation && entry.balancedEquation && !seen.has(entry.testLabel)) {
      seen.add(entry.testLabel);
      equations.push({ ionic: entry.ionicEquation, balanced: entry.balancedEquation, label: entry.testLabel });
    }
  }

  return { salt, preliminary, dryTests, wetTests, matched, equations };
}
