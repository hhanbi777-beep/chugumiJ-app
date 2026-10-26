import type { AlarmRow } from '@/db/schema';

export type Alarm = AlarmRow;

/** 반복 방식: 매주 고른 요일, 또는 특정 날짜 한 번 */
export type AlarmRepeat = { kind: 'weekly'; weekdays: number[] } | { kind: 'once'; date: string };

export type AlarmInput = {
  label: string | null;
  /** 'HH:mm' */
  time: string;
  repeat: AlarmRepeat;
};

/** 0 일요일 ~ 6 토요일 */
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
