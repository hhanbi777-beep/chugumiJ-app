import { and, asc, eq, isNull } from 'drizzle-orm';

import { db, type DbExecutor } from '@/db/client';
import { taskLists } from '@/db/schema';

const notDeleted = isNull(taskLists.deletedAt);

export const taskListQueries = {
  all(executor: DbExecutor = db) {
    return executor
      .select()
      .from(taskLists)
      .where(notDeleted)
      .orderBy(asc(taskLists.sortOrder), asc(taskLists.createdAt));
  },

  inbox(executor: DbExecutor = db) {
    return executor
      .select()
      .from(taskLists)
      .where(and(notDeleted, eq(taskLists.isInbox, true)))
      .limit(1);
  },
};
