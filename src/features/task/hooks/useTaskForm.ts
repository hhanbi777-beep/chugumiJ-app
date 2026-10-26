import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useMemo, useState } from 'react';

import { reminderRepository } from '@/features/reminder';
import { fromDateKey, fromTimeKey, nextFullHour, toDateKey, toTimeKey } from '@/shared/utils/date';

import { taskListQueries } from '../repository/taskListRepository';
import { taskRepository } from '../repository/taskRepository';
import { Priority, type Task } from '../types';

export type TaskFormValues = {
  title: string;
  listId: string | null;
  hasDueDate: boolean;
  dueDate: Date;
  hasDueTime: boolean;
  dueTime: Date;
  priority: Priority;
  reminderOffset: number | null;
  note: string;
};

function initialValues(task: Task | undefined, defaultDueDate: string | undefined): TaskFormValues {
  if (!task) {
    return {
      title: '',
      listId: null,
      hasDueDate: defaultDueDate !== undefined,
      dueDate: defaultDueDate ? fromDateKey(defaultDueDate) : new Date(),
      hasDueTime: false,
      dueTime: nextFullHour(),
      priority: Priority.NONE,
      reminderOffset: null,
      note: '',
    };
  }
  const reminder = reminderRepository.findFor({ taskId: task.id });
  return {
    title: task.title,
    listId: task.listId,
    hasDueDate: task.dueDate !== null,
    dueDate: task.dueDate ? fromDateKey(task.dueDate) : new Date(),
    hasDueTime: task.dueTime !== null,
    dueTime: task.dueTime ? fromTimeKey(task.dueTime) : nextFullHour(),
    priority: task.priority as Priority,
    reminderOffset: reminder?.offsetMinutes ?? null,
    note: task.note ?? '',
  };
}

/**
 * 할 일 추가·편집 폼 상태와 저장 흐름.
 * @param id 'new'이면 새 할 일
 * @param defaultDueDate 새 할 일의 기본 마감일 (캘린더에서 선택한 날)
 */
export function useTaskForm(id: string, defaultDueDate?: string) {
  const isNew = id === 'new';
  const existing = useMemo(() => (isNew ? undefined : taskRepository.findById(id)), [id, isNew]);
  const [values, setValues] = useState<TaskFormValues>(() => initialValues(existing, defaultDueDate));
  const { data: lists } = useLiveQuery(taskListQueries.all());

  const listId = values.listId ?? lists.find((l) => l.isInbox)?.id ?? lists.at(0)?.id ?? null;

  const setField = useCallback(<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canSave = values.title.trim().length > 0 && listId !== null;

  /** 저장 성공 시 true */
  const save = useCallback((): boolean => {
    if (!canSave || listId === null) return false;
    const input = {
      listId,
      title: values.title,
      note: values.note.trim() || null,
      dueDate: values.hasDueDate ? toDateKey(values.dueDate) : null,
      dueTime: values.hasDueDate && values.hasDueTime ? toTimeKey(values.dueTime) : null,
      priority: values.priority,
    };
    const reminderOffset = values.hasDueDate ? values.reminderOffset : null;
    if (isNew) {
      taskRepository.create(input, reminderOffset);
    } else {
      taskRepository.update(id, input, reminderOffset);
    }
    return true;
  }, [canSave, listId, values, isNew, id]);

  const remove = useCallback(() => {
    if (!isNew) taskRepository.softDelete(id);
  }, [id, isNew]);

  return {
    isNew,
    isMissing: !isNew && existing === undefined,
    values: { ...values, listId },
    setField,
    lists,
    canSave,
    save,
    remove,
  };
}
