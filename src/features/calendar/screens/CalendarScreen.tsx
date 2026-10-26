import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EventCard, useCategoryColors, useEventsOn } from '@/features/event';
import { TaskRow, useTaskActions, useTasksDueBetween } from '@/features/task';
import { EmptyState, Fab, HeaderButton, Screen } from '@/shared/components/ui';
import { useAddPrompt } from '@/shared/hooks/useAddPrompt';
import { MIN_TOUCH, palette, radius, spacing, typography, useThemeColors } from '@/shared/theme';
import {
  addDaysToKey,
  addMonthsToKey,
  formatDayTitle,
  formatMonthTitle,
  fromDateKey,
  monthGridWeeks,
  monthStartKey,
  todayKey as getTodayKey,
} from '@/shared/utils/date';

import { MonthGrid } from '../components/MonthGrid';
import { useMonthMarks } from '../hooks/useMonthMarks';

/** 월간 캘린더 + 선택한 날의 일정·할 일 */
export function CalendarScreen() {
  const colors = useThemeColors();
  const todayKey = getTodayKey();
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [monthKey, setMonthKey] = useState(() => monthStartKey(todayKey));

  const weeks = monthGridWeeks(monthKey);
  const gridStart = weeks[0][0];
  const gridEnd = addDaysToKey(weeks[weeks.length - 1][6], 1);
  const marks = useMonthMarks(gridStart, gridEnd);

  const events = useEventsOn(selectedKey);
  const tasks = useTasksDueBetween(selectedKey, addDaysToKey(selectedKey, 1));
  const categoryColors = useCategoryColors();
  const { toggleCompleted } = useTaskActions();
  const promptAdd = useAddPrompt();

  const moveMonth = (delta: number) => {
    const next = addMonthsToKey(monthKey, delta);
    setMonthKey(next);
    setSelectedKey(next.slice(0, 7) === todayKey.slice(0, 7) ? todayKey : next);
  };
  const handleSelect = (key: string) => {
    setSelectedKey(key);
    const keyMonth = monthStartKey(key);
    if (keyMonth !== monthKey) setMonthKey(keyMonth);
  };
  const goToday = () => {
    setSelectedKey(todayKey);
    setMonthKey(monthStartKey(todayKey));
  };

  return (
    <Screen
      title={formatMonthTitle(monthKey)}
      headerRight={
        <View style={styles.headerActions}>
          <MonthArrow label="‹" accessibilityLabel="이전 달" onPress={() => moveMonth(-1)} />
          <MonthArrow label="›" accessibilityLabel="다음 달" onPress={() => moveMonth(1)} />
          <HeaderButton label="오늘" onPress={goToday} />
        </View>
      }>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <MonthGrid
            weeks={weeks}
            monthKey={monthKey}
            selectedKey={selectedKey}
            todayKey={todayKey}
            marks={marks}
            onSelect={handleSelect}
          />
        </View>

        <View style={styles.section}>
          <Text style={[typography.section, { color: colors.text }]}>
            {formatDayTitle(fromDateKey(selectedKey))}
          </Text>
          {events.length === 0 && tasks.length === 0 ? <EmptyState message="이날은 비어 있어요" /> : null}
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              color={categoryColors.get(event.calendarId) ?? palette.accent}
              onPress={(e) => router.push(`/event/${e.id}`)}
            />
          ))}
          {tasks.length > 0 ? (
            <View style={[styles.taskCard, { backgroundColor: colors.surface }]}>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  meta={task.dueTime ?? undefined}
                  onToggle={toggleCompleted}
                  onPress={(t) => router.push(`/task/${t.id}`)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <Fab accessibilityLabel="이날에 일정 또는 할 일 추가" onPress={() => promptAdd(selectedKey)} />
    </Screen>
  );
}

type MonthArrowProps = { label: string; accessibilityLabel: string; onPress: () => void };

function MonthArrow({ label, accessibilityLabel, onPress }: MonthArrowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.arrow}>
      <Text style={[styles.arrowText, { color: colors.accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  arrow: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 26, lineHeight: 28 },
  content: { gap: spacing.xxl, paddingBottom: spacing.xxl * 3 },
  card: { borderRadius: radius.md, padding: spacing.sm },
  section: { gap: spacing.md - 2 },
  taskCard: { borderRadius: radius.md, overflow: 'hidden' },
});
