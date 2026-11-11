import { snapToStep } from '../components/RulerPicker';
import {
  ageOn,
  cmToInches,
  inchesToCm,
  kgToPounds,
  poundsToKg,
  validateProfile,
} from '../program/calculateProgram';
import type {
  AthleticLevel,
  DailyActivity,
  Diet,
  Distribution,
  ExerciseSessions,
  ExperienceLevel,
  Goal,
  ProgramAnswers,
  ProteinLevel,
  Sex,
  Training,
  Weekday,
  WeightTrend,
  YesNoNotSure,
} from '../program/types';
import type { StepId } from './steps';

export type BirthDate = { year: number; month: number; day: number }; // month: 0 = January
export type HeightValue = { unit: 'imperial'; inches: number } | { unit: 'metric'; cm: number };
export type WeightValue = { unit: 'lb' | 'kg'; value: number };

/** Everything the onboarding screens collect, before it's turned into ProgramAnswers. */
export type Draft = {
  sex?: Sex;
  birth: BirthDate;
  height: HeightValue;
  weight: WeightValue;
  weighedMore?: YesNoNotSure;
  recentTrend?: WeightTrend;
  /** A body fat range label, or 'notSure'. */
  bodyFat?: string;
  exerciseSessions?: ExerciseSessions;
  dailyActivity?: DailyActivity;
  liftingExperience?: ExperienceLevel;
  cardioExperience?: ExperienceLevel;
  athleticLevel?: AthleticLevel;
  expenditureOverride: number | null;
  goal: Goal;
  diet: Diet;
  training: Training;
  distribution: Distribution;
  highDays: Weekday[];
  protein: ProteinLevel;
};

export const HEIGHT_INCHES = { min: 48, max: 90 }; // 4'0" to 7'6"
export const HEIGHT_CM = { min: 122, max: 229 };
export const WEIGHT_LB = { min: 80, max: 660, step: 0.2 };
export const WEIGHT_KG = { min: 36, max: 300, step: 0.1 };
export const MIN_AGE = 18;
export const MAX_AGE = 100;

export function createDraft(today: Date): Draft {
  return {
    birth: { year: today.getFullYear() - 25, month: 0, day: 1 },
    height: { unit: 'imperial', inches: 67 },
    weight: { unit: 'lb', value: 160 },
    expenditureOverride: null,
    goal: 'maintain',
    diet: 'balanced',
    training: 'none',
    distribution: 'even',
    highDays: [],
    protein: 'moderate',
  };
}

// ---- Birthday ----

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Birth years from oldest to youngest allowed age, oldest first. */
export function birthYears(today: Date): number[] {
  const newest = today.getFullYear() - MIN_AGE;
  const oldest = today.getFullYear() - MAX_AGE;
  return Array.from({ length: newest - oldest + 1 }, (_, i) => oldest + i);
}

/** Keeps the day valid when the month or year changes (e.g. Mar 31 -> Feb 28). */
export function clampBirthDay(birth: BirthDate): BirthDate {
  return { ...birth, day: Math.min(birth.day, daysInMonth(birth.year, birth.month)) };
}

export function birthdayError(birth: BirthDate, today: Date): string | null {
  const age = ageOn(birth, today);
  if (age < MIN_AGE) return 'NedNutrition is for adults 18 and over.';
  if (age > MAX_AGE) return 'Please check your birth year.';
  return null;
}

// ---- Height and weight ----

export function heightInCm(height: HeightValue): number {
  return height.unit === 'imperial' ? inchesToCm(height.inches) : height.cm;
}

export function formatInches(inches: number): string {
  return `${Math.floor(inches / 12)} ft ${inches % 12} in`;
}

export function convertHeight(height: HeightValue, unit: HeightValue['unit']): HeightValue {
  if (height.unit === unit) return height;
  if (unit === 'metric') {
    const cm = Math.round(heightInCm(height));
    return { unit, cm: Math.min(Math.max(cm, HEIGHT_CM.min), HEIGHT_CM.max) };
  }
  const inches = Math.round(cmToInches(heightInCm(height)));
  return { unit, inches: Math.min(Math.max(inches, HEIGHT_INCHES.min), HEIGHT_INCHES.max) };
}

export function weightInKg(weight: WeightValue): number {
  return weight.unit === 'lb' ? poundsToKg(weight.value) : weight.value;
}

export function convertWeight(weight: WeightValue, unit: WeightValue['unit']): WeightValue {
  if (weight.unit === unit) return weight;
  if (unit === 'kg') {
    return { unit, value: snapToStep(weightInKg(weight), WEIGHT_KG.min, WEIGHT_KG.max, 0.1) };
  }
  return {
    unit,
    value: snapToStep(kgToPounds(weight.value), WEIGHT_LB.min, WEIGHT_LB.max, WEIGHT_LB.step),
  };
}

/** The "Have you ever weighed more than…" question uses 10% above today's weight. */
export function weighedMoreThreshold(weight: WeightValue): string {
  const amount = Math.round(weight.value * 1.1);
  return `${amount} ${weight.unit === 'lb' ? 'pounds' : 'kilograms'}`;
}

// ---- Body fat ----

export type BodyFatRange = { label: string; midpoint: number };

function ranges(bounds: [number, number | null][]): BodyFatRange[] {
  return bounds.map(([low, high]) =>
    high === null
      ? { label: `${low}%+`, midpoint: low + 2 }
      : { label: `${low}–${high}%`, midpoint: (low + high) / 2 },
  );
}

const MALE_BODY_FAT = ranges([
  [3, 4],
  [5, 7],
  [8, 12],
  [13, 17],
  [18, 23],
  [24, 29],
  [30, 34],
  [35, 39],
  [40, null],
]);

const FEMALE_BODY_FAT = ranges([
  [10, 13],
  [14, 17],
  [18, 22],
  [23, 27],
  [28, 32],
  [33, 37],
  [38, 42],
  [43, 47],
  [48, null],
]);

export function bodyFatRanges(sex: Sex | undefined): BodyFatRange[] {
  return sex === 'female' ? FEMALE_BODY_FAT : MALE_BODY_FAT;
}

/** The chosen range's midpoint, or null for "Not sure" or a range from the other sex's list. */
export function bodyFatPercent(sex: Sex | undefined, choice: string | undefined): number | null {
  return bodyFatRanges(sex).find((r) => r.label === choice)?.midpoint ?? null;
}

function isValidBodyFatChoice(draft: Draft): boolean {
  return draft.bodyFat === 'notSure' || bodyFatPercent(draft.sex, draft.bodyFat) !== null;
}

// ---- Putting it together ----

/** Turns a finished draft into program answers, or null when something is missing or invalid. */
export function toAnswers(draft: Draft, today: Date): ProgramAnswers | null {
  const {
    sex,
    weighedMore,
    recentTrend,
    exerciseSessions,
    dailyActivity,
    liftingExperience,
    cardioExperience,
    athleticLevel,
  } = draft;
  if (
    !sex ||
    !weighedMore ||
    !recentTrend ||
    !exerciseSessions ||
    !dailyActivity ||
    !liftingExperience ||
    !cardioExperience ||
    !athleticLevel ||
    !isValidBodyFatChoice(draft)
  ) {
    return null;
  }

  const profile = {
    sex,
    age: ageOn(draft.birth, today),
    heightCm: heightInCm(draft.height),
    weightKg: weightInKg(draft.weight),
    bodyFatPercent: bodyFatPercent(sex, draft.bodyFat),
  };
  if (validateProfile(profile)) return null;

  return {
    profile,
    activity: { exerciseSessions, dailyActivity, athleticLevel },
    history: { weighedMore, recentTrend, liftingExperience, cardioExperience },
    expenditureOverride: draft.expenditureOverride,
    goal: draft.goal,
    diet: draft.diet,
    training: draft.training,
    distribution: draft.distribution,
    highDays: draft.highDays,
    protein: draft.protein,
  };
}

/** Whether the Next button is enabled on a step. */
export function canContinue(step: StepId, draft: Draft, today: Date): boolean {
  switch (step) {
    case 'sex':
      return draft.sex !== undefined;
    case 'birthday':
      return birthdayError(draft.birth, today) === null;
    case 'weighedMore':
      return draft.weighedMore !== undefined;
    case 'weightTrend':
      return draft.recentTrend !== undefined;
    case 'bodyFat':
      return isValidBodyFatChoice(draft);
    case 'exercise':
      return draft.exerciseSessions !== undefined;
    case 'dailyActivity':
      return draft.dailyActivity !== undefined;
    case 'lifting':
      return draft.liftingExperience !== undefined;
    case 'cardio':
      return draft.cardioExperience !== undefined;
    case 'athletic':
      return draft.athleticLevel !== undefined;
    case 'highDays':
      return draft.highDays.length > 0;
    case 'ready':
      return toAnswers(draft, today) !== null;
    default:
      return true;
  }
}
