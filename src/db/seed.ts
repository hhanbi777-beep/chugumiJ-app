import { eq } from 'drizzle-orm';

import { nowUtcIso } from '@/shared/utils/date';
import { newId } from '@/shared/utils/uuid';

import { db } from './client';
import { calendars, taskLists } from './schema';

export const DEFAULT_CALENDAR = { name: '개인', color: '#2F5BD9' } as const;
export const INBOX_LIST = { name: '기본함' } as const;

/** 첫 실행 시 기본 캘린더와 기본함을 만든다. 여러 번 호출해도 안전. */
export function ensureDefaults(): void {
  const now = nowUtcIso();
  db.transaction((tx) => {
    const hasDefaultCalendar = tx
      .select({ id: calendars.id })
      .from(calendars)
      .where(eq(calendars.isDefault, true))
      .get();
    if (!hasDefaultCalendar) {
      tx.insert(calendars)
        .values({ id: newId(), ...DEFAULT_CALENDAR, isDefault: true, createdAt: now, updatedAt: now })
        .run();
    }

    const hasInbox = tx.select({ id: taskLists.id }).from(taskLists).where(eq(taskLists.isInbox, true)).get();
    if (!hasInbox) {
      tx.insert(taskLists)
        .values({ id: newId(), ...INBOX_LIST, isInbox: true, createdAt: now, updatedAt: now })
        .run();
    }
  });
}
