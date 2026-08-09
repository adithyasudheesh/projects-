import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  AnalysisMode,
  AnionId,
  BenchItem,
  BenchSize,
  CationGroupId,
  ChallengeGuess,
  EquipmentId,
  LabState,
  MetalId,
  NotebookEntry,
  PourStream,
  ReactionResult,
  ReagentId,
  SaltId,
  TrackState,
} from '../types/chemistry';
import { REAGENTS } from '../data/reagents';
import { SALTS, SALT_ORDER } from '../data/salts';
import { CATION_GROUPS } from '../data/groups';
import { EQUIPMENT_FOOTPRINT, EQUIPMENT_ORDER } from '../data/equipment';
import { evaluateReaction } from '../engine/reactionEngine';
import {
  performPreliminaryExam as runPreliminaryExam,
  performDryHeatTest as runDryHeatTest,
  performFlameTest as runFlameTest,
  performBoraxBeadTest as runBoraxBeadTest,
} from '../engine/dryTests';
import { applyBenchPhysics, withholdFumes } from '../engine/physics';

/**
 * Cation and anion analysis are two independent experiments sharing
 * only the selected unknown salt. Each track (see TrackState) has its
 * own bench, reagent selection, notebook, and last observation; no
 * action ever reads or writes across tracks. Context consumers keep
 * reading `benchItems` / `notebook` / `lastReaction` / etc. exactly as
 * before — the provider transparently projects whichever track is
 * currently active (`state.mode`) onto those top-level names, so only
 * this file and the handful of components that need to be
 * mode-aware (the shelves, the mode switcher, the report) had to
 * change.
 */
interface LabContextValue extends LabState, TrackState {
  setMode: (mode: AnalysisMode) => void;
  selectReagent: (id: ReagentId | null) => void;
  selectSalt: (id: SaltId) => void;
  addEquipmentToBench: (id: EquipmentId) => void;
  moveBenchItem: (uid: string, x: number, y: number) => void;
  rotateBenchItem: (uid: string, rotation: number) => void;
  removeBenchItem: (uid: string) => void;
  pourReagentInto: (uid: string) => void;
  resetExperiment: () => void;
  setBenchSize: (width: number, height: number) => void;
  performPreliminaryExam: () => void;
  performDryHeatTest: () => void;
  performFlameTest: () => void;
  performBoraxBeadTest: () => void;
  performGroupTest: (groupId: CationGroupId) => void;
  advanceGroup: () => void;
  evaporateToCrystals: (uid: string) => void;
  openReport: () => void;
  closeReport: () => void;
  /** True unless an unsolved, unrevealed challenge round is active —
   *  every component that displays the sample's identity checks this
   *  instead of assuming it's always safe to show. */
  saltRevealed: boolean;
  goToChallenge: () => void;
  goToLab: () => void;
  submitChallengeGuess: (metal: MetalId, anion: AnionId) => void;
  revealChallengeAnswer: () => void;
}

const LabContext = createContext<LabContextValue | null>(null);

let uidCounter = 0;
const nextUid = () => `item-${++uidCounter}`;

const VESSEL_IDS: EquipmentId[] = ['testTube', 'beaker', 'conicalFlask'];

/** Mobile-first fallback bench size, used until the actual bench
 *  element has been measured on mount (see LabBench's ResizeObserver).
 *  Chosen to safely fit the smallest supported viewport (320px). */
const DEFAULT_BENCH_SIZE: BenchSize = { width: 300, height: 380 };

const BENCH_PADDING = 16;

export function clampToBench(
  x: number,
  y: number,
  footprint: { width: number; height: number },
  bench: BenchSize
) {
  const maxX = Math.max(BENCH_PADDING / 2, bench.width - footprint.width - BENCH_PADDING / 2);
  const maxY = Math.max(BENCH_PADDING / 2, bench.height - footprint.height - BENCH_PADDING / 2);
  return {
    x: Math.min(Math.max(BENCH_PADDING / 2, x), maxX),
    y: Math.min(Math.max(BENCH_PADDING / 2, y), maxY),
  };
}

function freshBenchItem(id: EquipmentId, x: number, y: number): BenchItem {
  return {
    uid: nextUid(),
    equipment: id,
    x,
    y,
    rotation: 0,
    liquidLevel: 0,
    liquidColor: 'rgba(180, 220, 255, 0.35)',
    liquidGlow: 'rgba(180, 220, 255, 0.5)',
    effects: [],
    heated: false,
    saltLoaded: VESSEL_IDS.includes(id),
    mixCount: 0,
    effectsStartedAt: null,
    crystallising: false,
  };
}

/** Lays equipment out left-to-right in a single row, clamped so every
 *  item stays visible and reachable regardless of bench width. */
function buildInitialBench(bench: BenchSize = DEFAULT_BENCH_SIZE): BenchItem[] {
  let cursorX = BENCH_PADDING;
  const y = 20;
  return EQUIPMENT_ORDER.map((id) => {
    const footprint = EQUIPMENT_FOOTPRINT[id];
    const { x, y: clampedY } = clampToBench(cursorX, y, footprint, bench);
    cursorX += footprint.width + 14;
    return freshBenchItem(id, x, clampedY);
  });
}

/** A fresh, empty track — its own bench (auto-populated with the
 *  standard vessels, exactly like the single bench used to be), no
 *  reagent selected, no notebook entries. Cation and anion each start
 *  with one of these, built independently so their bench items get
 *  distinct uids and neither track's apparatus is the other's. */
function freshTrack(bench: BenchSize): TrackState {
  return {
    benchItems: buildInitialBench(bench),
    selectedReagent: null,
    notebook: [],
    reactionHistory: [],
    activeEffect: null,
    lastReaction: null,
    pourStream: null,
  };
}

/** Everything that needs to reset when the sample being analysed
 *  changes — both tracks fresh (a new sample means the old bench state
 *  and findings don't carry over), plus the salt identity itself.
 *  Shared by selectSalt and the challenge's "new round" action so
 *  there's exactly one place that defines what "a fresh sample" means. */
function freshForSalt(id: SaltId, bench: BenchSize) {
  const historyNote = [`Selected ${SALTS[id].name} for analysis`];
  return {
    selectedSalt: id,
    currentExperiment: `${SALTS[id].name} Analysis`,
    cation: { ...freshTrack(bench), reactionHistory: historyNote },
    anion: { ...freshTrack(bench), reactionHistory: historyNote },
    groupIndex: 0,
  };
}

const INITIAL_STATE: LabState = {
  mode: 'cation',
  selectedSalt: 'calciumCarbonate',
  currentExperiment: 'Calcium Carbonate Analysis',
  benchSize: DEFAULT_BENCH_SIZE,
  reportOpen: false,
  cation: freshTrack(DEFAULT_BENCH_SIZE),
  anion: freshTrack(DEFAULT_BENCH_SIZE),
  page: 'lab',
  challengeActive: false,
  challengeSolved: false,
  challengeRevealed: false,
  challengeGuesses: [],
  challengeStats: { rounds: 0, solved: 0 },
  groupIndex: 0,
};

function makeEntry(notebookLength: number, reagentLabel: string, result: ReactionResult): NotebookEntry {
  return {
    step: notebookLength + 1,
    reagent: reagentLabel,
    observation: result.observation,
    inference: result.inference,
    timestamp: Date.now(),
    testKind: result.testKind,
    testLabel: result.testLabel,
    matched: result.match,
    ionicEquation: result.ionicEquation,
    balancedEquation: result.balancedEquation,
  };
}

/** Replaces the named track with the result of `updater(currentTrack)`,
 *  leaving the rest of the state (the other track, the shared salt
 *  selection, etc.) untouched. Every track-scoped action goes through
 *  this so cation and anion state can never leak into each other. */
function withTrack(
  s: LabState,
  mode: AnalysisMode,
  updater: (track: TrackState) => Partial<TrackState>
): LabState {
  return { ...s, [mode]: { ...s[mode], ...updater(s[mode]) } };
}

/** Runs the position-based physics pass (heating, retroactive
 *  heat-triggered reactions, and the paper-ball reaction — see
 *  engine/physics.ts) against a candidate bench-items array for the
 *  given track and folds the result into a full state update — used
 *  by every action that can change where things sit on that track's
 *  bench (moving, adding, or removing an item), so heating and the
 *  paper ball stay purely physical rather than needing their own
 *  buttons. Cation and anion benches are checked entirely separately;
 *  a spirit lamp on one track never affects the other. */
function withPhysics(s: LabState, mode: AnalysisMode, benchItems: BenchItem[]): LabState {
  const salt = SALTS[s.selectedSalt];
  const { benchItems: nextItems, paperBallReaction, heatReactions } = applyBenchPhysics(benchItems, salt);

  return withTrack(s, mode, (track) => {
    let notebook = track.notebook;
    let reactionHistory = track.reactionHistory;
    let lastReaction = track.lastReaction;

    for (const heatReaction of heatReactions) {
      notebook = [
        ...notebook,
        makeEntry(notebook.length, `${heatReaction.reagentName} (heated)`, heatReaction.result),
      ];
      reactionHistory = [
        `${salt.name} + ${heatReaction.reagentName}, heated: ${heatReaction.result.observation}`,
        ...reactionHistory,
      ].slice(0, 30);
      lastReaction = heatReaction.result;
    }

    if (paperBallReaction) {
      notebook = [
        ...notebook,
        makeEntry(notebook.length, 'Paper ball (FeSO₄) at the mouth of the heated tube', paperBallReaction.result),
      ];
      reactionHistory = [`${salt.name}: paper ball (nitrate) test recorded`, ...reactionHistory].slice(0, 30);
      lastReaction = paperBallReaction.result;
    }

    if (notebook === track.notebook) {
      return { benchItems: nextItems };
    }
    return { benchItems: nextItems, notebook, reactionHistory, lastReaction };
  });
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState>(INITIAL_STATE);
  const pourTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMode = useCallback((mode: AnalysisMode) => {
    setState((s) => (s.mode === mode ? s : { ...s, mode }));
  }, []);

  const selectReagent = useCallback((id: ReagentId | null) => {
    setState((s) => withTrack(s, s.mode, () => ({ selectedReagent: id })));
  }, []);

  const selectSalt = useCallback((id: SaltId) => {
    setState((s) => ({
      ...s,
      ...freshForSalt(id, s.benchSize),
      reportOpen: false,
    }));
  }, []);

  const addEquipmentToBench = useCallback((id: EquipmentId) => {
    setState((s) => {
      const track = s[s.mode];
      const footprint = EQUIPMENT_FOOTPRINT[id];
      const cellW = 96;
      const cellH = 120;
      const cols = Math.max(1, Math.floor((s.benchSize.width - BENCH_PADDING) / cellW));
      const index = track.benchItems.length;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const { x, y } = clampToBench(
        BENCH_PADDING + col * cellW,
        BENCH_PADDING + row * cellH,
        footprint,
        s.benchSize
      );
      const newItem = freshBenchItem(id, x, y);
      return withPhysics(s, s.mode, [...track.benchItems, newItem]);
    });
  }, []);

  const moveBenchItem = useCallback((uid: string, x: number, y: number) => {
    setState((s) => {
      const track = s[s.mode];
      const target = track.benchItems.find((it) => it.uid === uid);
      if (!target) return s;
      const footprint = EQUIPMENT_FOOTPRINT[target.equipment];
      const clamped = clampToBench(x, y, footprint, s.benchSize);
      const movedItems = track.benchItems.map((it) =>
        it.uid === uid ? { ...it, x: clamped.x, y: clamped.y } : it
      );
      return withPhysics(s, s.mode, movedItems);
    });
  }, []);

  /** Called by LabBench whenever the measured bench drop-zone size
   *  changes (mount, window resize, orientation change). Bench size is
   *  a shared physical constraint (it's the same screen for both
   *  tracks), so both tracks' items are reflowed — each keeps items
   *  that already fit untouched (same object reference) so unaffected
   *  glassware doesn't re-render. */
  const setBenchSize = useCallback((width: number, height: number) => {
    setState((s) => {
      if (s.benchSize.width === width && s.benchSize.height === height) return s;
      const benchSize: BenchSize = { width, height };
      const reflow = (items: BenchItem[]) =>
        items.map((it) => {
          const footprint = EQUIPMENT_FOOTPRINT[it.equipment];
          const clamped = clampToBench(it.x, it.y, footprint, benchSize);
          return clamped.x === it.x && clamped.y === it.y ? it : { ...it, x: clamped.x, y: clamped.y };
        });
      return {
        ...s,
        benchSize,
        cation: { ...s.cation, benchItems: reflow(s.cation.benchItems) },
        anion: { ...s.anion, benchItems: reflow(s.anion.benchItems) },
      };
    });
  }, []);

  const rotateBenchItem = useCallback((uid: string, rotation: number) => {
    setState((s) =>
      withTrack(s, s.mode, (track) => ({
        benchItems: track.benchItems.map((it) => (it.uid === uid ? { ...it, rotation } : it)),
      }))
    );
  }, []);

  const removeBenchItem = useCallback((uid: string) => {
    setState((s) => withPhysics(s, s.mode, s[s.mode].benchItems.filter((it) => it.uid !== uid)));
  }, []);

  const pourReagentInto = useCallback((uid: string) => {
    setState((s) => {
      const mode = s.mode;
      const track = s[mode];
      if (!track.selectedReagent) return s;
      const reagent = REAGENTS[track.selectedReagent];
      const target = track.benchItems.find((it) => it.uid === uid);
      if (!target) return s;

      const isVessel = VESSEL_IDS.includes(target.equipment);
      if (!isVessel) return s;

      const hasLimeWaterOnBench = track.benchItems.some(
        (it) => it.uid !== uid && it.liquidLevel > 0 && it.liquidColor === REAGENTS.limeWater.color
      );

      const salt = SALTS[s.selectedSalt];
      const result = withholdFumes(
        evaluateReaction({
          salt,
          reagentId: track.selectedReagent,
          heated: target.heated,
          hasLimeWaterOnBench,
        })
      );

      const now = Date.now();
      const newLevel = Math.min(0.85, target.liquidLevel + 0.22);
      const newColor = result.resultingColor || reagent.color;
      const newGlow = result.resultingGlow || reagent.glow;

      const updatedItem: BenchItem = {
        ...target,
        liquidLevel: newLevel,
        liquidColor: newColor,
        liquidGlow: newGlow,
        effects: result.effects,
        heated: target.heated,
        mixCount: target.mixCount + 1,
        effectsStartedAt: now,
        crystallising: false,
        lastPouredReagent: track.selectedReagent,
      };

      let benchItems = track.benchItems.map((it) => (it.uid === uid ? updatedItem : it));

      if (result.match && salt.anion === 'carbonate' && hasLimeWaterOnBench) {
        benchItems = benchItems.map((it) =>
          it.uid !== uid && it.liquidLevel > 0 && it.liquidColor === REAGENTS.limeWater.color
            ? {
                ...it,
                liquidColor: 'rgba(255, 250, 230, 0.7)',
                liquidGlow: 'rgba(255, 240, 200, 0.6)',
                effects: [...it.effects, { id: 'milky' as const, intensity: 1 }],
                effectsStartedAt: now,
              }
            : it
        );
      }

      const entry = makeEntry(track.notebook.length, reagent.name, result);

      let notebook = [...track.notebook, entry];
      let history = [
        `${salt.name} + ${reagent.name}: ${result.observation}`,
        ...track.reactionHistory,
      ].slice(0, 30);
      let lastReaction: ReactionResult = result;

      const { benchItems: physicsItems, paperBallReaction, heatReactions } = applyBenchPhysics(benchItems, salt);
      benchItems = physicsItems;

      for (const heatReaction of heatReactions) {
        const heatEntry = makeEntry(notebook.length, `${heatReaction.reagentName} (heated)`, heatReaction.result);
        notebook = [...notebook, heatEntry];
        history = [
          `${salt.name} + ${heatReaction.reagentName}, heated: ${heatReaction.result.observation}`,
          ...history,
        ].slice(0, 30);
        lastReaction = heatReaction.result;
      }

      if (paperBallReaction) {
        const ballEntry = makeEntry(
          notebook.length,
          'Paper ball (FeSO₄) at the mouth of the heated tube',
          paperBallReaction.result
        );
        notebook = [...notebook, ballEntry];
        history = [`${salt.name}: paper ball (nitrate) test recorded`, ...history].slice(0, 30);
        lastReaction = paperBallReaction.result;
      }

      const pourStream: PourStream = {
        uid: target.uid,
        fromX: target.x + 20,
        fromY: -20,
        toX: target.x + 25,
        toY: target.y + 20,
        color: reagent.color,
        glow: reagent.glow,
        startedAt: now,
        seed: Math.random(),
      };

      return withTrack(s, mode, () => ({
        benchItems,
        notebook,
        reactionHistory: history,
        lastReaction,
        activeEffect: { itemId: uid, effects: result.effects },
        pourStream,
      }));
    });

    if (pourTimer.current) clearTimeout(pourTimer.current);
    pourTimer.current = setTimeout(() => {
      setState((s) => withTrack(s, s.mode, () => ({ pourStream: null })));
    }, 1400);
  }, []);

  // Preliminary examination, dry heating, the flame test, and the
  // borax bead test are cation-side confirmatory tests in the
  // classical scheme — they always record to the cation track's
  // notebook regardless of which dashboard is currently open, since
  // the buttons that trigger them only ever appear on the cation
  // dashboard (see LabBench).
  const performPreliminaryExam = useCallback(() => {
    setState((s) => {
      const salt = SALTS[s.selectedSalt];
      const result = runPreliminaryExam(salt);
      return withTrack(s, 'cation', (track) => ({
        lastReaction: result,
        notebook: [...track.notebook, makeEntry(track.notebook.length, 'Visual inspection', result)],
        reactionHistory: [`${salt.name}: preliminary examination recorded`, ...track.reactionHistory].slice(0, 30),
      }));
    });
  }, []);

  const performDryHeatTest = useCallback(() => {
    setState((s) => {
      const salt = SALTS[s.selectedSalt];
      const result = runDryHeatTest(salt);
      return withTrack(s, 'cation', (track) => ({
        lastReaction: result,
        notebook: [...track.notebook, makeEntry(track.notebook.length, 'Direct heat (dry sample)', result)],
        reactionHistory: [`${salt.name}: dry heating test recorded`, ...track.reactionHistory].slice(0, 30),
      }));
    });
  }, []);

  const performFlameTest = useCallback(() => {
    setState((s) => {
      const salt = SALTS[s.selectedSalt];
      const result = runFlameTest(salt);
      return withTrack(s, 'cation', (track) => ({
        lastReaction: result,
        notebook: [...track.notebook, makeEntry(track.notebook.length, 'Flame (Bunsen burner)', result)],
        reactionHistory: [`${salt.name}: flame test recorded`, ...track.reactionHistory].slice(0, 30),
      }));
    });
  }, []);

  const performBoraxBeadTest = useCallback(() => {
    setState((s) => {
      const salt = SALTS[s.selectedSalt];
      const result = runBoraxBeadTest(salt);
      return withTrack(s, 'cation', (track) => ({
        lastReaction: result,
        notebook: [...track.notebook, makeEntry(track.notebook.length, 'Borax bead (blowpipe flame)', result)],
        reactionHistory: [`${salt.name}: borax bead test recorded`, ...track.reactionHistory].slice(0, 30),
      }));
    });
  }, []);

  /** Tests the current sample against one of the six classical cation
   *  groups (see data/groups.ts) — always logs to the cation notebook
   *  regardless of which dashboard is open, same as the other quick
   *  tests, since group separation is exclusively a cation-side
   *  procedure. */
  const performGroupTest = useCallback((groupId: CationGroupId) => {
    setState((s) => {
      const group = CATION_GROUPS.find((g) => g.id === groupId);
      if (!group) return s;
      const salt = SALTS[s.selectedSalt];
      const positive = group.metals.includes(salt.metal);
      const result: ReactionResult = {
        match: positive,
        observation: positive ? group.positiveObservation : group.negativeObservation,
        inference: positive
          ? `A precipitate with ${group.reagentLabel} places this cation in ${group.label}.`
          : `No reaction with ${group.reagentLabel} rules out ${group.label}.`,
        effects: [],
        testKind: 'cation',
        testLabel: `${group.label} Separation`,
        reagentLabel: group.reagentLabel,
      };
      return withTrack(s, 'cation', (track) => ({
        lastReaction: result,
        notebook: [...track.notebook, makeEntry(track.notebook.length, group.reagentLabel, result)],
        reactionHistory: [
          `${salt.name}: ${group.label} separation — ${positive ? 'precipitate formed' : 'no precipitate'}`,
          ...track.reactionHistory,
        ].slice(0, 30),
      }));
    });
  }, []);

  const advanceGroup = useCallback(() => {
    setState((s) => ({ ...s, groupIndex: Math.min(s.groupIndex + 1, CATION_GROUPS.length - 1) }));
  }, []);

  const evaporateToCrystals = useCallback((uid: string) => {
    setState((s) => {
      const track = s[s.mode];
      const target = track.benchItems.find((it) => it.uid === uid);
      if (!target || target.liquidLevel <= 0) return s;
      const now = Date.now();
      return withTrack(s, s.mode, () => ({
        benchItems: track.benchItems.map((it) =>
          it.uid === uid
            ? {
                ...it,
                crystallising: true,
                effects: [...it.effects.filter((e) => e.id !== 'crystals'), { id: 'crystals' as const, intensity: 1 }],
                effectsStartedAt: now,
              }
            : it
        ),
      }));
    });
  }, []);

  const openReport = useCallback(() => setState((s) => ({ ...s, reportOpen: true })), []);
  const closeReport = useCallback(() => setState((s) => ({ ...s, reportOpen: false })), []);

  const resetExperiment = useCallback(() => {
    setState((s) => ({
      ...s,
      ...freshForSalt(s.selectedSalt, s.benchSize),
      reportOpen: false,
      // Resetting mid-challenge gives a clean slate to re-attempt the
      // same mystery sample rather than ending the round early.
      challengeGuesses: s.challengeActive ? [] : s.challengeGuesses,
      challengeSolved: s.challengeActive ? false : s.challengeSolved,
      challengeRevealed: s.challengeActive ? false : s.challengeRevealed,
    }));
  }, []);

  /** Starts a new challenge round: picks a random sample, resets both
   *  tracks fresh for it (via freshForSalt), and clears any previous
   *  round's guesses. Also used by "New sample" while already on the
   *  challenge page, so trying again just replaces the mystery salt. */
  const goToChallenge = useCallback(() => {
    setState((s) => {
      const randomSalt = SALT_ORDER[Math.floor(Math.random() * SALT_ORDER.length)];
      return {
        ...s,
        ...freshForSalt(randomSalt, s.benchSize),
        reportOpen: false,
        page: 'challenge',
        challengeActive: true,
        challengeSolved: false,
        challengeRevealed: false,
        challengeGuesses: [],
        challengeStats: { ...s.challengeStats, rounds: s.challengeStats.rounds + 1 },
      };
    });
  }, []);

  /** Leaves the challenge and returns to the ordinary lab — the bench
   *  and notebooks are left exactly as they are (including whatever
   *  the challenge sample was, now revealed) rather than being reset,
   *  so nothing already discovered is thrown away. */
  const goToLab = useCallback(() => {
    setState((s) => ({ ...s, page: 'lab', challengeActive: false }));
  }, []);

  const submitChallengeGuess = useCallback((metal: MetalId, anion: AnionId) => {
    setState((s) => {
      if (!s.challengeActive || s.challengeSolved || s.challengeRevealed) return s;
      const salt = SALTS[s.selectedSalt];
      const metalCorrect = metal === salt.metal;
      const anionCorrect = anion === salt.anion;
      const guess: ChallengeGuess = { metal, anion, metalCorrect, anionCorrect };
      const solved = metalCorrect && anionCorrect;
      return {
        ...s,
        challengeGuesses: [...s.challengeGuesses, guess],
        challengeSolved: solved,
        challengeStats: solved ? { ...s.challengeStats, solved: s.challengeStats.solved + 1 } : s.challengeStats,
      };
    });
  }, []);

  const revealChallengeAnswer = useCallback(() => {
    setState((s) => (s.challengeActive ? { ...s, challengeRevealed: true } : s));
  }, []);

  const value: LabContextValue = {
    ...state,
    ...state[state.mode],
    setMode,
    selectReagent,
    selectSalt,
    addEquipmentToBench,
    moveBenchItem,
    rotateBenchItem,
    removeBenchItem,
    pourReagentInto,
    resetExperiment,
    setBenchSize,
    performPreliminaryExam,
    performDryHeatTest,
    performFlameTest,
    performBoraxBeadTest,
    performGroupTest,
    advanceGroup,
    evaporateToCrystals,
    openReport,
    closeReport,
    saltRevealed: !state.challengeActive || state.challengeSolved || state.challengeRevealed,
    goToChallenge,
    goToLab,
    submitChallengeGuess,
    revealChallengeAnswer,
  };

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used within LabProvider');
  return ctx;
}
