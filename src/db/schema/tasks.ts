import { type AnySQLiteColumn, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './columns';

/** 투두 리스트 (예: 기본함, 업무, 장보기). */
export const taskLists = sqliteTable('task_lists', {
  ...syncColumns,
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  isInbox: integer('is_inbox', { mode: 'boolean' }).notNull().default(false),
});

/**
 * 할 일. 할 일과 투두는 하나의 테이블로 통합.
 * - due_date가 있으면 캘린더에도 표시, 없으면 리스트에만
 * - completed_at이 null이면 미완료
 */
export const tasks = sqliteTable(
  'tasks',
  {
    ...syncColumns,
    listId: text('list_id')
      .notNull()
      .references(() => taskLists.id),
    parentTaskId: text('parent_task_id').references((): AnySQLiteColumn => tasks.id),
    title: text('title').notNull(),
    note: text('note'),
    dueDate: text('due_date'),
    dueTime: text('due_time'),
    priority: integer('priority').notNull().default(0),
    completedAt: text('completed_at'),
    sortOrder: integer('sort_order').notNull().default(0),
    rrule: text('rrule'),
  },
  (t) => [
    index('idx_tasks_due').on(t.userId, t.dueDate, t.completedAt),
    index('idx_tasks_list').on(t.listId, t.sortOrder),
  ],
);

export type TaskListRow = typeof taskLists.$inferSelect;
export type NewTaskListRow = typeof taskLists.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
