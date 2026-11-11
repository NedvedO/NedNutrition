import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConsentScreen } from './src/consent/ConsentScreen';
import { HomePlaceholder } from './src/home/HomePlaceholder';
import { NextStepsScreen } from './src/onboarding/NextStepsScreen';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import type { MacroProgram, ProgramAnswers } from './src/program/types';
import { clearState, loadState, saveState } from './src/storage/appState';
import { colors } from './src/theme';
import { WelcomeCarousel } from './src/welcome/WelcomeCarousel';
import { WhatYouGetScreen } from './src/welcome/WhatYouGetScreen';

type Stage =
  | { name: 'loading' }
  | { name: 'welcome' }
  | { name: 'whatYouGet' }
  | { name: 'consent' }
  /** `previous` is set when redoing setup, so Back returns to the existing program. */
  | { name: 'onboarding'; previous?: MacroProgram }
  | { name: 'nextSteps'; program: MacroProgram }
  | { name: 'home'; program: MacroProgram };

export default function App() {
  const [stage, setStage] = useState<Stage>({ name: 'loading' });
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<string | null>(null);

  // Returning users skip setup and go straight home.
  useEffect(() => {
    loadState().then((saved) => {
      if (saved) {
        setConsentAcceptedAt(saved.consentAcceptedAt);
        setStage({ name: 'home', program: saved.program });
      } else {
        setStage({ name: 'welcome' });
      }
    });
  }, []);

  const finishSetup = (program: MacroProgram, answers: ProgramAnswers, redo: boolean) => {
    const acceptedAt = consentAcceptedAt ?? new Date().toISOString();
    // Saving can fail (e.g. a full disk); the app still works for this session.
    saveState({ consentAcceptedAt: acceptedAt, answers, program }).catch(() => {});
    setStage(redo ? { name: 'home', program } : { name: 'nextSteps', program });
  };

  const deleteData = async () => {
    await clearState().catch(() => {});
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
            setStage({ name: 'onboarding' });
          }}
        />
      )}
      {stage.name === 'onboarding' && (
        <OnboardingFlow
          onExit={() =>
            setStage(
              stage.previous ? { name: 'home', program: stage.previous } : { name: 'consent' },
            )
          }
          onComplete={(program, answers) => finishSetup(program, answers, !!stage.previous)}
        />
      )}
      {stage.name === 'nextSteps' && (
        <NextStepsScreen onContinue={() => setStage({ name: 'home', program: stage.program })} />
      )}
      {stage.name === 'home' && (
        <HomePlaceholder
          program={stage.program}
          onRestart={() => setStage({ name: 'onboarding', previous: stage.program })}
          onDeleteData={deleteData}
        />
      )}
    </SafeAreaProvider>
  );
}
