import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useMemo, useState } from 'react';

import { reminderRepository } from '@/features/reminder';
import {
  addDaysToKey,
  addHours,
  fromDateKey,
  fromUtcIso,
  nextFullHour,
  todayKey,
  toDateKey,
  withTimeOf,
} from '@/shared/utils/date';

import { categoryQueries } from '../repository/categoryRepository';
import { eventRepository } from '../repository/eventRepository';
import type { CreateEventInput, Event } from '../types';

export type EventFormValues = {
  title: string;
  isAllDay: boolean;
  /** 시간 있는 일정은 시각까지, 종일 일정은 날짜만 사용 */
  start: Date;
  /** 종일 일정에서는 마지막 날(포함) */
  end: Date;
  calendarId: string | null;
  reminderOffset: number | null;
  location: string;
  note: string;
};

function initialValues(event: Event | undefined, dateKey: string): EventFormValues {
  if (!event) {
    const start = withTimeOf(dateKey, nextFullHour());
    return {
      title: '',
      isAllDay: false,
      start,
      end: addHours(start, 1),
      calendarId: null,
      reminderOffset: 10,
      location: '',
      note: '',
    };
  }

  const reminder = reminderRepository.findFor({ eventId: event.id });
  const base = {
    title: event.title,
    isAllDay: event.isAllDay,
    calendarId: event.calendarId,
    reminderOffset: reminder?.offsetMinutes ?? null,
    location: event.location ?? '',
    note: event.note ?? '',
  };
  if (event.isAllDay && event.startDate && event.endDate) {
    return {
      ...base,
      start: fromDateKey(event.startDate),
      end: fromDateKey(addDaysToKey(event.endDate, -1)),
    };
  }
  const start = event.startAt ? fromUtcIso(event.startAt) : nextFullHour();
  return { ...base, start, end: event.endAt ? fromUtcIso(event.endAt) : addHours(start, 1) };
}

function toInput(values: EventFormValues, calendarId: string): CreateEventInput {
  const common = {
    calendarId,
    title: values.title,
    note: values.note.trim() || null,
    location: values.location.trim() || null,
  };
  if (values.isAllDay) {
    return {
      ...common,
      isAllDay: true,
      startDate: toDateKey(values.start),
      endDate: addDaysToKey(toDateKey(values.end), 1),
    };
  }
  return { ...common, isAllDay: false, startAt: values.start.toISOString(), endAt: values.end.toISOString() };
}

/**
 * 일정 추가·편집 폼 상태와 저장 흐름.
 * @param id 'new'이면 새 일정
 * @param dateKey 새 일정의 기본 날짜 (캘린더에서 선택한 날)
 */
export function useEventForm(id: string, dateKey: string = todayKey()) {
  const isNew = id === 'new';
  const existing = useMemo(() => (isNew ? undefined : eventRepository.findById(id)), [id, isNew]);
  const [values, setValues] = useState<EventFormValues>(() => initialValues(existing, dateKey));
  const { data: categories } = useLiveQuery(categoryQueries.all());

  const calendarId =
    values.calendarId ?? categories.find((c) => c.isDefault)?.id ?? categories.at(0)?.id ?? null;

  const setField = useCallback(<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // 시작을 종료 뒤로 옮기면 종료를 따라 밀어준다
      if (key === 'start' && next.end <= next.start) {
        next.end = next.isAllDay ? next.start : addHours(next.start, 1);
      }
      return next;
    });
  }, []);

  const isEndValid = values.isAllDay
    ? toDateKey(values.end) >= toDateKey(values.start)
    : values.end > values.start;
  const canSave = values.title.trim().length > 0 && isEndValid && calendarId !== null;

  /** 저장 성공 시 true */
  const save = useCallback((): boolean => {
    if (!canSave || calendarId === null) return false;
    const input = toInput(values, calendarId);
    if (isNew) {
      eventRepository.create(input, values.reminderOffset);
    } else {
      eventRepository.update(id, input, values.reminderOffset);
    }
    return true;
  }, [canSave, calendarId, values, isNew, id]);

  const remove = useCallback(() => {
    if (!isNew) eventRepository.softDelete(id);
  }, [id, isNew]);

  return {
    isNew,
    isMissing: !isNew && existing === undefined,
    values: { ...values, calendarId },
    setField,
    categories,
    isEndValid,
    canSave,
    save,
    remove,
  };
}
