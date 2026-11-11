import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomePlaceholder } from './src/home/HomePlaceholder';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import type { MacroProgram } from './src/program/types';
import { WelcomeCarousel } from './src/welcome/WelcomeCarousel';

type Stage = { name: 'welcome' } | { name: 'onboarding' } | { name: 'home'; program: MacroProgram };

export default function App() {
  // Not saved yet: the app starts at the welcome screens every launch.
  const [stage, setStage] = useState<Stage>({ name: 'welcome' });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {stage.name === 'welcome' && (
        <WelcomeCarousel onFinish={() => setStage({ name: 'onboarding' })} />
      )}
      {stage.name === 'onboarding' && (
        <OnboardingFlow
          onExit={() => setStage({ name: 'welcome' })}
          onComplete={(program) => setStage({ name: 'home', program })}
        />
      )}
      {stage.name === 'home' && (
        <HomePlaceholder
          program={stage.program}
          onRestart={() => setStage({ name: 'onboarding' })}
        />
      )}
    </SafeAreaProvider>
  );
}
