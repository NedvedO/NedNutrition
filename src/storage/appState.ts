import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MacroProgram, ProgramAnswers } from '../program/types';

/** Everything NedNutrition keeps between launches. It is stored only on this device. */
export type SavedState = {
  version: 1;
  /** When the user accepted the health disclaimer and data notice (ISO date). */
  consentAcceptedAt: string;
  answers: ProgramAnswers;
  program: MacroProgram;
  savedAt: string;
};

const STORAGE_KEY = 'nednutrition/state';

/** Reads saved state, returning null for missing, corrupt or outdated data. */
export function parseState(raw: string | null): SavedState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<SavedState>;
    if (
      data.version !== 1 ||
      typeof data.consentAcceptedAt !== 'string' ||
      !data.answers ||
      !Array.isArray(data.program?.days) ||
      data.program.days.length !== 7
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

export async function saveState(state: Omit<SavedState, 'version' | 'savedAt'>): Promise<void> {
  const saved: SavedState = { version: 1, savedAt: new Date().toISOString(), ...state };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

/** Deletes everything NedNutrition has saved. */
export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
