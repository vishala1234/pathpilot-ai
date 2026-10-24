import { z } from "zod";

import { MAX_TASKS_PER_DAY } from "@/lib/constants";

import {
  idSchema,
  isoDateSchema,
  isoDateTimeSchema,
  phaseKindSchema,
  taskTypeSchema,
} from "./common";
import { skillGapAnalysisSchema } from "./gap";
import { profileSchema } from "./profile";

export const taskSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(3).max(140),
  /** One or two sentences telling the student what to actually do. */
  description: z.string().trim().min(10).max(400),
  /** The catalog topic this task belongs to (from the career template). */
  topic: z.string().trim().min(3).max(140),
  type: taskTypeSchema,
  /** Estimated effort in minutes. */
  minutes: z.number().int().min(5).max(240),
  /** 1-based position inside its day. */
  order: z.number().int().min(1),
  /** Optional tasks are the first to be dropped when a plan is rebalanced. */
  optional: z.boolean().default(false),
  /** Skills exercised by this task (ids from the skills catalog). */
  skillIds: z.array(idSchema).min(1),
  /** Short hint such as a doc topic or practice site label. */
  resourceHint: z.string().trim().min(1).max(160).optional(),
});

export const daySchema = z
  .object({
    id: idSchema,
    /** 1-based plan day (not a calendar day). */
    index: z.number().int().min(1),
    phaseId: idSchema,
    title: z.string().trim().min(3).max(120),
    /** Catalog topic this day covers — exactly one per day. */
    topic: z.string().trim().min(3).max(140),
    /** What the student should be able to do by the end of the day. */
    goal: z.string().trim().min(10).max(400),
    skills: z.array(idSchema).min(1),
    /** Calendar date this day is scheduled for, or null for an unplaced day. */
    plannedDate: isoDateSchema.nullable(),
    estimatedMinutes: z.number().int().min(5).max(720),
    isProjectDay: z.boolean().default(false),
    tasks: z.array(taskSchema).min(1).max(MAX_TASKS_PER_DAY + 2),
  })
  .superRefine((day, ctx) => {
    const taskIds = new Set<string>();
    const orders = new Set<number>();

    day.tasks.forEach((task, index) => {
      if (taskIds.has(task.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate task id "${task.id}"`,
          path: ["tasks", index, "id"],
        });
      }
      taskIds.add(task.id);

      if (orders.has(task.order)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate task order ${task.order}`,
          path: ["tasks", index, "order"],
        });
      }
      orders.add(task.order);
    });
  });

/** How the generator weights a phase's task mix. */
export const phaseEmphasisSchema = z.enum(["focus", "balanced", "review"]);

export const phaseSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(3).max(80),
  order: z.number().int().min(1),
  summary: z.string().trim().min(10).max(320),
  kind: phaseKindSchema,
  /** Adaptation chosen from the skill gap + experience level. */
  emphasis: phaseEmphasisSchema.default("balanced"),
  skills: z.array(idSchema).min(1),
  /** Day ids belonging to this phase, in order. */
  dayIds: z.array(idSchema).min(1),
});

export const roadmapSourceSchema = z.enum(["ai", "fallback", "template"]);

/** A generated, day-wise plan. Content is versioned by replanning. */
export const roadmapSchema = z
  .object({
    id: idSchema,
    title: z.string().trim().min(3).max(120),
    careerId: idSchema,
    careerTitle: z.string().trim().min(3).max(80),
    /** Profile at generation time, so old roadmaps still render correctly. */
    profileSnapshot: profileSchema,
    version: z.number().int().min(1),
    source: roadmapSourceSchema,
    createdAt: isoDateTimeSchema,
    startDate: isoDateSchema,
    dailyMinutes: z.number().int().min(5).max(720),
    totalDays: z.number().int().min(1),
    totalMinutes: z.number().int().min(1),
    /** Snapshotted gap analysis used to build the plan. */
    skillGap: skillGapAnalysisSchema.optional(),
    phases: z.array(phaseSchema).min(1),
    days: z.array(daySchema).min(1),
  })
  .superRefine((roadmap, ctx) => {
    if (roadmap.totalDays !== roadmap.days.length) {
      ctx.addIssue({
        code: "custom",
        message: `totalDays is ${roadmap.totalDays}, but the roadmap has ${roadmap.days.length} days`,
        path: ["totalDays"],
      });
    }

    const dayIds = new Set<string>();
    roadmap.days.forEach((day, index) => {
      if (dayIds.has(day.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate day id "${day.id}"`,
          path: ["days", index, "id"],
        });
      }
      dayIds.add(day.id);
    });

    const phaseIds = new Set<string>();
    roadmap.phases.forEach((phase, index) => {
      if (phaseIds.has(phase.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate phase id "${phase.id}"`,
          path: ["phases", index, "id"],
        });
      }
      phaseIds.add(phase.id);

      phase.dayIds.forEach((dayId, dayIndex) => {
        if (!dayIds.has(dayId)) {
          ctx.addIssue({
            code: "custom",
            message: `Phase "${phase.id}" references unknown day "${dayId}"`,
            path: ["phases", index, "dayIds", dayIndex],
          });
        }
      });
    });

    roadmap.days.forEach((day, index) => {
      if (!phaseIds.has(day.phaseId)) {
        ctx.addIssue({
          code: "custom",
          message: `Day "${day.id}" references unknown phase "${day.phaseId}"`,
          path: ["days", index, "phaseId"],
        });
      }
    });
  });
