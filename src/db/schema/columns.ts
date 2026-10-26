import { text } from 'drizzle-orm/sqlite-core';

/**
 * 모든 동기화 대상 테이블이 공유하는 컬럼.
 * - id: 기기에서 생성하는 UUID (오프라인 생성 후 서버와 충돌 없음)
 * - user_id: MVP(로컬 전용)에서는 null, v1.1 로그인 도입 시 채움
 * - 시각은 UTC ISO 8601 문자열로 저장
 * - deleted_at: 소프트 삭제 (삭제도 다른 기기에 전파)
 */
export const syncColumns = {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
};
