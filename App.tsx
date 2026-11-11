import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConsentScreen } from './src/consent/ConsentScreen';
import { HomePlaceholder } from './src/home/HomePlaceholder';
import { NextStepsScreen } from './src/onboarding/NextStepsScreen';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import type { MacroProgram } from './src/program/types';
import { WelcomeCarousel } from './src/welcome/WelcomeCarousel';
import { WhatYouGetScreen } from './src/welcome/WhatYouGetScreen';

type Stage =
  | { name: 'welcome' }
  | { name: 'whatYouGet' }
  | { name: 'consent' }
  /** `previous` is set when redoing setup, so Back returns to the existing program. */
  | { name: 'onboarding'; previous?: MacroProgram }
  | { name: 'nextSteps'; program: MacroProgram }
  | { name: 'home'; program: MacroProgram };

export default function App() {
  // Not saved yet: the app starts at the welcome screens every launch.
  const [stage, setStage] = useState<Stage>({ name: 'welcome' });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
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
          onAccept={() => setStage({ name: 'onboarding' })}
        />
      )}
      {stage.name === 'onboarding' && (
        <OnboardingFlow
          onExit={() =>
            setStage(
              stage.previous ? { name: 'home', program: stage.previous } : { name: 'consent' },
            )
          }
          onComplete={(program) =>
            setStage(stage.previous ? { name: 'home', program } : { name: 'nextSteps', program })
          }
        />
      )}
      {stage.name === 'nextSteps' && (
        <NextStepsScreen onContinue={() => setStage({ name: 'home', program: stage.program })} />
      )}
      {stage.name === 'home' && (
        <HomePlaceholder
          program={stage.program}
          onRestart={() => setStage({ name: 'onboarding', previous: stage.program })}
        />
      )}
    </SafeAreaProvider>
  );
}
