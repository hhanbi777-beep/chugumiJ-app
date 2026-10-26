import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';
import { dayOfMonth } from '@/shared/utils/date';

import type { DayMarks } from '../hooks/useMonthMarks';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

type MonthGridProps = {
  weeks: string[][];
  /** 이번 달 1일 키 (앞뒤 달 날짜를 흐리게) */
  monthKey: string;
  selectedKey: string;
  todayKey: string;
  marks: Map<string, DayMarks>;
  onSelect: (dateKey: string) => void;
};

export function MonthGrid({ weeks, monthKey, selectedKey, todayKey, marks, onSelect }: MonthGridProps) {
  const colors = useThemeColors();
  const monthPrefix = monthKey.slice(0, 7);

  return (
    <View style={styles.grid}>
      <View style={styles.week}>
        {WEEKDAYS.map((label, i) => (
          <Text
            key={label}
            style={[
              typography.small,
              styles.weekday,
              { color: i === 0 ? colors.danger : colors.textSecondary },
            ]}>
            {label}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]} style={styles.week}>
          {week.map((key) => (
            <DayCell
              key={key}
              dateKey={key}
              isOtherMonth={!key.startsWith(monthPrefix)}
              isSelected={key === selectedKey}
              isToday={key === todayKey}
              marks={marks.get(key)}
              onSelect={onSelect}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

type DayCellProps = {
  dateKey: string;
  isOtherMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  marks: DayMarks | undefined;
  onSelect: (dateKey: string) => void;
};

const DayCell = memo(function DayCell({
  dateKey,
  isOtherMonth,
  isSelected,
  isToday,
  marks,
  onSelect,
}: DayCellProps) {
  const colors = useThemeColors();
  const day = dayOfMonth(dateKey);
  const textColor = isSelected ? colors.onAccent : isOtherMonth ? colors.textDisabled : colors.text;
  const dotCount = (marks?.eventColors.length ?? 0) + (marks?.hasOpenTask ? 1 : 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${dateKey}${dotCount > 0 ? ', 일정 있음' : ''}`}
      onPress={() => onSelect(dateKey)}
      style={styles.cell}>
      <View
        style={[
          styles.dayCircle,
          isSelected && { backgroundColor: colors.accent },
          !isSelected && isToday && { borderColor: colors.accent, borderWidth: 1.5 },
        ]}>
        <Text style={[typography.body, { color: textColor }, isToday && styles.todayText]}>{day}</Text>
      </View>
      <View style={styles.dots}>
        {marks?.eventColors.map((color) => (
          <View key={color} style={[styles.dot, { backgroundColor: color }]} />
        ))}
        {marks?.hasOpenTask ? (
          <View style={[styles.dot, styles.taskDot, { borderColor: colors.textSecondary }]} />
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  grid: { gap: spacing.xs },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', paddingVertical: spacing.xs },
  cell: { flex: 1, minHeight: MIN_TOUCH + 4, alignItems: 'center', gap: 2 },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: { fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 3, height: 6 },
  dot: { width: 5, height: 5, borderRadius: radius.pill },
  taskDot: { backgroundColor: 'transparent', borderWidth: 1 },
});
