import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DashboardLayout } from '../dashboard/layout';
import { dateKey } from '../dates';
import type { LogEntry } from '../nutrition/types';
import type { MacroProgram, ProgramAnswers } from '../program/types';

export type WeighIn = { date: string; kg: number };
export type BodyFatEntry = { date: string; percent: number };
export type Preferences = {
  weightUnit: 'lb' | 'kg';
  /** The user's dashboard arrangement; missing means the default layout. */
  dashboard?: DashboardLayout;
};

/** Everything NedNutrition keeps between launches. It is stored only on this device. */
export type SavedState = {
  version: 2;
  /** When the user accepted the health disclaimer and data notice (ISO date). */
  consentAcceptedAt: string;
  answers: ProgramAnswers;
  program: MacroProgram;
  preferences: Preferences;
  weighIns: WeighIn[];
  bodyFatEntries: BodyFatEntry[];
  foodLog: LogEntry[];
  savedAt: string;
};

export type StateInput = Omit<SavedState, 'version' | 'savedAt'>;

const STORAGE_KEY = 'nednutrition/state';

function hasProgram(data: Omit<Partial<SavedState>, 'version'>): boolean {
  return (
    typeof data.consentAcceptedAt === 'string' &&
    !!data.answers &&
    Array.isArray(data.program?.days) &&
    data.program.days.length === 7
  );
}

/** Upgrades data saved by version 1, which only had answers and a program. */
function migrateV1(data: Omit<Partial<SavedState>, 'version'>): SavedState {
  const answers = data.answers as ProgramAnswers;
  const date = dateKey(data.savedAt ? new Date(data.savedAt) : new Date());
  const percent = answers.profile.bodyFatPercent;
  return {
    version: 2,
    consentAcceptedAt: data.consentAcceptedAt as string,
    answers,
    program: data.program as MacroProgram,
    preferences: { weightUnit: 'lb' },
    weighIns: [{ date, kg: answers.profile.weightKg }],
    bodyFatEntries: percent === null ? [] : [{ date, percent }],
    foodLog: [],
    savedAt: data.savedAt ?? new Date().toISOString(),
  };
}

/** Reads saved state, returning null for missing, corrupt or unknown data. */
export function parseState(raw: string | null): SavedState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Omit<Partial<SavedState>, 'version'> & { version?: number };
    if (!hasProgram(data)) return null;
    if (data.version === 1) return migrateV1(data);
    if (
      data.version !== 2 ||
      !Array.isArray(data.weighIns) ||
      !Array.isArray(data.bodyFatEntries) ||
      !Array.isArray(data.foodLog) ||
      !data.preferences
    ) {
      return null;
    }
    return data as SavedState;
  } catch {
    return null;
  }
}

export async function loadState(): Promise<SavedState | null> {
  try {
    return parseState(await AsyncStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export async function saveState(state: StateInput): Promise<SavedState> {
  const saved: SavedState = { version: 2, savedAt: new Date().toISOString(), ...state };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

/** Deletes everything NedNutrition has saved. */
export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Adds an entry, replacing any existing entry for the same day, sorted oldest first. */
export function upsertByDate<T extends { date: string }>(list: T[], entry: T): T[] {
  return [...list.filter((e) => e.date !== entry.date), entry].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
