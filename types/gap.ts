import type { z } from "zod";

import type {
  gapPrioritySchema,
  skillGapAnalysisSchema,
  skillGapEntrySchema,
  skillStrengthSchema,
} from "@/lib/schemas/gap";

export type GapPriority = z.infer<typeof gapPrioritySchema>;
export type SkillGapEntry = z.infer<typeof skillGapEntrySchema>;
export type SkillStrength = z.infer<typeof skillStrengthSchema>;
export type SkillGapAnalysis = z.infer<typeof skillGapAnalysisSchema>;
