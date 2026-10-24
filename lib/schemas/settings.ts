import { z } from "zod";

/**
 * Small, UI-only preferences. Study settings (daily minutes, days per week,
 * start date) live on the profile/roadmap so there is only one source of truth.
 */
export const themePreferenceSchema = z.enum(["light", "dark", "system"]);

/** 0 = Sunday, 1 = Monday … 6 = Saturday. */
export const weekStartSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const settingsSchema = z.object({
  theme: themePreferenceSchema.default("system"),
  showOptionalTasks: z.boolean().default(true),
  compactMode: z.boolean().default(false),
  weekStartsOn: weekStartSchema.default(1),
});

export type ThemePreference = z.infer<typeof themePreferenceSchema>;
