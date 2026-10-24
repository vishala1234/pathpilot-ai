import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { STORAGE_KEYS } from "@/lib/constants";
import { getNextIncompleteDay } from "@/lib/engine";
import {
  buildRoadmapView,
  formatMinutes,
  type RoadmapView,
} from "@/lib/roadmap/view";
import { profileInputSchema } from "@/lib/schemas/profile";
import {
  areStoresHydrated,
  getRoadmapVersion,
  getTodayPlan,
  rehydrateStores,
  resetAllLocalData,
  useProfileStore,
  useProgressStore,
  useRoadmapStore,
} from "@/lib/store";
import type { Day, ProgressState, Roadmap } from "@/types";

const FIXED_NOW = new Date("2026-01-05T09:00:00.000Z");
const LATER = new Date("2026-01-05T18:00:00.000Z");
const START_DATE = "2026-01-05";
/** Saturday: with Mon–Fri study days there is no scheduled plan day. */
const REST_DAY = new Date("2026-01-10T10:00:00.000Z");

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

async function reloadFrom(snapshot: Record<string, string>): Promise<void> {
  resetAllLocalData();
  storage = installMemoryStorage();
  for (const [key, value] of Object.entries(snapshot)) {
    storage.setItem(key, value);
  }
  await rehydrateStores();
}

function createPlan(
  experienceLevel: "beginner" | "intermediate" | "advanced" = "beginner"
): {
  roadmap: Roadmap;
  progress: ProgressState;
} {
  const profile = useProfileStore.getState().saveProfile(
    profileInputSchema.parse({
      name: "Asha Rao",
      education: {
        degree: "B.Tech",
        branch: "Computer Science",
        year: 3,
      },
      targetCareerId: "ai-engineer",
      experienceLevel,
      skills: [
        { skillId: "python", level: 1 },
        { skillId: "git", level: 1 },
      ],
      customSkills: [],
      dailyMinutes: 90,
      daysPerWeek: 5,
      startDate: START_DATE,
    }),
    FIXED_NOW
  );

  const roadmap = useRoadmapStore
    .getState()
    .createRoadmap(profile, { now: FIXED_NOW });
  const progress = useProgressStore.getState().progress;
  assert.ok(progress);

  return { roadmap, progress };
}

function currentView(
  today: Date = FIXED_NOW,
  selectedDayId?: string | null
): RoadmapView {
  const roadmap = useRoadmapStore.getState().roadmap;
  const progress = useProgressStore.getState().progress;

  const view = buildRoadmapView(roadmap, progress, {
    todayPlan: getTodayPlan(roadmap, progress, today),
    ...(selectedDayId !== undefined ? { selectedDayId } : {}),
  });
  assert.ok(view, "expected a roadmap view");
  return view;
}

function completeTasks(taskIds: string[], now: Date = LATER): void {
  for (const taskId of taskIds) {
    useProgressStore.getState().markTaskComplete(taskId, now);
  }
}

function completeDay(day: Day, now: Date = LATER): void {
  completeTasks(day.tasks.map((task) => task.id), now);
}

beforeEach(() => {
  storage = installMemoryStorage();
  resetAllLocalData();
});

describe("hydration-safe roadmap rendering", () => {
  it("renders nothing until a matching roadmap and progress log are hydrated", () => {
    // Server render / first client render: stores are still at their defaults.
    assert.equal(areStoresHydrated(), false);
    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(buildRoadmapView(null, null), null);

    const { roadmap, progress } = createPlan();
    assert.equal(buildRoadmapView(roadmap, null), null);
    assert.equal(
      buildRoadmapView(roadmap, { ...progress, roadmapId: "another-roadmap" }),
      null
    );

    useProgressStore.getState().resetProgress();
    assert.equal(currentViewOrNull(), null);
  });
});

function currentViewOrNull(): RoadmapView | null {
  return buildRoadmapView(
    useRoadmapStore.getState().roadmap,
    useProgressStore.getState().progress,
    { today: FIXED_NOW }
  );
}

describe("roadmap overview data", () => {
  it("exposes 9 ordered phases, 45 days and five days per phase", () => {
    createPlan();
    const view = currentView();

    assert.equal(view.phases.length, 9);
    assert.equal(view.days.length, 45);
    assert.deepEqual(
      view.phases.map((entry) => entry.number),
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );
    assert.deepEqual(
      view.phases.map((entry) => entry.phase.order),
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );
    assert.deepEqual(
      view.days.map((entry) => entry.day.index),
      Array.from({ length: 45 }, (_, index) => index + 1)
    );

    for (const phase of view.phases) {
      assert.equal(phase.days.length, 5);
      assert.equal(phase.progress.totalDays, 5);
      assert.equal(phase.progress.totalTasks, phase.days.reduce((sum, day) => sum + day.progress.totalTasks, 0));
      assert.equal(phase.progress.completedDays, 0);
    }

    assert.deepEqual(
      view.phases.map((entry) => entry.status),
      ["current", "upcoming", "upcoming", "upcoming", "upcoming", "upcoming", "upcoming", "upcoming", "upcoming"]
    );
    assert.equal(view.currentPhaseId, view.phases[0].phase.id);
    assert.equal(view.summary.totalDays, 45);
    assert.equal(view.summary.completedTasks, 0);
    assert.equal(view.summary.completedDays, 0);
    assert.equal(view.summary.taskPercent, 0);
    assert.equal(view.roadmap.version, 1);
    assert.equal(getRoadmapVersion(view.roadmap), 1);
  });

  it("displays unchanged roadmap data instead of regenerating it", () => {
    const { roadmap } = createPlan();
    const view = currentView();

    assert.equal(view.roadmap.id, roadmap.id);
    assert.deepEqual(
      view.days.map((entry) => entry.day.id),
      roadmap.days.map((day) => day.id)
    );
    assert.deepEqual(
      view.days.map((entry) => entry.day.topic),
      roadmap.days.map((day) => day.topic)
    );
    assert.deepEqual(
      view.days.map((entry) => entry.day.plannedDate),
      roadmap.days.map((day) => day.plannedDate)
    );
    for (const entry of view.days) {
      assert.equal(entry.progress.totalMinutes, entry.day.tasks.reduce((sum, task) => sum + task.minutes, 0));
      assert.equal(entry.progress.totalTasks, entry.day.tasks.length);
    }
  });
});

describe("task completion and derived progress", () => {
  it("updates day, phase and overall progress from one task check", () => {
    const { roadmap } = createPlan();
    const day = roadmap.days[0];
    const task = day.tasks[0];

    useProgressStore.getState().toggleTask(task.id, LATER);
    const view = currentView();
    const dayView = view.days[0];
    const phaseView = view.phases[0];

    assert.equal(view.summary.completedTasks, 1);
    assert.equal(
      view.summary.taskPercent,
      Math.round((1 / view.summary.totalTasks) * 1000) / 10
    );
    assert.equal(view.summary.completedMinutes, task.minutes);
    assert.equal(dayView.progress.completedTasks, 1);
    assert.equal(dayView.status, "in-progress");
    assert.equal(dayView.progress.complete, false);
    assert.equal(phaseView.progress.completedTasks, 1);
    assert.equal(phaseView.progress.completedDays, 0);
    assert.equal(phaseView.status, "current");
    assert.equal(view.summary.completedDays, 0);

    useProgressStore.getState().toggleTask(task.id, LATER);
    const reverted = currentView();
    assert.equal(reverted.summary.completedTasks, 0);
    assert.equal(reverted.summary.completedMinutes, 0);
    assert.equal(reverted.days[0].status, "upcoming");
    assert.equal(reverted.days[0].progress.completedTasks, 0);
  });

  it("marks the day complete once every task is done, not before", () => {
    const { roadmap } = createPlan();
    const day = roadmap.days[0];

    completeTasks(day.tasks.slice(0, -1).map((task) => task.id));
    const partial = currentView();
    assert.equal(partial.days[0].progress.complete, false);
    assert.equal(partial.days[0].status, "in-progress");
    assert.equal(partial.summary.completedDays, 0);
    assert.equal(partial.phases[0].progress.completedDays, 0);

    completeTasks([day.tasks.at(-1)!.id]);
    const complete = currentView();
    assert.equal(complete.days[0].progress.complete, true);
    assert.equal(complete.days[0].progress.percent, 100);
    assert.equal(complete.days[0].status, "completed");
    assert.equal(complete.summary.completedDays, 1);
    assert.equal(complete.phases[0].progress.completedDays, 1);
    assert.equal(complete.summary.currentStreak, 1);
    assert.equal(complete.summary.longestStreak, 1);
  });

  it("completes a phase only after all five days and updates the next current phase", () => {
    const { roadmap } = createPlan();
    const firstPhase = roadmap.phases[0];
    const firstPhaseDays = firstPhase.dayIds.map(
      (dayId) => roadmap.days.find((day) => day.id === dayId)!
    );

    for (const day of firstPhaseDays) completeDay(day);

    const view = currentView();
    assert.equal(view.phases[0].progress.completedDays, 5);
    assert.equal(view.phases[0].progress.complete, true);
    assert.equal(view.phases[0].status, "completed");
    assert.equal(view.phases[1].status, "current");
    assert.equal(view.currentPhaseId, view.phases[1].phase.id);
    assert.equal(view.summary.completedDays, 5);
    assert.equal(
      view.summary.completedTasks,
      view.phases[0].progress.completedTasks
    );
    assert.equal(view.summary.taskPercent > 0, true);

    // Continued work only touches the phases the student actually checked.
    const nextDay = firstPhaseDays[0];
    useProgressStore.getState().toggleTask(nextDay.tasks[0].id, LATER);
    const reopened = currentView();
    assert.equal(reopened.phases[0].status, "current");
    assert.equal(reopened.phases[1].status, "upcoming");
    assert.equal(reopened.summary.completedDays, 4);
  });

  it("counts optional tasks in day completion and percentage", () => {
    const { roadmap } = createPlan("intermediate");
    const dayWithOptional = roadmap.days.find((day) =>
      day.tasks.some((task) => task.optional)
    );
    assert.ok(dayWithOptional, "intermediate plans include optional tasks");

    const required = dayWithOptional.tasks.filter((task) => !task.optional);
    const optional = dayWithOptional.tasks.filter((task) => task.optional);
    completeTasks(required.map((task) => task.id));

    const before = currentView();
    const dayView = before.days.find(
      (entry) => entry.day.id === dayWithOptional.id
    );
    assert.ok(dayView);
    assert.equal(dayView.progress.complete, false);

    completeTasks(optional.map((task) => task.id));
    const after = currentView();
    const completedDay = after.days.find(
      (entry) => entry.day.id === dayWithOptional.id
    );
    assert.ok(completedDay);
    assert.equal(completedDay.progress.complete, true);
  });
});

describe("today's plan and day selection", () => {
  it("uses the scheduled day when today is a study day", () => {
    const { roadmap } = createPlan();
    const today = currentView().today;

    assert.ok(today);
    assert.equal(today.scheduledToday, true);
    assert.equal(today.day.id, roadmap.days[0].id);
    assert.equal(today.progress.percent, 0);

    const todayView = currentView().days[0];
    assert.equal(todayView.isToday, true);
    assert.equal(todayView.isNext, true);
  });

  it("falls back to the next scheduled incomplete day on a rest day", () => {
    const { roadmap } = createPlan();
    for (const day of roadmap.days.slice(0, 5)) completeDay(day);

    const view = currentView(REST_DAY);
    assert.ok(view.today);
    assert.equal(view.today.scheduledToday, false);
    assert.equal(view.today.day.index, 6);
    assert.equal(view.today.day.plannedDate, roadmap.days[5].plannedDate);
    assert.equal(
      getNextIncompleteDay(view.roadmap, {
        ...useProgressStore.getState().progress!,
      })?.id,
      roadmap.days[5].id
    );

    const todayView = view.days.find(
      (entry) => entry.day.id === view.today?.day.id
    );
    assert.equal(todayView?.isToday, true);
    assert.equal(todayView?.isNext, true);
  });

  it("keeps a completed scheduled day as today's plan", () => {
    const { roadmap } = createPlan();
    completeDay(roadmap.days[0]);

    const view = currentView();
    assert.equal(view.today?.scheduledToday, true);
    assert.equal(view.today?.day.id, roadmap.days[0].id);
    assert.equal(view.today?.progress.complete, true);
    assert.equal(view.selectedDay.day.id, roadmap.days[0].id);
  });

  it("defaults to today but preserves an explicitly selected day", () => {
    const { roadmap } = createPlan();

    const defaults = currentView();
    assert.equal(defaults.selectedDay.day.index, 1);

    const selected = currentView(FIXED_NOW, roadmap.days[6].id);
    assert.equal(selected.selectedDay.day.index, 7);
    assert.equal(selected.selectedDay.day.id, roadmap.days[6].id);
    assert.equal(selected.selectedDay.phase.id, roadmap.days[6].phaseId);
    assert.equal(selected.today?.day.index, 1);
  });

  it("shows the scheduled day as today's plan even when complete, with no next incomplete day", () => {
    const { roadmap } = createPlan();
    for (const day of roadmap.days) completeDay(day);

    const view = currentView();
    assert.ok(view.today);
    assert.equal(view.today.scheduledToday, true);
    assert.equal(view.today.progress.complete, true);
    assert.equal(view.nextIncompleteDayId, null);
    assert.equal(view.summary.completedDays, 45);
    assert.equal(view.summary.completedTasks, view.summary.totalTasks);
    assert.equal(view.summary.taskPercent, 100);
    assert.equal(view.summary.currentStreak, 1);
  });
});

describe("persisted task completion", () => {
  it("restores checked tasks and derived progress after a refresh", async () => {
    const { roadmap } = createPlan();
    const day = roadmap.days[0];
    completeTasks(day.tasks.map((task) => task.id));
    useProgressStore.getState().toggleTask(roadmap.days[1].tasks[0].id, LATER);

    const before = currentView();
    const completedTaskIds = Object.values(
      useProgressStore.getState().progress?.taskStatus ?? {}
    )
      .filter((entry) => entry.done)
      .map((entry) => entry.taskId);
    assert.equal(before.summary.completedDays, 1);

    const snapshot = captureSnapshot();
    assert.ok(snapshot[STORAGE_KEYS.roadmap]);
    assert.ok(snapshot[STORAGE_KEYS.progress]);

    await reloadFrom(snapshot);

    const after = currentView();
    assert.equal(after.roadmap.id, roadmap.id);
    assert.equal(after.summary.completedTasks, completedTaskIds.length);
    assert.equal(after.summary.completedDays, 1);
    assert.equal(after.days[0].progress.complete, true);
    assert.equal(after.days[0].status, "completed");
    assert.equal(after.days[1].progress.completedTasks, 1);
    assert.equal(after.days[1].status, "in-progress");

    for (const taskId of completedTaskIds) {
      assert.equal(
        useProgressStore.getState().progress?.taskStatus[taskId]?.done,
        true
      );
    }
  });
});

describe("formatting helpers", () => {
  it("formats minutes without inventing precision", () => {
    assert.equal(formatMinutes(0), "0m");
    assert.equal(formatMinutes(45), "45m");
    assert.equal(formatMinutes(60), "1h");
    assert.equal(formatMinutes(90), "1h 30m");
  });
});
