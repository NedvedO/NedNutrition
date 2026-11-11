import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, type IconName } from '../theme';

type Slide = { headline: string; body: string; icon: IconName };

export const SLIDES: Slide[] = [
  {
    headline: 'A PLAN BUILT AROUND YOU',
    body: 'Answer a few questions and get daily calorie and macro targets based on your body, your goal, and your training.',
    icon: 'target',
  },
  {
    headline: 'EAT MORE ON THE DAYS YOU NEED IT',
    body: 'Spread your calories across the week your way, with higher targets on training days or weekends.',
    icon: 'calendar-week',
  },
  {
    headline: 'LOG FOOD, SEE WHAT’S LEFT',
    body: 'Search foods, log your meals, and see your protein, carbs and fat against today’s targets.',
    icon: 'silverware-fork-knife',
  },
];

export const TAGLINE = 'Your nutrition, your numbers.';

type Props = { onFinish: () => void };

export function WelcomeCarousel({ onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>NedNutrition</Text>
      </View>

      <View style={styles.slide}>
        <Text accessibilityRole="header" style={styles.headline}>
          {slide.headline}
        </Text>

        <View style={styles.illustrationRow}>
          <ArrowButton
            direction="left"
            disabled={index === 0}
            onPress={() => setIndex(index - 1)}
          />
          <View style={styles.illustration}>
            <MaterialCommunityIcons name={slide.icon} size={110} color={colors.text} />
          </View>
          <ArrowButton direction="right" disabled={isLast} onPress={() => setIndex(index + 1)} />
        </View>

        <Text style={styles.body}>{slide.body}</Text>

        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.headline} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={isLast ? 'Get started' : 'Continue'}
          onPress={() => (isLast ? onFinish() : setIndex(index + 1))}
        />
        <Text style={styles.tagline}>{TAGLINE}</Text>
      </View>
    </SafeAreaView>
  );
}

function ArrowButton({
  direction,
  disabled,
  onPress,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={direction === 'left' ? 'Previous' : 'Next'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.arrow, disabled && styles.arrowHidden]}
    >
      <MaterialCommunityIcons
        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
        size={30}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  brandRow: { height: 56, justifyContent: 'center', alignItems: 'center' },
  brand: { color: colors.textMuted, fontSize: 16, letterSpacing: 1 },
  slide: { flex: 1, paddingHorizontal: spacing.screen, justifyContent: 'center' },
  headline: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  illustrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 40,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHidden: { opacity: 0 },
  body: { color: colors.textMuted, fontSize: 18, lineHeight: 26, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.track },
  dotActive: { backgroundColor: colors.text },
  footer: { paddingHorizontal: spacing.screen, paddingBottom: 8, gap: 16 },
  tagline: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
});
