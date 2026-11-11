import { StyleSheet, Text, TextInput, View } from 'react-native';

import { OptionCard } from '../components/OptionCard';
import type { Sex } from '../program/types';
import { colors } from '../theme';

export type AboutYouDraft = {
  sex: Sex | undefined;
  age: string;
  feet: string;
  inches: string;
  pounds: string;
};

type Props = {
  draft: AboutYouDraft;
  onChange: (draft: AboutYouDraft) => void;
  error: string | null;
};

/**
 * Temporary design: body stats are needed to estimate expenditure.
 * Replace with the Figma version of this screen when it's ready.
 */
export function AboutYouStep({ draft, onChange, error }: Props) {
  const set = (patch: Partial<AboutYouDraft>) => onChange({ ...draft, ...patch });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sex (used for the energy estimate)</Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <OptionCard
            title="Male"
            icon="gender-male"
            compact
            selected={draft.sex === 'male'}
            onPress={() => set({ sex: 'male' })}
          />
        </View>
        <View style={styles.flex}>
          <OptionCard
            title="Female"
            icon="gender-female"
            compact
            selected={draft.sex === 'female'}
            onPress={() => set({ sex: 'female' })}
          />
        </View>
      </View>

      <NumberField label="Age" unit="years" value={draft.age} onChange={(age) => set({ age })} />

      <Text style={styles.label}>Height</Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <NumberField value={draft.feet} unit="ft" onChange={(feet) => set({ feet })} />
        </View>
        <View style={styles.flex}>
          <NumberField value={draft.inches} unit="in" onChange={(inches) => set({ inches })} />
        </View>
      </View>

      <NumberField
        label="Weight"
        unit="lb"
        value={draft.pounds}
        decimal
        onChange={(pounds) => set({ pounds })}
      />

      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

type FieldProps = {
  label?: string;
  unit: string;
  value: string;
  decimal?: boolean;
  onChange: (value: string) => void;
};

function NumberField({ label, unit, value, decimal = false, onChange }: FieldProps) {
  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputBox}>
        <TextInput
          accessibilityLabel={label ? `${label} in ${unit}` : unit}
          value={value}
          onChangeText={(text) => onChange(text.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, ''))}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          maxLength={5}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  field: { gap: 8 },
  label: { color: colors.textMuted, fontSize: 16 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 60,
  },
  input: { flex: 1, minWidth: 0, color: colors.text, fontSize: 20 },
  unit: { color: colors.textMuted, fontSize: 18 },
  error: { color: colors.danger, fontSize: 16 },
});
