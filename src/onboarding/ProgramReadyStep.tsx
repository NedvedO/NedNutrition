import { StyleSheet, Text, View } from 'react-native';

import type { DayTarget, Goal, MacroProgram } from '../program/types';
import { colors, WEEKDAY_NAMES } from '../theme';

const MAX_BAR_HEIGHT = 300;

type Props = {
  program: MacroProgram;
  goal: Goal;
  proteinPerPound: string;
};

export function ProgramReadyStep({ program, goal, proteinPerPound }: Props) {
  const maxCalories = Math.max(...program.days.map((d) => d.calories));
  const hasHighDays = program.days.some((d) => d.isHighDay);

  return (
    <View>
      <View style={styles.chart}>
        {program.days.map((day) => (
          <DayColumn key={day.day} day={day} maxCalories={maxCalories} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>How your program was built</Text>

      <Explanation
        number={1}
        title="Estimated expenditure"
        value={`${program.expenditure} kcal`}
        valueColor={colors.calories}
        body="Estimated from your age, sex, height, weight and training. Real expenditure varies from person to person, so treat this as a starting point."
      />
      <Explanation
        number={2}
        title="Average target"
        value={`${program.averageCalories} kcal`}
        valueColor={colors.carbs}
        body={targetExplanation(goal, program)}
      />
      <Explanation
        number={3}
        title="Protein"
        value={`${program.days[0].protein} g per day`}
        valueColor={colors.protein}
        body={`Based on your preference of ${proteinPerPound}. The rest of your calories are split between fat and carbs to match your diet style.`}
      />
      {hasHighDays && (
        <Explanation
          number={4}
          title="Weekly distribution"
          value="Higher on your chosen days"
          valueColor={colors.fat}
          body="Your chosen days get more calories and the other days slightly less, so your weekly total stays the same."
          last
        />
      )}

      <Text style={styles.disclaimer}>
        These targets are estimates, not medical advice. If you have a health condition, are
        pregnant, or have a history of disordered eating, talk to a doctor or dietitian first.
      </Text>
    </View>
  );
}

function targetExplanation(goal: Goal, program: MacroProgram): string {
  if (program.hitCalorieFloor) {
    return 'Your target was raised to 1,200 kcal, the lowest daily target NedNutrition will set.';
  }
  const change = Math.abs(program.dailyAdjustment);
  switch (goal) {
    case 'lose':
      return `To lose about 0.5% of your body weight per week, your target is ${change} kcal below your expenditure.`;
    case 'gain':
      return `To gain about 0.25% of your body weight per week, your target is ${change} kcal above your expenditure.`;
    case 'maintain':
      return 'To keep your weight steady, your target matches your expenditure.';
  }
}

function DayColumn({ day, maxCalories }: { day: DayTarget; maxCalories: number }) {
  const scale = MAX_BAR_HEIGHT / maxCalories;
  const segments = [
    { key: 'P', grams: day.protein, kcal: day.protein * 4, color: colors.protein },
    { key: 'F', grams: day.fat, kcal: day.fat * 9, color: colors.fat },
    { key: 'C', grams: day.carbs, kcal: day.carbs * 4, color: colors.carbs },
  ];

  return (
    <View
      accessible
      accessibilityLabel={`${WEEKDAY_NAMES[day.day]}: ${day.calories} calories, ${day.protein} grams protein, ${day.fat} grams fat, ${day.carbs} grams carbs`}
      style={styles.column}
    >
      <View style={styles.caloriePill}>
        <Text style={styles.calorieText} numberOfLines={1} adjustsFontSizeToFit>
          {day.calories}
        </Text>
      </View>
      {segments.map((s) => (
        <View
          key={s.key}
          style={[
            styles.segment,
            { backgroundColor: s.color, height: Math.max(s.kcal * scale, 28) },
          ]}
        >
          <Text style={styles.segmentText} numberOfLines={1} adjustsFontSizeToFit>
            {s.grams} {s.key}
          </Text>
        </View>
      ))}
      <Text style={styles.dayLetter}>{WEEKDAY_NAMES[day.day][0]}</Text>
    </View>
  );
}

function Explanation({
  number,
  title,
  value,
  valueColor,
  body,
  last = false,
}: {
  number: number;
  title: string;
  value: string;
  valueColor: string;
  body: string;
  last?: boolean;
}) {
  return (
    <View style={styles.explanation}>
      <View style={styles.timeline}>
        <View style={styles.numberCircle}>
          <Text style={styles.number}>{number}</Text>
        </View>
        {!last && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.explanationText}>
        <Text style={styles.explanationTitle}>{title}</Text>
        <Text style={[styles.explanationValue, { color: valueColor }]}>{value}</Text>
        <Text style={styles.explanationBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 36,
  },
  column: { flex: 1, gap: 4, alignItems: 'stretch' },
  caloriePill: {
    backgroundColor: colors.calories,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    marginBottom: 4,
  },
  calorieText: { color: colors.buttonText, fontSize: 13 },
  segment: {
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  segmentText: { color: colors.buttonText, fontSize: 13 },
  dayLetter: { color: colors.text, fontSize: 18, textAlign: 'center', marginTop: 10 },
  sectionTitle: { color: colors.text, fontSize: 22, marginBottom: 20 },
  explanation: { flexDirection: 'row', gap: 20 },
  timeline: { alignItems: 'center', width: 36 },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { color: colors.buttonText, fontSize: 18 },
  timelineLine: { flex: 1, width: 1, backgroundColor: colors.track, marginVertical: 4 },
  explanationText: { flex: 1, paddingBottom: 28, gap: 2 },
  explanationTitle: { color: colors.text, fontSize: 19 },
  explanationValue: { fontSize: 19 },
  explanationBody: { color: colors.textMuted, fontSize: 16, lineHeight: 23, marginTop: 6 },
  disclaimer: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4 },
});
