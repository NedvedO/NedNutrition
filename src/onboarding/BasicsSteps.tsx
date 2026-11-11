import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { RulerPicker } from '../components/RulerPicker';
import { SegmentedControl } from '../components/SegmentedControl';
import { WheelPicker } from '../components/WheelPicker';
import { EXPENDITURE_MAX, EXPENDITURE_MIN, isValidExpenditure } from '../program/calculateProgram';
import type { Sex } from '../program/types';
import { colors } from '../theme';
import {
  type BirthDate,
  birthYears,
  bodyFatRanges,
  clampBirthDay,
  convertHeight,
  convertWeight,
  daysInMonth,
  formatInches,
  HEIGHT_CM,
  HEIGHT_INCHES,
  type HeightValue,
  WEIGHT_KG,
  WEIGHT_LB,
  type WeightValue,
} from './draft';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

// ---- Health sync ----

export function HealthSyncStep() {
  const serviceName = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';
  return (
    <View style={styles.syncCard}>
      <View style={styles.syncTop}>
        <View style={styles.syncIcon}>
          <MaterialCommunityIcons name="heart-pulse" size={34} color="#FF4D6A" />
        </View>
        <Switch
          disabled
          value={false}
          accessibilityLabel={`Sync with ${serviceName}, coming soon`}
          trackColor={{ false: colors.track, true: colors.text }}
          thumbColor={colors.textMuted}
        />
      </View>
      <View style={styles.syncTitleRow}>
        <Text style={styles.syncTitle}>{serviceName}</Text>
        <View style={styles.soonBadge}>
          <Text style={styles.soonText}>Coming soon</Text>
        </View>
      </View>
      <Text style={styles.syncBody}>
        Sync your steps, weight and nutrition with {serviceName}. For now, you can skip this step.
      </Text>
    </View>
  );
}

// ---- Birthday ----

export function BirthdayStep({
  birth,
  today,
  error,
  onChange,
}: {
  birth: BirthDate;
  today: Date;
  error: string | null;
  onChange: (birth: BirthDate) => void;
}) {
  const years = birthYears(today);
  const days = range(1, daysInMonth(birth.year, birth.month));
  const set = (patch: Partial<BirthDate>) => onChange(clampBirthDay({ ...birth, ...patch }));

  return (
    <View style={styles.pickerScreen}>
      <View style={styles.wheels}>
        <WheelPicker
          labels={MONTHS}
          selectedIndex={birth.month}
          onChange={(month) => set({ month })}
          accessibilityLabel="Birth month"
        />
        <WheelPicker
          labels={days.map(String)}
          selectedIndex={birth.day - 1}
          onChange={(index) => set({ day: index + 1 })}
          accessibilityLabel="Birth day"
        />
        <WheelPicker
          labels={years.map(String)}
          selectedIndex={Math.max(years.indexOf(birth.year), 0)}
          onChange={(index) => set({ year: years[index] })}
          accessibilityLabel="Birth year"
        />
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

// ---- Height ----

const INCH_OPTIONS = range(HEIGHT_INCHES.min, HEIGHT_INCHES.max);
const CM_OPTIONS = range(HEIGHT_CM.min, HEIGHT_CM.max);

export function HeightStep({
  height,
  onChange,
}: {
  height: HeightValue;
  onChange: (height: HeightValue) => void;
}) {
  return (
    <View style={styles.pickerScreen}>
      <SegmentedControl
        options={[
          { value: 'imperial', label: 'Feet and inches' },
          { value: 'metric', label: 'Centimeters' },
        ]}
        value={height.unit}
        onChange={(unit) => onChange(convertHeight(height, unit))}
      />
      <View style={styles.wheels}>
        {height.unit === 'imperial' ? (
          <WheelPicker
            labels={INCH_OPTIONS.map(formatInches)}
            selectedIndex={INCH_OPTIONS.indexOf(height.inches)}
            onChange={(index) => onChange({ unit: 'imperial', inches: INCH_OPTIONS[index] })}
            accessibilityLabel="Height"
          />
        ) : (
          <WheelPicker
            labels={CM_OPTIONS.map((cm) => `${cm} cm`)}
            selectedIndex={CM_OPTIONS.indexOf(height.cm)}
            onChange={(index) => onChange({ unit: 'metric', cm: CM_OPTIONS[index] })}
            accessibilityLabel="Height"
          />
        )}
      </View>
    </View>
  );
}

// ---- Weight ----

export function WeightStep({
  weight,
  onChange,
}: {
  weight: WeightValue;
  onChange: (weight: WeightValue) => void;
}) {
  const limits = weight.unit === 'lb' ? WEIGHT_LB : WEIGHT_KG;
  return (
    <View style={styles.pickerScreen}>
      <SegmentedControl
        options={[
          { value: 'lb', label: 'Pounds' },
          { value: 'kg', label: 'Kilograms' },
        ]}
        value={weight.unit}
        onChange={(unit) => onChange(convertWeight(weight, unit))}
      />
      <View style={styles.ruler}>
        <RulerPicker
          key={weight.unit}
          min={limits.min}
          max={limits.max}
          step={limits.step}
          value={weight.value}
          unit={weight.unit}
          onChange={(value) => onChange({ unit: weight.unit, value })}
        />
      </View>
    </View>
  );
}

// ---- Info box ----

export function InfoBox({ text }: { text: string }) {
  return (
    <View style={styles.infoBox}>
      <MaterialCommunityIcons name="information" size={26} color={colors.text} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

// ---- Body fat ----

export function BodyFatStep({
  sex,
  value,
  onChange,
}: {
  sex: Sex | undefined;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const options = [...bodyFatRanges(sex).map((r) => r.label), 'notSure'];
  return (
    <View accessibilityRole="radiogroup" style={styles.bodyFatGrid}>
      {options.map((label) => {
        const selected = value === label;
        const notSure = label === 'notSure';
        return (
          <Pressable
            key={label}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={notSure ? 'Not sure' : `${label} body fat`}
            onPress={() => onChange(label)}
            style={[
              styles.bodyFatCell,
              notSure && styles.bodyFatNotSure,
              selected && styles.cellSelected,
            ]}
          >
            {selected && (
              <MaterialCommunityIcons name="check-circle" size={18} color={colors.text} />
            )}
            <Text style={styles.bodyFatLabel}>{notSure ? 'Not sure' : label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Expenditure ----

export function ExpenditureStep({
  estimate,
  override,
  onOverride,
  onDone,
}: {
  estimate: number;
  override: number | null;
  onOverride: (kcal: number | null) => void;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [explained, setExplained] = useState(false);
  const shown = override ?? estimate;

  const save = () => {
    const kcal = Number(text);
    if (!isValidExpenditure(kcal)) {
      setError(`Enter a number between ${EXPENDITURE_MIN} and ${EXPENDITURE_MAX}.`);
      return;
    }
    onOverride(Math.round(kcal));
    setEditing(false);
    setError(null);
  };

  return (
    <View style={styles.chat}>
      <Bubble>
        Based on your answers, this is about how many calories you burn in a day. It’s also how much
        you’d eat to keep your weight the same.
      </Bubble>

      <View style={styles.valueCard}>
        {editing ? (
          <TextInput
            autoFocus
            value={text}
            onChangeText={(t) => setText(t.replace(/[^0-9]/g, ''))}
            onSubmitEditing={save}
            keyboardType="number-pad"
            maxLength={4}
            accessibilityLabel="Your daily calories burned"
            style={styles.valueInput}
          />
        ) : (
          <Text style={styles.valueText}>{shown} kcal</Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editing ? 'Save' : 'Edit calories burned'}
          onPress={() => {
            if (editing) return save();
            setText(String(shown));
            setEditing(true);
          }}
          style={styles.editButton}
        >
          <MaterialCommunityIcons
            name={editing ? 'check' : 'pencil'}
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      {override !== null && !editing && (
        <Pressable accessibilityRole="button" onPress={() => onOverride(null)}>
          <Text style={styles.link}>Use the estimate ({estimate} kcal) instead</Text>
        </Pressable>
      )}

      <Bubble short>This is called your expenditure.</Bubble>

      {explained && (
        <Bubble>
          We estimate the energy your body uses at rest from your sex, age, height and weight (or
          from your lean mass when you chose a body fat range). Then we scale it up for your daily
          movement, how often you exercise, and how hard you train. It’s a starting point: real
          bodies vary, so adjust it if you know your numbers.
        </Bubble>
      )}

      <Text style={styles.responseLabel}>Choose your response</Text>
      <View style={styles.responses}>
        <ResponseChip label="Got it" onPress={onDone} />
        {!explained && (
          <ResponseChip label="How was this calculated?" onPress={() => setExplained(true)} />
        )}
      </View>
    </View>
  );
}

function Bubble({ children, short = false }: { children: string; short?: boolean }) {
  return (
    <View style={[styles.bubble, short && styles.bubbleShort]}>
      <Text style={styles.bubbleText}>{children}</Text>
    </View>
  );
}

function ResponseChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Health sync
  syncCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  syncTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  syncIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  syncTitle: { color: colors.text, fontSize: 19 },
  syncBody: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  soonBadge: {
    borderWidth: 1,
    borderColor: colors.track,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  soonText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },

  // Pickers
  pickerScreen: { gap: 24 },
  wheels: { flexDirection: 'row', marginTop: 40 },
  ruler: { marginTop: 60 },
  error: { color: colors.danger, fontSize: 16, marginTop: 8 },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#132A4D',
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
  },
  infoText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 23 },

  // Body fat
  bodyFatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bodyFatCell: {
    width: '31.5%',
    height: 72,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  bodyFatNotSure: { width: '100%', height: 60 },
  cellSelected: { borderColor: colors.borderSelected },
  bodyFatLabel: { color: colors.text, fontSize: 17 },

  // Expenditure chat
  chat: { gap: 12 },
  bubble: {
    backgroundColor: colors.text,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 16,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  bubbleShort: { alignSelf: 'flex-start' },
  bubbleText: { color: colors.buttonText, fontSize: 16, lineHeight: 23 },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: 14,
  },
  valueText: { color: colors.text, fontSize: 28, fontWeight: '700' },
  valueInput: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    minWidth: 110,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { color: colors.calories, fontSize: 15 },
  responseLabel: { color: colors.text, fontSize: 18, marginTop: 24 },
  responses: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chipText: { color: colors.text, fontSize: 17 },
});
