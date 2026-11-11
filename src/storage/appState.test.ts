import { calculateProgram } from '../program/calculateProgram';
import type { ProgramAnswers } from '../program/types';
import {
  clearState,
  loadState,
  parseState,
  saveState,
  type StateInput,
  upsertByDate,
} from './appState';

// Jest uses the package's in-memory mock (see "moduleNameMapper" in package.json).

const answers: ProgramAnswers = {
  profile: { sex: 'female', age: 30, heightCm: 165, weightKg: 63.5, bodyFatPercent: null },
  activity: { exerciseSessions: '1-3', dailyActivity: 'moderate', athleticLevel: 'regular' },
  history: {
    weighedMore: 'no',
    recentTrend: 'stable',
    liftingExperience: 'none',
    cardioExperience: 'beginner',
  },
  expenditureOverride: null,
  goal: 'maintain',
  diet: 'balanced',
  training: 'cardio',
  distribution: 'even',
  highDays: [],
  protein: 'moderate',
};

const state: StateInput = {
  consentAcceptedAt: '2026-11-10T12:00:00.000Z',
  answers,
  program: calculateProgram(answers),
  preferences: { weightUnit: 'kg' },
  weighIns: [{ date: '2026-11-10', kg: 63.5 }],
  bodyFatEntries: [],
  foodLog: [],
};

describe('saving and loading', () => {
  beforeEach(() => clearState());

  it('returns null when nothing has been saved', async () => {
    expect(await loadState()).toBeNull();
  });

  it('loads what was saved', async () => {
    await saveState(state);
    const loaded = await loadState();
    expect(loaded?.version).toBe(2);
    expect(loaded?.answers).toEqual(answers);
    expect(loaded?.program).toEqual(state.program);
    expect(loaded?.weighIns).toEqual(state.weighIns);
    expect(loaded?.preferences.weightUnit).toBe('kg');
  });

  it('forgets everything after clearing', async () => {
    await saveState(state);
    await clearState();
    expect(await loadState()).toBeNull();
  });
});

describe('parseState', () => {
  it('rejects corrupt or unknown data instead of crashing', () => {
    expect(parseState('not json')).toBeNull();
    expect(parseState(JSON.stringify({ version: 2 }))).toBeNull();
    expect(parseState(JSON.stringify({ ...state, version: 3 }))).toBeNull();
    expect(parseState(JSON.stringify({ ...state, version: 2, program: { days: [] } }))).toBeNull();
  });

  it('upgrades version 1 data, turning the onboarding weight into the first weigh-in', () => {
    const v1 = {
      version: 1,
      consentAcceptedAt: state.consentAcceptedAt,
      answers: { ...answers, profile: { ...answers.profile, bodyFatPercent: 25 } },
      program: state.program,
      savedAt: new Date(2026, 10, 9, 15).toISOString(),
    };
    const upgraded = parseState(JSON.stringify(v1));
    expect(upgraded?.version).toBe(2);
    expect(upgraded?.weighIns).toEqual([{ date: '2026-11-09', kg: 63.5 }]);
    expect(upgraded?.bodyFatEntries).toEqual([{ date: '2026-11-09', percent: 25 }]);
    expect(upgraded?.foodLog).toEqual([]);
  });
});

describe('upsertByDate', () => {
  it('adds entries in date order and replaces the same day', () => {
    const list = [
      { date: '2026-11-08', kg: 70 },
      { date: '2026-11-10', kg: 69 },
    ];
    expect(upsertByDate(list, { date: '2026-11-09', kg: 69.5 }).map((e) => e.date)).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
    ]);
    expect(upsertByDate(list, { date: '2026-11-10', kg: 68.8 })).toEqual([
      { date: '2026-11-08', kg: 70 },
      { date: '2026-11-10', kg: 68.8 },
    ]);
  });
});
