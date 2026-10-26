import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';

import type { Task } from '../types';

type TaskRowProps = {
  task: Task;
  meta?: string;
  onToggle: (task: Task) => void;
};

export function TaskRow({ task, meta, onToggle }: TaskRowProps) {
  const colors = useThemeColors();
  const isDone = task.completedAt !== null;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isDone }}
      accessibilityLabel={task.title}
      onPress={() => onToggle(task)}
      style={[styles.row, { borderBottomColor: colors.border }]}>
      <View
        style={[
          styles.check,
          { borderColor: colors.accent, backgroundColor: isDone ? colors.accent : 'transparent' },
        ]}
      />
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
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  check: { width: 20, height: 20, borderRadius: radius.pill, borderWidth: 2 },
  title: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
});
