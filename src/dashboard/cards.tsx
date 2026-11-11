import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {onSeeAll && (
        <Pressable accessibilityRole="link" onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      )}
    </View>
  );
}

/** A dashboard card: title, subtitle, a small chart, then the headline number. */
export function MetricCard({
  title,
  subtitle,
  value,
  unit,
  onPress,
  children,
}: {
  title: string;
  subtitle: string;
  value: string;
  unit?: string;
  onPress?: () => void;
  children?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}, ${subtitle}: ${value}${unit ? ` ${unit}` : ''}`}
      onPress={onPress}
      disabled={!onPress}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.cardChart}>{children}</View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardValue}>
          {value}
          {unit ? <Text style={styles.cardUnit}> {unit}</Text> : null}
        </Text>
        {onPress && <MaterialCommunityIcons name="chevron-right" size={24} color={colors.track} />}
      </View>
    </Pressable>
  );
}

export function CardRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

/** A 3 x 10 grid, one square per day for the last 30 days, oldest at top left. */
export function HabitGrid({ days }: { days: boolean[] }) {
  const rows = [days.slice(0, 10), days.slice(10, 20), days.slice(20, 30)];
  return (
    <View style={styles.grid}>
      {rows.map((row, r) => (
        <View key={r} style={styles.gridRow}>
          {row.map((done, i) => (
            <View key={i} style={[styles.gridCell, done && styles.gridCellDone]} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** A thin bar with a tick where the target is. */
export function TargetBar({ fraction, color }: { fraction: number; color: string }) {
  const TARGET_AT = 0.85;
  const filled = Math.min(fraction * TARGET_AT, 1);
  return (
    <View style={styles.targetTrack}>
      <View style={[styles.targetFill, { width: `${filled * 100}%`, backgroundColor: color }]} />
      <View style={[styles.targetTick, { left: `${TARGET_AT * 100}%` }]} />
    </View>
  );
}

export function ComingSoonBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 14,
  },
  sectionTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },
  seeAll: { color: colors.text, fontSize: 17, textDecorationLine: 'underline' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: 18, padding: 16 },
  cardTitle: { color: colors.text, fontSize: 19 },
  cardSubtitle: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  cardChart: { height: 60, justifyContent: 'center', marginVertical: 8 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.track,
    paddingTop: 10,
  },
  cardValue: { color: colors.text, fontSize: 22 },
  cardUnit: { color: colors.textMuted, fontSize: 15 },
  grid: { gap: 4 },
  gridRow: { flexDirection: 'row', gap: 4 },
  gridCell: { flex: 1, aspectRatio: 1, borderRadius: 3, backgroundColor: colors.surface },
  gridCellDone: { backgroundColor: colors.carbs },
  targetTrack: { height: 16, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden' },
  targetFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  targetTick: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 2,
    marginLeft: -1,
    backgroundColor: colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
