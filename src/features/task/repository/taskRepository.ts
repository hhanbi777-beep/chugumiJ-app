import { and, asc, eq, isNull, lte } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { EntityType, recordChange, SyncOp } from '@/db/outbox';
import { tasks } from '@/db/schema';
import { reminderRepository } from '@/features/reminder';
import { nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import { Priority, type CreateTaskInput, type Task, type UpdateTaskInput } from '../types';

const notDeleted = isNull(tasks.deletedAt);

/** 조회 쿼리. useLiveQuery에 넘길 수 있도록 실행하지 않은 쿼리를 돌려준다. */
export const taskQueries = {
  byList(listId: string, executor: DbExecutor = db) {
    return executor
      .select()
      .from(tasks)
      .where(and(notDeleted, eq(tasks.listId, listId)))
      .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
  },

  /** 오늘 화면: 마감일이 오늘이거나 지났고 아직 미완료인 할 일 + 오늘 완료한 할 일 */
  dueOnOrBefore(dateKey: string, executor: DbExecutor = db) {
    return executor
      .select()
      .from(tasks)
      .where(and(notDeleted, lte(tasks.dueDate, dateKey)))
      .orderBy(asc(tasks.dueDate), asc(tasks.dueTime));
  },
};

export const taskRepository = {
  findById(id: string): Task | undefined {
    return db
      .select()
      .from(tasks)
      .where(and(notDeleted, eq(tasks.id, id)))
      .get();
  },

  /** reminderOffset: 마감일이 있을 때만 의미 있음. null이면 알림 없음. */
  create(input: CreateTaskInput, reminderOffset: number | null = null): Task {
    const now = nowUtcIso();
    const row: Task = {
      id: newId(),
      userId: null,
      listId: input.listId,
      parentTaskId: null,
      title: input.title.trim(),
      note: input.note ?? null,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? null,
      priority: input.priority ?? Priority.NONE,
      completedAt: null,
      sortOrder: Date.now(),
      rrule: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    db.transaction((tx) => {
      tx.insert(tasks).values(row).run();
      recordChange(tx, { entityType: EntityType.TASK, entityId: row.id, op: SyncOp.CREATE, row });
      reminderRepository.replaceFor(tx, { taskId: row.id }, row.dueDate ? reminderOffset : null);
    });
    return row;
  },

  /** reminderOffset을 넘기지 않으면(undefined) 알림은 그대로 둔다. */
  update(id: string, input: UpdateTaskInput, reminderOffset?: number | null): Task | undefined {
    return db.transaction((tx) => {
      const updated = tx
        .update(tasks)
        .set({ ...input, updatedAt: nowUtcIso() })
        .where(and(notDeleted, eq(tasks.id, id)))
        .returning()
        .get();
      if (updated) {
        recordChange(tx, { entityType: EntityType.TASK, entityId: id, op: SyncOp.UPDATE, row: updated });
        if (reminderOffset !== undefined) {
          reminderRepository.replaceFor(tx, { taskId: id }, updated.dueDate ? reminderOffset : null);
        }
      }
      return updated;
    });
  },

  setCompleted(id: string, isCompleted: boolean): Task | undefined {
    return db.transaction((tx) => {
      const now = nowUtcIso();
      const updated = tx
        .update(tasks)
        .set({ completedAt: isCompleted ? now : null, updatedAt: now })
        .where(and(notDeleted, eq(tasks.id, id)))
        .returning()
        .get();
      if (updated) {
        recordChange(tx, { entityType: EntityType.TASK, entityId: id, op: SyncOp.UPDATE, row: updated });
      }
      return updated;
    });
  },

  softDelete(id: string): void {
    db.transaction((tx) => {
      const now = nowUtcIso();
      const deleted = tx
        .update(tasks)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(notDeleted, eq(tasks.id, id)))
        .returning()
        .get();
      if (deleted) {
        recordChange(tx, { entityType: EntityType.TASK, entityId: id, op: SyncOp.DELETE, row: deleted });
        reminderRepository.replaceFor(tx, { taskId: id }, null);
      }
    });
  },
};
