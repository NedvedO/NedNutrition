import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import type { MacroProgram } from '../program/types';
import { colors, spacing, WEEKDAY_NAMES } from '../theme';

type Props = { program: MacroProgram; onRestart: () => void };

/** Mondays are 0, matching Weekday; JavaScript's getDay() makes Sunday 0. */
function todayWeekday(): number {
  return (new Date().getDay() + 6) % 7;
}

/** Stand-in home screen until food logging (Phase 2) is built. */
export function HomePlaceholder({ program, onRestart }: Props) {
  const today = program.days[todayWeekday()];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.heading}>TODAY</Text>
        <Text style={styles.day}>{WEEKDAY_NAMES[today.day]}</Text>
        <View style={styles.grid}>
          <Stat label="Calories" value={`${today.calories}`} color={colors.calories} />
          <Stat label="Protein" value={`${today.protein} g`} color={colors.protein} />
          <Stat label="Fat" value={`${today.fat} g`} color={colors.fat} />
          <Stat label="Carbs" value={`${today.carbs} g`} color={colors.carbs} />
        </View>
        <Text style={styles.note}>Food logging is coming next.</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Redo setup" onPress={onRestart} />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.screen, paddingTop: 32 },
  heading: { color: colors.text, fontSize: 32, fontWeight: '900' },
  day: { color: colors.textMuted, fontSize: 18, marginTop: 4, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  swatch: { width: 24, height: 6, borderRadius: 3, marginBottom: 8 },
  statValue: { color: colors.text, fontSize: 26 },
  statLabel: { color: colors.textMuted, fontSize: 15 },
  note: { color: colors.textMuted, fontSize: 16, marginTop: 24 },
  footer: { paddingHorizontal: spacing.screen, paddingBottom: 8 },
});
