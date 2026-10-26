import { and, asc, eq, gt, isNull, lt, or } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { EntityType, recordChange, SyncOp } from '@/db/outbox';
import { events } from '@/db/schema';
import { reminderRepository } from '@/features/reminder';
import { addDaysToKey, deviceTimezone, fromDateKey, nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import type { CreateEventInput, Event } from '../types';

const notDeleted = isNull(events.deletedAt);

/** 입력값을 시간 있는/종일 컬럼에 나눠 담는다. */
function toTimeColumns(input: CreateEventInput) {
  return {
    isAllDay: input.isAllDay,
    startAt: input.isAllDay ? null : input.startAt,
    endAt: input.isAllDay ? null : input.endAt,
    startDate: input.isAllDay ? input.startDate : null,
    endDate: input.isAllDay ? input.endDate : null,
  };
}

export const eventQueries = {
  /** [startKey, endKey) 기간(기기 시간대)에 걸치는 일정. 종일 일정 먼저, 그다음 시작 시각 순. */
  inRange(startKey: string, endKey: string, executor: DbExecutor = db) {
    const rangeStartUtc = fromDateKey(startKey).toISOString();
    const rangeEndUtc = fromDateKey(endKey).toISOString();
    return executor
      .select()
      .from(events)
      .where(
        and(
          notDeleted,
          or(
            and(eq(events.isAllDay, true), lt(events.startDate, endKey), gt(events.endDate, startKey)),
            and(eq(events.isAllDay, false), lt(events.startAt, rangeEndUtc), gt(events.endAt, rangeStartUtc)),
          ),
        ),
      )
      .orderBy(asc(events.isAllDay), asc(events.startAt));
  },

  /** 해당 날짜에 걸치는 일정 */
  onDate(dateKey: string, executor: DbExecutor = db) {
    return eventQueries.inRange(dateKey, addDaysToKey(dateKey, 1), executor);
  },
};

export const eventRepository = {
  findById(id: string): Event | undefined {
    return db
      .select()
      .from(events)
      .where(and(notDeleted, eq(events.id, id)))
      .get();
  },

  /** 일정과 알림을 한 트랜잭션으로 저장한다. reminderOffset이 null이면 알림 없음. */
  create(input: CreateEventInput, reminderOffset: number | null = null): Event {
    const now = nowUtcIso();
    const row: Event = {
      id: newId(),
      userId: null,
      calendarId: input.calendarId,
      title: input.title.trim(),
      note: input.note ?? null,
      location: input.location ?? null,
      ...toTimeColumns(input),
      timezone: deviceTimezone(),
      rrule: null,
      repeatUntil: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    db.transaction((tx) => {
      tx.insert(events).values(row).run();
      recordChange(tx, { entityType: EntityType.EVENT, entityId: row.id, op: SyncOp.CREATE, row });
      reminderRepository.replaceFor(tx, { eventId: row.id }, reminderOffset);
    });
    return row;
  },

  update(id: string, input: CreateEventInput, reminderOffset: number | null = null): Event | undefined {
    return db.transaction((tx) => {
      const updated = tx
        .update(events)
        .set({
          calendarId: input.calendarId,
          title: input.title.trim(),
          note: input.note ?? null,
          location: input.location ?? null,
          ...toTimeColumns(input),
          updatedAt: nowUtcIso(),
        })
        .where(and(notDeleted, eq(events.id, id)))
        .returning()
        .get();
      if (updated) {
        recordChange(tx, { entityType: EntityType.EVENT, entityId: id, op: SyncOp.UPDATE, row: updated });
        reminderRepository.replaceFor(tx, { eventId: id }, reminderOffset);
      }
      return updated;
    });
  },

  softDelete(id: string): void {
    db.transaction((tx) => {
      const now = nowUtcIso();
      const deleted = tx
        .update(events)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(notDeleted, eq(events.id, id)))
        .returning()
        .get();
      if (deleted) {
        recordChange(tx, { entityType: EntityType.EVENT, entityId: id, op: SyncOp.DELETE, row: deleted });
        reminderRepository.replaceFor(tx, { eventId: id }, null);
      }
    });
  },
};
