import type { EventRow } from '@/db/schema';

export type Event = EventRow;

type EventBaseInput = {
  calendarId: string;
  title: string;
  note?: string | null;
  location?: string | null;
};

/** 시간 있는 일정: UTC ISO */
export type CreateTimedEventInput = EventBaseInput & {
  isAllDay: false;
  startAt: string;
  endAt: string;
};

/** 종일 일정: 'YYYY-MM-DD', endDate는 마지막 날 다음날 */
export type CreateAllDayEventInput = EventBaseInput & {
  isAllDay: true;
  startDate: string;
  endDate: string;
};

export type CreateEventInput = CreateTimedEventInput | CreateAllDayEventInput;
