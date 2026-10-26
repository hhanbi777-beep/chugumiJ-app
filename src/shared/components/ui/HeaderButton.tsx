import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH, typography, useThemeColors } from '@/shared/theme';

type HeaderButtonProps = {
  label: string;
  onPress: () => void;
  isPrimary?: boolean;
  isDisabled?: boolean;
};

/** 시트 상단의 취소·저장 버튼 */
export function HeaderButton({ label, onPress, isPrimary = false, isDisabled = false }: HeaderButtonProps) {
  const colors = useThemeColors();
  const color = isDisabled ? colors.textDisabled : isPrimary ? colors.accent : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={8}
      style={styles.button}>
      <Text style={[typography.body, { color, fontWeight: isPrimary ? '700' : '400' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, justifyContent: 'center', alignItems: 'center' },
});
