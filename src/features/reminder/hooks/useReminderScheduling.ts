import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { replaceScheduled } from '@/services/notifications';

import { reminderQueries } from '../repository/reminderRepository';
import { planReminders } from '../utils/planReminders';

/**
 * DB의 알림을 기기 로컬 알림과 맞춘다.
 * 일정·할 일·알림이 바뀌거나 앱이 다시 앞으로 올 때마다 전체를 다시 예약한다.
 */
export function useReminderScheduling(): void {
  const { data } = useLiveQuery(reminderQueries.activeWithTargets());
  const [foregroundCount, setForegroundCount] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setForegroundCount((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    void replaceScheduled(planReminders(data));
  }, [data, foregroundCount]);
}
