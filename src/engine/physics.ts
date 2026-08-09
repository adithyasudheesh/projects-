import type { BenchItem, ReactionResult, Salt } from '../types/chemistry';
import { EQUIPMENT_FOOTPRINT } from '../data/equipment';
import { REAGENTS } from '../data/reagents';
import { performPaperBallTest } from './paperBallTest';
import { evaluateReaction } from './reactionEngine';

// Mirrors the vessel list used elsewhere (LabContext's VESSEL_IDS,
// glassware/types.ts's VESSELS) — duplicated here rather than imported
// to keep this pure engine module free of a dependency on the
// component tree or the context module.
const VESSEL_EQUIPMENT: string[] = ['testTube', 'beaker', 'conicalFlask'];

/** How close (px, between the vessel's base and the lamp's flame tip)
 *  the spirit lamp needs to be to count as heating a vessel. */
const HEAT_RADIUS = 55;
/** How close (px, between a paper ball and a vessel's mouth) it needs
 *  to be to count as being held there. */
const PAPER_BALL_RADIUS = 50;

function isVessel(item: BenchItem) {
  return VESSEL_EQUIPMENT.includes(item.equipment);
}

function distance(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function nearLampFlame(vessel: BenchItem, lamps: BenchItem[]) {
  const footprint = EQUIPMENT_FOOTPRINT[vessel.equipment];
  const baseX = vessel.x + footprint.width / 2;
  const baseY = vessel.y + footprint.height;
  return lamps.some((lamp) => {
    const lampFootprint = EQUIPMENT_FOOTPRINT[lamp.equipment];
    return distance(baseX, baseY, lamp.x + lampFootprint.width / 2, lamp.y) <= HEAT_RADIUS;
  });
}

function ballAtMouth(ball: BenchItem, vessel: BenchItem) {
  const ballFootprint = EQUIPMENT_FOOTPRINT[ball.equipment];
  const gripX = ball.x + ballFootprint.width / 2;
  const gripY = ball.y + ballFootprint.height / 2;
  const footprint = EQUIPMENT_FOOTPRINT[vessel.equipment];
  const mouthX = vessel.x + footprint.width / 2;
  const mouthY = vessel.y;
  return distance(gripX, gripY, mouthX, mouthY) <= PAPER_BALL_RADIUS;
}

function hasLimeWaterNearby(excludeUid: string, items: BenchItem[]) {
  return items.some(
    (it) => it.uid !== excludeUid && it.liquidLevel > 0 && it.liquidColor === REAGENTS.limeWater.color
  );
}

function applyResult(item: BenchItem, result: ReactionResult): BenchItem {
  return {
    ...item,
    effects: result.effects,
    liquidColor: result.resultingColor ?? item.liquidColor,
    liquidGlow: result.resultingGlow ?? item.liquidGlow,
    effectsStartedAt: Date.now(),
  };
}

/** Whether a reaction result would show brown NO₂ fumes. */
export function isFumeReaction(result: ReactionResult): boolean {
  return result.effects.some((e) => e.id === 'brownFumes');
}

/**
 * Replaces a would-be brown-fume reveal with a "not yet visible"
 * placeholder. Used by the pour action itself so that pouring never
 * reveals fumes directly — not even onto a vessel that's already
 * heated — only a paper ball reaching the mouth of a heated vessel
 * does (see applyBenchPhysics below). A no-op for every other kind of
 * result, so it's safe to run on every pour unconditionally.
 */
export function withholdFumes(result: ReactionResult): ReactionResult {
  if (!isFumeReaction(result)) return result;
  return {
    ...result,
    match: false,
    observation:
      "Nothing visible happens yet — any fumes stay hidden until a paper ball is held at the tube's mouth.",
    inference: 'Bring the FeSO₄ paper ball to the mouth of the heated tube to check.',
    effects: [],
    resultingColor: undefined,
    resultingGlow: undefined,
  };
}

export interface HeatReaction {
  uid: string;
  result: ReactionResult;
  reagentName: string;
}

/**
 * Re-derives, from current bench positions, which vessels are being
 * heated, and reveals reactions in two ways:
 *
 *  - Most heat-requiring reactions reveal as soon as the vessel is
 *    heated — mix cold, then apply heat (the natural order), covering
 *    every salt's cation/anion confirmatory tests generically.
 *  - Reactions that produce brown NO₂ fumes (the nitrate test) are the
 *    one deliberate exception: heat alone never shows the fumes. They
 *    stay hidden until the FeSO₄ paper ball reaches the mouth of the
 *    heated tube — bringing the paper up to check is what reveals
 *    them, the same moment it also records its own colour change.
 *
 * Called after every bench-item move/add/remove so all of this stays
 * purely physical — no toggle buttons, no separate step sequence.
 */
export function applyBenchPhysics(
  benchItems: BenchItem[],
  salt: Salt
): {
  benchItems: BenchItem[];
  paperBallReaction: { uid: string; result: ReactionResult } | null;
  heatReactions: HeatReaction[];
} {
  const lamps = benchItems.filter((it) => it.equipment === 'spiritLamp');
  const heatReactions: HeatReaction[] = [];

  // 1. Heated flag, plus an immediate reveal for ordinary
  //    heat-requiring reactions. Brown-fume reactions are deliberately
  //    skipped here and left for step 2.
  let items = benchItems.map((item) => {
    if (!isVessel(item)) return item;
    const heated = nearLampFlame(item, lamps);
    const justHeated = heated && !item.heated;

    if (justHeated && item.effects.length === 0 && item.lastPouredReagent) {
      const reagentId = item.lastPouredReagent;
      const result = evaluateReaction({
        salt,
        reagentId,
        heated: true,
        hasLimeWaterOnBench: hasLimeWaterNearby(item.uid, benchItems),
      });
      const isFume = isFumeReaction(result);
      if (result.effects.length > 0 && !isFume) {
        heatReactions.push({ uid: item.uid, result, reagentName: REAGENTS[reagentId].name });
        return { ...applyResult(item, result), heated };
      }
    }

    return heated === item.heated ? item : { ...item, heated };
  });

  // 2. Brown-fume reactions: revealed the first time the FeSO₄ paper
  //    ball reaches the mouth of a heated vessel that's still waiting.
  const balls = items.filter((it) => it.equipment === 'paperBall');
  items = items.map((item) => {
    if (!isVessel(item) || !item.heated || item.liquidLevel <= 0) return item;
    if (item.effects.length > 0 || !item.lastPouredReagent) return item;
    if (!balls.some((ball) => ballAtMouth(ball, item))) return item;

    const reagentId = item.lastPouredReagent;
    const result = evaluateReaction({
      salt,
      reagentId,
      heated: true,
      hasLimeWaterOnBench: hasLimeWaterNearby(item.uid, items),
    });
    if (result.effects.length === 0) return item;
    heatReactions.push({ uid: item.uid, result, reagentName: REAGENTS[reagentId].name });
    return applyResult(item, result);
  });

  // 3. The FeSO₄ ball records its own colour-change result, reading
  //    the vessel's effects as just updated in step 2 above.
  let paperBallReaction: { uid: string; result: ReactionResult } | null = null;
  items = items.map((ball) => {
    if (ball.equipment !== 'paperBall' || ball.paperBallState) return ball;
    const vessel = items.find((v) => isVessel(v) && v.heated && v.liquidLevel > 0 && ballAtMouth(ball, v));
    if (!vessel) return ball;
    const positive = vessel.effects.some((e) => e.id === 'brownFumes');
    const result = performPaperBallTest(positive);
    paperBallReaction = { uid: ball.uid, result };
    return { ...ball, paperBallState: (positive ? 'positive' : 'negative') as const };
  });

  return { benchItems: items, paperBallReaction, heatReactions };
}
