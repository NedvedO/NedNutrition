import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { PROTEIN_OPTIONS } from '../onboarding/options';
import { ProgramReadyStep } from '../onboarding/ProgramReadyStep';
import type { SavedState } from '../storage/appState';
import { colors, spacing } from '../theme';

/** Shows the current macro program and lets the user rebuild it. */
export function StrategyScreen({
  state,
  onRedoSetup,
}: {
  state: SavedState;
  onRedoSetup: () => void;
}) {
  const proteinPerPound =
    PROTEIN_OPTIONS.find((o) => o.value === state.answers.protein)?.description?.replace(
      'About ',
      'about ',
    ) ?? 'your preference';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        STRATEGY
      </Text>
      <Text style={styles.subtitle}>Your current program</Text>
      <ProgramReadyStep
        program={state.program}
        goal={state.answers.goal}
        proteinPerPound={proteinPerPound}
      />
      <View style={styles.button}>
        <PrimaryButton label="Redo setup" onPress={onRedoSetup} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 120 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: colors.textMuted, fontSize: 17, marginTop: 6, marginBottom: 24 },
  button: { marginTop: 8 },
});
