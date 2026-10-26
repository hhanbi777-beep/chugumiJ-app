import { addDays, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/** 날짜 처리는 이 파일을 거친다. 저장은 UTC ISO, 표시는 기기 시간대. */

/** 저장용 현재 시각 (UTC ISO 8601). */
export function nowUtcIso(): string {
  return new Date().toISOString();
}

/** 기기 시간대 기준 'YYYY-MM-DD' (종일 일정·할 일 마감일용). */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** 'YYYY-MM-DD'를 기기 시간대 자정의 Date로. */
export function fromDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDaysToKey(dateKey: string, days: number): string {
  return toDateKey(addDays(fromDateKey(dateKey), days));
}

/** 기기 시간대 이름 (예: 'Asia/Seoul'). */
export function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** 예: '10월 26일 월요일' */
export function formatDayTitle(date: Date): string {
  return format(date, 'M월 d일 EEEE', { locale: ko });
}

/** 예: '10:00' */
export function formatTime(utcIso: string): string {
  return format(parseISO(utcIso), 'HH:mm');
}
