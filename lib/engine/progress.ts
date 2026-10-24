import { progressStateSchema } from "@/lib/schemas/progress";
import type {
  Day,
  Phase,
  ProgressState,
  ProgressSummary,
  Roadmap,
  Task,
  TaskCompletion,
} from "@/types";

/**
 * Progress is derived exclusively from `progress.taskStatus`.
 * Day and roadmap completion are never stored, so they cannot disagree.
 */

export type DayProgress = {
  dayId: string;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  completedMinutes: number;
  percent: number;
  complete: boolean;
};

export type PhaseProgress = {
  phaseId: string;
  totalDays: number;
  completedDays: number;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  completedMinutes: number;
  percent: number;
  complete: boolean;
};

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return roundOneDecimal((completed / total) * 100);
}

function dateKey(completedAt: string): string {
  return completedAt.slice(0, 10);
}

export function createProgressState(
  roadmapId: string,
  now: Date = new Date()
): ProgressState {
  return progressStateSchema.parse({
    roadmapId,
    taskStatus: {},
    dayOverrides: [],
    activeDates: [],
    replanHistory: [],
    updatedAt: now.toISOString(),
  });
}

export function getTaskStatus(
  progress: ProgressState,
  taskId: string
): TaskCompletion | undefined {
  return progress.taskStatus[taskId];
}

export function isTaskDone(progress: ProgressState, taskId: string): boolean {
  return progress.taskStatus[taskId]?.done === true;
}

function findTask(roadmap: Roadmap, taskId: string): Task {
  for (const day of roadmap.days) {
    const task = day.tasks.find((entry) => entry.id === taskId);
    if (task) return task;
  }
  throw new Error(`Task "${taskId}" does not exist in roadmap "${roadmap.id}"`);
}

function assertSameRoadmap(roadmap: Roadmap, progress: ProgressState): void {
  if (roadmap.id !== progress.roadmapId) {
    throw new Error(
      `Progress belongs to roadmap "${progress.roadmapId}", not "${roadmap.id}"`
    );
  }
}

/** Check or uncheck a task. Unchecking is allowed; replanning is what protects it. */
export function setTaskCompletion(
  roadmap: Roadmap,
  progress: ProgressState,
  taskId: string,
  done: boolean,
  now: Date = new Date()
): ProgressState {
  assertSameRoadmap(roadmap, progress);
  findTask(roadmap, taskId);

  const timestamp = now.toISOString();
  const taskStatus: Record<string, TaskCompletion> = {
    ...progress.taskStatus,
    [taskId]: {
      taskId,
      done,
      completedAt: done ? timestamp : null,
    },
  };

  const activeDates = new Set(progress.activeDates);
  if (done) {
    activeDates.add(timestamp.slice(0, 10));
  }

  return progressStateSchema.parse({
    ...progress,
    taskStatus,
    activeDates: [...activeDates].sort(),
    updatedAt: timestamp,
  });
}

export function toggleTask(
  roadmap: Roadmap,
  progress: ProgressState,
  taskId: string,
  now: Date = new Date()
): ProgressState {
  return setTaskCompletion(
    roadmap,
    progress,
    taskId,
    !isTaskDone(progress, taskId),
    now
  );
}

export function getDayProgress(
  day: Day,
  progress: ProgressState
): DayProgress {
  let completedTasks = 0;
  let completedMinutes = 0;

  for (const task of day.tasks) {
    if (isTaskDone(progress, task.id)) {
      completedTasks += 1;
      completedMinutes += task.minutes;
    }
  }

  return {
    dayId: day.id,
    totalTasks: day.tasks.length,
    completedTasks,
    totalMinutes: day.tasks.reduce((sum, task) => sum + task.minutes, 0),
    completedMinutes,
    percent: percent(completedTasks, day.tasks.length),
    complete: completedTasks === day.tasks.length,
  };
}

export function isDayComplete(day: Day, progress: ProgressState): boolean {
  return day.tasks.every((task) => isTaskDone(progress, task.id));
}

/** A day counts as complete only when every task — including optional ones — is done. */
export function getCompletedDays(
  roadmap: Roadmap,
  progress: ProgressState
): Day[] {
  assertSameRoadmap(roadmap, progress);
  return roadmap.days.filter((day) => isDayComplete(day, progress));
}

export function getPhaseProgress(
  phase: Phase,
  roadmap: Roadmap,
  progress: ProgressState
): PhaseProgress {
  const days = phase.dayIds
    .map((dayId) => roadmap.days.find((day) => day.id === dayId))
    .filter((day): day is Day => Boolean(day));

  const totals = days.reduce(
    (accumulator, day) => {
      const dayProgress = getDayProgress(day, progress);
      return {
        completedTasks: accumulator.completedTasks + dayProgress.completedTasks,
        totalTasks: accumulator.totalTasks + dayProgress.totalTasks,
        completedMinutes:
          accumulator.completedMinutes + dayProgress.completedMinutes,
        totalMinutes: accumulator.totalMinutes + dayProgress.totalMinutes,
        completedDays:
          accumulator.completedDays + (dayProgress.complete ? 1 : 0),
      };
    },
    {
      completedTasks: 0,
      totalTasks: 0,
      completedMinutes: 0,
      totalMinutes: 0,
      completedDays: 0,
    }
  );

  return {
    phaseId: phase.id,
    totalDays: days.length,
    completedDays: totals.completedDays,
    totalTasks: totals.totalTasks,
    completedTasks: totals.completedTasks,
    totalMinutes: totals.totalMinutes,
    completedMinutes: totals.completedMinutes,
    percent: percent(totals.completedTasks, totals.totalTasks),
    complete: days.length > 0 && totals.completedDays === days.length,
  };
}

function calculateStreaks(progress: ProgressState): {
  currentStreak: number;
  longestStreak: number;
} {
  const dates = [
    ...new Set(
      Object.values(progress.taskStatus)
        .filter((entry) => entry.done && entry.completedAt)
        .map((entry) => dateKey(entry.completedAt as string))
    ),
  ].sort();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dayMs = 24 * 60 * 60 * 1000;
  let run = 1;
  let longest = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const previous = Date.parse(`${dates[index - 1]}T00:00:00.000Z`);
    const current = Date.parse(`${dates[index]}T00:00:00.000Z`);
    if (current - previous === dayMs) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  return { currentStreak: run, longestStreak: longest };
}

/**
 * The single source of truth for dashboard numbers. Nothing here reads stored
 * percentages or day flags — only individual task completions.
 */
export function calculateProgress(
  roadmap: Roadmap,
  progress: ProgressState
): ProgressSummary {
  assertSameRoadmap(roadmap, progress);

  let totalTasks = 0;
  let completedTasks = 0;
  let totalMinutes = 0;
  let completedMinutes = 0;
  let completedDays = 0;

  for (const day of roadmap.days) {
    for (const task of day.tasks) {
      totalTasks += 1;
      totalMinutes += task.minutes;
      if (isTaskDone(progress, task.id)) {
        completedTasks += 1;
        completedMinutes += task.minutes;
      }
    }

    if (isDayComplete(day, progress)) {
      completedDays += 1;
    }
  }

  const { currentStreak, longestStreak } = calculateStreaks(progress);

  return {
    roadmapId: roadmap.id,
    totalTasks,
    completedTasks,
    totalMinutes,
    completedMinutes,
    taskPercent: percent(completedTasks, totalTasks),
    minutePercent: percent(completedMinutes, totalMinutes),
    totalDays: roadmap.days.length,
    completedDays,
    currentStreak,
    longestStreak,
  };
}

/** First day with unfinished work — the "continue where you left off" target. */
export function getNextIncompleteDay(
  roadmap: Roadmap,
  progress: ProgressState
): Day | undefined {
  assertSameRoadmap(roadmap, progress);
  return roadmap.days.find((day) => !isDayComplete(day, progress));
}
