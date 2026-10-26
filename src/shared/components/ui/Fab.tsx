import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, useThemeColors } from '@/shared/theme';

type FabProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

/** 화면 오른쪽 아래 떠 있는 + 버튼 */
export function Fab({ accessibilityLabel, onPress }: FabProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: pressed ? colors.accentPressed : colors.accent },
      ]}>
      <Text style={[styles.plus, { color: colors.onAccent }]}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  plus: { fontSize: 28, lineHeight: 30, fontWeight: '400' },
});
