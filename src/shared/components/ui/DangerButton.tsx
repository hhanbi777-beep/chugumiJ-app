import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH, radius, typography, useThemeColors } from '@/shared/theme';

type DangerButtonProps = {
  label: string;
  onPress: () => void;
};

/** 삭제처럼 되돌리기 어려운 동작 */
export function DangerButton({ label, onPress }: DangerButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.surface }]}>
      <Text style={[typography.body, { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
