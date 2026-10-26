import { NotificationChannel, type LocalNotification } from '@/services/notifications';
import { fromTimeKey, withTimeOf } from '@/shared/utils/date';

import type { Alarm } from '../types';
import { formatRepeat, repeatOf } from './alarmRepeat';

/** 켜진 알람 → 기기 로컬 알림 (요일 반복은 요일마다 1개, 지난 날짜 알람은 제외) */
export function planAlarms(alarms: Alarm[], now: Date = new Date()): LocalNotification[] {
  const items: LocalNotification[] = [];
  for (const alarm of alarms) {
    if (!alarm.isEnabled) continue;
    const repeat = repeatOf(alarm);
    const [hour, minute] = alarm.time.split(':').map(Number);
    const base = {
      channel: NotificationChannel.ALARMS,
      title: alarm.label ?? '알람',
      body: `${alarm.time} · ${formatRepeat(repeat)}`,
      url: `/alarm/${alarm.id}`,
    };
    if (repeat.kind === 'once') {
      const fireAt = withTimeOf(repeat.date, fromTimeKey(alarm.time));
      if (fireAt > now) items.push({ ...base, schedule: { kind: 'once', fireAt } });
      continue;
    }
    for (const weekday of repeat.weekdays) {
      items.push({ ...base, schedule: { kind: 'weekly', weekday, hour, minute } });
    }
  }
  return items;
}
