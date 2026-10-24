import { PROFICIENCY_LABELS } from "@/lib/schemas/skill";
import type { ExperienceLevel, Proficiency } from "@/types";

export type ChoiceOption<T> = {
  value: T;
  label: string;
  description: string;
};

export const EXPERIENCE_OPTIONS: ChoiceOption<ExperienceLevel>[] = [
  {
    value: "beginner",
    label: "Beginner",
    description:
      "New to the field. You may know some programming or none at all, and you want the plan to start from first principles.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description:
      "You have built a few things and know the basics. You want fewer warm-ups and more hands-on practice.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description:
      "You are comfortable building on your own. You want a faster pace, harder projects and interview-level depth.",
  },
];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function getExperienceOption(
  level: ExperienceLevel
): ChoiceOption<ExperienceLevel> {
  return (
    EXPERIENCE_OPTIONS.find((option) => option.value === level) ??
    EXPERIENCE_OPTIONS[0]
  );
}

/** Presets inside the supported 15–480 minute range. */
export const DAILY_MINUTES_OPTIONS = [30, 45, 60, 90, 120, 180] as const;

export const DAILY_MINUTES_HELP =
  "Supported range: 15–480 minutes per study day.";

export const DAYS_PER_WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Levels offered for a skill the student has selected. */
export const PROFICIENCY_OPTIONS: {
  value: Exclude<Proficiency, 0>;
  label: string;
  shortLabel: string;
}[] = [
  { value: 1, label: PROFICIENCY_LABELS[1], shortLabel: "Basics" },
  { value: 2, label: PROFICIENCY_LABELS[2], shortLabel: "Working" },
  { value: 3, label: PROFICIENCY_LABELS[3], shortLabel: "Strong" },
];

export function getProficiencyLabel(level: Proficiency): string {
  return PROFICIENCY_LABELS[level];
}

export function formatStudyDays(daysPerWeek: number): string {
  return daysPerWeek === 1 ? "1 day / week" : `${daysPerWeek} days / week`;
}

export function formatDailyMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min / day`;
  const hours = minutes / 60;
  const formatted = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${minutes} min / day (${formatted} h)`;
}
