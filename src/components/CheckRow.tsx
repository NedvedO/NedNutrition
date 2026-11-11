import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export function CheckRow({ label, checked, onToggle }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onToggle}
      style={styles.row}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <MaterialCommunityIcons name="check" size={20} color={colors.buttonText} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.track,
  },
  label: { color: colors.text, fontSize: 18 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boxChecked: { backgroundColor: colors.text, borderColor: colors.text },
});
