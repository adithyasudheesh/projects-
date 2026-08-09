import type { DryHeatObservationId, ReactionResult, ReactionEffect, Salt } from '../types/chemistry';
import { FLAME_TESTS } from '../data/flameTests';
import { BORAX_TESTS } from '../data/boraxBead';
import { METALS } from '../data/ions';

export function performPreliminaryExam(salt: Salt): ReactionResult {
  const flame = FLAME_TESTS[salt.metal];
  const flameNote = flame
    ? ` A flame test is expected to show a ${flame.colorName.toLowerCase()} flame.`
    : '';
  return {
    match: true,
    observation:
      `Colour: ${salt.colour}. Appearance: ${salt.appearance}. Odour: ${salt.odour}. ` +
      `Solubility: ${salt.solubility}.${flameNote}`,
    inference: 'These physical properties provide preliminary clues about the likely ions present — use dry and wet tests to confirm.',
    effects: [],
    testKind: 'preliminary',
    testLabel: 'Preliminary Examination',
  };
}

export const DRY_HEAT_EFFECTS: Record<DryHeatObservationId, ReactionEffect[]> = {
  waterDroplets: [{ id: 'heat', intensity: 0.6 }],
  colourChange: [{ id: 'heat', intensity: 0.6 }],
  charring: [{ id: 'heat', intensity: 0.8 }, { id: 'smoke', intensity: 0.6 }],
  brownFumes: [{ id: 'heat', intensity: 0.8 }, { id: 'brownFumes', intensity: 1 }],
  whiteFumes: [{ id: 'heat', intensity: 0.7 }, { id: 'whiteFumes', intensity: 0.8 }],
  oxygenEvolution: [{ id: 'heat', intensity: 0.8 }, { id: 'bubbles', intensity: 0.7 }],
  noChange: [{ id: 'heat', intensity: 0.5 }],
};

const DRY_HEAT_INFERENCE: Record<DryHeatObservationId, string> = {
  waterDroplets: 'Condensation of water droplets on heating indicates a hydrated (crystalline) salt.',
  colourChange: 'A colour change on heating often indicates loss of water of crystallisation or a change in oxidation state.',
  charring: 'Charring on heating suggests decomposition of an organic (e.g. acetate/oxalate) anion.',
  brownFumes: 'Brown fumes on heating are characteristic of the decomposition of a nitrate, often with a heavy metal cation.',
  whiteFumes: 'White/pungent fumes suggest evolution of an acidic gas such as SO₂ or HCl on decomposition.',
  oxygenEvolution: 'Oxygen evolution (relighting a glowing splint) indicates decomposition of a nitrate or similar oxidising salt.',
  noChange: 'No significant change on moderate heating suggests a thermally stable salt.',
};

export function performDryHeatTest(salt: Salt): ReactionResult {
  return {
    match: true,
    observation: salt.dryHeatDescription,
    inference: DRY_HEAT_INFERENCE[salt.dryHeatObservation],
    effects: DRY_HEAT_EFFECTS[salt.dryHeatObservation],
    testKind: 'dryHeat',
    testLabel: 'Dry Heating Test',
    visual: { kind: 'dryHeat', observation: salt.dryHeatObservation },
  };
}

export function performFlameTest(salt: Salt): ReactionResult {
  const flame = FLAME_TESTS[salt.metal];
  const metalName = METALS[salt.metal].name;
  if (flame) {
    return {
      match: true,
      observation: `The sample, moistened with conc. HCl and held in the flame, colours it ${flame.colorName.toLowerCase()}. ${flame.description}`,
      inference: `A ${flame.colorName.toLowerCase()} flame confirms ${metalName.toLowerCase()}.`,
      effects: [],
      testKind: 'flame',
      testLabel: 'Flame Test',
      visual: { kind: 'flame', colorHex: flame.colorHex, colorName: flame.colorName, applicable: true },
    };
  }
  return {
    match: false,
    observation: `The sample gives no characteristic flame colouration under the classical flame test.`,
    inference: `${metalName} is not identifiable by a simple flame test — rely on wet/dry tests instead.`,
    effects: [],
    testKind: 'flame',
    testLabel: 'Flame Test',
    visual: { kind: 'flame', colorHex: '#9CA3AF', colorName: 'No characteristic colour', applicable: false },
  };
}

export function performBoraxBeadTest(salt: Salt): ReactionResult {
  const bead = BORAX_TESTS[salt.metal];
  const metalName = METALS[salt.metal].name;
  if (bead) {
    return {
      match: true,
      observation: `The borax bead, fused with a trace of the salt in the oxidising flame, is ${bead.hotColorName.toLowerCase()} while hot and ${bead.coldColorName.toLowerCase()} on cooling.`,
      inference: `A ${bead.coldColorName.toLowerCase()} bead on cooling confirms ${metalName.toLowerCase()}.`,
      effects: [],
      testKind: 'borax',
      testLabel: 'Borax Bead Test',
      visual: {
        kind: 'borax',
        hotHex: bead.hotColorHex,
        hotName: bead.hotColorName,
        coldHex: bead.coldColorHex,
        coldName: bead.coldColorName,
        applicable: true,
      },
    };
  }
  return {
    match: false,
    observation: 'The borax bead remains essentially colourless, both hot and cold.',
    inference: `${metalName} does not give a characteristic borax bead colour.`,
    effects: [],
    testKind: 'borax',
    testLabel: 'Borax Bead Test',
    visual: {
      kind: 'borax',
      hotHex: '#E5E7EB',
      hotName: 'Colourless',
      coldHex: '#F3F4F6',
      coldName: 'Colourless',
      applicable: false,
    },
  };
}
