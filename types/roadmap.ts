import type { z } from "zod";

import type {
  daySchema,
  phaseSchema,
  roadmapSchema,
  roadmapSourceSchema,
  taskSchema,
} from "@/lib/schemas/roadmap";

export type Task = z.infer<typeof taskSchema>;
export type Day = z.infer<typeof daySchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type RoadmapSource = z.infer<typeof roadmapSourceSchema>;
export type Roadmap = z.infer<typeof roadmapSchema>;
