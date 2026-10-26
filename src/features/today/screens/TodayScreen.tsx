import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EventCard, useEventsOn } from '@/features/event';
import { TaskRow, useTaskActions, useTasksDueBy } from '@/features/task';
import { EmptyState, Fab, Screen } from '@/shared/components/ui';
import { useAddPrompt } from '@/shared/hooks/useAddPrompt';
import { palette, radius, spacing, typography, useThemeColors } from '@/shared/theme';
import { formatDayTitle, todayKey } from '@/shared/utils/date';

export function TodayScreen() {
  const colors = useThemeColors();
  const dateKey = todayKey();
  const events = useEventsOn(dateKey);
  const tasks = useTasksDueBy(dateKey);
  const { toggleCompleted } = useTaskActions();

  const openTasks = tasks.filter((task) => task.completedAt === null);

  const promptAdd = useAddPrompt();

  return (
    <Screen title="오늘" subtitle={formatDayTitle(new Date())}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[typography.section, { color: colors.text }]}>일정 {events.length}</Text>
          {events.length === 0 ? (
            <EmptyState message="오늘 일정이 없어요" />
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                color={palette.accent}
                onPress={(e) => router.push(`/event/${e.id}`)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[typography.section, { color: colors.text }]}>할 일 {openTasks.length}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {tasks.length === 0 ? (
              <EmptyState message="오늘 마감인 할 일이 없어요" />
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  meta={
                    task.dueDate !== null && task.dueDate < dateKey
                      ? '지난 할 일'
                      : (task.dueTime ?? undefined)
                  }
                  onToggle={toggleCompleted}
                  onPress={(t) => router.push(`/task/${t.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <Fab accessibilityLabel="일정 또는 할 일 추가" onPress={() => promptAdd(dateKey)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xxl, paddingBottom: spacing.xxl * 3 },
  section: { gap: spacing.md - 2 },
  card: { borderRadius: radius.md, overflow: 'hidden' },
});
