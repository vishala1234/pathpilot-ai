import { useProfileStore } from "@/lib/store/profile";
import { useProgressStore } from "@/lib/store/progress";
import { useRoadmapStore } from "@/lib/store/roadmap";
import { getProgressSummary } from "@/lib/store/selectors";
import type { Profile, ProgressSummary, Roadmap } from "@/types";

import type { OnboardingDraft } from "./draft";
import { toProfileInput } from "./validation";

/** Where the wizard goes after a successful build. */
export const ROADMAP_DESTINATION = "/roadmap" as const;

export type ExistingRoadmapState = {
  exists: boolean;
  roadmap: Roadmap | null;
  summary: ProgressSummary | null;
  completedTasks: number;
  completedDays: number;
};

/** Inspect the current plan without mutating anything. */
export function getExistingRoadmapState(): ExistingRoadmapState {
  const roadmap = useRoadmapStore.getState().roadmap;
  const progress = useProgressStore.getState().progress;

  if (!roadmap) {
    return {
      exists: false,
      roadmap: null,
      summary: null,
      completedTasks: 0,
      completedDays: 0,
    };
  }

  const summary = getProgressSummary(roadmap, progress);

  return {
    exists: true,
    roadmap,
    summary,
    completedTasks: summary?.completedTasks ?? 0,
    completedDays: summary?.completedDays ?? 0,
  };
}

/**
 * Raised when a roadmap already exists and the caller did not explicitly agree
 * to replace it. The wizard uses this to show a confirmation dialog rather than
 * silently destroying completed work.
 */
export class ExistingRoadmapError extends Error {
  readonly completedTasks: number;
  readonly completedDays: number;

  constructor(completedTasks: number, completedDays: number) {
    super(
      "A roadmap already exists. Confirm that you want to replace it before continuing."
    );
    this.name = "ExistingRoadmapError";
    this.completedTasks = completedTasks;
    this.completedDays = completedDays;
  }
}

export type BuildRoadmapOptions = {
  /** Wall-clock time used for ids/timestamps; omit in tests for determinism. */
  now?: Date;
  /**
   * Must be `true` to overwrite an existing plan. The UI only sets this after
   * the student confirms in the replacement dialog.
   */
  replaceExisting?: boolean;
};

export type BuildRoadmapResult = {
  profile: Profile;
  roadmap: Roadmap;
  destination: typeof ROADMAP_DESTINATION;
};

/**
 * The single build path used by the wizard:
 *
 * 1. validate the complete draft with `profileInputSchema`;
 * 2. refuse to overwrite an existing plan without explicit confirmation;
 * 3. save the profile through `useProfileStore`;
 * 4. generate through `useRoadmapStore.createRoadmap` (the Step 2 engine), which
 *    also initialises the progress log for the new roadmap.
 *
 * No roadmap or task logic is duplicated here.
 */
export function buildRoadmapFromDraft(
  draft: OnboardingDraft,
  options: BuildRoadmapOptions = {}
): BuildRoadmapResult {
  const input = toProfileInput(draft);
  const existing = getExistingRoadmapState();

  if (existing.roadmap && !options.replaceExisting) {
    throw new ExistingRoadmapError(
      existing.completedTasks,
      existing.completedDays
    );
  }

  const profile = useProfileStore.getState().saveProfile(input, options.now);
  const roadmap = useRoadmapStore
    .getState()
    .createRoadmap(profile, { now: options.now });

  return {
    profile,
    roadmap,
    destination: ROADMAP_DESTINATION,
  };
}
