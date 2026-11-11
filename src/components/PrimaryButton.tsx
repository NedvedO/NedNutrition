import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** "secondary" is a dark button for less important actions like Skip. */
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({ label, onPress, disabled = false, variant = 'primary' }: Props) {
  const muted = disabled || variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        muted && styles.mutedButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' && styles.secondaryLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.text,
    borderRadius: 14,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedButton: { backgroundColor: colors.surface },
  pressed: { opacity: 0.85 },
  label: { color: colors.buttonText, fontSize: 20, fontWeight: '500' },
  secondaryLabel: { color: colors.text },
  disabledLabel: { color: colors.track },
});
