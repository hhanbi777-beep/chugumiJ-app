import { useCallback, useMemo, useState } from 'react';

import { fromDateKey, fromTimeKey, nextFullHour, toDateKey, toTimeKey } from '@/shared/utils/date';

import { alarmRepository } from '../repository/alarmRepository';
import type { Alarm } from '../types';
import { repeatOf } from '../utils/alarmRepeat';

export type AlarmFormValues = {
  label: string;
  time: Date;
  repeatKind: 'weekly' | 'once';
  weekdays: number[];
  date: Date;
};

function initialValues(alarm: Alarm | undefined, defaultDate: string | undefined): AlarmFormValues {
  if (!alarm) {
    const date = defaultDate ? fromDateKey(defaultDate) : new Date();
    return {
      label: '',
      time: nextFullHour(),
      // 캘린더에서 날짜를 골라 들어오면 그날 한 번, 아니면 요일 반복
      repeatKind: defaultDate ? 'once' : 'weekly',
      weekdays: [date.getDay()],
      date,
    };
  }
  const repeat = repeatOf(alarm);
  return {
    label: alarm.label ?? '',
    time: fromTimeKey(alarm.time),
    repeatKind: repeat.kind,
    weekdays: repeat.kind === 'weekly' ? repeat.weekdays : [fromDateKey(repeat.date).getDay()],
    date: repeat.kind === 'once' ? fromDateKey(repeat.date) : new Date(),
  };
}

/**
 * 알람 추가·편집 폼.
 * @param id 'new'이면 새 알람
 * @param defaultDate 캘린더에서 고른 날 ('YYYY-MM-DD')
 */
export function useAlarmForm(id: string, defaultDate?: string) {
  const isNew = id === 'new';
  const existing = useMemo(() => (isNew ? undefined : alarmRepository.findById(id)), [id, isNew]);
  const [values, setValues] = useState<AlarmFormValues>(() => initialValues(existing, defaultDate));

  const setField = useCallback(<K extends keyof AlarmFormValues>(key: K, value: AlarmFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleWeekday = useCallback((weekday: number) => {
    setValues((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(weekday)
        ? prev.weekdays.filter((d) => d !== weekday)
        : [...prev.weekdays, weekday],
    }));
  }, []);

  const canSave = values.repeatKind === 'once' || values.weekdays.length > 0;

  /** 저장 성공 시 true */
  const save = useCallback((): boolean => {
    if (!canSave) return false;
    const input = {
      label: values.label,
      time: toTimeKey(values.time),
      repeat:
        values.repeatKind === 'once'
          ? ({ kind: 'once', date: toDateKey(values.date) } as const)
          : ({ kind: 'weekly', weekdays: values.weekdays } as const),
    };
    if (isNew) {
      alarmRepository.create(input);
    } else {
      alarmRepository.update(id, input);
    }
    return true;
  }, [canSave, values, isNew, id]);

  const remove = useCallback(() => {
    if (!isNew) alarmRepository.softDelete(id);
  }, [id, isNew]);

  return {
    isNew,
    isMissing: !isNew && (existing === undefined || existing.deletedAt !== null),
    values,
    setField,
    toggleWeekday,
    canSave,
    save,
    remove,
  };
}
