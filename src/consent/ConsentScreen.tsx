import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import { canAccept } from './consent';

type Props = {
  onBack: () => void;
  onAccept: () => void;
};

export function ConsentScreen({ onBack, onAccept }: Props) {
  const [health, setHealth] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ScreenHeader title="" onBack={onBack} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Before you start: your health and your data
        </Text>

        <Text style={styles.sectionTitle}>Health disclaimer</Text>
        <Text style={styles.body}>
          NedNutrition gives general nutrition estimates based on what you tell it. It is not
          medical advice and doesn’t replace a doctor or registered dietitian.
        </Text>
        <Text style={styles.body}>
          Talk to a healthcare professional before making big changes to how you eat or exercise,
          especially if you have a medical condition, are pregnant or breastfeeding, are under 18,
          or have a history of disordered eating. Daily calorie targets never go below 1,200 kcal.
          Stop and get help if you feel unwell.
        </Text>

        <Text style={styles.sectionTitle}>Your health data</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>It stays on your phone. </Text>
          Your answers (like your age, height, weight, body fat, activity and goals) are stored only
          on this device. There’s no account and nothing is uploaded.
        </Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>No ads, no selling. </Text>
          NedNutrition has no ads or ad trackers and never sells or shares your data.
        </Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>You’re in control. </Text>
          Change your answers anytime with “Redo setup”, or erase everything with “Delete my data”
          on the home screen.
        </Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Saved for later. </Text>
          Your weight history and training experience don’t change your numbers yet. They’re kept on
          your phone for adaptive coaching, a feature that’s coming soon.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <AgreeRow label="I understand the health disclaimer." value={health} onChange={setHealth} />
        <AgreeRow
          label="I agree to how NedNutrition uses my health data."
          value={privacy}
          onChange={setPrivacy}
        />
        <PrimaryButton
          label="Accept and continue"
          onPress={onAccept}
          disabled={!canAccept(health, privacy)}
        />
      </View>
    </SafeAreaView>
  );
}

function AgreeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.agreeRow}>
      <Text style={styles.agreeLabel}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.track, true: colors.text }}
        thumbColor={value ? colors.buttonText : colors.textMuted}
        ios_backgroundColor={colors.track}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.screen },
  content: { paddingHorizontal: spacing.screen, paddingBottom: 16 },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { color: colors.text, fontSize: 20, marginTop: 20, marginBottom: 8 },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginBottom: 10 },
  bold: { color: colors.text, fontWeight: '600' },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.track,
  },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  agreeLabel: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 22 },
});
