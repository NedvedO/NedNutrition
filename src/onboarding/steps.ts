import type { Distribution } from '../program/types';

export type StepId =
  'about' | 'goal' | 'diet' | 'training' | 'distribution' | 'highDays' | 'protein' | 'ready';

/** The onboarding steps in order. "Pick high days" only appears when calories are shifted. */
export function getSteps(distribution: Distribution): StepId[] {
  return [
    'about',
    'goal',
    'diet',
    'training',
    'distribution',
    ...(distribution === 'shift' ? (['highDays'] as const) : []),
    'protein',
    'ready',
  ];
}

/** Progress bar fill (0 to 1) for the step at `index`. */
export function stepProgress(index: number, stepCount: number): number {
  if (stepCount <= 1) return 1;
  return Math.min(Math.max(index / (stepCount - 1), 0), 1);
}
