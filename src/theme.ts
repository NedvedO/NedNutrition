import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const colors = {
  background: '#1E1E1E',
  surface: '#2A2A2A',
  border: '#3D3D3D',
  borderSelected: '#FFFFFF',
  text: '#FFFFFF',
  textMuted: '#B3B3B3',
  track: '#4A4A4A',
  buttonText: '#111111',
  danger: '#FF8A80',
  calories: '#6E9BF5',
  protein: '#F28B66',
  fat: '#F7CF5C',
  carbs: '#5DBB86',
  /** Darker background for the lower half of the dashboard. */
  backgroundDeep: '#141414',
  card: '#222222',
  expenditure: '#D9714E',
  weight: '#B18CFF',
} as const;

export const spacing = {
  screen: 20,
  gap: 16,
} as const;

export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
