import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme';

const TICK_SPACING = 12;

type Props = {
  min: number;
  max: number;
  /** Size of one tick, e.g. 0.2 lb or 0.1 kg. Must divide 1 evenly. */
  step: number;
  value: number;
  unit: string;
  onChange: (value: number) => void;
};

/** Rounds to the ruler's step and keeps one decimal place. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round(value / step) * step;
  return Math.round(Math.min(Math.max(snapped, min), max) * 10) / 10;
}

export function formatRulerValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** A horizontal ruler the user drags to choose a value, like a bathroom scale dial. */
export function RulerPicker({ min, max, step, value, unit, onChange }: Props) {
  const listRef = useRef<FlatList<number>>(null);
  const [width, setWidth] = useState(0);
  const shownValue = useRef(value);

  const ticksPerUnit = Math.round(1 / step);
  const unitWidth = ticksPerUnit * TICK_SPACING;
  const firstUnit = Math.floor(min);
  const units = Array.from({ length: Math.floor(max) - firstUnit + 1 }, (_, i) => firstUnit + i);

  const offsetFor = (v: number) => ((v - firstUnit) / step) * TICK_SPACING;

  const scrollTo = (v: number, animated: boolean) =>
    listRef.current?.scrollToOffset({ offset: offsetFor(v), animated });

  useEffect(() => {
    if (Math.abs(shownValue.current - value) > step / 2) {
      shownValue.current = value;
      scrollTo(value, false);
    }
    // scrollTo only depends on props already listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, step, min]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = firstUnit + (event.nativeEvent.contentOffset.x / TICK_SPACING) * step;
    const next = snapToStep(raw, min, max, step);
    if (next !== shownValue.current) {
      shownValue.current = next;
      onChange(next);
    }
  };

  const adjust = (delta: number) => {
    const next = snapToStep(value + delta, min, max, step);
    shownValue.current = next;
    scrollTo(next, true);
    onChange(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Weight"
      accessibilityValue={{ text: `${formatRulerValue(value)} ${unit}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => adjust(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Text style={styles.value}>
        {formatRulerValue(value)} {unit}
      </Text>
      <View style={styles.rulerArea}>
        {width > 0 && (
          <FlatList
            ref={listRef}
            data={units}
            horizontal
            keyExtractor={(u) => String(u)}
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_SPACING}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onLayout={() => scrollTo(value, false)}
            getItemLayout={(_, index) => ({
              length: unitWidth,
              offset: unitWidth * index,
              index,
            })}
            // Start rendering at the current value so the ruler isn't blank on first load.
            initialScrollIndex={Math.min(
              Math.max(Math.floor(value) - firstUnit, 0),
              units.length - 1,
            )}
            initialNumToRender={20}
            windowSize={7}
            contentContainerStyle={{ paddingHorizontal: width / 2 }}
            renderItem={({ item }) => (
              <View style={[styles.unit, { width: unitWidth }]}>
                <Text style={styles.unitLabel}>{item}</Text>
                <View style={styles.ticks}>
                  {Array.from({ length: ticksPerUnit }, (_, i) => (
                    <View key={i} style={[styles.tick, i === 0 ? styles.majorTick : null]} />
                  ))}
                </View>
              </View>
            )}
          />
        )}
        <View pointerEvents="none" style={styles.indicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  rulerArea: { height: 90, justifyContent: 'flex-end' },
  unit: { height: 90, justifyContent: 'flex-end' },
  unitLabel: {
    position: 'absolute',
    top: 8,
    left: -14,
    width: 28,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
  },
  ticks: { flexDirection: 'row', alignItems: 'flex-end', height: 60 },
  tick: {
    width: 1,
    height: 36,
    marginRight: TICK_SPACING - 1,
    backgroundColor: colors.track,
  },
  majorTick: { height: 52, backgroundColor: colors.textMuted },
  indicator: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 3,
    marginLeft: -1.5,
    height: 70,
    borderRadius: 1.5,
    backgroundColor: colors.carbs,
  },
});
