import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EnergyChart, Gauge } from '../components/charts';
import { SegmentedControl } from '../components/SegmentedControl';
import type { LogEntry } from '../nutrition/types';
import type { MacroProgram } from '../program/types';
import { colors, WEEKDAY_NAMES } from '../theme';
import {
  barFraction,
  type DaySummary,
  energyBalance,
  type Macro,
  MACROS,
  remainingAmount,
  type ViewMode,
} from './metrics';

export const PAGE_HEIGHT = 470;

const MACRO_COLORS: Record<Macro, string> = {
  calories: colors.calories,
  protein: colors.protein,
  fat: colors.fat,
  carbs: colors.carbs,
};

const MACRO_LETTER: Record<Macro, string> = { calories: '', protein: 'P', fat: 'F', carbs: 'C' };
const MACRO_NAME: Record<Macro, string> = {
  calories: 'Calories',
  protein: 'Protein',
  fat: 'Fat',
  carbs: 'Carbs',
};

const MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'consumed', label: 'Consumed' },
  { value: 'remaining', label: 'Remaining' },
];

// ---- Page 1: weekly nutrition ----

export function WeeklyNutritionPage({ week }: { week: DaySummary[] }) {
  const [mode, setMode] = useState<ViewMode>('consumed');
  const [selected, setSelected] = useState(() =>
    Math.max(
      week.findIndex((d) => d.isToday),
      0,
    ),
  );
  const day = week[selected];

  return (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>Weekly Nutrition</Text>
      <View style={styles.weekRow}>
        <View style={styles.weekGrid}>
          {week.map((d, col) => (
            <Pressable
              key={d.date}
              accessibilityRole="button"
              accessibilityState={{ selected: col === selected }}
              accessibilityLabel={WEEKDAY_NAMES[d.weekday]}
              onPress={() => setSelected(col)}
              style={[styles.weekColumn, col === selected && styles.weekColumnSelected]}
            >
              {MACROS.map((macro) => {
                const fraction = barFraction(d.consumed[macro], d.target[macro], mode);
                const grey = mode === 'remaining' && d.isFuture;
                return (
                  <View key={macro} style={styles.miniCell}>
                    <View style={styles.miniTick} />
                    <View
                      style={[
                        styles.miniFill,
                        {
                          height: `${fraction * 78}%`,
                          backgroundColor: grey ? colors.track : MACRO_COLORS[macro],
                        },
                      ]}
                    />
                  </View>
                );
              })}
              <Text style={[styles.dayLetter, col === selected && styles.dayLetterSelected]}>
                {WEEKDAY_NAMES[d.weekday][0]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.weekTotals}>
          {MACROS.map((macro) => {
            const target = day.target[macro];
            const consumed = Math.round(day.consumed[macro]);
            const shown = mode === 'consumed' ? consumed : remainingAmount(consumed, target);
            return (
              <View key={macro} style={styles.totalBlock}>
                <View style={styles.totalLine}>
                  <Text style={styles.totalValue}>
                    {shown} {MACRO_LETTER[macro]}
                  </Text>
                  {macro === 'calories' && (
                    <MaterialCommunityIcons name="fire" size={18} color={colors.text} />
                  )}
                </View>
                <Text style={styles.totalTarget}>of {target}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.toggle}>
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </View>
    </View>
  );
}

// ---- Page 2: energy balance ----

export function EnergyBalancePage({
  program,
  log,
  today,
}: {
  program: MacroProgram;
  log: LogEntry[];
  today: Date;
}) {
  const [compareTo, setCompareTo] = useState<'expenditure' | 'targets'>('expenditure');
  const balance = energyBalance(program, log, today, compareTo);
  const lineColor = compareTo === 'expenditure' ? colors.protein : colors.fat;
  const show = (v: number | null) => (v === null ? 'N/A' : String(v));

  return (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>Energy Balance</Text>
      <View style={styles.chartArea}>
        <EnergyChart
          reference={balance.referenceSeries}
          nutrition={balance.nutritionSeries}
          lineColor={lineColor}
          height={170}
        />
        <Text style={styles.chartCaption}>Last 30 Days</Text>
      </View>

      <View style={styles.equation}>
        <EquationPart value={show(balance.nutritionAverage)} label="Nutrition">
          <MaterialCommunityIcons name="chart-bar" size={20} color={colors.calories} />
        </EquationPart>
        <Text style={styles.operator}>−</Text>
        <EquationPart
          value={String(balance.reference)}
          label={compareTo === 'expenditure' ? 'Expenditure' : 'Targets'}
        >
          <MaterialCommunityIcons name="chart-line-variant" size={20} color={lineColor} />
        </EquationPart>
        <Text style={styles.operator}>=</Text>
        <EquationPart value={show(balance.difference)} label="Difference" />
      </View>

      <View style={styles.toggle}>
        <SegmentedControl
          options={[
            { value: 'expenditure', label: 'Expenditure' },
            { value: 'targets', label: 'Targets' },
          ]}
          value={compareTo}
          onChange={setCompareTo}
        />
      </View>
    </View>
  );
}

function EquationPart({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.equationPart}>
      <Text style={styles.equationValue}>{value}</Text>
      <View style={styles.equationLabelRow}>
        {children}
        <Text style={styles.equationLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ---- Page 3: daily nutrition ----

export function DailyNutritionPage({ day }: { day: DaySummary }) {
  const [mode, setMode] = useState<ViewMode>('consumed');
  const target = day.target.calories;
  const consumed = Math.round(day.consumed.calories);
  const remaining = remainingAmount(consumed, target);

  const center =
    mode === 'consumed'
      ? { value: consumed, label: 'Consumed' }
      : { value: remaining, label: 'Remaining' };
  const left =
    mode === 'consumed'
      ? { value: remaining, label: 'Remaining' }
      : { value: consumed, label: 'Consumed' };

  return (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>Daily Nutrition</Text>
      <View style={styles.gaugeRow}>
        <SideStat {...left} />
        <View style={styles.gauge}>
          <Gauge
            size={200}
            fraction={barFraction(consumed, target, mode)}
            color={colors.calories}
          />
          <View style={styles.gaugeCenter}>
            <Text style={styles.gaugeValue}>{center.value}</Text>
            <Text style={styles.gaugeLabel}>{center.label}</Text>
          </View>
        </View>
        <SideStat value={target} label="Target" />
      </View>

      <View style={styles.macroRow}>
        {(['protein', 'fat', 'carbs'] as const).map((macro) => {
          const t = day.target[macro];
          const c = Math.round(day.consumed[macro]);
          const shown = mode === 'consumed' ? c : remainingAmount(c, t);
          return (
            <View key={macro} style={styles.macro}>
              <Text style={styles.macroName}>{MACRO_NAME[macro]}</Text>
              <View style={styles.macroTrack}>
                <View
                  style={[
                    styles.macroFill,
                    {
                      width: `${barFraction(c, t, mode) * 100}%`,
                      backgroundColor: MACRO_COLORS[macro],
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroValue}>
                {shown} / {t}g
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.toggle}>
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </View>
    </View>
  );
}

function SideStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.sideStat}>
      <Text style={styles.sideValue}>{value}</Text>
      <Text style={styles.sideLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { height: PAGE_HEIGHT, paddingHorizontal: 20, paddingTop: 8 },
  pageTitle: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 18 },
  toggle: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },

  // Weekly
  weekRow: { flexDirection: 'row', gap: 12 },
  weekGrid: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  weekColumn: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weekColumnSelected: { borderColor: colors.text },
  miniCell: {
    width: 22,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
  },
  miniTick: {
    position: 'absolute',
    top: 6,
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textMuted,
  },
  miniFill: { width: 5, borderRadius: 2 },
  dayLetter: { color: colors.textMuted, fontSize: 15 },
  dayLetterSelected: { color: colors.text, fontWeight: '700' },
  weekTotals: { width: 84, paddingTop: 8, gap: 16 },
  totalBlock: { height: 48, justifyContent: 'center' },
  totalLine: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  totalValue: { color: colors.text, fontSize: 19 },
  totalTarget: { color: colors.textMuted, fontSize: 14 },

  // Energy balance
  chartArea: { borderBottomWidth: 0 },
  chartCaption: { color: colors.textMuted, fontSize: 14, textAlign: 'right', marginTop: 8 },
  equation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  equationPart: { alignItems: 'center', flex: 1 },
  equationValue: { color: colors.text, fontSize: 22 },
  equationLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  equationLabel: { color: colors.textMuted, fontSize: 14 },
  operator: { color: colors.text, fontSize: 22 },

  // Daily
  gaugeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gauge: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { color: colors.text, fontSize: 40, fontWeight: '700' },
  gaugeLabel: { color: colors.textMuted, fontSize: 15 },
  sideStat: { alignItems: 'center', width: 70 },
  sideValue: { color: colors.text, fontSize: 21, fontWeight: '700' },
  sideLabel: { color: colors.textMuted, fontSize: 13 },
  macroRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  macro: { flex: 1, alignItems: 'center', gap: 8 },
  macroName: { color: colors.textMuted, fontSize: 15 },
  macroTrack: {
    alignSelf: 'stretch',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  macroFill: { height: 4 },
  macroValue: { color: colors.text, fontSize: 15 },
});
