import {
  DEFAULT_DAILY_MINUTES,
  DEFAULT_DAYS_PER_WEEK,
} from "@/lib/constants";
import type {
  ExperienceLevel,
  Proficiency,
  SkillAssessment,
} from "@/types";

/**
 * The in-progress onboarding answer sheet.
 *
 * Unlike `Profile`, every field is optional or empty until the student fills it
 * in. That lets the wizard render an honest first state and run per-step
 * validation without inventing placeholder values. The only defaults are the
 * study preferences, which use the product-wide supported defaults.
 */
export type EducationDraft = {
  degree: string;
  branch: string;
  year: number | null;
  college: string;
};

export type OnboardingDraft = {
  name: string;
  education: EducationDraft;
  targetCareerId: string | null;
  /** Selected catalog skills with their self-assessed level. */
  skills: SkillAssessment[];
  experienceLevel: ExperienceLevel | null;
  dailyMinutes: number | null;
  daysPerWeek: number | null;
  /** `YYYY-MM-DD`, or an empty string before the student picks a date. */
  startDate: string;
};

export function createEmptyEducation(): EducationDraft {
  return { degree: "", branch: "", year: null, college: "" };
}

/**
 * A fresh answer sheet. No dates or random ids are created here, so the same
 * initial state is rendered on the server and the client.
 */
export function createEmptyDraft(): OnboardingDraft {
  return {
    name: "",
    education: createEmptyEducation(),
    targetCareerId: null,
    skills: [],
    experienceLevel: null,
    dailyMinutes: DEFAULT_DAILY_MINUTES,
    daysPerWeek: DEFAULT_DAYS_PER_WEEK,
    startDate: "",
  };
}

export function patchDraft(
  draft: OnboardingDraft,
  patch: Partial<OnboardingDraft>
): OnboardingDraft {
  return { ...draft, ...patch };
}

export function patchEducation(
  draft: OnboardingDraft,
  patch: Partial<EducationDraft>
): OnboardingDraft {
  return {
    ...draft,
    education: { ...draft.education, ...patch },
  };
}

export function getSelectedSkillIds(draft: OnboardingDraft): string[] {
  return draft.skills.map((skill) => skill.skillId);
}

export function isSkillSelected(
  draft: OnboardingDraft,
  skillId: string
): boolean {
  return draft.skills.some((skill) => skill.skillId === skillId);
}

export function getSkillLevel(
  draft: OnboardingDraft,
  skillId: string
): Proficiency | null {
  return draft.skills.find((skill) => skill.skillId === skillId)?.level ?? null;
}

/**
 * Select or deselect a catalog skill. New selections start at "Basics" (1), the
 * friendliest honest default; the proficiency step lets the student adjust it.
 */
export function setSkillSelected(
  draft: OnboardingDraft,
  skillId: string,
  selected: boolean
): OnboardingDraft {
  const alreadySelected = isSkillSelected(draft, skillId);

  if (selected && !alreadySelected) {
    return {
      ...draft,
      skills: [...draft.skills, { skillId, level: 1 }],
    };
  }

  if (!selected && alreadySelected) {
    return {
      ...draft,
      skills: draft.skills.filter((skill) => skill.skillId !== skillId),
    };
  }

  return draft;
}

export function toggleSkill(
  draft: OnboardingDraft,
  skillId: string
): OnboardingDraft {
  return setSkillSelected(draft, skillId, !isSkillSelected(draft, skillId));
}

export function setSkillProficiency(
  draft: OnboardingDraft,
  skillId: string,
  level: Proficiency
): OnboardingDraft {
  if (!isSkillSelected(draft, skillId)) return draft;

  return {
    ...draft,
    skills: draft.skills.map((skill) =>
      skill.skillId === skillId ? { ...skill, level } : skill
    ),
  };
}

export function removeSkill(
  draft: OnboardingDraft,
  skillId: string
): OnboardingDraft {
  return setSkillSelected(draft, skillId, false);
}
