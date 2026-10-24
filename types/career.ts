import type { z } from "zod";

import type {
  careerSchema,
  careerSkillSchema,
  levelGuidanceSchema,
  phaseTemplateSchema,
  skillImportanceSchema,
} from "@/lib/schemas/career";

export type SkillImportance = z.infer<typeof skillImportanceSchema>;
export type CareerSkill = z.infer<typeof careerSkillSchema>;
export type PhaseTemplate = z.infer<typeof phaseTemplateSchema>;
export type LevelGuidance = z.infer<typeof levelGuidanceSchema>;
export type Career = z.infer<typeof careerSchema>;
