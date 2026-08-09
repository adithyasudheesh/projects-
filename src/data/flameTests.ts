import type { FlameTestResult, MetalId } from '../types/chemistry';

export const FLAME_TESTS: Partial<Record<MetalId, FlameTestResult>> = {
  sodium: {
    metal: 'sodium',
    colorName: 'Golden yellow',
    colorHex: '#FFD24A',
    description: 'A persistent, intense golden-yellow flame — characteristic of sodium.',
  },
  potassium: {
    metal: 'potassium',
    colorName: 'Lilac (violet)',
    colorHex: '#B266FF',
    description: 'A pale lilac flame, best viewed through blue (cobalt) glass to mask any sodium contamination.',
  },
  calcium: {
    metal: 'calcium',
    colorName: 'Brick red',
    colorHex: '#FF5A36',
    description: 'A brick-red flame — characteristic of calcium.',
  },
  barium: {
    metal: 'barium',
    colorName: 'Apple green',
    colorHex: '#7CE07C',
    description: 'A pale apple-green flame — characteristic of barium.',
  },
  copper: {
    metal: 'copper',
    colorName: 'Blue-green (torch green)',
    colorHex: '#22E0C0',
    description: 'A vivid blue-green flame — characteristic of copper.',
  },
  strontium: {
    metal: 'strontium',
    colorName: 'Crimson red',
    colorHex: '#FF1744',
    description: 'A strong crimson-scarlet flame — characteristic of strontium.',
  },
  lithium: {
    metal: 'lithium',
    colorName: 'Carmine red',
    colorHex: '#FF3D6E',
    description: 'A carmine-pink/crimson flame, slightly rosier than strontium — characteristic of lithium.',
  },
};
