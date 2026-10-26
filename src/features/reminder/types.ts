import type { ReminderRow } from '@/db/schema';

export type Reminder = ReminderRow;

/** 알림 대상: 일정 또는 할 일 중 하나 */
export type ReminderTarget = { eventId: string } | { taskId: string };

/** 선택지. null = 알림 없음 */
export const REMINDER_OPTIONS: readonly { label: string; offsetMinutes: number | null }[] = [
  { label: '없음', offsetMinutes: null },
  { label: '정시', offsetMinutes: 0 },
  { label: '10분 전', offsetMinutes: 10 },
  { label: '30분 전', offsetMinutes: 30 },
  { label: '1시간 전', offsetMinutes: 60 },
  { label: '하루 전', offsetMinutes: 1440 },
];
