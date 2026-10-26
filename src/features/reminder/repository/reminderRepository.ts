import { and, eq, isNull } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { EntityType, recordChange, SyncOp } from '@/db/outbox';
import { events, reminders, tasks } from '@/db/schema';
import { nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import type { Reminder, ReminderTarget } from '../types';

function targetCondition(target: ReminderTarget) {
  return 'eventId' in target ? eq(reminders.eventId, target.eventId) : eq(reminders.taskId, target.taskId);
}

export const reminderQueries = {
  /** 살아 있는 알림 + 대상 일정/할 일 (기기 알림 예약용) */
  activeWithTargets(executor: DbExecutor = db) {
    return executor
      .select({ reminder: reminders, event: events, task: tasks })
      .from(reminders)
      .leftJoin(events, and(eq(reminders.eventId, events.id), isNull(events.deletedAt)))
      .leftJoin(tasks, and(eq(reminders.taskId, tasks.id), isNull(tasks.deletedAt)))
      .where(isNull(reminders.deletedAt));
  },
};

export const reminderRepository = {
  /** MVP는 대상당 알림 1개 */
  findFor(target: ReminderTarget, executor: DbExecutor = db): Reminder | undefined {
    return executor
      .select()
      .from(reminders)
      .where(and(isNull(reminders.deletedAt), targetCondition(target)))
      .get();
  },

  /**
   * 대상의 알림을 offsetMinutes 하나로 맞춘다 (null이면 모두 삭제).
   * 일정·할 일 저장과 같은 트랜잭션에서 호출한다.
   */
  replaceFor(tx: DbExecutor, target: ReminderTarget, offsetMinutes: number | null): void {
    const now = nowUtcIso();
    const current = reminderRepository.findFor(target, tx);
    if (current && current.offsetMinutes === offsetMinutes) return;

    if (current) {
      const deleted = tx
        .update(reminders)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(reminders.id, current.id))
        .returning()
        .get();
      if (deleted) {
        recordChange(tx, {
          entityType: EntityType.REMINDER,
          entityId: current.id,
          op: SyncOp.DELETE,
          row: deleted,
        });
      }
    }

    if (offsetMinutes === null) return;

    const row: Reminder = {
      id: newId(),
      userId: null,
      eventId: 'eventId' in target ? target.eventId : null,
      taskId: 'taskId' in target ? target.taskId : null,
      offsetMinutes,
      notificationId: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    tx.insert(reminders).values(row).run();
    recordChange(tx, { entityType: EntityType.REMINDER, entityId: row.id, op: SyncOp.CREATE, row });
  },
};
