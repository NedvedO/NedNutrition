import { type ComponentRef, useEffect, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme';

export const WHEEL_ITEM_HEIGHT = 48;
const VISIBLE_ROWS = 5;
const PADDING_ROWS = (VISIBLE_ROWS - 1) / 2;

type Props = {
  labels: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  /** Read by screen readers, e.g. "Birth month". */
  accessibilityLabel: string;
};

function clampIndex(index: number, count: number): number {
  return Math.min(Math.max(index, 0), count - 1);
}

/** A scrolling wheel that snaps to one row, like the iOS date picker. */
export function WheelPicker({ labels, selectedIndex, onChange, accessibilityLabel }: Props) {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  // The index the wheel is currently showing, so outside changes can scroll it.
  const shownIndex = useRef(selectedIndex);

  const scrollToIndex = (index: number, animated: boolean) =>
    scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated });

  useEffect(() => {
    if (shownIndex.current !== selectedIndex) {
      shownIndex.current = selectedIndex;
      scrollToIndex(selectedIndex, false);
    }
  }, [selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = clampIndex(
      Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT),
      labels.length,
    );
    if (index !== shownIndex.current) {
      shownIndex.current = index;
      onChange(index);
    }
  };

  const step = (delta: number) => {
    const index = clampIndex(selectedIndex + delta, labels.length);
    shownIndex.current = index;
    scrollToIndex(index, true);
    onChange(index);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: labels[selectedIndex] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      style={styles.container}
    >
      <View pointerEvents="none" style={styles.selection} />
      <ScrollView
        ref={scrollRef}
        onLayout={() => scrollToIndex(selectedIndex, false)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {labels.map((label, index) => {
          const distance = Math.abs(index - selectedIndex);
          return (
            <Pressable
              key={`${label}-${index}`}
              onPress={() => step(index - selectedIndex)}
              style={styles.row}
            >
              <Text
                style={[
                  styles.label,
                  { opacity: distance === 0 ? 1 : distance === 1 ? 0.55 : 0.25 },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: WHEEL_ITEM_HEIGHT * VISIBLE_ROWS },
  content: { paddingVertical: WHEEL_ITEM_HEIGHT * PADDING_ROWS },
  selection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: WHEEL_ITEM_HEIGHT * PADDING_ROWS,
    height: WHEEL_ITEM_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textMuted,
  },
  row: { height: WHEEL_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.text, fontSize: 22, fontWeight: '500' },
});
