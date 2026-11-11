import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  title: string;
  onBack: () => void;
  /** 0 to 1. Omit to hide the progress bar. */
  progress?: number;
};

export function ScreenHeader({ title, onBack, progress }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={onBack}
          style={styles.back}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      {progress !== undefined && (
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          style={styles.track}
        >
          <View style={[styles.fill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 56, justifyContent: 'center' },
  back: { position: 'absolute', left: 0, zIndex: 1 },
  title: { color: colors.text, fontSize: 20, textAlign: 'center' },
  track: { height: 4, backgroundColor: colors.track, marginTop: 8 },
  fill: { height: 4, backgroundColor: colors.text },
});
