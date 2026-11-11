import { calculateProgram } from '../program/calculateProgram';
import type { ProgramAnswers } from '../program/types';
import { clearState, loadState, parseState, saveState } from './appState';

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

const state = {
  consentAcceptedAt: '2026-11-10T12:00:00.000Z',
  answers,
  program: calculateProgram(answers),
};

describe('saving and loading', () => {
  beforeEach(() => clearState());

  it('returns null when nothing has been saved', async () => {
    expect(await loadState()).toBeNull();
  });

  it('loads what was saved', async () => {
    await saveState(state);
    const loaded = await loadState();
    expect(loaded?.version).toBe(1);
    expect(loaded?.answers).toEqual(answers);
    expect(loaded?.program).toEqual(state.program);
  });

  it('forgets everything after clearing', async () => {
    await saveState(state);
    await clearState();
    expect(await loadState()).toBeNull();
  });
});

describe('parseState', () => {
  it('rejects corrupt or outdated data instead of crashing', () => {
    expect(parseState('not json')).toBeNull();
    expect(parseState(JSON.stringify({ version: 2 }))).toBeNull();
    expect(parseState(JSON.stringify({ ...state, version: 1, program: { days: [] } }))).toBeNull();
  });
});
