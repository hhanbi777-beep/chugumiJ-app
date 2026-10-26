import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './columns';

/** 일정 카테고리 (예: 개인, 업무). 색상 단위. */
export const calendars = sqliteTable('calendars', {
  ...syncColumns,
  name: text('name').notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export type CalendarRow = typeof calendars.$inferSelect;
export type NewCalendarRow = typeof calendars.$inferInsert;
