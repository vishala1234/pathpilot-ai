import type { z } from "zod";

import type {
  skillAssessmentSchema,
  skillCategorySchema,
  skillSchema,
} from "@/lib/schemas/skill";

export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillAssessment = z.infer<typeof skillAssessmentSchema>;
