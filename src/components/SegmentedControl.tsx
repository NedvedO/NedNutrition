import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 4,
  },
  segment: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  segmentSelected: { backgroundColor: colors.text },
  label: { color: colors.text, fontSize: 17 },
  labelSelected: { color: colors.buttonText },
});
