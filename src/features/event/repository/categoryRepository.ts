import { asc, isNull } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { calendars } from '@/db/schema';

/** 일정 카테고리(calendars 테이블). 카테고리 관리 화면은 설정 PR에서. */
export const categoryQueries = {
  all(executor: DbExecutor = db) {
    return executor
      .select()
      .from(calendars)
      .where(isNull(calendars.deletedAt))
      .orderBy(asc(calendars.sortOrder), asc(calendars.createdAt));
  },
};
