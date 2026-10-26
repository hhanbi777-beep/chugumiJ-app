import type { Event } from '@/features/event';
import type { Task } from '@/features/task';
import { formatDayTitle, formatTime, fromDateKey } from '@/shared/utils/date';

import type { TodayWidgetItem, TodayWidgetProps } from '../types';

const MAX_ITEMS = 6;

/** 그날 일정 + 미완료 할 일(지난 것 포함) → 위젯 값 */
export function buildTodayWidgetProps(
  dateKey: string,
  events: Event[],
  tasks: Task[],
  categoryColors: Map<string, string>,
  fallbackColor: string,
): TodayWidgetProps {
  const eventItems: TodayWidgetItem[] = events.map((event) => ({
    kind: 'event',
    time: event.isAllDay || !event.startAt ? '종일' : formatTime(event.startAt),
    title: event.title,
    color: categoryColors.get(event.calendarId) ?? fallbackColor,
  }));
  const taskItems: TodayWidgetItem[] = tasks
    .filter((task) => task.completedAt === null)
    .map((task) => ({
      kind: 'task',
      time: task.dueDate !== null && task.dueDate < dateKey ? '지남' : (task.dueTime ?? ''),
      title: task.title,
      color: fallbackColor,
    }));
  const all = [...eventItems, ...taskItems];
  return {
    dateLabel: formatDayTitle(fromDateKey(dateKey)),
    items: all.slice(0, MAX_ITEMS),
    moreCount: Math.max(0, all.length - MAX_ITEMS),
  };
}
