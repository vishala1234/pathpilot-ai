import { z } from "zod";

import {
  MAX_DAILY_MINUTES,
  MAX_DAYS_PER_WEEK,
  MIN_DAILY_MINUTES,
  MIN_DAYS_PER_WEEK,
} from "@/lib/constants";

import {
  experienceLevelSchema,
  idSchema,
  isoDateSchema,
  isoDateTimeSchema,
} from "./common";
import { skillAssessmentSchema } from "./skill";

export const educationSchema = z.object({
  degree: z.string().trim().min(2).max(80),
  branch: z.string().trim().min(2).max(80),
  /** Current year of study, 1-indexed. */
  year: z.number().int().min(1).max(6),
  college: z.string().trim().min(2).max(120).optional(),
});

function uniqueSkillIds(skills: { skillId: string }[]) {
  return new Set(skills.map((skill) => skill.skillId)).size === skills.length;
}

/** Study minutes available per plan day. Shared by onboarding and the profile. */
export const dailyMinutesSchema = z
  .number()
  .int()
  .min(MIN_DAILY_MINUTES)
  .max(MAX_DAILY_MINUTES);

/** Study days per week; affects calendar placement. */
export const daysPerWeekSchema = z
  .number()
  .int()
  .min(MIN_DAYS_PER_WEEK)
  .max(MAX_DAYS_PER_WEEK);

const profileFieldsSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  education: educationSchema,
  targetCareerId: idSchema,
  experienceLevel: experienceLevelSchema,
  /** Skills the student already has, with a self-assessed level. */
  skills: z.array(skillAssessmentSchema).max(100),
  /** Free-text skills that are not in the catalog. */
  customSkills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  /** Study minutes available per plan day. */
  dailyMinutes: dailyMinutesSchema,
  /** How many days a week the student studies (affects calendar placement). */
  daysPerWeek: daysPerWeekSchema,
  /** First plan day, in `YYYY-MM-DD`. */
  startDate: isoDateSchema,
});

/** Shape collected by the onboarding wizard, before persistence. */
export const profileInputSchema = profileFieldsSchema.refine(
  (profile) => uniqueSkillIds(profile.skills),
  { message: "A skill can only be listed once", path: ["skills"] }
);

/** Persisted student profile. */
export const profileSchema = profileFieldsSchema
  .extend({
    id: idSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .refine((profile) => uniqueSkillIds(profile.skills), {
    message: "A skill can only be listed once",
    path: ["skills"],
  });
