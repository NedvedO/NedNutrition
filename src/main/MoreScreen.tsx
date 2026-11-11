import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SegmentedControl } from '../components/SegmentedControl';
import type { Preferences } from '../storage/appState';
import { colors, spacing } from '../theme';

export function MoreScreen({
  preferences,
  onChangePreferences,
  onDeleteData,
}: {
  preferences: Preferences;
  onChangePreferences: (preferences: Preferences) => void;
  onDeleteData: () => void;
}) {
  // Deleting takes two taps so it can't happen by accident.
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        MORE
      </Text>

      <Text style={styles.section}>Units</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Body weight</Text>
        <SegmentedControl
          options={[
            { value: 'lb', label: 'Pounds' },
            { value: 'kg', label: 'Kilograms' },
          ]}
          value={preferences.weightUnit}
          onChange={(weightUnit) => onChangePreferences({ ...preferences, weightUnit })}
        />
      </View>

      <Text style={styles.section}>Your data</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          Everything NedNutrition knows about you is stored only on this phone. There’s no account
          and nothing is uploaded.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => (confirmDelete ? onDeleteData() : setConfirmDelete(true))}
          style={[styles.deleteButton, confirmDelete && styles.deleteButtonConfirm]}
        >
          <Text style={styles.deleteText}>
            {confirmDelete ? 'Tap again to delete all your data' : 'Delete my data'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.section}>About</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          NedNutrition gives general nutrition estimates, not medical advice. Talk to a healthcare
          professional before making big changes to how you eat or exercise.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 120 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: 0.5 },
  section: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 30, marginBottom: 12 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 18, gap: 16 },
  label: { color: colors.textMuted, fontSize: 16 },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonConfirm: { backgroundColor: '#3A1F1F' },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '600' },
});
