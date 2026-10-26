import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { NotificationChannel, type LocalNotification } from '@/services/notifications';

import { reminderQueries } from '../repository/reminderRepository';
import { planReminders } from '../utils/planReminders';

/**
 * 일정·할 일 알림을 기기 로컬 알림 목록으로 (가까운 순).
 * @param now 기준 시각. 앱이 다시 앞으로 올 때 바꿔서 지난 알림을 걸러낸다.
 */
export function useReminderNotifications(now: Date): LocalNotification[] {
  const { data } = useLiveQuery(reminderQueries.activeWithTargets());
  return useMemo(
    () =>
      planReminders(data, now).map((plan) => ({
        schedule: { kind: 'once', fireAt: plan.fireAt },
        channel: NotificationChannel.REMINDERS,
        title: plan.title,
        body: plan.body,
        url: plan.url,
      })),
    [data, now],
  );
}
