import type { z } from "zod";

import type {
  experienceLevelSchema,
  isoDateSchema,
  isoDateTimeSchema,
  percentageSchema,
  phaseKindSchema,
  proficiencySchema,
  taskTypeSchema,
} from "@/lib/schemas/common";
import type { phaseEmphasisSchema } from "@/lib/schemas/roadmap";

export type IsoDate = z.infer<typeof isoDateSchema>;
export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type Proficiency = z.infer<typeof proficiencySchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type PhaseKind = z.infer<typeof phaseKindSchema>;
export type PhaseEmphasis = z.infer<typeof phaseEmphasisSchema>;
export type Percentage = z.infer<typeof percentageSchema>;
