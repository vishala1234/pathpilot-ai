/**
 * The onboarding wizard is a fixed, ordered list of steps. Keeping the order and
 * copy in one typed place means the progress indicator, back/continue buttons
 * and tests can never disagree about the flow.
 */

export const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome",
    shortLabel: "You",
    description: "A little about your studies before we plot the route.",
  },
  {
    id: "career",
    title: "Target career",
    shortLabel: "Career",
    description: "Pick the destination. You can only aim at one role at a time.",
  },
  {
    id: "skills",
    title: "Current skills",
    shortLabel: "Skills",
    description: "Tick anything you have already used, even a little.",
  },
  {
    id: "proficiency",
    title: "Proficiency",
    shortLabel: "Levels",
    description: "Be honest about your comfort level with each selected skill.",
  },
  {
    id: "experience",
    title: "Experience",
    shortLabel: "Experience",
    description: "This sets the starting tone of your plan.",
  },
  {
    id: "study-time",
    title: "Daily study time",
    shortLabel: "Minutes",
    description: "How many focused minutes can you give on a study day?",
  },
  {
    id: "study-days",
    title: "Study days",
    shortLabel: "Days",
    description: "How many days a week will you actually show up?",
  },
  {
    id: "start-date",
    title: "Start date",
    shortLabel: "Date",
    description: "Choose the first day of your 45-day plan.",
  },
  {
    id: "review",
    title: "Review",
    shortLabel: "Review",
    description: "Check the details and see your deterministic skill gap.",
  },
  {
    id: "build",
    title: "Build roadmap",
    shortLabel: "Build",
    description: "Turn this profile into your 45-day plan.",
  },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type OnboardingStepId = OnboardingStep["id"];

export const ONBOARDING_STEP_IDS = ONBOARDING_STEPS.map(
  (step) => step.id
) as OnboardingStepId[];

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;

export function getStep(stepId: OnboardingStepId): OnboardingStep {
  const step = ONBOARDING_STEPS.find((entry) => entry.id === stepId);
  if (!step) {
    throw new Error(`Unknown onboarding step "${stepId}"`);
  }
  return step;
}

/** Zero-based position in the flow. */
export function getStepIndex(stepId: OnboardingStepId): number {
  const index = ONBOARDING_STEP_IDS.indexOf(stepId);
  if (index < 0) {
    throw new Error(`Unknown onboarding step "${stepId}"`);
  }
  return index;
}

/** One-based position shown to the student. */
export function getStepNumber(stepId: OnboardingStepId): number {
  return getStepIndex(stepId) + 1;
}

export function getNextStep(
  stepId: OnboardingStepId
): OnboardingStepId | null {
  return ONBOARDING_STEP_IDS[getStepIndex(stepId) + 1] ?? null;
}

export function getPreviousStep(
  stepId: OnboardingStepId
): OnboardingStepId | null {
  const index = getStepIndex(stepId);
  return index <= 0 ? null : ONBOARDING_STEP_IDS[index - 1];
}

export function getStepProgress(stepId: OnboardingStepId): {
  /** 1-based current step. */
  current: number;
  total: number;
  /** Percentage of the flow covered by the current step (0–100). */
  percent: number;
} {
  const current = getStepNumber(stepId);
  return {
    current,
    total: ONBOARDING_STEP_COUNT,
    percent: Math.round((current / ONBOARDING_STEP_COUNT) * 100),
  };
}
