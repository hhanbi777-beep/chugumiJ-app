import { useMemo } from 'react';

import { useCategoryColors, useEventsInRange, type Event } from '@/features/event';
import { useTasksDueBetween } from '@/features/task';
import { addDaysToKey, fromUtcIso, toDateKey } from '@/shared/utils/date';

/** 그리드 한 칸에 찍을 표시 */
export type DayMarks = {
  /** 그날 걸치는 일정의 카테고리 색 (중복 제거, 최대 3개) */
  eventColors: string[];
  /** 미완료 할 일 마감 여부 */
  hasOpenTask: boolean;
};

const MAX_DOTS = 3;

/** 일정이 걸치는 날짜 키들 [첫날, 마지막날] */
function coveredDays(event: Event): [string, string] | null {
  if (event.isAllDay) {
    if (!event.startDate || !event.endDate) return null;
    return [event.startDate, addDaysToKey(event.endDate, -1)];
  }
  if (!event.startAt || !event.endAt) return null;
  const first = toDateKey(fromUtcIso(event.startAt));
  // 자정에 끝나는 일정은 그 전날까지만
  const last = toDateKey(new Date(fromUtcIso(event.endAt).getTime() - 1));
  return [first, last < first ? first : last];
}

/** [startKey, endKey) 기간의 날짜별 표시 */
export function useMonthMarks(startKey: string, endKey: string): Map<string, DayMarks> {
  const events = useEventsInRange(startKey, endKey);
  const tasks = useTasksDueBetween(startKey, endKey);
  const categoryColors = useCategoryColors();

  return useMemo(() => {
    const marks = new Map<string, DayMarks>();
    const at = (key: string) => {
      let mark = marks.get(key);
      if (!mark) {
        mark = { eventColors: [], hasOpenTask: false };
        marks.set(key, mark);
      }
      return mark;
    };

    for (const event of events) {
      const span = coveredDays(event);
      if (!span) continue;
      const color = categoryColors.get(event.calendarId);
      if (!color) continue;
      let key = span[0] < startKey ? startKey : span[0];
      while (key <= span[1] && key < endKey) {
        const mark = at(key);
        if (mark.eventColors.length < MAX_DOTS && !mark.eventColors.includes(color)) {
          mark.eventColors.push(color);
        }
        key = addDaysToKey(key, 1);
      }
    }
    for (const task of tasks) {
      if (task.dueDate && task.completedAt === null) at(task.dueDate).hasOpenTask = true;
    }
    return marks;
  }, [events, tasks, categoryColors, startKey, endKey]);
}
