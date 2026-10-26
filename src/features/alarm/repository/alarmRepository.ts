import { asc, eq, isNull } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { EntityType, recordChange, SyncOp } from '@/db/outbox';
import { alarms } from '@/db/schema';
import { nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import type { Alarm, AlarmInput } from '../types';
import { repeatColumns } from '../utils/alarmRepeat';

const notDeleted = isNull(alarms.deletedAt);

export const alarmQueries = {
  /** 시각 순 */
  all(executor: DbExecutor = db) {
    return executor.select().from(alarms).where(notDeleted).orderBy(asc(alarms.time), asc(alarms.createdAt));
  },
};

function recordUpdate(tx: DbExecutor, row: Alarm | undefined, op: SyncOp = SyncOp.UPDATE) {
  if (row) recordChange(tx, { entityType: EntityType.ALARM, entityId: row.id, op, row });
}

export const alarmRepository = {
  findById(id: string, executor: DbExecutor = db): Alarm | undefined {
    return executor.select().from(alarms).where(eq(alarms.id, id)).get();
  },

  create(input: AlarmInput): Alarm {
    const now = nowUtcIso();
    const row: Alarm = {
      id: newId(),
      userId: null,
      label: input.label?.trim() || null,
      time: input.time,
      ...repeatColumns(input.repeat),
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    db.transaction((tx) => {
      tx.insert(alarms).values(row).run();
      recordUpdate(tx, row, SyncOp.CREATE);
    });
    return row;
  },

  /** 수정하면 다시 켠다 (시계 앱과 같은 동작) */
  update(id: string, input: AlarmInput): void {
    db.transaction((tx) => {
      const row = tx
        .update(alarms)
        .set({
          label: input.label?.trim() || null,
          time: input.time,
          ...repeatColumns(input.repeat),
          isEnabled: true,
          updatedAt: nowUtcIso(),
        })
        .where(eq(alarms.id, id))
        .returning()
        .get();
      recordUpdate(tx, row);
    });
  },

  setEnabled(id: string, isEnabled: boolean): void {
    db.transaction((tx) => {
      const row = tx
        .update(alarms)
        .set({ isEnabled, updatedAt: nowUtcIso() })
        .where(eq(alarms.id, id))
        .returning()
        .get();
      recordUpdate(tx, row);
    });
  },

  softDelete(id: string): void {
    const now = nowUtcIso();
    db.transaction((tx) => {
      const row = tx
        .update(alarms)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(alarms.id, id))
        .returning()
        .get();
      recordUpdate(tx, row, SyncOp.DELETE);
    });
  },
};
