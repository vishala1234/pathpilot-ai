import type { z } from "zod";

import type {
  settingsSchema,
  themePreferenceSchema,
  weekStartSchema,
} from "@/lib/schemas/settings";

export type ThemePreference = z.infer<typeof themePreferenceSchema>;
export type WeekStart = z.infer<typeof weekStartSchema>;
export type Settings = z.infer<typeof settingsSchema>;
