import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { taskListQueries } from '../repository/taskListRepository';
import { taskQueries, taskRepository } from '../repository/taskRepository';
import type { Task } from '../types';

/** 기본함 + 그 안의 할 일 목록 (DB 변경 시 자동 갱신) */
export function useInboxTasks(): { inboxId: string | undefined; tasks: Task[] } {
  const { data: inbox } = useLiveQuery(taskListQueries.inbox());
  const inboxId = inbox.at(0)?.id;
  const { data: tasks } = useLiveQuery(taskQueries.byList(inboxId ?? ''), [inboxId]);
  return { inboxId, tasks };
}

/** 마감일이 오늘이거나 지난 할 일 */
export function useTasksDueBy(dateKey: string): Task[] {
  const { data } = useLiveQuery(taskQueries.dueOnOrBefore(dateKey), [dateKey]);
  return data;
}

export function useTaskActions() {
  const toggleCompleted = useCallback((task: Task) => {
    taskRepository.setCompleted(task.id, task.completedAt === null);
  }, []);

  const quickAdd = useCallback((listId: string, title: string) => {
    if (title.trim().length === 0) return;
    taskRepository.create({ listId, title });
  }, []);

  return { toggleCompleted, quickAdd };
}
