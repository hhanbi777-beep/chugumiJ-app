import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './columns';

/**
 * 알람 (시계 앱의 알람처럼 일정·할 일과 별개).
 * - 요일 반복: weekdays = '1,3,5' (0 일요일 ~ 6 토요일), date = null
 * - 특정 날짜 한 번: date = 'YYYY-MM-DD', weekdays = null
 * - time: 기기 시간대 기준 'HH:mm'
 */
export const alarms = sqliteTable(
  'alarms',
  {
    ...syncColumns,
    label: text('label'),
    time: text('time').notNull(),
    weekdays: text('weekdays'),
    date: text('date'),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [index('idx_alarms_date').on(t.userId, t.date)],
);

export type AlarmRow = typeof alarms.$inferSelect;
export type NewAlarmRow = typeof alarms.$inferInsert;
