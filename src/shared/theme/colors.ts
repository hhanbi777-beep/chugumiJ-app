/** 색상 토큰. 컴포넌트에서 hex를 직접 쓰지 않고 이 값만 사용한다. */
export const palette = {
  accent: '#2F5BD9',
  accentPressed: '#1E3F9E',
  danger: '#B3261E',
  warning: '#C2410C',
  categoryOrange: '#E07B39',
} as const;

export const lightColors = {
  ...palette,
  background: '#F7F7F8',
  surface: '#FFFFFF',
  border: '#ECECEE',
  borderStrong: '#DADCE0',
  text: '#1A1A1A',
  textSecondary: '#5F6368',
  textDisabled: '#80868B',
  onAccent: '#FFFFFF',
} as const;

export const darkColors: ThemeColors = {
  ...palette,
  accent: '#6E8EF5',
  background: '#121214',
  surface: '#1E1F22',
  border: '#2A2B2F',
  borderStrong: '#3A3C41',
  text: '#F2F2F3',
  textSecondary: '#B0B4BA',
  textDisabled: '#7C8087',
  onAccent: '#FFFFFF',
};

export type ThemeColors = { [K in keyof typeof lightColors]: string };
