import { nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import type { DbExecutor } from './client';
import { syncOutbox } from './schema';

export const EntityType = {
  CALENDAR: 'calendar',
  EVENT: 'event',
  EVENT_EXCEPTION: 'event_exception',
  TASK_LIST: 'task_list',
  TASK: 'task',
  REMINDER: 'reminder',
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const SyncOp = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;
export type SyncOp = (typeof SyncOp)[keyof typeof SyncOp];

type OutboxInput = {
  entityType: EntityType;
  entityId: string;
  op: SyncOp;
  /** 변경 후 행 전체 */
  row: unknown;
};

/** repository에서 데이터 변경과 같은 트랜잭션 안에서 호출한다. */
export function recordChange(tx: DbExecutor, input: OutboxInput): void {
  tx.insert(syncOutbox)
    .values({
      id: newId(),
      entityType: input.entityType,
      entityId: input.entityId,
      op: input.op,
      payload: JSON.stringify(input.row),
      occurredAt: nowUtcIso(),
    })
    .run();
}
