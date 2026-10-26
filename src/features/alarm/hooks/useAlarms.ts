import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useEffect, useMemo } from 'react';

import { isAlarmClockSupported, replaceAlarms } from '@/services/alarmClock';
import type { LocalNotification } from '@/services/notifications';

import { alarmQueries, alarmRepository } from '../repository/alarmRepository';
import type { Alarm } from '../types';
import { planAlarms } from '../utils/planAlarms';
import { planNativeAlarms } from '../utils/planNativeAlarms';

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
 * 켜진 알람을 기기에 예약한다.
 * - 진짜 알람을 쓸 수 있으면 (iOS 26+ AlarmKit, Android) 네이티브로 예약하고 빈 목록을 돌려준다.
 * - 아니면 (iOS 26 미만, Expo Go) 로컬 알림 목록을 돌려줘서 일반 알림으로 대신 울린다.
 * @param now 기준 시각. 앱이 다시 앞으로 올 때 바꿔서 지난 날짜 알람을 걸러낸다.
 */
export function useAlarmScheduling(now: Date): LocalNotification[] {
  const alarms = useAlarms();
  const isNative = isAlarmClockSupported();

  useEffect(() => {
    if (!isNative) return;
    replaceAlarms(planNativeAlarms(alarms, now)).catch((error: unknown) => {
      console.warn('알람 예약 실패', error);
    });
  }, [alarms, now, isNative]);

  return useMemo(() => (isNative ? [] : planAlarms(alarms, now)), [alarms, now, isNative]);
}
