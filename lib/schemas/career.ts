import { z } from "zod";

import { idSchema, phaseKindSchema, proficiencySchema } from "./common";

/** How important a skill is for a target career. */
export const skillImportanceSchema = z.enum(["core", "supporting", "bonus"]);

/** A skill a career requires, with the level expected by graduation day. */
export const careerSkillSchema = z.object({
  skillId: idSchema,
  requiredLevel: proficiencySchema,
  importance: skillImportanceSchema,
});

/** One learning phase inside a career template. */
export const phaseTemplateSchema = z
  .object({
    id: idSchema,
    /** 1-based position inside the career track. */
    order: z.number().int().min(1),
    title: z.string().trim().min(3).max(80),
    summary: z.string().trim().min(10).max(320),
    kind: phaseKindSchema,
    /** Number of plan days this phase occupies. */
    dayCount: z.number().int().min(1).max(20),
    skills: z.array(idSchema).min(1),
    /** One topic per plan day — the fallback generator expands these. */
    topics: z.array(z.string().trim().min(3).max(140)).min(1).max(20),
  })
  .refine((phase) => phase.topics.length === phase.dayCount, {
    message: "A phase needs exactly one topic per plan day",
    path: ["topics"],
  });

/** Tone adjustments for each starting level. */
export const levelGuidanceSchema = z.object({
  beginner: z.string().trim().min(10).max(320),
  intermediate: z.string().trim().min(10).max(320),
  advanced: z.string().trim().min(10).max(320),
});

/** A complete career track from the catalog. */
export const careerSchema = z
  .object({
    id: idSchema,
    title: z.string().trim().min(3).max(80),
    tagline: z.string().trim().min(10).max(120),
    description: z.string().trim().min(30).max(500),
    /** Total plan days across all phases (must equal the sum of dayCount). */
    estimatedDays: z.number().int().min(7).max(180),
    coreSkills: z.array(careerSkillSchema).min(5),
    phases: z.array(phaseTemplateSchema).min(3),
    projectIds: z.array(idSchema).min(1),
    levelGuidance: levelGuidanceSchema,
  })
  .superRefine((career, ctx) => {
    const phaseIds = new Set<string>();
    const orders: number[] = [];
    let totalDays = 0;

    career.phases.forEach((phase, index) => {
      if (phaseIds.has(phase.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate phase id "${phase.id}"`,
          path: ["phases", index, "id"],
        });
      }
      phaseIds.add(phase.id);
      orders.push(phase.order);
      totalDays += phase.dayCount;

      if (new Set(phase.skills).size !== phase.skills.length) {
        ctx.addIssue({
          code: "custom",
          message: `Phase "${phase.id}" lists a skill more than once`,
          path: ["phases", index, "skills"],
        });
      }
    });

    const sortedOrders = [...orders].sort((a, b) => a - b);
    const ordersAreSequential = sortedOrders.every(
      (order, index) => order === index + 1
    );
    if (!ordersAreSequential) {
      ctx.addIssue({
        code: "custom",
        message: "Phase orders must be unique and run from 1 to phases.length",
        path: ["phases"],
      });
    }

    if (totalDays !== career.estimatedDays) {
      ctx.addIssue({
        code: "custom",
        message: `Phase dayCount totals ${totalDays}, but estimatedDays is ${career.estimatedDays}`,
        path: ["estimatedDays"],
      });
    }

    const skillIds = career.coreSkills.map((skill) => skill.skillId);
    if (new Set(skillIds).size !== skillIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "A career cannot list the same core skill twice",
        path: ["coreSkills"],
      });
    }

    const skillsTaught = new Set(
      career.phases.flatMap((phase) => phase.skills)
    );
    career.coreSkills.forEach((skill, index) => {
      if (!skillsTaught.has(skill.skillId)) {
        ctx.addIssue({
          code: "custom",
          message: `Core skill "${skill.skillId}" is not covered by any phase`,
          path: ["coreSkills", index, "skillId"],
        });
      }
    });
  });
