import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { categoryQueries } from '../repository/categoryRepository';
import { eventQueries } from '../repository/eventRepository';
import type { Event } from '../types';

/** 해당 날짜의 일정 (DB 변경 시 자동 갱신) */
export function useEventsOn(dateKey: string): Event[] {
  const { data } = useLiveQuery(eventQueries.onDate(dateKey), [dateKey]);
  return data;
}

/** [startKey, endKey) 기간의 일정 */
export function useEventsInRange(startKey: string, endKey: string): Event[] {
  const { data } = useLiveQuery(eventQueries.inRange(startKey, endKey), [startKey, endKey]);
  return data;
}

/** 카테고리 id → 색상 */
export function useCategoryColors(): Map<string, string> {
  const { data } = useLiveQuery(categoryQueries.all());
  return useMemo(() => new Map(data.map((c) => [c.id, c.color])), [data]);
}
