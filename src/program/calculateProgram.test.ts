import {
  activityMultiplier,
  ageOn,
  CALORIE_FLOOR,
  calculateProgram,
  cmToInches,
  dailyAdjustment,
  distributeCalories,
  estimateExpenditure,
  feetInchesToCm,
  isValidExpenditure,
  kgToPounds,
  poundsToKg,
  proteinGrams,
  restingEnergy,
  splitMacros,
  validateProfile,
} from './calculateProgram';
import type { ActivityProfile, BodyProfile, ProgramAnswers } from './types';

const profile: BodyProfile = {
  sex: 'male',
  age: 25,
  heightCm: 178,
  weightKg: 70,
  bodyFatPercent: null,
};

const activity: ActivityProfile = {
  exerciseSessions: '1-3',
  dailyActivity: 'moderate',
  athleticLevel: 'regular',
};

const answers: ProgramAnswers = {
  profile,
  activity,
  history: {
    weighedMore: 'no',
    recentTrend: 'stable',
    liftingExperience: 'beginner',
    cardioExperience: 'none',
  },
  expenditureOverride: null,
  goal: 'lose',
  diet: 'balanced',
  training: 'lifting',
  distribution: 'even',
  highDays: [],
  protein: 'moderate',
};

describe('restingEnergy', () => {
  it('uses Mifflin-St Jeor for men and women when body fat is unknown', () => {
    // 10*70 + 6.25*178 - 5*25 = 1687.5, then +5 for men or -161 for women
    expect(restingEnergy(profile)).toBe(1692.5);
    expect(restingEnergy({ ...profile, sex: 'female' })).toBe(1526.5);
  });

  it('uses Katch-McArdle (lean mass) when body fat is known', () => {
    // 70 kg at 20% fat = 56 kg lean; 370 + 21.6 * 56 = 1579.6
    expect(restingEnergy({ ...profile, bodyFatPercent: 20 })).toBeCloseTo(1579.6, 5);
  });
});

describe('activityMultiplier', () => {
  it('adds everyday activity, exercise and athletic level', () => {
    expect(
      activityMultiplier({
        exerciseSessions: '0',
        dailyActivity: 'sedentary',
        athleticLevel: 'regular',
      }),
    ).toBeCloseTo(1.2, 5);
    expect(activityMultiplier(activity)).toBeCloseTo(1.475, 5);
  });

  it('rises with more exercise and a higher athletic level', () => {
    expect(activityMultiplier({ ...activity, exerciseSessions: '4-6' })).toBeGreaterThan(
      activityMultiplier(activity),
    );
    expect(activityMultiplier({ ...activity, athleticLevel: 'athlete' })).toBeGreaterThan(
      activityMultiplier(activity),
    );
  });

  it('is capped for extreme answers', () => {
    expect(
      activityMultiplier({
        exerciseSessions: '7+',
        dailyActivity: 'veryActive',
        athleticLevel: 'professional',
      }),
    ).toBeLessThanOrEqual(2.2);
  });
});

describe('estimateExpenditure', () => {
  it('scales resting energy by the activity multiplier', () => {
    // 1692.5 * 1.475 = 2496.4
    expect(estimateExpenditure(profile, activity)).toBe(2496);
  });
});

describe('isValidExpenditure', () => {
  it('accepts values between 1,000 and 6,000 kcal', () => {
    expect(isValidExpenditure(2400)).toBe(true);
    expect(isValidExpenditure(999)).toBe(false);
    expect(isValidExpenditure(6001)).toBe(false);
    expect(isValidExpenditure(NaN)).toBe(false);
  });
});

describe('dailyAdjustment', () => {
  it('is a deficit for losing, zero for maintaining, a surplus for gaining', () => {
    expect(dailyAdjustment(70, 'lose')).toBe(-385);
    expect(dailyAdjustment(70, 'maintain')).toBe(0);
    expect(dailyAdjustment(70, 'gain')).toBe(193);
  });
});

describe('proteinGrams', () => {
  it('scales with body weight and preference', () => {
    expect(proteinGrams(70, 'low')).toBe(112);
    expect(proteinGrams(70, 'extraHigh')).toBe(175);
  });
});

describe('splitMacros', () => {
  it('fills the remaining calories with fat and carbs', () => {
    // 2000 - 150*4 = 1400 left; balanced: 40% fat, 60% carbs
    expect(splitMacros(2000, 150, 'balanced')).toEqual({ protein: 150, fat: 62, carbs: 210 });
  });

  it('gives low-fat less fat than low-carb', () => {
    const lowFat = splitMacros(2000, 150, 'lowFat');
    const lowCarb = splitMacros(2000, 150, 'lowCarb');
    expect(lowFat.fat).toBeLessThan(lowCarb.fat);
    expect(lowFat.carbs).toBeGreaterThan(lowCarb.carbs);
  });

  it('caps carbs at 30 g on keto', () => {
    expect(splitMacros(2000, 150, 'keto')).toEqual({ protein: 150, carbs: 30, fat: 142 });
  });

  it('never returns negative fat or carbs when protein uses every calorie', () => {
    expect(splitMacros(500, 200, 'balanced')).toEqual({ protein: 200, fat: 0, carbs: 0 });
  });
});

describe('distributeCalories', () => {
  const total = (days: { calories: number }[]) => days.reduce((sum, d) => sum + d.calories, 0);

  it('gives every day the average when distributing evenly', () => {
    const days = distributeCalories(2000, [0, 1], false);
    expect(days.every((d) => d.calories === 2000 && !d.isHighDay)).toBe(true);
  });

  it('raises high days and keeps the weekly total about the same', () => {
    const days = distributeCalories(2000, [0, 1, 3, 4, 5], true);
    expect(days[0].isHighDay).toBe(true);
    expect(days[2].isHighDay).toBe(false);
    expect(days[0].calories).toBeGreaterThan(days[2].calories);
    expect(Math.abs(total(days) - 14000)).toBeLessThanOrEqual(7);
  });

  it('falls back to even when no days or every day is high', () => {
    expect(new Set(distributeCalories(2000, [], true).map((d) => d.calories)).size).toBe(1);
    expect(
      new Set(distributeCalories(2000, [0, 1, 2, 3, 4, 5, 6], true).map((d) => d.calories)).size,
    ).toBe(1);
  });

  it('falls back to even rather than pushing normal days below the floor', () => {
    const days = distributeCalories(CALORIE_FLOOR, [0, 1, 2], true);
    expect(days.every((d) => d.calories === CALORIE_FLOOR)).toBe(true);
  });
});

describe('calculateProgram', () => {
  it('builds seven days of targets', () => {
    const program = calculateProgram(answers);
    expect(program.expenditure).toBe(2496);
    expect(program.expenditureIsCustom).toBe(false);
    expect(program.averageCalories).toBe(2111);
    expect(program.dailyAdjustment).toBe(-385);
    expect(program.hitCalorieFloor).toBe(false);
    expect(program.days).toHaveLength(7);
    expect(program.days[0]).toMatchObject({ calories: 2111, protein: 133 });
  });

  it('uses the expenditure the user typed in', () => {
    const program = calculateProgram({ ...answers, expenditureOverride: 2600 });
    expect(program.expenditure).toBe(2600);
    expect(program.expenditureIsCustom).toBe(true);
    expect(program.averageCalories).toBe(2215);
  });

  it('ignores an out-of-range custom expenditure', () => {
    const program = calculateProgram({ ...answers, expenditureOverride: 200 });
    expect(program.expenditure).toBe(2496);
    expect(program.expenditureIsCustom).toBe(false);
  });

  it('never targets less than the calorie floor', () => {
    const small: ProgramAnswers = {
      ...answers,
      profile: { sex: 'female', age: 70, heightCm: 150, weightKg: 45, bodyFatPercent: null },
      activity: { exerciseSessions: '0', dailyActivity: 'sedentary', athleticLevel: 'regular' },
      training: 'none',
    };
    const program = calculateProgram(small);
    expect(program.averageCalories).toBe(CALORIE_FLOOR);
    expect(program.hitCalorieFloor).toBe(true);
    expect(program.days.every((d) => d.calories >= CALORIE_FLOOR)).toBe(true);
  });
});

describe('unit conversion', () => {
  it('converts pounds, kilograms, feet/inches and centimeters', () => {
    expect(poundsToKg(154)).toBeCloseTo(69.85, 2);
    expect(kgToPounds(poundsToKg(154))).toBeCloseTo(154, 5);
    expect(feetInchesToCm(5, 10)).toBeCloseTo(177.8, 1);
    expect(cmToInches(177.8)).toBeCloseTo(70, 5);
  });
});

describe('ageOn', () => {
  const today = new Date(2026, 10, 10); // 10 Nov 2026

  it('counts a birthday earlier this year', () => {
    expect(ageOn({ year: 2000, month: 0, day: 22 }, today)).toBe(26);
  });

  it('counts a birthday today', () => {
    expect(ageOn({ year: 2000, month: 10, day: 10 }, today)).toBe(26);
  });

  it('does not count a birthday later this year', () => {
    expect(ageOn({ year: 2000, month: 10, day: 11 }, today)).toBe(25);
  });
});

describe('validateProfile', () => {
  it('accepts a normal adult profile', () => {
    expect(validateProfile(profile)).toBeNull();
  });

  it('rejects out-of-range or missing values', () => {
    expect(validateProfile({ ...profile, age: 15 })).toMatch(/age/);
    expect(validateProfile({ ...profile, heightCm: NaN })).toMatch(/height/);
    expect(validateProfile({ ...profile, weightKg: 20 })).toMatch(/weight/);
  });
});
