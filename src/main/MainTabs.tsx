import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomizeDashboardScreen } from '../dashboard/CustomizeDashboardScreen';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { sanitizeLayout } from '../dashboard/layout';
import type { Preferences, SavedState } from '../storage/appState';
import { colors, spacing, type IconName } from '../theme';
import { ComingSoonContent, ComingSoonScreen } from './ComingSoonScreen';
import { MoreScreen } from './MoreScreen';
import { StrategyScreen } from './StrategyScreen';

type Tab = 'dashboard' | 'foodLog' | 'strategy' | 'more';

const TABS: { id: Tab; label: string; icon: IconName; iconActive: IconName }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard-outline',
    iconActive: 'view-dashboard',
  },
  { id: 'foodLog', label: 'Food Log', icon: 'food-apple-outline', iconActive: 'food-apple' },
  { id: 'strategy', label: 'Strategy', icon: 'chart-donut', iconActive: 'chart-donut-variant' },
  {
    id: 'more',
    label: 'More',
    icon: 'dots-horizontal-circle-outline',
    iconActive: 'dots-horizontal-circle',
  },
];

const FOOD_LOGGING_MESSAGE =
  'Search foods, scan barcodes and log your meals. This is the next part of NedNutrition being built.';

type Props = {
  state: SavedState;
  onRedoSetup: () => void;
  onChangePreferences: (preferences: Preferences) => void;
  onDeleteData: () => void;
};

export function MainTabs({ state, onRedoSetup, onChangePreferences, onDeleteData }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [comingSoon, setComingSoon] = useState<{ title: string; message: string } | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [today] = useState(() => new Date());

  const openFoodLogging = () => setTab('foodLog');

  if (customizing) {
    return (
      <CustomizeDashboardScreen
        initial={sanitizeLayout(state.preferences.dashboard)}
        onCancel={() => setCustomizing(false)}
        onSave={(dashboard) => {
          onChangePreferences({ ...state.preferences, dashboard });
          setCustomizing(false);
        }}
      />
    );
  }

  if (comingSoon) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ComingSoonScreen {...comingSoon} onBack={() => setComingSoon(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.body}>
        {tab === 'dashboard' && (
          <DashboardScreen
            state={state}
            today={today}
            onComingSoon={(title, message) => setComingSoon({ title, message })}
            onCustomize={() => setCustomizing(true)}
          />
        )}
        {tab === 'foodLog' && (
          <ComingSoonContent title="Food Log" message={FOOD_LOGGING_MESSAGE} icon="food-apple" />
        )}
        {tab === 'strategy' && <StrategyScreen state={state} onRedoSetup={onRedoSetup} />}
        {tab === 'more' && (
          <MoreScreen
            preferences={state.preferences}
            onChangePreferences={onChangePreferences}
            onDeleteData={onDeleteData}
          />
        )}

        {tab === 'dashboard' && (
          <View style={styles.searchRow} pointerEvents="box-none">
            <Pressable
              accessibilityRole="search"
              accessibilityLabel="Search for a food"
              onPress={openFoodLogging}
              style={styles.searchBar}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
              <Text style={styles.searchText}>Search for a food</Text>
              <MaterialCommunityIcons name="barcode-scan" size={24} color={colors.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log a meal with AI"
              onPress={() =>
                setComingSoon({
                  title: 'AI meal logging',
                  message: 'Take a photo or describe a meal to log it. Coming soon.',
                })
              }
              style={styles.aiButton}
            >
              <MaterialCommunityIcons name="creation" size={26} color={colors.text} />
            </Pressable>
          </View>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        <View style={styles.tabRow} accessibilityRole="tablist">
          {TABS.slice(0, 2).map((t) => (
            <TabButton key={t.id} tab={t} active={tab === t.id} onPress={() => setTab(t.id)} />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add food"
            onPress={openFoodLogging}
            style={styles.addButton}
          >
            <MaterialCommunityIcons name="plus" size={30} color={colors.buttonText} />
          </Pressable>
          {TABS.slice(2).map((t) => (
            <TabButton key={t.id} tab={t} active={tab === t.id} onPress={() => setTab(t.id)} />
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

function TabButton({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? colors.text : colors.textMuted;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
      onPress={onPress}
      style={styles.tab}
    >
      <MaterialCommunityIcons name={active ? tab.iconActive : tab.icon} size={28} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  searchRow: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    bottom: 12,
    flexDirection: 'row',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  searchText: { flex: 1, color: colors.textMuted, fontSize: 18 },
  aiButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.track,
  },
  tabRow: { flexDirection: 'row', alignItems: 'center', height: 68 },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 12 },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
});
