import { format, parseISO } from "date-fns";

import { ROADMAP_LENGTH_DAYS } from "@/lib/constants";
import { getCareer } from "@/lib/data/careers";
import { SKILLS_BY_ID } from "@/lib/data/skills";
import { analyzeSkillGap } from "@/lib/engine/skill-gap";
import { scheduleStudyDates } from "@/lib/engine/dates";
import { profileInputSchema } from "@/lib/schemas/profile";
import { SKILL_CATEGORY_LABELS } from "@/lib/schemas/skill";
import type {
  Career,
  ExperienceLevel,
  Proficiency,
  ProfileInput,
  SkillCategory,
  SkillGapAnalysis,
} from "@/types";

import type { OnboardingDraft } from "./draft";
import {
  EXPERIENCE_LABELS,
  getProficiencyLabel,
} from "./options";
import { toProfileCandidate } from "./validation";

export type ReviewSkill = {
  skillId: string;
  name: string;
  category: SkillCategory;
  categoryLabel: string;
  level: Proficiency;
  levelLabel: string;
};

export type ReviewSchedule = {
  dailyMinutes: number;
  daysPerWeek: number;
  startDate: string;
  /** Last planned calendar date, or `null` when the date is invalid. */
  endDate: string | null;
  planDays: number;
  totalMinutes: number;
  minutesPerWeek: number;
};

export type ReviewData = {
  profile: ProfileInput;
  career: Career;
  skills: ReviewSkill[];
  experienceLevel: ExperienceLevel;
  experienceLabel: string;
  schedule: ReviewSchedule;
  /** Deterministic gap analysis from the Step 1 engine. */
  gap: SkillGapAnalysis;
};

function formatEndDate(
  startDate: string,
  daysPerWeek: number
): string | null {
  try {
    const dates = scheduleStudyDates(
      startDate,
      daysPerWeek,
      ROADMAP_LENGTH_DAYS
    );
    return dates.at(-1) ?? null;
  } catch {
    return null;
  }
}

export function buildSchedule(
  startDate: string,
  daysPerWeek: number,
  dailyMinutes: number
): ReviewSchedule {
  return {
    dailyMinutes,
    daysPerWeek,
    startDate,
    endDate: formatEndDate(startDate, daysPerWeek),
    planDays: ROADMAP_LENGTH_DAYS,
    totalMinutes: dailyMinutes * ROADMAP_LENGTH_DAYS,
    minutesPerWeek: dailyMinutes * daysPerWeek,
  };
}

/**
 * Everything the review screen shows, derived from the draft in one place.
 * Returns `null` while the draft is incomplete so the UI can point the student
 * back instead of rendering half-valid data.
 */
export function buildReviewData(draft: OnboardingDraft): ReviewData | null {
  const parsed = profileInputSchema.safeParse(toProfileCandidate(draft));
  if (!parsed.success) return null;

  const profile = parsed.data;
  const career = getCareer(profile.targetCareerId);
  if (!career) return null;

  const skills = profile.skills
    .map<ReviewSkill | null>((assessment) => {
      const skill = SKILLS_BY_ID[assessment.skillId];
      if (!skill) return null;
      return {
        skillId: skill.id,
        name: skill.name,
        category: skill.category,
        categoryLabel: SKILL_CATEGORY_LABELS[skill.category],
        level: assessment.level,
        levelLabel: getProficiencyLabel(assessment.level),
      };
    })
    .filter((skill): skill is ReviewSkill => skill !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    profile,
    career,
    skills,
    experienceLevel: profile.experienceLevel,
    experienceLabel: EXPERIENCE_LABELS[profile.experienceLevel],
    schedule: buildSchedule(
      profile.startDate,
      profile.daysPerWeek,
      profile.dailyMinutes
    ),
    gap: analyzeSkillGap(career, profile.skills),
  };
}

export function formatReviewDate(isoDate: string | null): string {
  if (!isoDate) return "Not set";
  try {
    return format(parseISO(isoDate), "EEEE, d MMMM yyyy");
  } catch {
    return isoDate;
  }
}

export function formatShortReviewDate(isoDate: string | null): string {
  if (!isoDate) return "Not set";
  try {
    return format(parseISO(isoDate), "d MMM yyyy");
  } catch {
    return isoDate;
  }
}
