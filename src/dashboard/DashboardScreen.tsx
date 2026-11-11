import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sparkline } from '../components/charts';
import type { SavedState } from '../storage/appState';
import { colors, spacing } from '../theme';
import { CardRow, ComingSoonBadge, HabitGrid, MetricCard, SectionHeader, TargetBar } from './cards';
import {
  countThisWeek,
  displayWeight,
  entriesSince,
  habitGrid,
  loggedDates,
  trendWeights,
  weekSummary,
} from './metrics';
import {
  DailyNutritionPage,
  EnergyBalancePage,
  PAGE_HEIGHT,
  WeeklyNutritionPage,
} from './SummaryPages';

type Props = {
  state: SavedState;
  today: Date;
  /** Shows a "coming soon" screen for features that aren't built yet. */
  onComingSoon: (title: string, message: string) => void;
  onOpenSettings: () => void;
};

const PAGE_COUNT = 3;

export function DashboardScreen({ state, today, onComingSoon, onOpenSettings }: Props) {
  const [pagerWidth, setPagerWidth] = useState(0);
  const [page, setPage] = useState(0);

  const { program, foodLog, weighIns, bodyFatEntries, preferences } = state;
  const unit = preferences.weightUnit;
  const week = weekSummary(program, foodLog, today);
  const todaySummary = week.find((d) => d.isToday) ?? week[0];

  const trend = trendWeights(weighIns);
  const recentTrend = entriesSince(trend, today, 7);
  const latestTrend = trend[trend.length - 1];
  const latestWeighIn = weighIns[weighIns.length - 1];
  const latestBodyFat = bodyFatEntries[bodyFatEntries.length - 1];

  const weighInDates = new Set(weighIns.map((w) => w.date));
  const foodDates = loggedDates(foodLog);

  const seeAll = (what: string) => () =>
    onComingSoon(what, `Detailed ${what.toLowerCase()} charts are coming soon.`);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            DASHBOARD
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={onOpenSettings}
            style={styles.settingsButton}
          >
            <MaterialCommunityIcons name="tune-variant" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => setPagerWidth(e.nativeEvent.layout.width)}
          onScroll={(e) => {
            if (pagerWidth > 0) {
              setPage(Math.round(e.nativeEvent.contentOffset.x / pagerWidth));
            }
          }}
          scrollEventThrottle={32}
          style={{ height: PAGE_HEIGHT }}
        >
          {/* Each page must be a direct child: on web, paging wraps every child to snap it. */}
          {pagerWidth > 0 && (
            <View style={{ width: pagerWidth }}>
              <WeeklyNutritionPage week={week} />
            </View>
          )}
          {pagerWidth > 0 && (
            <View style={{ width: pagerWidth }}>
              <EnergyBalancePage program={program} log={foodLog} today={today} />
            </View>
          )}
          {pagerWidth > 0 && (
            <View style={{ width: pagerWidth }}>
              <DailyNutritionPage day={todaySummary} />
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.bottom}>
        <View
          style={styles.dots}
          accessibilityLabel={`Page ${page + 1} of ${PAGE_COUNT}`}
          accessible
        >
          {Array.from({ length: PAGE_COUNT }, (_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <SectionHeader title="Insights & Analytics" onSeeAll={seeAll('Insights')} />
        <CardRow>
          <MetricCard
            title="Expenditure"
            subtitle="Last 7 Days"
            value={String(program.expenditure)}
            unit="kcal"
            onPress={seeAll('Expenditure')}
          >
            <Sparkline
              values={Array(5).fill(program.expenditure)}
              color={colors.expenditure}
              band
              square
            />
          </MetricCard>
          <MetricCard
            title="Weight Trend"
            subtitle="Last 7 Days"
            value={latestTrend ? displayWeight(latestTrend.kg, unit).toFixed(1) : '—'}
            unit={unit}
            onPress={seeAll('Weight trend')}
          >
            <Sparkline
              values={recentTrend.map((w) => displayWeight(w.kg, unit))}
              color={colors.weight}
            />
          </MetricCard>
        </CardRow>

        <SectionHeader title="Habits" />
        <CardRow>
          <MetricCard
            title="Weigh-In"
            subtitle="Last 30 Days"
            value={`${countThisWeek(weighInDates, today)}/7`}
            unit="this week"
          >
            <HabitGrid days={habitGrid(weighInDates, today)} />
          </MetricCard>
          <MetricCard
            title="Food Logging"
            subtitle="Last 30 Days"
            value={`${countThisWeek(foodDates, today)}/7`}
            unit="this week"
          >
            <HabitGrid days={habitGrid(foodDates, today)} />
          </MetricCard>
        </CardRow>

        <SectionHeader title="Body Metrics" onSeeAll={seeAll('Body metrics')} />
        <CardRow>
          <MetricCard
            title="Scale Weight"
            subtitle="Last 7 Entries"
            value={latestWeighIn ? displayWeight(latestWeighIn.kg, unit).toFixed(1) : '—'}
            unit={unit}
            onPress={seeAll('Scale weight')}
          >
            <Sparkline
              values={weighIns.slice(-7).map((w) => displayWeight(w.kg, unit))}
              color={colors.carbs}
              slots={7}
            />
          </MetricCard>
          <MetricCard
            title="Visual Body Fat"
            subtitle={latestBodyFat ? 'Last 7 Entries' : 'Not set'}
            value={latestBodyFat ? latestBodyFat.percent.toFixed(1) : '—'}
            unit={latestBodyFat ? '%' : undefined}
            onPress={seeAll('Body fat')}
          >
            <Sparkline
              values={bodyFatEntries.slice(-7).map((b) => b.percent)}
              color={colors.carbs}
              slots={7}
            />
          </MetricCard>
        </CardRow>

        <SectionHeader title="Nutrition" onSeeAll={seeAll('Nutrition')} />
        <CardRow>
          <NutritionCard
            title="Calories"
            consumed={todaySummary.consumed.calories}
            target={todaySummary.target.calories}
            unit="kcal"
            color={colors.calories}
          />
          <NutritionCard
            title="Protein"
            consumed={todaySummary.consumed.protein}
            target={todaySummary.target.protein}
            unit="g"
            color={colors.protein}
          />
        </CardRow>
        <CardRow>
          <NutritionCard
            title="Fat"
            consumed={todaySummary.consumed.fat}
            target={todaySummary.target.fat}
            unit="g"
            color={colors.fat}
          />
          <NutritionCard
            title="Carbs"
            consumed={todaySummary.consumed.carbs}
            target={todaySummary.target.carbs}
            unit="g"
            color={colors.carbs}
          />
        </CardRow>

        <SectionHeader title="General" />
        <CardRow>
          <MetricCard
            title="Steps"
            subtitle="Last 7 Days"
            value="—"
            onPress={() =>
              onComingSoon(
                'Steps',
                'Steps will come from Apple Health or Health Connect once syncing is ready.',
              )
            }
          >
            <ComingSoonBadge />
          </MetricCard>
          <View style={styles.cardSpacer} />
        </CardRow>

        <SectionHeader title="More" />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onComingSoon(
              'Nutrition data manager',
              'Export, review and edit everything you’ve logged. Coming soon.',
            )
          }
          style={styles.moreRow}
        >
          <MaterialCommunityIcons name="database" size={28} color={colors.text} />
          <Text style={styles.moreText}>Nutrition Data Manager</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.track} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function NutritionCard({
  title,
  consumed,
  target,
  unit,
  color,
}: {
  title: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}) {
  return (
    <MetricCard title={title} subtitle="Today" value={String(Math.round(consumed))} unit={unit}>
      <TargetBar fraction={target > 0 ? consumed / target : 0} color={color} />
    </MetricCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundDeep },
  content: { paddingBottom: 150 },
  top: { backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 18,
  },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: 0.5 },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { paddingHorizontal: spacing.screen },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.track },
  dotActive: { backgroundColor: colors.text },
  cardSpacer: { flex: 1 },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
  },
  moreText: { flex: 1, color: colors.text, fontSize: 18 },
});
