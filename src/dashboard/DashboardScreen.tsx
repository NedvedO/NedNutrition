import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sparkline } from '../components/charts';
import type { SavedState } from '../storage/appState';
import { colors, spacing } from '../theme';
import { CardRow, ComingSoonBadge, HabitGrid, MetricCard, SectionHeader, TargetBar } from './cards';
import {
  type CardId,
  isNutrientCard,
  type NutrientCardId,
  type PageId,
  sanitizeLayout,
  SECTION_NAMES,
  type SectionId,
  visiblePages,
} from './layout';
import {
  countThisWeek,
  displayWeight,
  entriesSince,
  habitGrid,
  loggedDates,
  remainingAmount,
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
  onCustomize: () => void;
};

const NUTRIENT_STYLE: Record<NutrientCardId, { title: string; unit: string; color: string }> = {
  calories: { title: 'Calories', unit: 'kcal', color: colors.calories },
  protein: { title: 'Protein', unit: 'g', color: colors.protein },
  fat: { title: 'Fat', unit: 'g', color: colors.fat },
  carbs: { title: 'Carbs', unit: 'g', color: colors.carbs },
};

/** Sections whose "See All" opens a detail page (coming soon for now). */
const SEE_ALL: Partial<Record<SectionId, true>> = {
  insights: true,
  bodyMetrics: true,
  nutrition: true,
};

export function DashboardScreen({ state, today, onComingSoon, onCustomize }: Props) {
  const [pagerWidth, setPagerWidth] = useState(0);
  const [page, setPage] = useState(0);

  const { program, foodLog, weighIns, bodyFatEntries, preferences } = state;
  const layout = sanitizeLayout(preferences.dashboard);
  const pages = visiblePages(layout);
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

  const renderPage = (id: PageId): ReactNode => {
    switch (id) {
      case 'weekly':
        return <WeeklyNutritionPage week={week} />;
      case 'energy':
        return <EnergyBalancePage program={program} log={foodLog} today={today} />;
      case 'daily':
        return <DailyNutritionPage day={todaySummary} />;
    }
  };

  const renderCard = (id: CardId): ReactNode => {
    if (isNutrientCard(id)) {
      const { title, unit: nutrientUnit, color } = NUTRIENT_STYLE[id];
      const consumed = todaySummary.consumed[id];
      const target = todaySummary.target[id];
      const remaining = layout.nutritionModes[id] === 'remaining';
      return (
        <MetricCard
          key={id}
          title={title}
          subtitle={remaining ? 'Remaining today' : 'Today'}
          value={String(remaining ? remainingAmount(consumed, target) : Math.round(consumed))}
          unit={nutrientUnit}
          onPress={seeAll(title)}
        >
          <TargetBar
            fraction={
              target > 0 ? (remaining ? (target - consumed) / target : consumed / target) : 0
            }
            color={color}
          />
        </MetricCard>
      );
    }

    switch (id) {
      case 'expenditure':
        return (
          <MetricCard
            key={id}
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
        );
      case 'weightTrend':
        return (
          <MetricCard
            key={id}
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
        );
      case 'weighIn':
        return (
          <MetricCard
            key={id}
            title="Weigh-In"
            subtitle="Last 30 Days"
            value={`${countThisWeek(weighInDates, today)}/7`}
            unit="this week"
          >
            <HabitGrid days={habitGrid(weighInDates, today)} />
          </MetricCard>
        );
      case 'foodLogging':
        return (
          <MetricCard
            key={id}
            title="Food Logging"
            subtitle="Last 30 Days"
            value={`${countThisWeek(foodDates, today)}/7`}
            unit="this week"
          >
            <HabitGrid days={habitGrid(foodDates, today)} />
          </MetricCard>
        );
      case 'scaleWeight':
        return (
          <MetricCard
            key={id}
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
        );
      case 'bodyFat':
        return (
          <MetricCard
            key={id}
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
        );
      case 'steps':
        return (
          <MetricCard
            key={id}
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
        );
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            DASHBOARD
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Customize dashboard"
            onPress={onCustomize}
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
          {pagerWidth > 0 &&
            pages.map((id) => (
              <View key={id} style={{ width: pagerWidth }}>
                {renderPage(id)}
              </View>
            ))}
        </ScrollView>
      </View>

      <View style={styles.bottom}>
        {pages.length > 1 && (
          <View
            style={styles.dots}
            accessibilityLabel={`Page ${page + 1} of ${pages.length}`}
            accessible
          >
            {pages.map((id, i) => (
              <View key={id} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
        )}

        {layout.sections
          .filter((section) => section.cards.length > 0)
          .map((section) => (
            <View key={section.id}>
              <SectionHeader
                title={SECTION_NAMES[section.id]}
                onSeeAll={SEE_ALL[section.id] ? seeAll(SECTION_NAMES[section.id]) : undefined}
              />
              {pairs(section.cards).map((pair) => (
                <CardRow key={pair.join('-')}>
                  {pair.map(renderCard)}
                  {pair.length === 1 && <View style={styles.cardSpacer} />}
                </CardRow>
              ))}
            </View>
          ))}

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

/** Splits cards into rows of two. */
function pairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
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
