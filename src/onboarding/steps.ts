import type { Distribution } from '../program/types';

export type StepId =
  // Basics: who the user is and how active they are
  | 'healthSync'
  | 'sex'
  | 'birthday'
  | 'height'
  | 'weight'
  | 'weighedMore'
  | 'weightTrend'
  | 'bodyFat'
  | 'exercise'
  | 'dailyActivity'
  | 'lifting'
  | 'cardio'
  | 'athletic'
  | 'expenditure'
  // Program: what the user wants
  | 'goal'
  | 'diet'
  | 'training'
  | 'distribution'
  | 'highDays'
  | 'protein'
  | 'ready';

export type Section = 'basics' | 'program';

export const BASICS_STEPS: StepId[] = [
  'healthSync',
  'sex',
  'birthday',
  'height',
  'weight',
  'weighedMore',
  'weightTrend',
  'bodyFat',
  'exercise',
  'dailyActivity',
  'lifting',
  'cardio',
  'athletic',
  'expenditure',
];

/** The onboarding steps in order. "Pick high days" only appears when calories are shifted. */
export function getSteps(distribution: Distribution): StepId[] {
  return [
    ...BASICS_STEPS,
    'goal',
    'diet',
    'training',
    'distribution',
    ...(distribution === 'shift' ? (['highDays'] as const) : []),
    'protein',
    'ready',
  ];
}

export function sectionOf(step: StepId): Section {
  return BASICS_STEPS.includes(step) ? 'basics' : 'program';
}

/** Progress bar fill (0 to 1) within the current step's section. */
export function sectionProgress(steps: StepId[], index: number): number {
  const step = steps[index];
  if (!step) return 0;
  const section = steps.filter((s) => sectionOf(s) === sectionOf(step));
  return (section.indexOf(step) + 1) / section.length;
}
