import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { STORAGE_KEYS } from "@/lib/constants";
import { CAREERS, getCareer } from "@/lib/data/careers";
import { SKILLS } from "@/lib/data/skills";
import { scheduleStudyDates } from "@/lib/engine";
import {
  ONBOARDING_STEPS,
  ONBOARDING_STEP_IDS,
  ROADMAP_DESTINATION,
  ExistingRoadmapError,
  buildReviewData,
  buildRoadmapFromDraft,
  buildSchedule,
  createEmptyDraft,
  findFirstInvalidStep,
  getExistingRoadmapState,
  getNextStep,
  getPreviousStep,
  getSelectedSkillIds,
  getSkillLevel,
  getStepIndex,
  getStepNumber,
  getStepProgress,
  isOnboardingDraftValid,
  patchDraft,
  patchEducation,
  removeSkill,
  setSkillProficiency,
  setSkillSelected,
  toProfileInput,
  toggleSkill,
  validateStep,
  type OnboardingDraft,
  type OnboardingStepId,
} from "@/lib/onboarding";
import {
  rehydrateStores,
  resetAllLocalData,
  useProfileStore,
  useProgressStore,
  useRoadmapStore,
} from "@/lib/store";
import type { Proficiency } from "@/types";

const FIXED_NOW = new Date("2026-01-05T09:00:00.000Z");
const LATER = new Date("2026-01-08T12:00:00.000Z");
const START_DATE = "2026-01-05";

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

let storage: MemoryStorage;

function installMemoryStorage(): MemoryStorage {
  const next = new MemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: next,
    configurable: true,
    writable: true,
  });
  return next;
}

function captureSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const value = storage.getItem(key);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}

async function reloadFrom(
  snapshot: Record<string, string>
): Promise<void> {
  resetAllLocalData();
  storage = installMemoryStorage();
  for (const [key, value] of Object.entries(snapshot)) {
    storage.setItem(key, value);
  }
  await rehydrateStores();
}

/** A fully valid answer sheet; individual tests override one field at a time. */
function completeDraft(
  overrides: Partial<OnboardingDraft> = {}
): OnboardingDraft {
  return {
    name: "Asha Rao",
    education: {
      degree: "B.Tech",
      branch: "Computer Science",
      year: 3,
      college: "National Institute of Technology",
    },
    targetCareerId: "ai-engineer",
    skills: [
      { skillId: "python", level: 2 },
      { skillId: "git", level: 1 },
    ],
    experienceLevel: "beginner",
    dailyMinutes: 90,
    daysPerWeek: 5,
    startDate: START_DATE,
    ...overrides,
  };
}

beforeEach(() => {
  storage = installMemoryStorage();
  resetAllLocalData();
});

describe("initial onboarding state", () => {
  it("defines the ten steps in the required order", () => {
    assert.equal(ONBOARDING_STEPS.length, 10);
    assert.deepEqual(ONBOARDING_STEP_IDS, [
      "welcome",
      "career",
      "skills",
      "proficiency",
      "experience",
      "study-time",
      "study-days",
      "start-date",
      "review",
      "build",
    ]);
    assert.equal(getStepNumber("welcome"), 1);
    assert.equal(getStepNumber("build"), 10);
    assert.deepEqual(getStepProgress("review"), {
      current: 9,
      total: 10,
      percent: 90,
    });
  });

  it("starts empty except for supported study defaults", () => {
    const draft = createEmptyDraft();

    assert.equal(draft.name, "");
    assert.equal(draft.education.degree, "");
    assert.equal(draft.education.branch, "");
    assert.equal(draft.education.year, null);
    assert.equal(draft.targetCareerId, null);
    assert.deepEqual(draft.skills, []);
    assert.equal(draft.experienceLevel, null);
    assert.equal(draft.dailyMinutes, 90);
    assert.equal(draft.daysPerWeek, 5);
    assert.equal(draft.startDate, "");

    assert.equal(findFirstInvalidStep(draft), "welcome");
    assert.equal(isOnboardingDraftValid(draft), false);
    assert.throws(() => toProfileInput(draft));
  });
});

describe("step navigation", () => {
  it("walks forward and backward through every step", () => {
    const forward: OnboardingStepId[] = ["welcome"];
    let current: OnboardingStepId = "welcome";

    while (true) {
      const next = getNextStep(current);
      if (!next) break;
      forward.push(next);
      current = next;
    }
    assert.deepEqual(forward, ONBOARDING_STEP_IDS);
    assert.equal(getNextStep("build"), null);

    const backward: OnboardingStepId[] = ["build"];
    current = "build";
    while (true) {
      const previous = getPreviousStep(current);
      if (!previous) break;
      backward.push(previous);
      current = previous;
    }
    assert.deepEqual(backward, [...ONBOARDING_STEP_IDS].reverse());
    assert.equal(getPreviousStep("welcome"), null);
    assert.equal(getStepIndex("career"), 1);
  });

  it("preserves answers when an earlier field changes or the student goes back", () => {
    const original = completeDraft();
    const edited = patchEducation(original, { college: "" });
    const moved = patchDraft(edited, { dailyMinutes: 120 });

    assert.equal(moved.targetCareerId, "ai-engineer");
    assert.equal(moved.experienceLevel, "beginner");
    assert.equal(moved.startDate, START_DATE);
    assert.deepEqual(moved.skills, original.skills);
    assert.equal(moved.education.degree, "B.Tech");
    assert.equal(moved.education.college, "");
    assert.equal(moved.dailyMinutes, 120);

    // A student can still move backwards to an earlier step and find the
    // answers intact, because the draft is never reset by navigation.
    assert.equal(getPreviousStep("review"), "start-date");
    assert.equal(getNextStep("start-date"), "review");
  });
});

describe("required-field validation", () => {
  it("blocks each incomplete answer step with a field-level error", () => {
    const empty = createEmptyDraft();

    const welcome = validateStep("welcome", empty);
    assert.equal(welcome.valid, false);
    assert.ok(welcome.errors["education.degree"]);
    assert.ok(welcome.errors["education.branch"]);
    assert.ok(welcome.errors["education.year"]);

    const career = validateStep("career", empty);
    assert.equal(career.valid, false);
    assert.ok(career.errors.targetCareerId);

    assert.equal(validateStep("experience", empty).valid, false);
    assert.equal(validateStep("study-time", patchDraft(empty, { dailyMinutes: null })).valid, false);
    assert.equal(validateStep("study-days", patchDraft(empty, { daysPerWeek: null })).valid, false);
    assert.equal(validateStep("start-date", empty).valid, false);
    assert.equal(validateStep("review", empty).valid, false);
  });

  it("allows a beginner to continue with zero selected skills", () => {
    const draft = completeDraft({ skills: [] });
    assert.equal(validateStep("skills", draft).valid, true);
    assert.equal(validateStep("proficiency", draft).valid, true);
    assert.equal(validateStep("review", draft).valid, true);
    assert.equal(isOnboardingDraftValid(draft), true);
  });

  it("finds the earliest invalid step for the wizard to jump to", () => {
    const draft = completeDraft({ startDate: "", experienceLevel: null });
    assert.equal(findFirstInvalidStep(draft), "experience");

    assert.equal(
      findFirstInvalidStep(completeDraft({ targetCareerId: null })),
      "career"
    );
    assert.equal(findFirstInvalidStep(completeDraft()), null);
  });
});

describe("career selection", () => {
  it("accepts exactly one known career", () => {
    assert.equal(CAREERS.length, 8);
    assert.equal(SKILLS.length, 83);
    assert.ok(getCareer("ai-engineer"));

    assert.equal(
      validateStep("career", completeDraft({ targetCareerId: "ai-engineer" }))
        .valid,
      true
    );
    assert.equal(
      validateStep("career", completeDraft({ targetCareerId: "astronaut" }))
        .valid,
      false
    );
    assert.equal(
      validateStep("career", completeDraft({ targetCareerId: null })).valid,
      false
    );
  });
});

describe("skill and proficiency selection", () => {
  it("adds a skill at Basics, toggles it off and never duplicates it", () => {
    const draft = createEmptyDraft();

    const added = setSkillSelected(draft, "python", true);
    assert.deepEqual(added.skills, [{ skillId: "python", level: 1 }]);
    assert.equal(getSkillLevel(added, "python"), 1);
    assert.deepEqual(getSelectedSkillIds(added), ["python"]);

    const duplicate = setSkillSelected(added, "python", true);
    assert.equal(duplicate.skills.length, 1);

    const toggled = toggleSkill(added, "python");
    assert.deepEqual(toggled.skills, []);
    assert.equal(getSkillLevel(toggled, "python"), null);

    const readded = toggleSkill(toggled, "python");
    assert.equal(readded.skills.length, 1);
  });

  it("updates proficiency and validates the selected assessments", () => {
    const draft = setSkillProficiency(
      setSkillSelected(createEmptyDraft(), "python", true),
      "python",
      3
    );
    assert.equal(getSkillLevel(draft, "python"), 3);
    assert.equal(validateStep("proficiency", draft).valid, true);

    const removed = removeSkill(draft, "python");
    assert.deepEqual(removed.skills, []);

    const duplicate = completeDraft({
      skills: [
        { skillId: "python", level: 1 },
        { skillId: "python", level: 2 },
      ],
    });
    assert.equal(validateStep("proficiency", duplicate).valid, false);

    const unknown = completeDraft({
      skills: [{ skillId: "teleportation", level: 1 }],
    });
    assert.equal(validateStep("proficiency", unknown).valid, false);

    const invalidLevel = patchDraft(completeDraft(), {
      skills: [
        {
          skillId: "python",
          level: 9 as unknown as Proficiency,
        },
      ],
    });
    assert.equal(validateStep("proficiency", invalidLevel).valid, false);
  });
});

describe("study preference validation", () => {
  it("accepts only supported daily minutes and days per week", () => {
    assert.equal(
      validateStep("study-time", completeDraft({ dailyMinutes: 15 })).valid,
      true
    );
    assert.equal(
      validateStep("study-time", completeDraft({ dailyMinutes: 480 })).valid,
      true
    );
    assert.equal(
      validateStep("study-time", completeDraft({ dailyMinutes: 14 })).valid,
      false
    );
    assert.equal(
      validateStep("study-time", completeDraft({ dailyMinutes: 481 })).valid,
      false
    );
    assert.equal(
      validateStep("study-time", completeDraft({ dailyMinutes: 90.5 })).valid,
      false
    );

    for (const days of [1, 4, 7]) {
      assert.equal(
        validateStep("study-days", completeDraft({ daysPerWeek: days })).valid,
        true,
        String(days)
      );
    }
    for (const days of [0, 8, 2.5]) {
      assert.equal(
        validateStep("study-days", completeDraft({ daysPerWeek: days })).valid,
        false,
        String(days)
      );
    }
  });

  it("validates the start date and derives a 45-day schedule summary", () => {
    assert.equal(
      validateStep("start-date", completeDraft({ startDate: START_DATE })).valid,
      true
    );
    assert.equal(
      validateStep("start-date", completeDraft({ startDate: "2026-13-01" }))
        .valid,
      false
    );
    assert.equal(
      validateStep("start-date", completeDraft({ startDate: "05/01/2026" }))
        .valid,
      false
    );

    const schedule = buildSchedule(START_DATE, 5, 90);
    assert.equal(schedule.planDays, 45);
    assert.equal(schedule.dailyMinutes, 90);
    assert.equal(schedule.daysPerWeek, 5);
    assert.equal(schedule.totalMinutes, 4050);
    assert.equal(schedule.minutesPerWeek, 450);
    assert.equal(
      schedule.endDate,
      scheduleStudyDates(START_DATE, 5, 45).at(-1)
    );
  });
});

describe("review data", () => {
  it("summarises the profile, schedule and deterministic skill gap", () => {
    const draft = completeDraft();
    const review = buildReviewData(draft);

    assert.ok(review);
    assert.equal(review.career.id, "ai-engineer");
    assert.equal(review.career.title, "AI Engineer");
    assert.equal(review.profile.name, "Asha Rao");
    assert.equal(review.profile.education.degree, "B.Tech");
    assert.equal(review.experienceLevel, "beginner");
    assert.equal(review.experienceLabel, "Beginner");
    assert.equal(review.schedule.dailyMinutes, 90);
    assert.equal(review.schedule.daysPerWeek, 5);
    assert.equal(review.schedule.startDate, START_DATE);
    assert.equal(
      review.schedule.endDate,
      scheduleStudyDates(START_DATE, 5, 45).at(-1)
    );

    assert.equal(review.skills.length, 2);
    const python = review.skills.find((skill) => skill.skillId === "python");
    assert.ok(python);
    assert.equal(python.level, 2);
    assert.equal(python.levelLabel, "Working");
    assert.equal(python.categoryLabel, "Programming");

    assert.equal(review.gap.careerId, "ai-engineer");
    assert.equal(review.gap.totalRequiredSkills, 16);
    assert.ok(review.gap.gaps.length > 0);
    assert.equal(review.gap.strengths.length, 0);
    assert.ok(review.gap.readinessPercent >= 0);
    assert.ok(review.gap.readinessPercent <= 100);

    // The analysis is deterministic: same input, byte-identical output.
    assert.deepEqual(buildReviewData(draft), buildReviewData(draft));
  });

  it("returns null until the draft is valid", () => {
    assert.equal(buildReviewData(createEmptyDraft()), null);
    assert.equal(
      buildReviewData(completeDraft({ targetCareerId: null })),
      null
    );
  });
});

describe("roadmap generation and profile persistence", () => {
  it("saves the profile, generates a 45-day plan and initialises progress", () => {
    const result = buildRoadmapFromDraft(completeDraft(), { now: FIXED_NOW });

    assert.equal(result.destination, ROADMAP_DESTINATION);
    assert.equal(result.roadmap.days.length, 45);
    assert.equal(result.roadmap.phases.length, 9);
    assert.equal(result.roadmap.profileSnapshot.id, result.profile.id);
    assert.equal(result.profile.id, useProfileStore.getState().profile?.id);
    assert.equal(result.profile.targetCareerId, "ai-engineer");
    assert.equal(result.profile.dailyMinutes, 90);

    const storedRoadmap = useRoadmapStore.getState().roadmap;
    const progress = useProgressStore.getState().progress;
    assert.equal(storedRoadmap?.id, result.roadmap.id);
    assert.equal(progress?.roadmapId, result.roadmap.id);
    assert.deepEqual(progress?.taskStatus, {});
    assert.equal(getExistingRoadmapState().exists, true);
    assert.equal(getExistingRoadmapState().completedTasks, 0);
  });

  it("persists the saved profile and roadmap across a simulated refresh", async () => {
    const result = buildRoadmapFromDraft(completeDraft(), { now: FIXED_NOW });
    const snapshot = captureSnapshot();

    assert.ok(snapshot[STORAGE_KEYS.profile]);
    assert.ok(snapshot[STORAGE_KEYS.roadmap]);
    assert.ok(snapshot[STORAGE_KEYS.progress]);

    await reloadFrom(snapshot);

    const profile = useProfileStore.getState().profile;
    assert.equal(profile?.id, result.profile.id);
    assert.equal(profile?.name, "Asha Rao");
    assert.equal(profile?.targetCareerId, "ai-engineer");
    assert.equal(profile?.dailyMinutes, 90);

    assert.equal(useRoadmapStore.getState().roadmap?.id, result.roadmap.id);
    assert.equal(useProgressStore.getState().progress?.roadmapId, result.roadmap.id);
  });

  it("navigates to the roadmap route after a successful build", () => {
    const upstreamDraft = completeDraft({ targetCareerId: "data-analyst" });
    const result = buildRoadmapFromDraft(upstreamDraft, { now: FIXED_NOW });

    assert.equal(result.destination, "/roadmap");
    assert.equal(result.roadmap.title.length > 0, true);
    assert.equal(
      result.roadmap.profileSnapshot.targetCareerId,
      "data-analyst"
    );
  });
});

describe("existing roadmap protection", () => {
  it("refuses to replace a plan without explicit confirmation", () => {
    const first = buildRoadmapFromDraft(completeDraft(), { now: FIXED_NOW });
    const taskId = first.roadmap.days[0].tasks[0].id;
    useProgressStore.getState().markTaskComplete(taskId, FIXED_NOW);

    const existing = getExistingRoadmapState();
    assert.equal(existing.exists, true);
    assert.equal(existing.completedTasks, 1);

    assert.throws(
      () =>
        buildRoadmapFromDraft(
          completeDraft({ targetCareerId: "data-scientist" }),
          { now: LATER }
        ),
      (error: unknown) =>
        error instanceof ExistingRoadmapError &&
        error.completedTasks === 1 &&
        error.completedDays === 0
    );

    // Nothing was overwritten by the refused build.
    assert.equal(
      useRoadmapStore.getState().roadmap?.id,
      first.roadmap.id
    );
    assert.equal(
      useProgressStore.getState().progress?.taskStatus[taskId]?.done,
      true
    );
    assert.equal(
      useProfileStore.getState().profile?.targetCareerId,
      "ai-engineer"
    );
  });

  it("replaces the plan and resets progress only after confirmation", () => {
    const first = buildRoadmapFromDraft(completeDraft(), { now: FIXED_NOW });
    const completedTaskId = first.roadmap.days[0].tasks[0].id;
    useProgressStore.getState().markTaskComplete(completedTaskId, FIXED_NOW);

    const replacement = buildRoadmapFromDraft(
      completeDraft({
        targetCareerId: "data-scientist",
        dailyMinutes: 120,
        skills: [{ skillId: "python", level: 3 }],
      }),
      { now: LATER, replaceExisting: true }
    );

    assert.notEqual(replacement.roadmap.id, first.roadmap.id);
    assert.equal(
      replacement.roadmap.profileSnapshot.targetCareerId,
      "data-scientist"
    );
    assert.equal(replacement.profile.dailyMinutes, 120);
    assert.equal(useRoadmapStore.getState().roadmap?.id, replacement.roadmap.id);
    assert.equal(
      useProgressStore.getState().progress?.roadmapId,
      replacement.roadmap.id
    );
    assert.deepEqual(useProgressStore.getState().progress?.taskStatus, {});
  });

  it("still asks for confirmation when the existing plan has no completions", () => {
    buildRoadmapFromDraft(completeDraft(), { now: FIXED_NOW });

    assert.throws(
      () =>
        buildRoadmapFromDraft(completeDraft({ targetCareerId: "product-manager" }), {
          now: LATER,
        }),
      (error: unknown) =>
        error instanceof ExistingRoadmapError &&
        error.completedTasks === 0
    );
  });
});
