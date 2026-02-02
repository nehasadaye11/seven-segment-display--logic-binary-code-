
export enum DashboardMode {
  ANIMATION = 'ANIMATION',
  MANUAL = 'MANUAL',
  COUNTER = 'COUNTER'
}

export type SegmentKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

export interface DigitMapping {
  digit: number;
  binary: string;
}
