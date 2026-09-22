import { Task, ScheduleEvent } from "../types";

export interface ArchiveResult {
  updatedTasks: Task[];
  updatedSchedule: ScheduleEvent[];
  archivedTasksCount: number;
  archivedScheduleCount: number;
  hasChanges: boolean;
}

/**
 * Background auto-archive utility.
 * Scans tasks and schedule events, automatically moving items older than `thresholdDays` (default 30 days)
 * to an 'archived' state to keep main views clean, fast, and responsive.
 */
export function autoArchiveOldItems(
  tasks: Task[],
  schedule: ScheduleEvent[],
  thresholdDays = 30
): ArchiveResult {
  const now = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  const cutoffTime = now - thresholdMs;

  let archivedTasksCount = 0;
  let archivedScheduleCount = 0;

  const updatedTasks = tasks.map((t) => {
    if (t.archived) return t;

    // Check date from createdAt or dueDate
    let itemTime = 0;
    if (t.dueDate) {
      itemTime = new Date(t.dueDate).getTime();
    } else if (t.createdAt) {
      itemTime = new Date(t.createdAt).getTime();
    }

    if (itemTime > 0 && itemTime < cutoffTime) {
      archivedTasksCount++;
      return { ...t, archived: true };
    }
    return t;
  });

  const updatedSchedule = schedule.map((evt) => {
    if (evt.archived) return evt;

    let evtTime = 0;
    if (evt.date) {
      evtTime = new Date(evt.date).getTime();
    }

    if (evtTime > 0 && evtTime < cutoffTime) {
      archivedScheduleCount++;
      return { ...evt, archived: true };
    }
    return evt;
  });

  const hasChanges = archivedTasksCount > 0 || archivedScheduleCount > 0;

  return {
    updatedTasks,
    updatedSchedule,
    archivedTasksCount,
    archivedScheduleCount,
    hasChanges,
  };
}
