import { z } from "zod";

import { isCareerId } from "@/lib/data/careers";
import { isSkillId } from "@/lib/data/skills";
import {
  dailyMinutesSchema,
  daysPerWeekSchema,
  educationSchema,
  profileInputSchema,
} from "@/lib/schemas/profile";
import { experienceLevelSchema, isoDateSchema } from "@/lib/schemas/common";
import { skillAssessmentSchema } from "@/lib/schemas/skill";
import type { ProfileInput } from "@/types";

import type { OnboardingDraft } from "./draft";
import {
  ONBOARDING_STEP_IDS,
  type OnboardingStepId,
} from "./steps";

/** Flat field path → first validation message, e.g. `education.year`. */
export type FieldErrors = Record<string, string>;

export type StepValidation = {
  valid: boolean;
  errors: FieldErrors;
};

const valid: StepValidation = { valid: true, errors: {} };

function fail(path: string, message: string): StepValidation {
  return { valid: false, errors: { [path]: message } };
}

function fromZod(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!errors[path]) errors[path] = issue.message;

    // Also surface a message on the field group (e.g. `skills`) so a step can
    // render one clear summary even when the issue is nested.
    const root = String(issue.path[0] ?? "form");
    if (!errors[root]) errors[root] = issue.message;
  }

  return errors;
}

function result(parsed: z.ZodSafeParseResult<unknown>): StepValidation {
  return parsed.success
    ? valid
    : { valid: false, errors: fromZod(parsed.error) };
}

const welcomeSchema = z.object({
  name: z.string().trim().max(60, "Keep your name under 60 characters").optional(),
  education: educationSchema,
});

const selectedSkillsSchema = z
  .array(skillAssessmentSchema)
  .max(100, "That is more skills than the catalog contains")
  .refine(
    (skills) =>
      new Set(skills.map((skill) => skill.skillId)).size === skills.length,
    "A skill can only be listed once"
  )
  .refine(
    (skills) => skills.every((skill) => isSkillId(skill.skillId)),
    "Remove skills that are not part of the catalog"
  );

const skillsStepSchema = z.object({ skills: selectedSkillsSchema });

const careerStepSchema = z.object({
  targetCareerId: z
    .string()
    .refine(isCareerId, "Choose a target career from the catalog"),
});

function normalizedEducation(draft: OnboardingDraft) {
  const college = draft.education.college.trim();
  return {
    degree: draft.education.degree.trim(),
    branch: draft.education.branch.trim(),
    year: draft.education.year,
    ...(college ? { college } : {}),
  };
}

function normalizedName(draft: OnboardingDraft): string | undefined {
  const name = draft.name.trim();
  return name ? name : undefined;
}

export function toProfileCandidate(draft: OnboardingDraft) {
  const education = normalizedEducation(draft);
  return {
    ...(normalizedName(draft) ? { name: normalizedName(draft) } : {}),
    education,
    targetCareerId: draft.targetCareerId,
    experienceLevel: draft.experienceLevel,
    skills: draft.skills,
    customSkills: [],
    dailyMinutes: draft.dailyMinutes,
    daysPerWeek: draft.daysPerWeek,
    startDate: draft.startDate,
  };
}

/** Parse the whole draft into the exact shape the stores and engine consume. */
export function toProfileInput(draft: OnboardingDraft): ProfileInput {
  return profileInputSchema.parse(toProfileCandidate(draft));
}

/**
 * Validate one step with the same Zod contracts used everywhere else. Empty
 * optional skills are allowed: a true beginner can build a roadmap from zero.
 */
export function validateStep(
  stepId: OnboardingStepId,
  draft: OnboardingDraft
): StepValidation {
  switch (stepId) {
    case "welcome":
      return result(
        welcomeSchema.safeParse({
          name: normalizedName(draft),
          education: normalizedEducation(draft),
        })
      );

    case "career":
      return result(
        careerStepSchema.safeParse({
          targetCareerId: draft.targetCareerId ?? "",
        })
      );

    case "skills":
      return result(skillsStepSchema.safeParse({ skills: draft.skills }));

    case "proficiency":
      return result(skillsStepSchema.safeParse({ skills: draft.skills }));

    case "experience": {
      if (!draft.experienceLevel) {
        return fail("experienceLevel", "Choose your experience level");
      }
      return result(experienceLevelSchema.safeParse(draft.experienceLevel));
    }

    case "study-time": {
      if (draft.dailyMinutes === null) {
        return fail("dailyMinutes", "Choose how long you can study each day");
      }
      const parsed = dailyMinutesSchema.safeParse(draft.dailyMinutes);
      return parsed.success
        ? valid
        : fail(
            "dailyMinutes",
            "Choose between 15 and 480 minutes per study day"
          );
    }

    case "study-days": {
      if (draft.daysPerWeek === null) {
        return fail("daysPerWeek", "Choose how many days a week you can study");
      }
      const parsed = daysPerWeekSchema.safeParse(draft.daysPerWeek);
      return parsed.success
        ? valid
        : fail("daysPerWeek", "Choose between 1 and 7 study days per week");
    }

    case "start-date": {
      if (!draft.startDate) {
        return fail("startDate", "Choose the first day of your plan");
      }
      const parsed = isoDateSchema.safeParse(draft.startDate);
      return parsed.success
        ? valid
        : fail("startDate", "Enter a valid calendar date (YYYY-MM-DD)");
    }

    case "review":
    case "build":
      return result(profileInputSchema.safeParse(toProfileCandidate(draft)));
  }
}

export function validateOnboardingDraft(
  draft: OnboardingDraft
): Record<OnboardingStepId, StepValidation> {
  return Object.fromEntries(
    ONBOARDING_STEP_IDS.map((stepId) => [stepId, validateStep(stepId, draft)])
  ) as Record<OnboardingStepId, StepValidation>;
}

/** The first step whose answers are incomplete, or `null` when everything is valid. */
export function findFirstInvalidStep(
  draft: OnboardingDraft
): OnboardingStepId | null {
  for (const stepId of ONBOARDING_STEP_IDS) {
    // `build` reuses the review validation; there is no separate answer sheet.
    if (stepId === "build") continue;
    if (!validateStep(stepId, draft).valid) return stepId;
  }
  return null;
}

export function isOnboardingDraftValid(draft: OnboardingDraft): boolean {
  return findFirstInvalidStep(draft) === null;
}
