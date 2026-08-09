import type { EquipmentId, EquipmentItem } from '../types/chemistry';

export const EQUIPMENT: Record<EquipmentId, EquipmentItem> = {
  testTube: {
    id: 'testTube',
    name: 'Test Tube',
    description: 'Small cylindrical vessel for heating and mixing small samples.',
  },
  beaker: {
    id: 'beaker',
    name: 'Beaker',
    description: 'Wide-mouth vessel for stirring, mixing, and pouring liquids.',
  },
  conicalFlask: {
    id: 'conicalFlask',
    name: 'Conical Flask',
    description: 'Erlenmeyer flask used for swirling without splashing.',
  },
  spiritLamp: {
    id: 'spiritLamp',
    name: 'Spirit Lamp',
    description: 'Drag under a vessel to heat it — drag it away to let the vessel cool.',
  },
  paperBall: {
    id: 'paperBall',
    name: 'Paper Ball (FeSO₄)',
    description: 'FeSO₄-soaked pellet — carry to the mouth of a heated vessel to reveal and test for nitrate fumes.',
  },
};

/** Vessels auto-placed on the bench at the start of every experiment. */
export const EQUIPMENT_ORDER: EquipmentId[] = ['testTube', 'beaker', 'conicalFlask'];

/** Apparatus available from the shelf but not auto-placed — added to
 *  the bench only when the person clicks them, same as vessels. */
export const TOOL_EQUIPMENT_ORDER: EquipmentId[] = ['spiritLamp', 'paperBall'];

/** Full shelf listing: starter vessels followed by the extra apparatus. */
export const SHELF_EQUIPMENT_ORDER: EquipmentId[] = [...EQUIPMENT_ORDER, ...TOOL_EQUIPMENT_ORDER];

/** Approximate rendered footprint (px) of each glassware/apparatus type
 *  at its default (non-compact) scale, matching the SVG dimensions in
 *  Glassware.tsx. Used to keep bench items within visible bounds on
 *  any screen size, and to detect when the spirit lamp is positioned
 *  under a vessel or the paper ball at a vessel's mouth. */
export const EQUIPMENT_FOOTPRINT: Record<EquipmentId, { width: number; height: number }> = {
  testTube: { width: 46, height: 158 },
  beaker: { width: 80, height: 98 },
  conicalFlask: { width: 70, height: 118 },
  spiritLamp: { width: 50, height: 40 },
  paperBall: { width: 22, height: 22 },
};
