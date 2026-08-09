export type EquipmentId = 'testTube' | 'beaker' | 'conicalFlask' | 'spiritLamp' | 'paperBall';

export interface EquipmentItem {
  id: EquipmentId;
  name: string;
  description: string;
}

export type ReagentCategory = 'water' | 'acid' | 'base' | 'specific';

export type ReagentId =
  | 'distilledWater'
  | 'diluteHCl'
  | 'concHCl'
  | 'diluteH2SO4'
  | 'concH2SO4'
  | 'diluteHNO3'
  | 'concHNO3'
  | 'naoh'
  | 'nh4oh'
  | 'agno3'
  | 'bacl2'
  | 'limeWater'
  | 'ki'
  | 'k4feCN6'
  | 'k3feCN6'
  | 'kscn'
  | 'dmg'
  | 'ammoniumOxalate'
  | 'ammoniumSulphate'
  | 'potassiumChromate'
  | 'ammoniumMolybdate'
  | 'neutralFeCl3'
  | 'kmno4'
  | 'leadAcetate'
  | 'magneson'
  | 'aluminon'
  | 'h2o2'
  | 'ferrousSulphateSolution'
  | 'paperBallReagent'
  | 'h2s'
  | 'ammoniumCarbonate';

export type CationGroupId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export interface Reagent {
  id: ReagentId;
  name: string;
  formula: string;
  color: string;
  glow: string;
  description: string;
  category: ReagentCategory;
}

/** Canonical identity of every metal/cation the lab knows about.
 *  Not all of these have a wet precipitation confirmatory test —
 *  sodium/potassium/lithium are flame-only, chromium is borax-bead-only —
 *  see CATION_TESTS / FLAME_TESTS / BORAX_TESTS for which lookups exist
 *  for a given id. */
export type MetalId =
  | 'ammonium'
  | 'lead'
  | 'copper'
  | 'ferrous'
  | 'ferric'
  | 'aluminium'
  | 'zinc'
  | 'manganese'
  | 'nickel'
  | 'cobalt'
  | 'calcium'
  | 'strontium'
  | 'barium'
  | 'magnesium'
  | 'sodium'
  | 'potassium'
  | 'lithium'
  | 'chromium';

export type AnionId =
  | 'carbonate'
  | 'sulphide'
  | 'sulphite'
  | 'chloride'
  | 'bromide'
  | 'iodide'
  | 'nitrate'
  | 'sulphate'
  | 'phosphate'
  | 'acetate'
  | 'oxalate';

export interface MetalInfo {
  id: MetalId;
  name: string;
  formula: string;
}

export interface AnionInfo {
  id: AnionId;
  name: string;
  formula: string;
}

/** A single confirmatory test: pouring `reagentId` (optionally requiring
 *  heat) into a solution of the target ion produces this result. */
export interface IonConfirmatoryTest {
  reagentId: ReagentId;
  altReagentIds?: ReagentId[];
  requiresHeat?: boolean;
  reagentLabel: string;
  observation: string;
  ionicEquation: string;
  balancedEquation: string;
  inference: string;
  effects: ReactionEffect[];
  resultingColor?: string;
  resultingGlow?: string;
}

export type DryHeatObservationId =
  | 'waterDroplets'
  | 'colourChange'
  | 'charring'
  | 'brownFumes'
  | 'whiteFumes'
  | 'oxygenEvolution'
  | 'noChange';

export type FlameElementId = 'sodium' | 'potassium' | 'calcium' | 'barium' | 'copper' | 'strontium' | 'lithium';

export interface FlameTestResult {
  metal: MetalId;
  colorName: string;
  colorHex: string;
  description: string;
}

export type BoraxCationId = 'copper' | 'cobalt' | 'chromium' | 'ferric' | 'manganese' | 'nickel';

export interface BoraxBeadResult {
  metal: MetalId;
  hotColorName: string;
  hotColorHex: string;
  coldColorName: string;
  coldColorHex: string;
}

export type SaltId =
  | 'calciumCarbonate'
  | 'sodiumNitrate'
  | 'copperSulphate'
  | 'ferrousSulphate'
  | 'ferricChloride'
  | 'leadNitrate'
  | 'zincSulphate'
  | 'manganeseSulphate'
  | 'nickelSulphate'
  | 'cobaltChloride'
  | 'strontiumChloride'
  | 'bariumChloride'
  | 'magnesiumSulphate'
  | 'ammoniumAcetate'
  | 'potassiumIodide'
  | 'sodiumBromide'
  | 'sodiumSulphide'
  | 'sodiumSulphite'
  | 'sodiumOxalate'
  | 'sodiumPhosphate'
  | 'lithiumChloride'
  | 'chromiumChloride';

export interface Salt {
  id: SaltId;
  name: string;
  formula: string;
  description: string;
  metal: MetalId;
  anion: AnionId;
  colour: string;
  appearance: string;
  odour: string;
  solubility: string;
  dryHeatObservation: DryHeatObservationId;
  dryHeatDescription: string;
}

export type ReactionEffectId =
  | 'bubbles'
  | 'co2Gas'
  | 'precipitate'
  | 'smoke'
  | 'brownFumes'
  | 'whiteFumes'
  | 'heat'
  | 'milky'
  | 'crystals';

/** How a precipitate actually behaves as it forms and settles, based on
 *  its real physical character:
 *  - granular: dense, settles fairly quickly to a thin, well-defined
 *    band (most crystalline salts — halides of Pb/Ba, oxalates...)
 *  - gelatinous: voluminous, cloud-like, soft-edged, settles slowly
 *    into a thick fluffy layer (hydroxide/"lake" precipitates)
 *  - flocculent: light, bulky, drifts before slowly sinking, very
 *    voluminous for the amount of substance present (Ni-DMG)
 *  - colloidal: very finely divided, stays hazy/turbid for a long
 *    time and barely settles (ferro/ferricyanides, metal sulphides)
 *  - curdy: clumpy, irregular curd-like masses that coagulate
 *    (classic silver halides)
 *  - slow: forms gradually rather than at once, otherwise granular
 *    (e.g. strontium sulphate, which "slowly forms on standing") */
export type PrecipitateTexture = 'granular' | 'gelatinous' | 'flocculent' | 'colloidal' | 'curdy' | 'slow';

export interface ReactionEffect {
  id: ReactionEffectId;
  intensity: number;
  /** Optional free-form payload, e.g. a CSS colour override for smoke/gas tint. */
  meta?: string;
  /** Only meaningful on a 'precipitate' effect — see PrecipitateTexture. */
  texture?: PrecipitateTexture;
}

export type TestKind = 'preliminary' | 'dryHeat' | 'flame' | 'borax' | 'cation' | 'anion' | 'general';

export type ReactionVisual =
  | { kind: 'flame'; colorHex: string; colorName: string; applicable: boolean }
  | { kind: 'borax'; hotHex: string; hotName: string; coldHex: string; coldName: string; applicable: boolean }
  | { kind: 'dryHeat'; observation: DryHeatObservationId }
  | { kind: 'paperBall'; positive: boolean };

export interface ReactionResult {
  match: boolean;
  observation: string;
  inference: string;
  effects: ReactionEffect[];
  resultingColor?: string;
  resultingGlow?: string;
  testKind: TestKind;
  testLabel: string;
  reagentLabel?: string;
  ionicEquation?: string;
  balancedEquation?: string;
  visual?: ReactionVisual;
}

export interface NotebookEntry {
  step: number;
  reagent: string;
  observation: string;
  inference: string;
  timestamp: number;
  testKind: TestKind;
  testLabel: string;
  matched: boolean;
  ionicEquation?: string;
  balancedEquation?: string;
}

export interface BenchItem {
  uid: string;
  equipment: EquipmentId;
  x: number;
  y: number;
  rotation: number;
  liquidLevel: number;
  liquidColor: string;
  liquidGlow: string;
  effects: ReactionEffect[];
  heated: boolean;
  saltLoaded: boolean;
  /** Incremented on every pour; used to key/restart the post-pour swirl animation. */
  mixCount: number;
  /** Timestamp (ms) the current effect set started, used to drive time-based
   *  animation decay (e.g. dense-then-sparse gas evolution). */
  effectsStartedAt: number | null;
  crystallising: boolean;
  /** The reagent most recently poured into this vessel (if any) — kept
   *  so that heating it afterwards (dragging the spirit lamp under it)
   *  can retroactively re-evaluate the reaction, matching the real
   *  procedure of mixing cold and then applying heat. Cleared to null
   *  by a fresh pour of a reagent that doesn't react, and left as-is
   *  otherwise. */
  lastPouredReagent?: ReagentId | null;
  /** Set once a paper-ball equipment item has been held at the mouth
   *  of a heated, fuming vessel — persists the outcome so it doesn't
   *  re-evaluate every time bench items move. Unused by vessels. */
  paperBallState?: 'positive' | 'negative';
}

export interface PourStream {
  uid: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  glow: string;
  startedAt: number;
  seed: number;
}

/** Measured pixel size of the lab bench drop-zone, used to keep
 *  absolutely-positioned glassware within visible bounds on any
 *  screen size. */
export interface BenchSize {
  width: number;
  height: number;
}

export type AnalysisMode = 'cation' | 'anion';

/** Everything that belongs to a single, independent analysis track —
 *  its own bench, its own reagent selection, its own notebook, its own
 *  most-recent observation. Cation and anion analysis each get one of
 *  these; they never read or write each other's. */
export interface TrackState {
  benchItems: BenchItem[];
  selectedReagent: ReagentId | null;
  notebook: NotebookEntry[];
  reactionHistory: string[];
  activeEffect: {
    itemId: string;
    effects: ReactionEffect[];
  } | null;
  lastReaction: ReactionResult | null;
  pourStream: PourStream | null;
}

export type AppPage = 'lab' | 'challenge';

export interface ChallengeGuess {
  metal: MetalId;
  anion: AnionId;
  metalCorrect: boolean;
  anionCorrect: boolean;
}

export interface LabState {
  mode: AnalysisMode;
  selectedSalt: SaltId;
  currentExperiment: string;
  benchSize: BenchSize;
  reportOpen: boolean;
  cation: TrackState;
  anion: TrackState;
  page: AppPage;
  /** True only while an unsolved, unrevealed challenge round is in
   *  progress — gates whether the sample's real identity is shown
   *  anywhere in the UI (see the derived `saltRevealed` context value). */
  challengeActive: boolean;
  challengeSolved: boolean;
  challengeRevealed: boolean;
  challengeGuesses: ChallengeGuess[];
  challengeStats: { rounds: number; solved: number };
  /** Which of the 6 classical cation groups (I–VI) is currently being
   *  tested — only relevant on the cation track, resets whenever the
   *  sample changes (see freshForSalt in LabContext). */
  groupIndex: number;
}
