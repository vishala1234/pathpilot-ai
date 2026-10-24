import { z } from "zod";

import { idSchema, proficiencySchema } from "./common";

export const skillCategorySchema = z.enum([
  "programming",
  "data",
  "machine-learning",
  "devops-cloud",
  "security",
  "web",
  "product",
  "professional",
]);

/** A single entry in the global skills catalog. */
export const skillSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(2).max(60),
  category: skillCategorySchema,
  description: z.string().trim().min(10).max(240),
  aliases: z.array(z.string().trim().min(1).max(40)).default([]),
});

/** A student's self-reported level for one catalog skill. */
export const skillAssessmentSchema = z.object({
  skillId: idSchema,
  level: proficiencySchema,
});

export const PROFICIENCY_LABELS = {
  0: "Not started",
  1: "Basics",
  2: "Working",
  3: "Strong",
} as const satisfies Record<0 | 1 | 2 | 3, string>;

export const SKILL_CATEGORY_LABELS = {
  programming: "Programming",
  data: "Data & Analytics",
  "machine-learning": "AI & Machine Learning",
  "devops-cloud": "DevOps & Cloud",
  security: "Security",
  web: "Web Engineering",
  product: "Product",
  professional: "Professional Skills",
} as const satisfies Record<z.infer<typeof skillCategorySchema>, string>;
