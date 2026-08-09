import type { ReactionResult } from '../types/chemistry';
import { ANION_TESTS, ANIONS } from '../data/ions';

const TEST_LABEL = 'Paper Ball Test (Nitrate)';

/**
 * The paper ball (nitrate) confirmatory test: a sample is heated with
 * concentrated H₂SO₄ and a ferrous-sulfate-soaked paper ball is held at
 * the mouth of the tube. `positive` is determined by the caller from
 * whatever's actually happening in the vessel (see engine/physics.ts,
 * which checks for the brownFumes effect already produced by the
 * generic wet-anion-test pathway) rather than re-derived here, so a
 * paper ball only reads "positive" when the real chemistry — acid
 * poured, heat applied, correct salt — actually happened. Reuses the
 * same nitrate equations already in ANION_TESTS.nitrate so the
 * chemistry stays consistent with the rest of the app.
 */
export function performPaperBallTest(positive: boolean): ReactionResult {
  const nitrateTest = ANION_TESTS.nitrate;

  if (positive) {
    return {
      match: true,
      observation:
        'On heating, reddish-brown fumes of NO₂ pour from the mouth of the tube; the ferrous-sulfate-soaked paper ball held there turns brown, deepening to black.',
      inference: `Brown fumes together with a brown/black paper ball confirm the presence of ${ANIONS.nitrate.name.toLowerCase()} (${ANIONS.nitrate.formula}).`,
      effects: nitrateTest.effects,
      resultingColor: nitrateTest.resultingColor,
      resultingGlow: nitrateTest.resultingGlow,
      testKind: 'anion',
      testLabel: TEST_LABEL,
      reagentLabel: 'Conc. H₂SO₄, heated, with FeSO₄ paper ball',
      ionicEquation: nitrateTest.ionicEquation,
      balancedEquation: nitrateTest.balancedEquation,
      visual: { kind: 'paperBall', positive: true },
    };
  }

  return {
    match: false,
    observation:
      'On heating, no brown fumes are evolved and the ferrous-sulfate-soaked paper ball shows no significant colour change.',
    inference: `No colour change in the paper ball and no brown fumes indicate ${ANIONS.nitrate.name.toLowerCase()} (${ANIONS.nitrate.formula}) is absent.`,
    effects: [],
    testKind: 'anion',
    testLabel: TEST_LABEL,
    reagentLabel: 'Conc. H₂SO₄, heated, with FeSO₄ paper ball',
    visual: { kind: 'paperBall', positive: false },
  };
}
