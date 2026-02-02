
import { DigitMapping } from './types';

export const DIGIT_MAPS: Record<number, string> = {
  0: '1111110',
  1: '0110000',
  2: '1101101',
  3: '1111001',
  4: '0110011',
  5: '1011011',
  6: '1011111',
  7: '1110000',
  8: '1111111',
  9: '1111011',
};

export const COLOR_PALETTE = {
  active: '#ec4899', // pink-500
  activeGlow: '0 0 20px #ec4899, 0 0 40px #ec4899',
  inactive: '#1e293b', // slate-800
  binaryText: '#22c55e', // green-500
  bgDark: '#020617',
};

export const SEGMENT_LABELS: ('a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g')[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
