import { formatDateLabel, fromDateKey } from '@/shared/utils/date';

import { WEEKDAY_LABELS, type Alarm, type AlarmRepeat } from '../types';

/** DB 컬럼 → AlarmRepeat */
export function repeatOf(alarm: Pick<Alarm, 'weekdays' | 'date'>): AlarmRepeat {
  if (alarm.date) return { kind: 'once', date: alarm.date };
  const weekdays = (alarm.weekdays ?? '')
    .split(',')
    .filter((d) => d !== '')
    .map(Number);
  return { kind: 'weekly', weekdays };
}

/** AlarmRepeat → DB 컬럼 */
export function repeatColumns(repeat: AlarmRepeat): { weekdays: string | null; date: string | null } {
  if (repeat.kind === 'once') return { weekdays: null, date: repeat.date };
  return { weekdays: [...repeat.weekdays].sort((a, b) => a - b).join(','), date: null };
}

/** 예: '매일', '평일', '주말', '월·수·금', '10월 31일 (금)' */
export function formatRepeat(repeat: AlarmRepeat): string {
  if (repeat.kind === 'once') return formatDateLabel(fromDateKey(repeat.date));
  const days = [...repeat.weekdays].sort((a, b) => a - b);
  const key = days.join(',');
  if (key === '0,1,2,3,4,5,6') return '매일';
  if (key === '1,2,3,4,5') return '평일';
  if (key === '0,6') return '주말';
  return days.map((d) => WEEKDAY_LABELS[d]).join('·');
}
