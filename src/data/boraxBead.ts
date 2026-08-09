import type { BoraxBeadResult, MetalId } from '../types/chemistry';

export const BORAX_TESTS: Partial<Record<MetalId, BoraxBeadResult>> = {
  copper: {
    metal: 'copper',
    hotColorName: 'Bluish-green',
    hotColorHex: '#2FBF8F',
    coldColorName: 'Blue',
    coldColorHex: '#3B6FE0',
  },
  cobalt: {
    metal: 'cobalt',
    hotColorName: 'Blue',
    hotColorHex: '#3B6FE0',
    coldColorName: 'Blue',
    coldColorHex: '#3B6FE0',
  },
  chromium: {
    metal: 'chromium',
    hotColorName: 'Dirty yellowish-green',
    hotColorHex: '#9ACD32',
    coldColorName: 'Emerald green',
    coldColorHex: '#2E8B57',
  },
  ferric: {
    metal: 'ferric',
    hotColorName: 'Yellow / brownish-yellow',
    hotColorHex: '#D98E1E',
    coldColorName: 'Pale yellow',
    coldColorHex: '#F0D878',
  },
  manganese: {
    metal: 'manganese',
    hotColorName: 'Violet (amethyst)',
    hotColorHex: '#8B3FA0',
    coldColorName: 'Violet (amethyst)',
    coldColorHex: '#A567C2',
  },
  nickel: {
    metal: 'nickel',
    hotColorName: 'Reddish-brown / violet',
    hotColorHex: '#8B4A2B',
    coldColorName: 'Brownish-red',
    coldColorHex: '#A0522D',
  },
};
