import type { CationGroupId, MetalId, ReagentId } from '../types/chemistry';

export interface CationGroupInfo {
  id: CationGroupId;
  label: string;
  reagentLabel: string;
  reagentId: ReagentId;
  medium: string;
  positiveObservation: string;
  negativeObservation: string;
  /** Which of this app's cations (see MetalId) fall in this group. */
  metals: MetalId[];
}

/**
 * The classical H₂S qualitative-analysis scheme for cation group
 * separation (Vogel), applied to exactly the cations this app already
 * has data for. This is standard, well-established laboratory
 * procedure — nothing here is invented:
 *
 *  - Group I  (dilute HCl): insoluble chlorides — only Pb²⁺ among this
 *    app's cations (Ag⁺, Hg₂²⁺ aren't in the salt set).
 *  - Group II (H₂S, acidic medium): insoluble sulphides that form even
 *    in the presence of H⁺ — only Cu²⁺ here.
 *  - Group III (NH₄Cl + NH₄OH, ammoniacal): insoluble hydroxides —
 *    Fe³⁺, Fe²⁺ (oxidised first), Al³⁺, Cr³⁺.
 *  - Group IV (H₂S, ammoniacal medium): sulphides that only precipitate
 *    once H⁺ is removed — Zn²⁺, Mn²⁺, Ni²⁺, Co²⁺.
 *  - Group V ((NH₄)₂CO₃ + NH₄Cl): carbonates — Ca²⁺, Sr²⁺, Ba²⁺.
 *  - Group VI: no common group reagent — Mg²⁺, Na⁺, K⁺, Li⁺ stay in
 *    solution and are identified individually (flame test, or Mg's
 *    own magneson test).
 *
 * NH₄⁺ isn't part of this sequence at all — it's tested separately,
 * before group analysis begins, since the group reagents themselves
 * are ammonium salts/ammonia and would make an ammonium test done
 * afterwards meaningless.
 */
export const CATION_GROUPS: CationGroupInfo[] = [
  {
    id: 'I',
    label: 'Group I',
    reagentLabel: 'Dilute HCl',
    reagentId: 'diluteHCl',
    medium: 'Cold, dilute hydrochloric acid',
    positiveObservation: 'A white precipitate forms at once — the chloride is insoluble even in cold dilute HCl.',
    negativeObservation: 'No precipitate forms in cold dilute HCl — this cation is not in Group I.',
    metals: ['lead'],
  },
  {
    id: 'II',
    label: 'Group II',
    reagentLabel: 'H₂S gas',
    reagentId: 'h2s',
    medium: 'H₂S passed through the solution acidified with dilute HCl',
    positiveObservation: 'A coloured metal sulphide precipitates even in the strongly acidic medium.',
    negativeObservation: 'No precipitate forms in acidic medium — this cation is not in Group II.',
    metals: ['copper'],
  },
  {
    id: 'III',
    label: 'Group III',
    reagentLabel: 'NH₄Cl + NH₄OH',
    reagentId: 'nh4oh',
    medium: 'Solution made ammoniacal with NH₄Cl and NH₄OH',
    positiveObservation: 'A gelatinous coloured hydroxide precipitates in the ammoniacal medium.',
    negativeObservation: 'No precipitate forms in ammoniacal medium — this cation is not in Group III.',
    metals: ['ferric', 'ferrous', 'aluminium', 'chromium'],
  },
  {
    id: 'IV',
    label: 'Group IV',
    reagentLabel: 'H₂S gas',
    reagentId: 'h2s',
    medium: 'H₂S passed through the same ammoniacal (NH₄OH) solution',
    positiveObservation: 'A coloured metal sulphide precipitates now that the solution is ammoniacal rather than acidic.',
    negativeObservation: 'Still no precipitate — this cation is not in Group IV.',
    metals: ['zinc', 'manganese', 'nickel', 'cobalt'],
  },
  {
    id: 'V',
    label: 'Group V',
    reagentLabel: '(NH₄)₂CO₃',
    reagentId: 'ammoniumCarbonate',
    medium: 'Ammonium carbonate in the presence of NH₄Cl',
    positiveObservation: 'A white precipitate of the metal carbonate forms.',
    negativeObservation: 'No precipitate forms — this cation is not in Group V.',
    metals: ['barium', 'strontium', 'calcium'],
  },
  {
    id: 'VI',
    label: 'Group VI',
    reagentLabel: 'No common group reagent',
    reagentId: 'distilledWater',
    medium: 'None — this is the "soluble group"',
    positiveObservation:
      'Having ruled out Groups I–V, the cation stays in solution — it belongs to the soluble Group VI. Identify it individually (flame test, or a specific reagent).',
    negativeObservation: 'No precipitate forms — this cation is not in Group VI either (check the working salt data).',
    metals: ['magnesium', 'sodium', 'potassium', 'lithium'],
  },
];
