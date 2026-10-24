import { MAX_DAILY_MINUTES, MAX_DAYS_PER_WEEK, MIN_DAILY_MINUTES, MIN_DAYS_PER_WEEK } from "@/lib/constants";
import { isoDateSchema } from "@/lib/schemas/common";
import { progressStateSchema } from "@/lib/schemas/progress";
import { roadmapSchema } from "@/lib/schemas/roadmap";
import type {
  Day,
  ProgressState,
  ReplanEvent,
  Roadmap,
} from "@/types";

import { scheduleStudyDates, stableHash } from "./dates";
import { isTaskDone } from "./progress";
import { buildDayTasks, totalTaskMinutes } from "./task-builder";

export type RebalanceRoadmapInput = {
  roadmap: Roadmap;
  progress: ProgressState;
  /** New minutes per day; defaults to the roadmap's current budget. */
  dailyMinutes?: number;
  now?: Date;
  reason?: ReplanEvent["reason"];
};

export type RebalanceResult = {
  roadmap: Roadmap;
  progress: ProgressState;
  /** Days left byte-identical because they contain completed work. */
  protectedDayIds: string[];
  /** Days whose task list was rebuilt. */
  updatedDayIds: string[];
};

/**
 * Rebalance the remaining plan without ever touching work in progress.
 *
 * A day is protected as soon as *any* of its tasks is complete. Partially
 * finished days are intentionally kept whole: changing the task list under a
 * student who has already started is the fastest way to lose their trust.
 */
export function rebalanceRoadmap({
  roadmap,
  progress,
  dailyMinutes,
  now = new Date(),
  reason = "manual",
}: RebalanceRoadmapInput): RebalanceResult {
  if (roadmap.id !== progress.roadmapId) {
    throw new Error(
      `Progress belongs to roadmap "${progress.roadmapId}", not "${roadmap.id}"`
    );
  }

  const targetMinutes = dailyMinutes ?? roadmap.dailyMinutes;
  if (
    !Number.isInteger(targetMinutes) ||
    targetMinutes < MIN_DAILY_MINUTES ||
    targetMinutes > MAX_DAILY_MINUTES
  ) {
    throw new Error(
      `dailyMinutes must be an integer from ${MIN_DAILY_MINUTES} to ${MAX_DAILY_MINUTES}, got ${targetMinutes}`
    );
  }

  const phaseById = new Map(roadmap.phases.map((phase) => [phase.id, phase]));
  const protectedDayIds: string[] = [];
  const updatedDayIds: string[] = [];

  const days: Day[] = roadmap.days.map((day) => {
    const isProtected = day.tasks.some((task) => isTaskDone(progress, task.id));

    if (isProtected) {
      protectedDayIds.push(day.id);
      return day;
    }

    const phase = phaseById.get(day.phaseId);
    if (!phase) {
      throw new Error(`Day "${day.id}" references unknown phase "${day.phaseId}"`);
    }

    const tasks = buildDayTasks({
      dayId: day.id,
      topic: day.topic,
      skillIds: day.skills,
      phaseKind: phase.kind,
      emphasis: phase.emphasis,
      dailyMinutes: targetMinutes,
      allowOptional: roadmap.profileSnapshot.experienceLevel !== "beginner",
    });

    updatedDayIds.push(day.id);

    return {
      ...day,
      estimatedMinutes: totalTaskMinutes(tasks),
      tasks,
    };
  });

  const nextVersion = roadmap.version + 1;
  const createdAt = now.toISOString();

  const event: ReplanEvent = {
    id: `replan-v${nextVersion}-${stableHash(
      `${roadmap.id}|${nextVersion}|${updatedDayIds.join(",")}`
    )}`,
    createdAt,
    reason,
    fromVersion: roadmap.version,
    toVersion: nextVersion,
    affectedDayIds: updatedDayIds,
    summary: `Rebalanced ${updatedDayIds.length} days to ${targetMinutes} minutes per day. ${protectedDayIds.length} days with completed work were left unchanged.`,
  };

  const nextRoadmap = roadmapSchema.parse({
    ...roadmap,
    version: nextVersion,
    dailyMinutes: targetMinutes,
    profileSnapshot: {
      ...roadmap.profileSnapshot,
      dailyMinutes: targetMinutes,
      updatedAt: createdAt,
    },
    totalMinutes: days.reduce((sum, day) => sum + day.estimatedMinutes, 0),
    days,
  });

  const nextProgress = progressStateSchema.parse({
    ...progress,
    replanHistory: [...progress.replanHistory, event],
    updatedAt: createdAt,
  });

  return {
    roadmap: nextRoadmap,
    progress: nextProgress,
    protectedDayIds,
    updatedDayIds,
  };
}

export type RescheduleRoadmapInput = {
  roadmap: Roadmap;
  progress: ProgressState;
  /** New first day of the plan; defaults to the current start date. */
  startDate?: string;
  /** New study days per week; defaults to the current preference. */
  daysPerWeek?: number;
  now?: Date;
  reason?: ReplanEvent["reason"];
};

export type RescheduleResult = {
  roadmap: Roadmap;
  progress: ProgressState;
  /** Days whose calendar date moved. Task lists are never touched. */
  updatedDayIds: string[];
};

/**
 * Move the calendar part of a plan without rewriting its work.
 *
 * Changing the start date or study days per week only recomputes `plannedDate`
 * for each day; task ids, task lists and task completion are preserved. This is
 * deliberately separate from `rebalanceRoadmap`, which rewrites unfinished days
 * to fit a new minute budget.
 */
export function rescheduleRoadmap({
  roadmap,
  progress,
  startDate,
  daysPerWeek,
  now = new Date(),
  reason = "profile-change",
}: RescheduleRoadmapInput): RescheduleResult {
  if (roadmap.id !== progress.roadmapId) {
    throw new Error(
      `Progress belongs to roadmap "${progress.roadmapId}", not "${roadmap.id}"`
    );
  }

  const nextStartDate = startDate ?? roadmap.startDate;
  const nextDaysPerWeek = daysPerWeek ?? roadmap.profileSnapshot.daysPerWeek;

  isoDateSchema.parse(nextStartDate);
  if (
    !Number.isInteger(nextDaysPerWeek) ||
    nextDaysPerWeek < MIN_DAYS_PER_WEEK ||
    nextDaysPerWeek > MAX_DAYS_PER_WEEK
  ) {
    throw new Error(
      `daysPerWeek must be an integer from ${MIN_DAYS_PER_WEEK} to ${MAX_DAYS_PER_WEEK}, got ${nextDaysPerWeek}`
    );
  }

  const metadataChanged =
    nextStartDate !== roadmap.startDate ||
    nextDaysPerWeek !== roadmap.profileSnapshot.daysPerWeek;

  const dates = scheduleStudyDates(
    nextStartDate,
    nextDaysPerWeek,
    roadmap.days.length
  );
  const updatedDayIds: string[] = [];
  const days: Day[] = roadmap.days.map((day, index) => {
    const plannedDate = dates[index] ?? null;
    if (plannedDate === day.plannedDate) {
      return day;
    }
    updatedDayIds.push(day.id);
    return { ...day, plannedDate };
  });

  if (!metadataChanged && updatedDayIds.length === 0) {
    return { roadmap, progress, updatedDayIds: [] };
  }

  const nextVersion = roadmap.version + 1;
  const createdAt = now.toISOString();

  const event: ReplanEvent = {
    id: `replan-v${nextVersion}-${stableHash(
      `${roadmap.id}|${nextVersion}|${nextStartDate}|${nextDaysPerWeek}`
    )}`,
    createdAt,
    reason,
    fromVersion: roadmap.version,
    toVersion: nextVersion,
    affectedDayIds: updatedDayIds,
    summary: `Moved ${updatedDayIds.length} days onto the calendar starting ${nextStartDate} at ${nextDaysPerWeek} study days per week. Task lists and completed work were preserved.`,
  };

  const nextRoadmap = roadmapSchema.parse({
    ...roadmap,
    version: nextVersion,
    startDate: nextStartDate,
    profileSnapshot: {
      ...roadmap.profileSnapshot,
      startDate: nextStartDate,
      daysPerWeek: nextDaysPerWeek,
      updatedAt: createdAt,
    },
    days,
  });

  const nextProgress = progressStateSchema.parse({
    ...progress,
    replanHistory: [...progress.replanHistory, event],
    updatedAt: createdAt,
  });

  return {
    roadmap: nextRoadmap,
    progress: nextProgress,
    updatedDayIds,
  };
}
