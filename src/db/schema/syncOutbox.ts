import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * 변경 기록 (기기 전용). 생성·수정·삭제를 같은 트랜잭션에서 이벤트로 쌓아두고,
 * v1.1에서 서버로 올리면 서버가 그대로 Kafka 메시지로 발행한다.
 */
export const syncOutbox = sqliteTable(
  'sync_outbox',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    op: text('op').notNull(),
    payload: text('payload').notNull(),
    occurredAt: text('occurred_at').notNull(),
    syncedAt: text('synced_at'),
  },
  (t) => [index('idx_outbox_pending').on(t.syncedAt, t.occurredAt)],
);

export type SyncOutboxRow = typeof syncOutbox.$inferSelect;
