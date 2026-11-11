import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckRow } from '../components/CheckRow';
import { OptionList } from '../components/OptionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  calculateProgram,
  feetInchesToCm,
  poundsToKg,
  validateProfile,
  WEEKDAYS,
} from '../program/calculateProgram';
import type {
  BodyProfile,
  Diet,
  Distribution,
  Goal,
  MacroProgram,
  ProgramAnswers,
  ProteinLevel,
  Training,
  Weekday,
} from '../program/types';
import { colors, spacing, WEEKDAY_NAMES } from '../theme';
import { AboutYouStep, type AboutYouDraft } from './AboutYouStep';
import {
  DIET_OPTIONS,
  DISTRIBUTION_OPTIONS,
  GOAL_OPTIONS,
  PROTEIN_OPTIONS,
  TRAINING_OPTIONS,
} from './options';
import { ProgramReadyStep } from './ProgramReadyStep';
import { getSteps, stepProgress, type StepId } from './steps';

const QUESTIONS: Record<StepId, string> = {
  about: 'Tell us about yourself',
  goal: 'What is your goal?',
  diet: 'Which diet style do you prefer?',
  training: 'What training will you do during this program?',
  distribution: 'How should your calories be spread across the week?',
  highDays: 'Which days should have more calories?',
  protein: 'How much protein do you want?',
  ready: 'Your macro program is ready',
};

type Props = {
  onExit: () => void;
  onComplete: (program: MacroProgram, answers: ProgramAnswers) => void;
};

function toProfile(draft: AboutYouDraft): BodyProfile | null {
  if (!draft.sex) return null;
  return {
    sex: draft.sex,
    age: Number(draft.age),
    heightCm: feetInchesToCm(Number(draft.feet), Number(draft.inches || 0)),
    weightKg: poundsToKg(Number(draft.pounds)),
  };
}

export function OnboardingFlow({ onExit, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [aboutYou, setAboutYou] = useState<AboutYouDraft>({
    sex: undefined,
    age: '',
    feet: '',
    inches: '',
    pounds: '',
  });
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [diet, setDiet] = useState<Diet>('balanced');
  const [training, setTraining] = useState<Training>('none');
  const [distribution, setDistribution] = useState<Distribution>('even');
  const [highDays, setHighDays] = useState<Weekday[]>([]);
  const [protein, setProtein] = useState<ProteinLevel>('moderate');

  const steps = getSteps(distribution);
  const step = steps[index];
  const profile = toProfile(aboutYou);

  const answers: ProgramAnswers | null = profile
    ? { profile, goal, diet, training, distribution, highDays, protein }
    : null;

  const program = step === 'ready' && answers ? calculateProgram(answers) : null;

  const goBack = () => (index === 0 ? onExit() : setIndex(index - 1));

  const goNext = () => {
    if (step === 'about') {
      const error = profile ? validateProfile(profile) : 'Select your sex.';
      setAboutError(error);
      if (error) return;
    }
    if (step === 'ready') {
      if (program && answers) onComplete(program, answers);
      return;
    }
    setIndex(index + 1);
  };

  const toggleDay = (day: Weekday) =>
    setHighDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b),
    );

  const canContinue = step !== 'highDays' || highDays.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <ScreenHeader
            title="Build Your Program"
            onBack={goBack}
            progress={stepProgress(index, steps.length)}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.question}>
            {QUESTIONS[step]}
          </Text>

          {step === 'about' && (
            <AboutYouStep draft={aboutYou} onChange={setAboutYou} error={aboutError} />
          )}
          {step === 'goal' && (
            <OptionList options={GOAL_OPTIONS} selected={goal} onSelect={setGoal} />
          )}
          {step === 'diet' && (
            <OptionList options={DIET_OPTIONS} selected={diet} onSelect={setDiet} />
          )}
          {step === 'training' && (
            <OptionList options={TRAINING_OPTIONS} selected={training} onSelect={setTraining} />
          )}
          {step === 'distribution' && (
            <OptionList
              options={DISTRIBUTION_OPTIONS}
              selected={distribution}
              onSelect={setDistribution}
            />
          )}
          {step === 'highDays' && (
            <View>
              {WEEKDAYS.map((day) => (
                <CheckRow
                  key={day}
                  label={WEEKDAY_NAMES[day]}
                  checked={highDays.includes(day)}
                  onToggle={() => toggleDay(day)}
                />
              ))}
            </View>
          )}
          {step === 'protein' && (
            <OptionList options={PROTEIN_OPTIONS} selected={protein} onSelect={setProtein} />
          )}
          {step === 'ready' && program && (
            <ProgramReadyStep
              program={program}
              goal={goal}
              proteinPerPound={PROTEIN_OPTIONS.find(
                (o) => o.value === protein,
              )!.description!.replace('About ', 'about ')}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={step === 'ready' ? 'Done' : 'Next'}
            onPress={goNext}
            disabled={!canContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.screen },
  content: { paddingHorizontal: spacing.screen, paddingBottom: 24 },
  question: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginTop: 28,
    marginBottom: 28,
  },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 8 },
});
