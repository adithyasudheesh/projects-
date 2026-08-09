import type { IonConfirmatoryTest, ReactionResult, ReagentId, Salt } from '../types/chemistry';
import { CATION_TESTS, ANION_TESTS, SULPHIDE_LEAD_ACETATE_ALT, METALS, ANIONS } from '../data/ions';
import { REAGENTS } from '../data/reagents';

function reagentMatches(test: IonConfirmatoryTest, reagentId: ReagentId): boolean {
  return test.reagentId === reagentId || !!test.altReagentIds?.includes(reagentId);
}

function fromTest(
  test: IonConfirmatoryTest,
  testKind: 'cation' | 'anion',
  testLabel: string,
  heated: boolean
): ReactionResult {
  if (test.requiresHeat && !heated) {
    return {
      match: false,
      observation: 'No visible change at room temperature with this reagent.',
      inference: 'This test requires warming the mixture — drag the spirit lamp under the vessel.',
      effects: [],
      testKind,
      testLabel,
      reagentLabel: test.reagentLabel,
    };
  }
  return {
    match: true,
    observation: test.observation,
    inference: test.inference,
    effects: test.effects,
    resultingColor: test.resultingColor,
    resultingGlow: test.resultingGlow,
    testKind,
    testLabel,
    reagentLabel: test.reagentLabel,
    ionicEquation: test.ionicEquation,
    balancedEquation: test.balancedEquation,
  };
}

export interface EvaluateArgs {
  salt: Salt;
  reagentId: ReagentId;
  heated: boolean;
  hasLimeWaterOnBench: boolean;
}

export function evaluateReaction({ salt, reagentId, heated, hasLimeWaterOnBench }: EvaluateArgs): ReactionResult {
  const reagent = REAGENTS[reagentId];

  // Cation confirmatory test for this salt's metal, if one exists.
  const cationTest = CATION_TESTS[salt.metal];
  if (cationTest && reagentMatches(cationTest, reagentId)) {
    const metalName = METALS[salt.metal].name;
    return fromTest(cationTest, 'cation', `Cation Test — ${metalName} (${METALS[salt.metal].formula})`, heated);
  }

  // Anion confirmatory test for this salt's anion.
  const anionTest = ANION_TESTS[salt.anion];
  if (anionTest && reagentMatches(anionTest, reagentId)) {
    const anionName = ANIONS[salt.anion].name;
    const result = fromTest(anionTest, 'anion', `Anion Test — ${anionName} (${ANIONS[salt.anion].formula})`, heated);
    if (salt.anion === 'carbonate' && hasLimeWaterOnBench) {
      result.observation += ' Lime water in the adjoining vessel turns milky, confirming CO₂.';
    }
    return result;
  }

  // Direct sulphide + lead acetate precipitation shortcut.
  if (salt.anion === 'sulphide' && reagentMatches(SULPHIDE_LEAD_ACETATE_ALT, reagentId)) {
    return fromTest(
      SULPHIDE_LEAD_ACETATE_ALT,
      'anion',
      `Anion Test — ${ANIONS.sulphide.name} (${ANIONS.sulphide.formula})`,
      heated
    );
  }

  if (reagentId === 'distilledWater') {
    return {
      match: false,
      observation: `The sample dissolves; ${salt.solubility.toLowerCase()}.`,
      inference: 'No characteristic reaction — water is used only to prepare the solution for wet testing.',
      effects: [],
      testKind: 'general',
      testLabel: 'Dissolution',
      reagentLabel: reagent.name,
    };
  }

  return {
    match: false,
    observation: `No characteristic change observed with ${reagent.name}.`,
    inference: 'This reagent does not confirm either ion in this salt — try a different reagent.',
    effects: [],
    testKind: 'general',
    testLabel: 'No Reaction',
    reagentLabel: reagent.name,
  };
}
