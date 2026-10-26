import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { calendars } from './calendars';
import { syncColumns } from './columns';

/**
 * 일정.
 * - 시간 있는 일정: start_at / end_at (UTC ISO)
 * - 종일 일정: start_date / end_date ('YYYY-MM-DD', end_date는 마지막 날 다음날)
 * - rrule: v1.1 반복 일정 규칙 (예: 'FREQ=WEEKLY;BYDAY=MO,WE')
 */
export const events = sqliteTable(
  'events',
  {
    ...syncColumns,
    calendarId: text('calendar_id')
      .notNull()
      .references(() => calendars.id),
    title: text('title').notNull(),
    note: text('note'),
    location: text('location'),
    isAllDay: integer('is_all_day', { mode: 'boolean' }).notNull().default(false),
    startAt: text('start_at'),
    endAt: text('end_at'),
    startDate: text('start_date'),
    endDate: text('end_date'),
    timezone: text('timezone').notNull(),
    rrule: text('rrule'),
    repeatUntil: text('repeat_until'),
  },
  (t) => [
    index('idx_events_range').on(t.userId, t.startAt, t.endAt),
    index('idx_events_allday').on(t.userId, t.startDate),
  ],
);

/** 반복 일정 중 한 회차만 수정·삭제 (v1.1). */
export const eventExceptions = sqliteTable(
  'event_exceptions',
  {
    ...syncColumns,
    eventId: text('event_id')
      .notNull()
      .references(() => events.id),
    originalStart: text('original_start').notNull(),
    isCancelled: integer('is_cancelled', { mode: 'boolean' }).notNull().default(false),
    title: text('title'),
    startAt: text('start_at'),
    endAt: text('end_at'),
  },
  (t) => [uniqueIndex('uq_event_exceptions_original').on(t.eventId, t.originalStart)],
);

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
