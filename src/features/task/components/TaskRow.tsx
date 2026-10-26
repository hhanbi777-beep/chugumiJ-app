import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';

import type { Task } from '../types';

type TaskRowProps = {
  task: Task;
  meta?: string;
  onToggle: (task: Task) => void;
  /** 행 본문을 눌렀을 때 (편집 열기). 체크 원은 onToggle */
  onPress?: (task: Task) => void;
};

export function TaskRow({ task, meta, onToggle, onPress }: TaskRowProps) {
  const colors = useThemeColors();
  const isDone = task.completedAt !== null;

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={`${task.title} 완료`}
        onPress={() => onToggle(task)}
        hitSlop={spacing.sm}
        style={styles.checkTouch}>
        <View
          style={[
            styles.check,
            { borderColor: colors.accent, backgroundColor: isDone ? colors.accent : 'transparent' },
          ]}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={task.title}
        disabled={!onPress}
        onPress={() => onPress?.(task)}
        style={styles.body}>
        <Text
          style={[
            typography.body,
            styles.title,
            { color: isDone ? colors.textDisabled : colors.text },
            isDone && styles.done,
          ]}
          numberOfLines={1}>
          {task.title}
        </Text>
        {meta ? <Text style={[typography.small, { color: colors.textSecondary }]}>{meta}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkTouch: { width: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  check: { width: 20, height: 20, borderRadius: radius.pill, borderWidth: 2 },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
});
