import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, type IconName } from '../theme';

export type Option<T extends string> = {
  value: T;
  title: string;
  description?: string;
  icon: IconName;
};

type CardProps = {
  title: string;
  description?: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  /** Smaller card without the radio circle, for side-by-side choices. */
  compact?: boolean;
};

export function OptionCard({
  title,
  description,
  icon,
  selected,
  onPress,
  compact = false,
}: CardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={description ? `${title}. ${description}` : title}
      onPress={onPress}
      style={[styles.card, compact && styles.cardCompact, selected && styles.cardSelected]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={compact ? 26 : 34}
        color={colors.text}
        style={compact ? styles.iconCompact : styles.icon}
      />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {!compact && (
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      )}
    </Pressable>
  );
}

type ListProps<T extends string> = {
  options: Option<T>[];
  selected: T | undefined;
  onSelect: (value: T) => void;
};

export function OptionList<T extends string>({ options, selected, onSelect }: ListProps<T>) {
  return (
    <View accessibilityRole="radiogroup" style={styles.list}>
      {options.map((option) => (
        <OptionCard
          key={option.value}
          title={option.title}
          description={option.description}
          icon={option.icon}
          selected={option.value === selected}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 96,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardCompact: { minHeight: 64, paddingVertical: 12 },
  cardSelected: { borderColor: colors.borderSelected },
  icon: { width: 40, marginRight: 16 },
  iconCompact: { marginRight: 10 },
  text: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 18 },
  description: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.track,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.text, borderColor: colors.text },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.buttonText },
});
