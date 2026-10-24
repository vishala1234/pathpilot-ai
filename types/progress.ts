import type { z } from "zod";

import type {
  dayOverrideSchema,
  progressStateSchema,
  progressSummarySchema,
  replanEventSchema,
  taskCompletionSchema,
} from "@/lib/schemas/progress";

export type TaskCompletion = z.infer<typeof taskCompletionSchema>;
export type DayOverride = z.infer<typeof dayOverrideSchema>;
export type ReplanEvent = z.infer<typeof replanEventSchema>;
export type ProgressState = z.infer<typeof progressStateSchema>;
export type ProgressSummary = z.infer<typeof progressSummarySchema>;
