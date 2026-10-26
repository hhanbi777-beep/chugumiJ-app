import type { NativeAlarmSpec } from '@/services/alarmClock';
import { fromTimeKey, withTimeOf } from '@/shared/utils/date';

import type { Alarm } from '../types';
import { repeatOf } from './alarmRepeat';

/** 켜진 알람 → 네이티브 알람 목록 (지난 날짜 알람은 제외) */
export function planNativeAlarms(alarms: Alarm[], now: Date = new Date()): NativeAlarmSpec[] {
  const specs: NativeAlarmSpec[] = [];
  for (const alarm of alarms) {
    if (!alarm.isEnabled) continue;
    const repeat = repeatOf(alarm);
    const [hour = 0, minute = 0] = alarm.time.split(':').map(Number);
    const base = { id: alarm.id, title: alarm.label ?? '알람', hour, minute };
    if (repeat.kind === 'weekly') {
      if (repeat.weekdays.length > 0) specs.push({ ...base, weekdays: repeat.weekdays, fireAtMs: null });
      continue;
    }
    const fireAt = withTimeOf(repeat.date, fromTimeKey(alarm.time));
    if (fireAt > now) specs.push({ ...base, weekdays: null, fireAtMs: fireAt.getTime() });
  }
  return specs;
}
