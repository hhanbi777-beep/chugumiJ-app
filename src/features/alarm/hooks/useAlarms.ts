import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useMemo } from 'react';

import type { LocalNotification } from '@/services/notifications';

import { alarmQueries, alarmRepository } from '../repository/alarmRepository';
import type { Alarm } from '../types';
import { planAlarms } from '../utils/planAlarms';

export function useAlarms(): Alarm[] {
  const { data } = useLiveQuery(alarmQueries.all());
  return data;
}

export function useAlarmActions() {
  const toggleEnabled = useCallback((alarm: Alarm) => {
    alarmRepository.setEnabled(alarm.id, !alarm.isEnabled);
  }, []);
  return { toggleEnabled };
}

/**
 * 켜진 알람을 기기 로컬 알림 목록으로.
 * @param now 기준 시각. 앱이 다시 앞으로 올 때 바꿔서 지난 날짜 알람을 걸러낸다.
 */
export function useAlarmNotifications(now: Date): LocalNotification[] {
  const alarms = useAlarms();
  return useMemo(() => planAlarms(alarms, now), [alarms, now]);
}
