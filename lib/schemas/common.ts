import { z } from "zod";

/**
 * Shared primitives used across the domain schemas.
 * These are the building blocks every other schema composes.
 */

/** Lowercase kebab-case identifier, e.g. `ai-engineer`, `d003-t2`. */
export const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Ids must be lowercase kebab-case (letters, digits, hyphens)"
  );

/** Calendar date in `YYYY-MM-DD` form. */
export const isoDateSchema = z.iso.date();

/** Full timestamp in ISO 8601 form, e.g. `2026-10-23T10:15:30.000Z`. */
export const isoDateTimeSchema = z.iso.datetime();

export const experienceLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

/**
 * Skill proficiency on a 0–3 scale.
 * 0 = none, 1 = basics, 2 = working, 3 = strong.
 */
export const proficiencySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const taskTypeSchema = z.enum([
  "learn",
  "practice",
  "build",
  "quiz",
  "review",
  "project",
]);

export const phaseKindSchema = z.enum([
  "foundation",
  "tools",
  "core",
  "advanced",
  "project",
  "interview",
]);

/** 0–100, rounded to one decimal by the engine. */
export const percentageSchema = z.number().min(0).max(100);
