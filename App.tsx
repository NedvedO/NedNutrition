import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConsentScreen } from './src/consent/ConsentScreen';
import { dateKey } from './src/dates';
import { MainTabs } from './src/main/MainTabs';
import { NextStepsScreen } from './src/onboarding/NextStepsScreen';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import type { MacroProgram, ProgramAnswers } from './src/program/types';
import {
  clearState,
  loadState,
  type Preferences,
  type SavedState,
  saveState,
  type StateInput,
  upsertByDate,
} from './src/storage/appState';
import { colors } from './src/theme';
import { WelcomeCarousel } from './src/welcome/WelcomeCarousel';
import { WhatYouGetScreen } from './src/welcome/WhatYouGetScreen';

type Stage =
  | { name: 'loading' }
  | { name: 'welcome' }
  | { name: 'whatYouGet' }
  | { name: 'consent' }
  /** `redo` is set when redoing setup, so Back returns to the app. */
  | { name: 'onboarding'; redo: boolean }
  | { name: 'nextSteps' }
  | { name: 'main' };

/** Builds the saved state after setup, keeping any history from before a redo. */
function withNewProgram(
  previous: SavedState | null,
  consentAcceptedAt: string,
  program: MacroProgram,
  answers: ProgramAnswers,
  weightUnit: Preferences['weightUnit'],
): StateInput {
  const today = dateKey(new Date());
  const percent = answers.profile.bodyFatPercent;
  const bodyFatEntries = previous?.bodyFatEntries ?? [];
  return {
    consentAcceptedAt,
    answers,
    program,
    preferences: { ...previous?.preferences, weightUnit },
    weighIns: upsertByDate(previous?.weighIns ?? [], { date: today, kg: answers.profile.weightKg }),
    bodyFatEntries:
      percent === null ? bodyFatEntries : upsertByDate(bodyFatEntries, { date: today, percent }),
    foodLog: previous?.foodLog ?? [],
  };
}

export default function App() {
  const [stage, setStage] = useState<Stage>({ name: 'loading' });
  const [saved, setSaved] = useState<SavedState | null>(null);
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<string | null>(null);

  // Returning users skip setup and go straight to the dashboard.
  useEffect(() => {
    loadState().then((state) => {
      if (state) {
        setSaved(state);
        setConsentAcceptedAt(state.consentAcceptedAt);
        setStage({ name: 'main' });
      } else {
        setStage({ name: 'welcome' });
      }
    });
  }, []);

  const persist = (input: StateInput) => {
    // Show the change right away; saving can fail (e.g. a full disk) without breaking the session.
    setSaved({ version: 2, savedAt: new Date().toISOString(), ...input });
    saveState(input).catch(() => {});
  };

  const finishSetup = (
    program: MacroProgram,
    answers: ProgramAnswers,
    weightUnit: Preferences['weightUnit'],
    redo: boolean,
  ) => {
    const acceptedAt = consentAcceptedAt ?? new Date().toISOString();
    persist(withNewProgram(saved, acceptedAt, program, answers, weightUnit));
    setStage(redo ? { name: 'main' } : { name: 'nextSteps' });
  };

  const deleteData = async () => {
    await clearState().catch(() => {});
    setSaved(null);
    setConsentAcceptedAt(null);
    setStage({ name: 'welcome' });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {stage.name === 'loading' && <View style={{ flex: 1, backgroundColor: colors.background }} />}
      {stage.name === 'welcome' && (
        <WelcomeCarousel onFinish={() => setStage({ name: 'whatYouGet' })} />
      )}
      {stage.name === 'whatYouGet' && (
        <WhatYouGetScreen
          onBack={() => setStage({ name: 'welcome' })}
          onContinue={() => setStage({ name: 'consent' })}
        />
      )}
      {stage.name === 'consent' && (
        <ConsentScreen
          onBack={() => setStage({ name: 'whatYouGet' })}
          onAccept={() => {
            setConsentAcceptedAt(new Date().toISOString());
            setStage({ name: 'onboarding', redo: false });
          }}
        />
      )}
      {stage.name === 'onboarding' && (
        <OnboardingFlow
          onExit={() => setStage(stage.redo ? { name: 'main' } : { name: 'consent' })}
          onComplete={(program, answers, weightUnit) =>
            finishSetup(program, answers, weightUnit, stage.redo)
          }
        />
      )}
      {stage.name === 'nextSteps' && (
        <NextStepsScreen onContinue={() => setStage({ name: 'main' })} />
      )}
      {stage.name === 'main' && saved && (
        <MainTabs
          state={saved}
          onRedoSetup={() => setStage({ name: 'onboarding', redo: true })}
          onChangePreferences={(preferences) => persist({ ...saved, preferences })}
          onDeleteData={deleteData}
        />
      )}
    </SafeAreaProvider>
  );
}
