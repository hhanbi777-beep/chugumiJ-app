import { and, asc, eq, gt, isNull, lt, lte, or } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { EntityType, recordChange, SyncOp } from '@/db/outbox';
import { events } from '@/db/schema';
import { addDaysToKey, deviceTimezone, fromDateKey, nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import type { CreateEventInput, Event } from '../types';

const notDeleted = isNull(events.deletedAt);

export const eventQueries = {
  /** 해당 날짜(기기 시간대)에 걸치는 일정. 종일 일정 먼저, 그다음 시작 시각 순. */
  onDate(dateKey: string, executor: DbExecutor = db) {
    const dayStartUtc = fromDateKey(dateKey).toISOString();
    const dayEndUtc = fromDateKey(addDaysToKey(dateKey, 1)).toISOString();
    return executor
      .select()
      .from(events)
      .where(
        and(
          notDeleted,
          or(
            and(eq(events.isAllDay, true), lte(events.startDate, dateKey), gt(events.endDate, dateKey)),
            and(eq(events.isAllDay, false), lt(events.startAt, dayEndUtc), gt(events.endAt, dayStartUtc)),
          ),
        ),
      )
      .orderBy(asc(events.isAllDay), asc(events.startAt));
  },
};

export const eventRepository = {
  create(input: CreateEventInput): Event {
    const now = nowUtcIso();
    const row: Event = {
      id: newId(),
      userId: null,
      calendarId: input.calendarId,
      title: input.title.trim(),
      note: input.note ?? null,
      location: input.location ?? null,
      isAllDay: input.isAllDay,
      startAt: input.isAllDay ? null : input.startAt,
      endAt: input.isAllDay ? null : input.endAt,
      startDate: input.isAllDay ? input.startDate : null,
      endDate: input.isAllDay ? input.endDate : null,
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
    });
    return row;
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
      }
    });
  },
};
