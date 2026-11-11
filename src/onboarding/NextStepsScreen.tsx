import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, type IconName } from '../theme';

type Step = { icon: IconName; title: string; body: string };

export const NEXT_STEPS: Step[] = [
  {
    icon: 'food-apple',
    title: 'Eat to your targets each day',
    body: 'Your home screen shows today’s calories, protein, fat and carbs. Higher days are already built in.',
  },
  {
    icon: 'scale-bathroom',
    title: 'Weigh yourself a few times a week',
    body: 'Same time, same conditions, like first thing in the morning. Daily weight swings are normal, so look at the trend.',
  },
  {
    icon: 'calendar-check',
    title: 'Check your progress every two weeks',
    body: 'Compare your average weight to your goal’s pace. If you’re off track, redo setup to update your targets.',
  },
  {
    icon: 'flag-checkered',
    title: 'Give it a month',
    body: 'Your starting targets are estimates. A few weeks of steady habits tell you far more than any formula.',
  },
];

type Props = { onContinue: () => void };

export function NextStepsScreen({ onContinue }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.headline}>
          YOUR FIRST MONTH
        </Text>

        {NEXT_STEPS.map((step, i) => {
          const last = i === NEXT_STEPS.length - 1;
          return (
            <View key={step.title} style={styles.step}>
              <View style={styles.timeline}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name={step.icon} size={24} color={colors.buttonText} />
                </View>
                {!last && <View style={styles.line} />}
              </View>
              <View style={[styles.text, !last && styles.textSpaced]}>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.body}>{step.body}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.screen, paddingTop: 48, paddingBottom: 24 },
  headline: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 40,
  },
  step: { flexDirection: 'row', gap: 18 },
  timeline: { alignItems: 'center', width: 44 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 2, backgroundColor: colors.text },
  text: { flex: 1, gap: 6, paddingTop: 2 },
  textSpaced: { paddingBottom: 32 },
  title: { color: colors.text, fontSize: 19, lineHeight: 25 },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 8 },
});
