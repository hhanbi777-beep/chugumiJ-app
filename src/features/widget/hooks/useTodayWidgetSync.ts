import { useEffect } from 'react';

import { useCategoryColors, useEventsOn } from '@/features/event';
import { useTasksDueBy } from '@/features/task';
import { palette } from '@/shared/theme';
import { addDaysToKey, fromDateKey, toDateKey } from '@/shared/utils/date';

import { getTodayWidget } from '../todayWidget';
import { buildTodayWidgetProps } from '../utils/buildTodayWidgetProps';

/**
 * 오늘 일정·할 일이 바뀔 때마다 홈 화면 위젯을 갱신한다.
 * iOS는 자정에 내일 내용으로 바뀌도록 타임라인을 함께 넘긴다.
 * @param now 기준 시각 (앱이 다시 앞으로 올 때 바뀐다)
 */
export function useTodayWidgetSync(now: Date): void {
  const todayKey = toDateKey(now);
  const tomorrowKey = addDaysToKey(todayKey, 1);
  const todayEvents = useEventsOn(todayKey);
  const todayTasks = useTasksDueBy(todayKey);
  const tomorrowEvents = useEventsOn(tomorrowKey);
  const tomorrowTasks = useTasksDueBy(tomorrowKey);
  const categoryColors = useCategoryColors();

  useEffect(() => {
    const widget = getTodayWidget();
    if (!widget) return;
    const today = buildTodayWidgetProps(todayKey, todayEvents, todayTasks, categoryColors, palette.accent);
    const tomorrow = buildTodayWidgetProps(
      tomorrowKey,
      tomorrowEvents,
      tomorrowTasks,
      categoryColors,
      palette.accent,
    );
    try {
      // Android는 타임라인이 없어 지금 값만 반영된다 (앱을 열면 다시 갱신)
      widget.updateSnapshot(today);
      widget.updateTimeline([
        { date: new Date(), props: today },
        { date: fromDateKey(tomorrowKey), props: tomorrow },
      ]);
    } catch (error) {
      console.warn('위젯 갱신 실패', error);
    }
  }, [todayKey, tomorrowKey, todayEvents, todayTasks, tomorrowEvents, tomorrowTasks, categoryColors]);
}
