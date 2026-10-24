import { z } from "zod";

import { idSchema, isoDateSchema, isoDateTimeSchema, percentageSchema } from "./common";

/**
 * Status for a single task. Only `taskStatus` is stored — day and roadmap
 * completion are always derived so the two can never disagree.
 */
export const taskCompletionSchema = z.object({
  taskId: idSchema,
  done: z.boolean(),
  completedAt: isoDateTimeSchema.nullable().default(null),
});

/**
 * A manual override for a day, used when the student works ahead, takes a
 * rest day or marks a day complete out of order.
 */
export const dayOverrideSchema = z.object({
  dayId: idSchema,
  /** `skip` removes the day from progress math; `complete` finishes it early. */
  kind: z.enum(["skip", "complete"]),
  note: z.string().trim().max(240).optional(),
  createdAt: isoDateTimeSchema,
});

/** A record of a replan event so the assistant can explain what changed. */
export const replanEventSchema = z.object({
  id: idSchema,
  createdAt: isoDateTimeSchema,
  reason: z.enum(["behind-schedule", "profile-change", "manual", "ai"]),
  /** Roadmap version before and after the replan. */
  fromVersion: z.number().int().min(1),
  toVersion: z.number().int().min(1),
  /** Day ids that were rewritten. Completed days are never included. */
  affectedDayIds: z.array(idSchema),
  summary: z.string().trim().min(3).max(400),
});

/** Everything PathPilot persists about a student's progress. */
export const progressStateSchema = z.object({
  roadmapId: idSchema,
  /** Map of task id → completion. Missing ids mean "not done". */
  taskStatus: z.record(idSchema, taskCompletionSchema),
  dayOverrides: z.array(dayOverrideSchema).default([]),
  /** Calendar dates the student actually studied, in `YYYY-MM-DD`. */
  activeDates: z.array(isoDateSchema).default([]),
  replanHistory: z.array(replanEventSchema).default([]),
  updatedAt: isoDateTimeSchema,
});

/** Derived metrics — never persisted, always recomputed from `taskStatus`. */
export const progressSummarySchema = z.object({
  roadmapId: idSchema,
  totalTasks: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  totalMinutes: z.number().int().min(0),
  completedMinutes: z.number().int().min(0),
  /** Percent of tasks completed, rounded to one decimal. */
  taskPercent: percentageSchema,
  /** Minute-weighted percent completed, rounded to one decimal. */
  minutePercent: percentageSchema,
  totalDays: z.number().int().min(0),
  completedDays: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
});
