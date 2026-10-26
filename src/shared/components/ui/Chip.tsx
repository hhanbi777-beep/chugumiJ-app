import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';

type ChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  /** 색상 점 (카테고리 표시용) */
  dotColor?: string;
};

export function Chip({ label, isSelected, onPress, dotColor }: ChipProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      hitSlop={4}
      style={[
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.accent : colors.borderStrong,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <Text style={[typography.caption, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH - 8,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
