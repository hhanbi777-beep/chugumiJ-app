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

/** 지금 이후 가장 가까운 정각 (새 일정 기본 시작 시각). */
export function nextFullHour(base: Date = new Date()): Date {
  const date = new Date(base);
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/** UTC ISO 문자열을 Date로. */
export function fromUtcIso(utcIso: string): Date {
  return parseISO(utcIso);
}

/** 'YYYY-MM-DD'의 날짜에 time의 시·분을 붙인다 (기기 시간대). */
export function withTimeOf(dateKey: string, time: Date): Date {
  const date = fromDateKey(dateKey);
  date.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return date;
}

/** 'HH:mm' (할 일 마감 시각 저장용). */
export function toTimeKey(date: Date): string {
  return format(date, 'HH:mm');
}

/** 'HH:mm'을 오늘 날짜의 Date로 (시간 선택기 초기값용). */
export function fromTimeKey(timeKey: string): Date {
  const [hours, minutes] = timeKey.split(':').map(Number);
  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}

/** 예: '10월 26일 (월)' */
export function formatDateLabel(date: Date): string {
  return format(date, 'M월 d일 (EEE)', { locale: ko });
}

/** 예: '10:00' */
export function formatTimeLabel(date: Date): string {
  return format(date, 'HH:mm');
}
