import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './columns';
import { events } from './events';
import { tasks } from './tasks';

/** 알림. 일정 또는 할 일 중 하나에만 연결 (둘 중 하나만 채움). */
export const reminders = sqliteTable('reminders', {
  ...syncColumns,
  eventId: text('event_id').references(() => events.id),
  taskId: text('task_id').references(() => tasks.id),
  offsetMinutes: integer('offset_minutes').notNull(),
  /** 기기에 예약된 로컬 알림 id (expo-notifications). 동기화 대상 아님. */
  notificationId: text('notification_id'),
});

export type ReminderRow = typeof reminders.$inferSelect;
export type NewReminderRow = typeof reminders.$inferInsert;
