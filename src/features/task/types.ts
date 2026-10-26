import type { TaskRow } from '@/db/schema';

export type Task = TaskRow;

export const Priority = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export type CreateTaskInput = {
  listId: string;
  title: string;
  note?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: Priority;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'listId'>> & {
  listId?: string;
};
