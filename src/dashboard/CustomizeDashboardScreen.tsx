import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gauge } from '../components/charts';
import { CheckRow } from '../components/CheckRow';
import { ReorderableList } from '../components/ReorderableList';
import { colors, spacing } from '../theme';
import {
  CARD_NAMES,
  type CardId,
  DEFAULT_LAYOUT,
  type DashboardLayout,
  isNutrientCard,
  moveItem,
  movePage,
  moveSection,
  PAGE_NAMES,
  type PageId,
  SECTION_ADD_LABELS,
  SECTION_CARDS,
  SECTION_NAMES,
  type SectionId,
  setNutritionMode,
  setSectionCards,
  toggleCard,
  togglePage,
} from './layout';

const ROW_HEIGHT = 70;

type Props = {
  initial: DashboardLayout;
  onCancel: () => void;
  onSave: (layout: DashboardLayout) => void;
};

export function CustomizeDashboardScreen({ initial, onCancel, onSave }: Props) {
  const [layout, setLayout] = useState(initial);
  const [editing, setEditing] = useState<SectionId | null>(null);
  const [dragging, setDragging] = useState(false);
  const visibleCount = layout.pages.filter((p) => p.visible).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={onCancel}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.headerTitle}>
          Customize Dashboard
        </Text>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => onSave(layout)}>
          <Text style={styles.save}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        scrollEnabled={!dragging}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <View style={styles.focusArea}>
          <Text style={[styles.sectionTitle, styles.focusTitle]}>Primary Focus</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pages}
          >
            {layout.pages.map((page, index) => (
              <View key={page.id} style={styles.pageColumn}>
                <View style={[styles.pageCard, page.visible && styles.pageCardOn]}>
                  <View style={styles.pageCardTop}>
                    <Text style={styles.pageName}>{PAGE_NAMES[page.id]}</Text>
                    <Switch
                      accessibilityLabel={`Show ${PAGE_NAMES[page.id]}`}
                      value={page.visible}
                      disabled={page.visible && visibleCount === 1}
                      onValueChange={() => setLayout(togglePage(layout, page.id))}
                      trackColor={{ false: colors.track, true: colors.text }}
                      thumbColor={page.visible ? colors.buttonText : colors.textMuted}
                      ios_backgroundColor={colors.track}
                    />
                  </View>
                  <PageThumbnail id={page.id} />
                </View>
                <View style={styles.pageArrows}>
                  {index > 0 && (
                    <ArrowButton
                      icon="arrow-left"
                      label={`Move ${PAGE_NAMES[page.id]} left`}
                      onPress={() => setLayout(movePage(layout, index, -1))}
                    />
                  )}
                  {index < layout.pages.length - 1 && (
                    <ArrowButton
                      icon="arrow-right"
                      label={`Move ${PAGE_NAMES[page.id]} right`}
                      onPress={() => setLayout(movePage(layout, index, 1))}
                    />
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
          {visibleCount === 1 && <Text style={styles.hint}>At least one page stays on.</Text>}
        </View>

        <View style={styles.sections}>
          {layout.sections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{SECTION_NAMES[section.id]}</Text>
                <View style={styles.sectionArrows}>
                  <ArrowButton
                    icon="arrow-up"
                    label={`Move ${SECTION_NAMES[section.id]} up`}
                    disabled={sectionIndex === 0}
                    onPress={() => setLayout(moveSection(layout, sectionIndex, -1))}
                  />
                  <ArrowButton
                    icon="arrow-down"
                    label={`Move ${SECTION_NAMES[section.id]} down`}
                    disabled={sectionIndex === layout.sections.length - 1}
                    onPress={() => setLayout(moveSection(layout, sectionIndex, 1))}
                  />
                </View>
              </View>

              <View style={styles.card}>
                {section.cards.length === 0 && (
                  <Text style={styles.empty}>Hidden from your dashboard</Text>
                )}
                <ReorderableList
                  items={section.cards}
                  keyOf={(c) => c}
                  labelOf={(c) => CARD_NAMES[c]}
                  rowHeight={ROW_HEIGHT}
                  onDragChange={setDragging}
                  onMove={(from, to) =>
                    setLayout((current) => {
                      const cards = current.sections.find((s) => s.id === section.id)!.cards;
                      return setSectionCards(current, section.id, moveItem(cards, from, to));
                    })
                  }
                  renderRow={(card, handle, index) => (
                    <View style={styles.row}>
                      <CardIcon id={card} />
                      <View style={[styles.rowBody, index > 0 && styles.rowDivider]}>
                        <Text style={styles.rowName}>{CARD_NAMES[card]}</Text>
                        {isNutrientCard(card) && (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${CARD_NAMES[card]} shows ${layout.nutritionModes[card]}. Tap to change.`}
                            onPress={() =>
                              setLayout(
                                setNutritionMode(
                                  layout,
                                  card,
                                  layout.nutritionModes[card] === 'consumed'
                                    ? 'remaining'
                                    : 'consumed',
                                ),
                              )
                            }
                            style={styles.mode}
                          >
                            <Text style={styles.modeText}>
                              {layout.nutritionModes[card] === 'consumed'
                                ? 'Consumed'
                                : 'Remaining'}
                            </Text>
                            <MaterialCommunityIcons
                              name="chevron-down"
                              size={22}
                              color={colors.text}
                            />
                          </Pressable>
                        )}
                        {handle}
                      </View>
                    </View>
                  )}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: editing === section.id }}
                  onPress={() => setEditing(editing === section.id ? null : section.id)}
                  style={styles.addButton}
                >
                  <Text style={styles.addText}>
                    {editing === section.id ? 'Done' : SECTION_ADD_LABELS[section.id]}
                  </Text>
                </Pressable>

                {editing === section.id && (
                  <View style={styles.picker}>
                    {SECTION_CARDS[section.id].map((card) => (
                      <CheckRow
                        key={card}
                        label={CARD_NAMES[card]}
                        checked={section.cards.includes(card)}
                        onToggle={() => setLayout(toggleCard(layout, section.id, card))}
                      />
                    ))}
                    {section.id === 'nutrition' && (
                      <Text style={styles.pickerNote}>Vitamins and minerals are coming soon.</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLayout(DEFAULT_LAYOUT);
              setEditing(null);
            }}
            style={styles.reset}
          >
            <Text style={styles.resetText}>Reset to App Defaults</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ArrowButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right';
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={styles.arrow}
    >
      <MaterialCommunityIcons name={icon} size={26} color={disabled ? colors.track : colors.text} />
    </Pressable>
  );
}

// ---- Small pictures for each card and page ----

function Squares({ color }: { color: string }) {
  return (
    <View style={styles.squares}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.square, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function CardIcon({ id }: { id: CardId }) {
  let content;
  switch (id) {
    case 'expenditure':
      content = <MaterialCommunityIcons name="chart-bell-curve" size={30} color={colors.protein} />;
      break;
    case 'weightTrend':
      content = <MaterialCommunityIcons name="chart-bell-curve" size={30} color={colors.weight} />;
      break;
    case 'weighIn':
      content = <Squares color={colors.carbs} />;
      break;
    case 'foodLogging':
      content = <Squares color={colors.calories} />;
      break;
    case 'scaleWeight':
      content = <MaterialCommunityIcons name="scale-bathroom" size={28} color={colors.carbs} />;
      break;
    case 'bodyFat':
      content = <MaterialCommunityIcons name="human" size={28} color={colors.carbs} />;
      break;
    case 'steps':
      content = <MaterialCommunityIcons name="chart-bar" size={30} color={colors.protein} />;
      break;
    default: {
      const color = {
        calories: colors.calories,
        protein: colors.protein,
        fat: colors.fat,
        carbs: colors.carbs,
      }[id];
      content = <View style={[styles.swatch, { backgroundColor: color }]} />;
    }
  }
  return <View style={styles.icon}>{content}</View>;
}

const MACRO_COLORS = [colors.calories, colors.protein, colors.fat, colors.carbs];
const ENERGY_BARS = [
  0.6, 0.7, 0.9, 0.6, 0.7, 0.95, 0.65, 0.6, 0.9, 0.7, 0.6, 0.95, 0.6, 0.7, 0.9, 0.6, 0.7, 0.95,
];

function PageThumbnail({ id }: { id: PageId }) {
  if (id === 'weekly') {
    return (
      <View style={styles.thumbRow}>
        <View style={styles.thumbGrid}>
          {MACRO_COLORS.map((color) => (
            <View key={color} style={styles.thumbGridRow}>
              {Array.from({ length: 7 }, (_, i) => (
                <View key={i} style={styles.thumbCell}>
                  <View style={[styles.thumbBar, { backgroundColor: color }]} />
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.thumbPills}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.thumbPill} />
          ))}
        </View>
      </View>
    );
  }
  if (id === 'energy') {
    return (
      <View>
        <View style={styles.energyBars}>
          {ENERGY_BARS.map((h, i) => (
            <View key={i} style={[styles.energyBar, { height: `${h * 100}%` }]} />
          ))}
          <View style={styles.energyLine} />
        </View>
        <ThumbFooter />
      </View>
    );
  }
  return (
    <View style={styles.dailyThumb}>
      <Gauge size={86} fraction={0.6} color={colors.calories} />
      <ThumbFooter />
    </View>
  );
}

function ThumbFooter() {
  return (
    <View style={styles.thumbFooter}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.thumbFooterPill} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen - 8,
    height: 56,
  },
  headerTitle: { color: colors.text, fontSize: 20 },
  save: { color: colors.text, fontSize: 18, paddingHorizontal: 8 },
  scroll: { flex: 1, backgroundColor: colors.backgroundDeep },
  content: { paddingBottom: 40 },
  focusArea: { backgroundColor: colors.background, paddingBottom: 20, paddingTop: 8 },
  focusTitle: { paddingHorizontal: spacing.screen },
  pages: { paddingHorizontal: spacing.screen, gap: 14, paddingTop: 14 },
  pageColumn: { width: 186, gap: 10 },
  pageCard: {
    height: 170,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  pageCardOn: { borderColor: colors.text },
  pageCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageName: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  pageArrows: { flexDirection: 'row', justifyContent: 'center', gap: 26, minHeight: 30 },
  hint: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6 },
  sections: { paddingHorizontal: spacing.screen },
  section: { marginTop: 36 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 0,
    marginLeft: 0,
  },
  sectionArrows: { flexDirection: 'row', gap: 20 },
  arrow: { padding: 4 },
  card: { backgroundColor: colors.card, borderRadius: 18, paddingVertical: 8, paddingLeft: 16 },
  empty: { color: colors.textMuted, fontSize: 16, paddingVertical: 16 },
  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowBody: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.track },
  rowName: { flex: 1, color: colors.text, fontSize: 18 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 14 },
  modeText: { color: colors.textMuted, fontSize: 17 },
  icon: {
    width: 40,
    height: 34,
    backgroundColor: colors.surface,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 32, height: 8 },
  squares: { flexDirection: 'row', gap: 3 },
  square: { width: 8, height: 8, borderRadius: 2 },
  addButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    marginRight: 16,
  },
  addText: { color: colors.text, fontSize: 18 },
  picker: { paddingRight: 16, paddingBottom: 8 },
  pickerNote: { color: colors.textMuted, fontSize: 14, paddingTop: 12 },
  reset: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 36,
  },
  resetText: { color: colors.danger, fontSize: 18 },

  // Thumbnails
  thumbRow: { flexDirection: 'row', gap: 8, flex: 1 },
  thumbGrid: { flex: 1, gap: 4 },
  thumbGridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  thumbCell: {
    width: 12,
    height: 22,
    backgroundColor: colors.surface,
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  thumbBar: { width: 3, height: 15, borderRadius: 1 },
  thumbPills: { gap: 5, paddingTop: 2 },
  thumbPill: { width: 30, height: 14, borderRadius: 4, backgroundColor: colors.surface },
  energyBars: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  energyBar: { width: 5, backgroundColor: colors.calories },
  energyLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    height: 2,
    backgroundColor: colors.protein,
  },
  thumbFooter: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14 },
  thumbFooterPill: { width: 32, height: 16, borderRadius: 4, backgroundColor: colors.surface },
  dailyThumb: { alignItems: 'center', marginTop: -6 },
});
