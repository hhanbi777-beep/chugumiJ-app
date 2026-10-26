import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { eventQueries } from '../repository/eventRepository';
import type { Event } from '../types';

/** 해당 날짜의 일정 (DB 변경 시 자동 갱신) */
export function useEventsOn(dateKey: string): Event[] {
  const { data } = useLiveQuery(eventQueries.onDate(dateKey), [dateKey]);
  return data;
}
