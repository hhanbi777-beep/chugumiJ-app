import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';

type FieldGroupProps = {
  children: ReactNode;
};

/** 설정 화면처럼 둥근 카드 안에 행을 쌓는다. 행 사이 구분선 자동. */
export function FieldGroup({ children }: FieldGroupProps) {
  const colors = useThemeColors();
  const items = Children.toArray(children);
  return (
    <View style={[styles.group, { backgroundColor: colors.surface }]}>
      {items.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

type FieldRowProps = {
  label: string;
  children?: ReactNode;
};

/** 왼쪽 라벨 + 오른쪽 입력(토글, 날짜 버튼 등) 한 줄. */
export function FieldRow({ label, children }: FieldRowProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
      <View style={styles.value}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.md, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg },
  row: {
    minHeight: MIN_TOUCH + 4,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  value: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
