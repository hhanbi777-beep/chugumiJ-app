import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from './colors';

export { darkColors, lightColors, palette, type ThemeColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '700' },
  section: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
} as const;

/** 최소 터치 영역 (접근성) */
export const MIN_TOUCH = 44;

export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}
