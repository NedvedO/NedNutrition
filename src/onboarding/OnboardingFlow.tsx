import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckRow } from '../components/CheckRow';
import { OptionList } from '../components/OptionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { calculateProgram, estimateExpenditure, WEEKDAYS } from '../program/calculateProgram';
import type { MacroProgram, ProgramAnswers, Weekday } from '../program/types';
import { colors, spacing, WEEKDAY_NAMES } from '../theme';
import {
  BirthdayStep,
  BodyFatStep,
  ExpenditureStep,
  HealthSyncStep,
  HeightStep,
  InfoBox,
  WeightStep,
} from './BasicsSteps';
import {
  birthdayError,
  canContinue,
  createDraft,
  type Draft,
  toAnswers,
  weighedMoreThreshold,
} from './draft';
import {
  ATHLETIC_OPTIONS,
  CARDIO_OPTIONS,
  DAILY_ACTIVITY_OPTIONS,
  DIET_OPTIONS,
  DISTRIBUTION_OPTIONS,
  EXERCISE_OPTIONS,
  GOAL_OPTIONS,
  LIFTING_OPTIONS,
  PROTEIN_OPTIONS,
  SEX_OPTIONS,
  TRAINING_OPTIONS,
  WEIGHED_MORE_OPTIONS,
  WEIGHT_TREND_OPTIONS,
} from './options';
import { ProgramReadyStep } from './ProgramReadyStep';
import { getSteps, sectionOf, sectionProgress, type StepId } from './steps';

const SECTION_TITLES = { basics: 'Basics', program: 'Build Your Program' } as const;

function question(step: StepId, draft: Draft): string | null {
  switch (step) {
    case 'healthSync':
      return 'Sync your health data (optional)';
    case 'sex':
      return 'What is your sex?';
    case 'birthday':
      return 'When were you born?';
    case 'height':
      return 'How tall are you?';
    case 'weight':
      return 'How much do you weigh?';
    case 'weighedMore':
      return `Have you ever weighed more than ${weighedMoreThreshold(draft.weight)}?`;
    case 'weightTrend':
      return 'How has your weight changed over the past few weeks?';
    case 'bodyFat':
      return 'About how much body fat do you have?';
    case 'exercise':
      return 'How often do you exercise?';
    case 'dailyActivity':
      return 'How active are you day to day?';
    case 'lifting':
      return 'How experienced are you with lifting?';
    case 'cardio':
      return 'How experienced are you with cardio?';
    case 'athletic':
      return 'Which best describes you?';
    case 'expenditure':
      return null; // this step is a short conversation instead of a question
    case 'goal':
      return 'What is your goal?';
    case 'diet':
      return 'Which diet style do you prefer?';
    case 'training':
      return 'What training will you do during this program?';
    case 'distribution':
      return 'How should your calories be spread across the week?';
    case 'highDays':
      return 'Which days should have more calories?';
    case 'protein':
      return 'How much protein do you want?';
    case 'ready':
      return 'Your macro program is ready';
  }
}

const SUBTITLES: Partial<Record<StepId, string>> = {
  bodyFat: 'A rough guess is fine. Pick “Not sure” if you have no idea.',
  exercise: 'Count sports, cardio and strength training sessions.',
  dailyActivity: 'Your movement outside of exercise, at work and in your free time.',
};

type Props = {
  onExit: () => void;
  onComplete: (
    program: MacroProgram,
    answers: ProgramAnswers,
    weightUnit: Draft['weight']['unit'],
  ) => void;
};

export function OnboardingFlow({ onExit, onComplete }: Props) {
  const [today] = useState(() => new Date());
  const [draft, setDraft] = useState<Draft>(() => createDraft(today));
  const [index, setIndex] = useState(0);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const steps = getSteps(draft.distribution);
  const step = steps[index];
  const answers = toAnswers(draft, today);
  const program = step === 'ready' && answers ? calculateProgram(answers) : null;
  const estimate = answers ? estimateExpenditure(answers.profile, answers.activity) : 0;

  const goBack = () => (index === 0 ? onExit() : setIndex(index - 1));
  const goNext = () => {
    if (step === 'ready') {
      if (program && answers) onComplete(program, answers, draft.weight.unit);
      return;
    }
    setIndex(index + 1);
  };

  const toggleDay = (day: Weekday) =>
    set({
      highDays: draft.highDays.includes(day)
        ? draft.highDays.filter((d) => d !== day)
        : [...draft.highDays, day].sort((a, b) => a - b),
    });

  const title = question(step, draft);
  const subtitle = SUBTITLES[step];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <ScreenHeader
            title={SECTION_TITLES[sectionOf(step)]}
            onBack={goBack}
            progress={sectionProgress(steps, index)}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {title && (
            <Text accessibilityRole="header" style={styles.question}>
              {title}
            </Text>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <View style={!title ? styles.noTitle : subtitle ? styles.afterSubtitle : undefined}>
            {renderStep()}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {step === 'expenditure' ? (
            <PrimaryButton label="Skip" variant="secondary" onPress={goNext} />
          ) : (
            <PrimaryButton
              label={step === 'ready' ? 'Done' : 'Next'}
              onPress={goNext}
              disabled={!canContinue(step, draft, today)}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  function renderStep() {
    switch (step) {
      case 'healthSync':
        return <HealthSyncStep />;
      case 'sex':
        return (
          <OptionList options={SEX_OPTIONS} selected={draft.sex} onSelect={(sex) => set({ sex })} />
        );
      case 'birthday':
        return (
          <BirthdayStep
            birth={draft.birth}
            today={today}
            error={birthdayError(draft.birth, today)}
            onChange={(birth) => set({ birth })}
          />
        );
      case 'height':
        return <HeightStep height={draft.height} onChange={(height) => set({ height })} />;
      case 'weight':
        return <WeightStep weight={draft.weight} onChange={(weight) => set({ weight })} />;
      case 'weighedMore':
        return (
          <>
            <OptionList
              options={WEIGHED_MORE_OPTIONS}
              selected={draft.weighedMore}
              onSelect={(weighedMore) => set({ weighedMore })}
            />
            <InfoBox text="Your weight history can affect your metabolism. NedNutrition saves this answer for adaptive coaching, coming soon." />
          </>
        );
      case 'weightTrend':
        return (
          <OptionList
            options={WEIGHT_TREND_OPTIONS}
            selected={draft.recentTrend}
            onSelect={(recentTrend) => set({ recentTrend })}
          />
        );
      case 'bodyFat':
        return (
          <BodyFatStep
            sex={draft.sex}
            value={draft.bodyFat}
            onChange={(bodyFat) => set({ bodyFat })}
          />
        );
      case 'exercise':
        return (
          <OptionList
            options={EXERCISE_OPTIONS}
            selected={draft.exerciseSessions}
            onSelect={(exerciseSessions) => set({ exerciseSessions })}
          />
        );
      case 'dailyActivity':
        return (
          <OptionList
            options={DAILY_ACTIVITY_OPTIONS}
            selected={draft.dailyActivity}
            onSelect={(dailyActivity) => set({ dailyActivity })}
          />
        );
      case 'lifting':
        return (
          <OptionList
            options={LIFTING_OPTIONS}
            selected={draft.liftingExperience}
            onSelect={(liftingExperience) => set({ liftingExperience })}
          />
        );
      case 'cardio':
        return (
          <OptionList
            options={CARDIO_OPTIONS}
            selected={draft.cardioExperience}
            onSelect={(cardioExperience) => set({ cardioExperience })}
          />
        );
      case 'athletic':
        return (
          <OptionList
            options={ATHLETIC_OPTIONS}
            selected={draft.athleticLevel}
            onSelect={(athleticLevel) => set({ athleticLevel })}
          />
        );
      case 'expenditure':
        return (
          <ExpenditureStep
            estimate={estimate}
            override={draft.expenditureOverride}
            onOverride={(expenditureOverride) => set({ expenditureOverride })}
            onDone={goNext}
          />
        );
      case 'goal':
        return (
          <OptionList
            options={GOAL_OPTIONS}
            selected={draft.goal}
            onSelect={(goal) => set({ goal })}
          />
        );
      case 'diet':
        return (
          <OptionList
            options={DIET_OPTIONS}
            selected={draft.diet}
            onSelect={(diet) => set({ diet })}
          />
        );
      case 'training':
        return (
          <OptionList
            options={TRAINING_OPTIONS}
            selected={draft.training}
            onSelect={(training) => set({ training })}
          />
        );
      case 'distribution':
        return (
          <OptionList
            options={DISTRIBUTION_OPTIONS}
            selected={draft.distribution}
            onSelect={(distribution) => set({ distribution })}
          />
        );
      case 'highDays':
        return (
          <View>
            {WEEKDAYS.map((day) => (
              <CheckRow
                key={day}
                label={WEEKDAY_NAMES[day]}
                checked={draft.highDays.includes(day)}
                onToggle={() => toggleDay(day)}
              />
            ))}
          </View>
        );
      case 'protein':
        return (
          <OptionList
            options={PROTEIN_OPTIONS}
            selected={draft.protein}
            onSelect={(protein) => set({ protein })}
          />
        );
      case 'ready':
        return program ? (
          <ProgramReadyStep
            program={program}
            goal={draft.goal}
            proteinPerPound={PROTEIN_OPTIONS.find(
              (o) => o.value === draft.protein,
            )!.description!.replace('About ', 'about ')}
          />
        ) : null;
    }
  }
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
  subtitle: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: -18,
  },
  afterSubtitle: { marginTop: 20 },
  noTitle: { marginTop: 28 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 8 },
});
