import { format } from "date-fns";

import {
  calculateProgress,
  getCompletedDays as getCompletedDaysFromEngine,
  getDayProgress,
  getNextIncompleteDay,
  getPhaseProgress,
  type DayProgress,
  type PhaseProgress,
} from "@/lib/engine";
import type { Day, ProgressSummary, ProgressState, Roadmap } from "@/types";

/**
 * Pure, read-only selectors. Nothing here writes or persists state, and every
 * progress number is recomputed from `taskStatus` via the Step 2 engine.
 */

export type TodayPlan = {
  day: Day;
  progress: DayProgress;
  /** True when the day is the one scheduled on the requested calendar date. */
  scheduledToday: boolean;
};

export function getProgressSummary(
  roadmap: Roadmap | null,
  progress: ProgressState | null
): ProgressSummary | null {
  if (!roadmap || !progress) return null;
  if (progress.roadmapId !== roadmap.id) return null;
  return calculateProgress(roadmap, progress);
}

export function getCompletedTaskCount(
  roadmap: Roadmap | null,
  progress: ProgressState | null
): number {
  return getProgressSummary(roadmap, progress)?.completedTasks ?? 0;
}

export function getCurrentStreak(
  roadmap: Roadmap | null,
  progress: ProgressState | null
): number {
  return getProgressSummary(roadmap, progress)?.currentStreak ?? 0;
}

export function getCompletedDays(
  roadmap: Roadmap | null,
  progress: ProgressState | null
): Day[] {
  if (!roadmap || !progress || progress.roadmapId !== roadmap.id) return [];
  return getCompletedDaysFromEngine(roadmap, progress);
}

/** Count of fully completed days without materialising the day array. */
export function getCompletedDayCount(
  roadmap: Roadmap | null,
  progress: ProgressState | null
): number {
  return getProgressSummary(roadmap, progress)?.completedDays ?? 0;
}

export function getPhaseProgressFor(
  roadmap: Roadmap | null,
  progress: ProgressState | null,
  phaseId: string
): PhaseProgress | null {
  if (!roadmap || !progress || progress.roadmapId !== roadmap.id) return null;
  const phase = roadmap.phases.find((entry) => entry.id === phaseId);
  if (!phase) return null;
  return getPhaseProgress(phase, roadmap, progress);
}

export function getAllPhaseProgress(
  roadmap: Roadmap | null,
  progress: ProgressState | null
): PhaseProgress[] {
  if (!roadmap || !progress || progress.roadmapId !== roadmap.id) return [];
  return roadmap.phases.map((phase) =>
    getPhaseProgress(phase, roadmap, progress)
  );
}

export function getDayProgressFor(
  roadmap: Roadmap | null,
  progress: ProgressState | null,
  dayId: string
): DayProgress | null {
  if (!roadmap || !progress || progress.roadmapId !== roadmap.id) return null;
  const day = roadmap.days.find((entry) => entry.id === dayId);
  if (!day) return null;
  return getDayProgress(day, progress);
}

/**
 * Today's plan: the day scheduled for the given date when it exists, otherwise
 * the next incomplete day ("continue where you left off"). Returns `null` when
 * the whole roadmap is done.
 */
export function getTodayPlan(
  roadmap: Roadmap | null,
  progress: ProgressState | null,
  today?: Date
): TodayPlan | null {
  if (!roadmap || !progress || progress.roadmapId !== roadmap.id) return null;

  const current = today ?? new Date();
  const dateKey = format(current, "yyyy-MM-dd");
  const scheduled = roadmap.days.find((day) => day.plannedDate === dateKey);
  const day = scheduled ?? getNextIncompleteDay(roadmap, progress);
  if (!day) return null;

  return {
    day,
    progress: getDayProgress(day, progress),
    scheduledToday: Boolean(scheduled),
  };
}

export function getRoadmapVersion(roadmap: Roadmap | null): number | null {
  return roadmap?.version ?? null;
}
