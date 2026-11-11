import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing, type IconName } from '../theme';

/** Placeholder for features on the roadmap (see docs/ROADMAP.md). */
export function ComingSoonContent({
  title,
  message,
  icon = 'hammer-wrench',
}: {
  title: string;
  message: string;
  icon?: IconName;
}) {
  return (
    <View style={styles.body}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={44} color={colors.text} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Coming soon</Text>
      </View>
    </View>
  );
}

export function ComingSoonScreen({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <ScreenHeader title="" onBack={onBack} />
      </View>
      <ComingSoonContent title={title} message={message} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.screen },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  message: { color: colors.textMuted, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  badge: {
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  badgeText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
