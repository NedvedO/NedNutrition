import {
  birthYears,
  birthdayError,
  bodyFatPercent,
  bodyFatRanges,
  canContinue,
  clampBirthDay,
  convertHeight,
  convertWeight,
  createDraft,
  daysInMonth,
  type Draft,
  formatInches,
  heightInCm,
  toAnswers,
  weighedMoreThreshold,
  weightInKg,
} from './draft';

const today = new Date(2026, 10, 10); // 10 Nov 2026

function completeDraft(): Draft {
  return {
    ...createDraft(today),
    sex: 'male',
    birth: { year: 2001, month: 0, day: 22 },
    height: { unit: 'imperial', inches: 70 },
    weight: { unit: 'lb', value: 154 },
    weighedMore: 'no',
    recentTrend: 'stable',
    bodyFat: 'notSure',
    exerciseSessions: '1-3',
    dailyActivity: 'moderate',
    liftingExperience: 'beginner',
    cardioExperience: 'none',
    athleticLevel: 'regular',
  };
}

describe('birthday helpers', () => {
  it('knows month lengths, including leap years', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2026, 0)).toBe(31);
  });

  it('clamps the day when the month gets shorter', () => {
    expect(clampBirthDay({ year: 2026, month: 1, day: 31 }).day).toBe(28);
  });

  it('offers birth years for ages 18 to 100', () => {
    const years = birthYears(today);
    expect(years[0]).toBe(1926);
    expect(years[years.length - 1]).toBe(2008);
  });

  it('rejects anyone under 18', () => {
    expect(birthdayError({ year: 2008, month: 11, day: 1 }, today)).toMatch(/18/);
    expect(birthdayError({ year: 2008, month: 0, day: 1 }, today)).toBeNull();
  });
});

describe('height and weight', () => {
  it('formats and converts height', () => {
    expect(formatInches(68)).toBe('5 ft 8 in');
    expect(convertHeight({ unit: 'imperial', inches: 70 }, 'metric')).toEqual({
      unit: 'metric',
      cm: 178,
    });
    expect(convertHeight({ unit: 'metric', cm: 178 }, 'imperial')).toEqual({
      unit: 'imperial',
      inches: 70,
    });
    expect(heightInCm({ unit: 'imperial', inches: 70 })).toBeCloseTo(177.8, 5);
  });

  it('converts weight between pounds and kilograms', () => {
    expect(convertWeight({ unit: 'lb', value: 154 }, 'kg')).toEqual({ unit: 'kg', value: 69.9 });
    expect(convertWeight({ unit: 'kg', value: 70 }, 'lb')).toEqual({ unit: 'lb', value: 154.4 });
    expect(weightInKg({ unit: 'kg', value: 70 })).toBe(70);
  });

  it('asks about weighing 10% more than today', () => {
    expect(weighedMoreThreshold({ unit: 'lb', value: 164 })).toBe('180 pounds');
    expect(weighedMoreThreshold({ unit: 'kg', value: 70 })).toBe('77 kilograms');
  });
});

describe('body fat', () => {
  it('has nine ranges per sex, with different ranges for women', () => {
    expect(bodyFatRanges('male')).toHaveLength(9);
    expect(bodyFatRanges('female')[0].label).not.toBe(bodyFatRanges('male')[0].label);
  });

  it('uses the middle of the chosen range', () => {
    expect(bodyFatPercent('male', '18–23%')).toBe(20.5);
    expect(bodyFatPercent('male', '40%+')).toBe(42);
  });

  it('returns null for "Not sure" or a range from the other list', () => {
    expect(bodyFatPercent('male', 'notSure')).toBeNull();
    expect(bodyFatPercent('female', '3–4%')).toBeNull();
  });
});

describe('toAnswers', () => {
  it('builds program answers from a complete draft', () => {
    const answers = toAnswers(completeDraft(), today);
    expect(answers?.profile).toMatchObject({ sex: 'male', age: 25, bodyFatPercent: null });
    expect(answers?.profile.weightKg).toBeCloseTo(69.85, 2);
    expect(answers?.history.recentTrend).toBe('stable');
  });

  it('returns null while a question is unanswered', () => {
    expect(toAnswers({ ...completeDraft(), athleticLevel: undefined }, today)).toBeNull();
  });
});

describe('canContinue', () => {
  it('requires an answer on the Basics questions', () => {
    const draft = createDraft(today);
    expect(canContinue('sex', draft, today)).toBe(false);
    expect(canContinue('sex', { ...draft, sex: 'female' }, today)).toBe(true);
    expect(canContinue('bodyFat', { ...draft, bodyFat: 'notSure' }, today)).toBe(true);
  });

  it('needs a body fat range that matches the chosen sex', () => {
    const draft = { ...completeDraft(), sex: 'female' as const, bodyFat: '3–4%' };
    expect(canContinue('bodyFat', draft, today)).toBe(false);
  });

  it('lets optional screens through', () => {
    const draft = createDraft(today);
    expect(canContinue('healthSync', draft, today)).toBe(true);
    expect(canContinue('expenditure', draft, today)).toBe(true);
  });

  it('needs at least one high day', () => {
    expect(canContinue('highDays', completeDraft(), today)).toBe(false);
    expect(canContinue('highDays', { ...completeDraft(), highDays: [5] }, today)).toBe(true);
  });
});
