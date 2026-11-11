import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import { FEATURES, sortFeatures, type Feature } from './features';
import { TAGLINE } from './WelcomeCarousel';

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

export function WhatYouGetScreen({ onBack, onContinue }: Props) {
  const features = sortFeatures(FEATURES);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ScreenHeader title="" onBack={onBack} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.headline}>
          WHAT YOU GET
        </Text>
        {features.map((feature, i) => (
          <FeatureRow key={feature.title} feature={feature} last={i === features.length - 1} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
        <Text style={styles.tagline}>{TAGLINE}</Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ feature, last }: { feature: Feature; last: boolean }) {
  const available = feature.status === 'available';

  return (
    <View
      accessible
      accessibilityLabel={`${feature.title}. ${available ? 'Available now' : 'Coming soon'}. ${feature.description}`}
      style={styles.row}
    >
      <MaterialCommunityIcons
        name={feature.icon}
        size={36}
        color={available ? colors.text : colors.textMuted}
        style={styles.icon}
      />
      <View style={[styles.text, !last && styles.divider]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !available && styles.titleMuted]}>{feature.title}</Text>
          {available ? (
            <View style={styles.availableBadge}>
              <MaterialCommunityIcons name="check" size={14} color={colors.buttonText} />
            </View>
          ) : (
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>Coming soon</Text>
            </View>
          )}
        </View>
        <Text style={styles.description}>{feature.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.screen },
  content: { paddingHorizontal: spacing.screen, paddingBottom: 24 },
  headline: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  row: { flexDirection: 'row', gap: 18 },
  icon: { width: 40, marginTop: 2 },
  text: { flex: 1, paddingBottom: 20, marginBottom: 20 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.track },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  title: { color: colors.text, fontSize: 19, lineHeight: 25, flexShrink: 1 },
  titleMuted: { color: colors.textMuted },
  description: { color: colors.textMuted, fontSize: 16, lineHeight: 23, marginTop: 6 },
  availableBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.carbs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonBadge: {
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  soonText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 8, gap: 16 },
  tagline: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
});
