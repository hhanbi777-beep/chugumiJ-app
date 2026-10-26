import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useThemeColors } from '@/shared/theme';

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.root}>
      <Text style={[typography.body, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: spacing.xxl, alignItems: 'center' },
});
