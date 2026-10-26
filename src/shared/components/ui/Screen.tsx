import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, typography, useThemeColors } from '@/shared/theme';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

/** 탭 화면 공통 레이아웃: 큰 제목 + 본문 영역. */
export function Screen({ title, subtitle, children }: ScreenProps) {
  const colors = useThemeColors();
  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
        <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  body: { flex: 1, paddingHorizontal: spacing.xl },
});
