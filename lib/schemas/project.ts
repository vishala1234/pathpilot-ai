import { z } from "zod";

import { experienceLevelSchema, idSchema } from "./common";

export const projectSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(3).max(80),
  /** Short pitch shown on the project card. */
  summary: z.string().trim().min(20).max(280),
  /** Why this project matters for the target career. */
  whyItMatters: z.string().trim().min(20).max(320),
  careerIds: z.array(idSchema).min(1),
  level: experienceLevelSchema,
  /** Estimated hours of focused work. */
  estimatedHours: z.number().int().min(1).max(120),
  skills: z.array(idSchema).min(1),
  /** Concrete deliverables the student can show in a portfolio. */
  deliverables: z.array(z.string().trim().min(3).max(140)).min(1),
  /** Suggested repo/folder name, kebab-case. */
  repoName: idSchema,
});
