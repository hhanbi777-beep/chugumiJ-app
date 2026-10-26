import type { EventRow, ReminderRow, TaskRow } from '@/db/schema';
import { formatDateLabel, fromTimeKey, fromUtcIso, withTimeOf } from '@/shared/utils/date';

/** 시간이 없는 종일 일정·할 일의 알림 기준 시각 */
export const DEFAULT_REMINDER_TIME = '09:00';

export type ReminderPlan = {
  reminderId: string;
  fireAt: Date;
  title: string;
  body: string;
  /** 알림을 누르면 열 경로 */
  url: string;
};

type ReminderWithTarget = { reminder: ReminderRow; event: EventRow | null; task: TaskRow | null };

/** 몇 분 전 → '10분 후', '1시간 후', '내일' 같은 말 */
function relativeLabel(offsetMinutes: number): string {
  if (offsetMinutes === 0) return '지금';
  if (offsetMinutes < 60) return `${offsetMinutes}분 후`;
  if (offsetMinutes < 1440) return `${Math.round(offsetMinutes / 60)}시간 후`;
  return offsetMinutes === 1440 ? '내일' : `${Math.round(offsetMinutes / 1440)}일 후`;
}

function planFor({
  reminder,
  event,
  task,
}: ReminderWithTarget): (Omit<ReminderPlan, 'fireAt'> & { startAt: Date }) | null {
  const offset = reminder.offsetMinutes;
  if (event) {
    if (event.isAllDay) {
      if (!event.startDate) return null;
      const startAt = withTimeOf(event.startDate, fromTimeKey(DEFAULT_REMINDER_TIME));
      return {
        reminderId: reminder.id,
        startAt,
        title: event.title,
        body: `${offset === 0 ? '오늘' : relativeLabel(offset)} 종일 일정 · ${formatDateLabel(startAt)}`,
        url: `/event/${event.id}`,
      };
    }
    if (!event.startAt) return null;
    return {
      reminderId: reminder.id,
      startAt: fromUtcIso(event.startAt),
      title: event.title,
      body: `${relativeLabel(offset)} 시작`,
      url: `/event/${event.id}`,
    };
  }
  if (task) {
    if (!task.dueDate || task.completedAt !== null) return null;
    const startAt = withTimeOf(task.dueDate, fromTimeKey(task.dueTime ?? DEFAULT_REMINDER_TIME));
    return {
      reminderId: reminder.id,
      startAt,
      title: task.title,
      body: task.dueTime ? `${relativeLabel(offset)} 마감` : `할 일 마감 · ${formatDateLabel(startAt)}`,
      url: `/task/${task.id}`,
    };
  }
  return null;
}

/** DB 알림 → 기기에 예약할 목록 (지난 것 제외, 가까운 순) */
export function planReminders(rows: ReminderWithTarget[], now: Date = new Date()): ReminderPlan[] {
  const plans: ReminderPlan[] = [];
  for (const row of rows) {
    const plan = planFor(row);
    if (!plan) continue;
    const { startAt, ...rest } = plan;
    const fireAt = new Date(startAt.getTime() - row.reminder.offsetMinutes * 60_000);
    if (fireAt > now) plans.push({ ...rest, fireAt });
  }
  return plans.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}
