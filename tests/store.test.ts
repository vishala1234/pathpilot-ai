import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { STORAGE_KEYS } from "@/lib/constants";
import { scheduleStudyDates } from "@/lib/engine";
import { profileInputSchema } from "@/lib/schemas/profile";
import {
  getCompletedDayCount,
  getCompletedDays,
  getCompletedTaskCount,
  getCurrentStreak,
  getAllPhaseProgress,
  getPhaseProgressFor,
  getProgressSummary,
  getTodayPlan,
  rehydrateStores,
  resetAllLocalData,
  useProfileStore,
  useProgressStore,
  useRoadmapStore,
  useSettingsStore,
} from "@/lib/store";
import type { ProfileInput } from "@/types";

const FIXED_NOW = new Date("2026-01-05T09:00:00.000Z");
const LATER = new Date("2026-01-10T12:00:00.000Z");
const START_DATE = "2026-01-05";

/** Minimal in-memory `Storage` so the suite runs under Node. */
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

function removeMemoryStorage(): void {
  Reflect.deleteProperty(globalThis, "localStorage");
}

function profileInput(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return profileInputSchema.parse({
    name: "Asha Rao",
    education: {
      degree: "B.Tech",
      branch: "Computer Science",
      year: 3,
      college: "National Institute of Technology",
    },
    targetCareerId: "ai-engineer",
    experienceLevel: "beginner",
    skills: [
      { skillId: "python", level: 1 },
      { skillId: "git", level: 1 },
    ],
    customSkills: [],
    dailyMinutes: 90,
    daysPerWeek: 5,
    startDate: START_DATE,
    ...overrides,
  });
}

function saveProfile(overrides: Partial<ProfileInput> = {}) {
  return useProfileStore.getState().saveProfile(profileInput(overrides), FIXED_NOW);
}

function createPlan(overrides: Partial<ProfileInput> = {}) {
  const profile = saveProfile(overrides);
  const roadmap = useRoadmapStore
    .getState()
    .createRoadmap(undefined, { now: FIXED_NOW });
  return { profile, roadmap };
}

function completeTasks(taskIds: string[], now = FIXED_NOW): void {
  for (const taskId of taskIds) {
    useProgressStore.getState().markTaskComplete(taskId, now);
  }
}

function rawEntry(key: string): unknown {
  const raw = storage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}

function captureSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const value = storage.getItem(key);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}

/** Simulates a page refresh: fresh browser storage, state rebuilt from disk. */
async function reloadFrom(
  snapshot: Record<string, string>
): Promise<MemoryStorage> {
  resetAllLocalData();
  storage = installMemoryStorage();
  for (const [key, value] of Object.entries(snapshot)) {
    storage.setItem(key, value);
  }
  await rehydrateStores();
  return storage;
}

beforeEach(() => {
  storage = installMemoryStorage();
  resetAllLocalData();
});

describe("store initialization", () => {
  it("starts with safe defaults and no persisted data", () => {
    assert.equal(useProfileStore.getState().profile, null);
    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(useProgressStore.getState().progress, null);

    const settings = useSettingsStore.getState().settings;
    assert.equal(settings.theme, "system");
    assert.equal(settings.showOptionalTasks, true);
    assert.equal(settings.weekStartsOn, 1);

    assert.equal(useRoadmapStore.getState().roadmap?.version ?? null, null);
    assert.equal(getProgressSummary(null, null), null);
    assert.equal(getCompletedTaskCount(null, null), 0);
    assert.equal(getCompletedDays(null, null).length, 0);
    assert.equal(getTodayPlan(null, null), null);

    for (const key of Object.values(STORAGE_KEYS)) {
      assert.equal(storage.getItem(key), null, key);
    }
  });

  it("exposes typed actions for every required mutation", () => {
    const profileActions = useProfileStore.getState();
    const roadmapActions = useRoadmapStore.getState();
    const progressActions = useProgressStore.getState();

    assert.equal(typeof profileActions.saveProfile, "function");
    assert.equal(typeof profileActions.updateProfile, "function");
    assert.equal(typeof roadmapActions.createRoadmap, "function");
    assert.equal(typeof roadmapActions.setRoadmap, "function");
    assert.equal(typeof roadmapActions.updateDailyMinutes, "function");
    assert.equal(typeof roadmapActions.updateDaysPerWeek, "function");
    assert.equal(typeof roadmapActions.updateStartDate, "function");
    assert.equal(typeof roadmapActions.resetRoadmap, "function");
    assert.equal(typeof progressActions.markTaskComplete, "function");
    assert.equal(typeof progressActions.markTaskIncomplete, "function");
    assert.equal(typeof progressActions.toggleTask, "function");
  });
});

describe("profile persistence", () => {
  it("saves and rehydrates the profile after a refresh", async () => {
    const profile = saveProfile();

    assert.match(profile.id, /^profile-/);
    assert.equal(profile.targetCareerId, "ai-engineer");

    const entry = rawEntry(STORAGE_KEYS.profile) as {
      state: { profile: { id: string } };
      version: number;
    };
    assert.equal(entry.state.profile.id, profile.id);
    assert.equal(entry.version, 1);

    const snapshot = captureSnapshot();
    await reloadFrom(snapshot);

    const restored = useProfileStore.getState().profile;
    assert.equal(restored?.id, profile.id);
    assert.equal(restored?.name, "Asha Rao");
    assert.equal(restored?.dailyMinutes, 90);
  });

  it("keeps identity stable when a profile is updated", async () => {
    const profile = saveProfile();
    const updated = useProfileStore
      .getState()
      .updateProfile({ name: "Asha B", dailyMinutes: 120 }, LATER);

    assert.ok(updated);
    assert.equal(updated.id, profile.id);
    assert.equal(updated.createdAt, profile.createdAt);
    assert.equal(updated.updatedAt, LATER.toISOString());
    assert.equal(updated.dailyMinutes, 120);

    const snapshot = captureSnapshot();
    await reloadFrom(snapshot);
    assert.equal(useProfileStore.getState().profile?.name, "Asha B");
    assert.equal(useProfileStore.getState().profile?.dailyMinutes, 120);
  });

  it("clears the profile and its persisted entry", () => {
    saveProfile();
    useProfileStore.getState().clearProfile();

    assert.equal(useProfileStore.getState().profile, null);
    assert.equal(storage.getItem(STORAGE_KEYS.profile), null);
  });
});

describe("roadmap persistence", () => {
  it("creates, persists and rehydrates a 45-day roadmap", async () => {
    const { profile, roadmap } = createPlan();

    assert.equal(roadmap.days.length, 45);
    assert.equal(roadmap.version, 1);
    assert.equal(roadmap.profileSnapshot.id, profile.id);
    assert.equal(useProgressStore.getState().progress?.roadmapId, roadmap.id);

    const snapshot = captureSnapshot();
    assert.ok(snapshot[STORAGE_KEYS.roadmap]);
    assert.ok(snapshot[STORAGE_KEYS.progress]);

    await reloadFrom(snapshot);

    const restored = useRoadmapStore.getState().roadmap;
    assert.equal(restored?.id, roadmap.id);
    assert.equal(restored?.version, 1);
    assert.equal(restored?.days.length, 45);

    const progress = useProgressStore.getState().progress;
    assert.equal(progress?.roadmapId, roadmap.id);
    assert.deepEqual(progress?.taskStatus, {});
  });

  it("persists task completion across a refresh", async () => {
    const { roadmap } = createPlan();
    const taskId = roadmap.days[0].tasks[0].id;
    completeTasks([taskId]);

    const snapshot = captureSnapshot();
    await reloadFrom(snapshot);

    const restored = useRoadmapStore.getState().roadmap;
    const progress = useProgressStore.getState().progress;
    assert.ok(restored);
    assert.ok(progress);
    assert.equal(progress.taskStatus[taskId].done, true);
    assert.equal(getCompletedTaskCount(restored, progress), 1);
  });

  it("persists UI settings separately from study settings", async () => {
    useSettingsStore.getState().updateSettings({ theme: "dark", compactMode: true });

    const snapshot = captureSnapshot();
    await reloadFrom(snapshot);

    assert.equal(useSettingsStore.getState().settings.theme, "dark");
    assert.equal(useSettingsStore.getState().settings.compactMode, true);
    assert.equal(storage.getItem(STORAGE_KEYS.settings) !== null, true);
  });
});

describe("task completion", () => {
  it("marks tasks complete and incomplete without storing derived values", () => {
    const { roadmap } = createPlan();
    const day = roadmap.days[0];
    const taskId = day.tasks[0].id;

    useProgressStore.getState().markTaskComplete(taskId, FIXED_NOW);
    let progress = useProgressStore.getState().progress;
    assert.ok(progress);
    assert.equal(progress.taskStatus[taskId].done, true);
    assert.equal(
      progress.taskStatus[taskId].completedAt,
      FIXED_NOW.toISOString()
    );
    assert.equal(progress.activeDates[0], "2026-01-05");

    const entry = rawEntry(STORAGE_KEYS.progress) as {
      state: { progress: Record<string, unknown> };
    };
    assert.deepEqual(Object.keys(entry.state.progress).sort(), [
      "activeDates",
      "dayOverrides",
      "replanHistory",
      "roadmapId",
      "taskStatus",
      "updatedAt",
    ]);
    assert.equal("taskPercent" in entry.state.progress, false);
    assert.equal("completedDays" in entry.state.progress, false);
    assert.equal("currentStreak" in entry.state.progress, false);

    const dayProgress = getProgressSummary(
      roadmap,
      useProgressStore.getState().progress
    );
    assert.equal(dayProgress?.completedTasks, 1);
    assert.equal(dayProgress?.completedDays, 0);

    useProgressStore.getState().markTaskIncomplete(taskId, LATER);
    progress = useProgressStore.getState().progress;
    assert.ok(progress);
    assert.equal(progress.taskStatus[taskId].done, false);
    assert.equal(progress.taskStatus[taskId].completedAt, null);
    assert.equal(
      getCompletedTaskCount(roadmap, useProgressStore.getState().progress),
      0
    );
  });

  it("toggles a task and handles unknown tasks safely", () => {
    const { roadmap } = createPlan();
    const taskId = roadmap.days[0].tasks[0].id;

    useProgressStore.getState().toggleTask(taskId, FIXED_NOW);
    assert.equal(
      useProgressStore.getState().progress?.taskStatus[taskId].done,
      true
    );

    useProgressStore.getState().toggleTask(taskId, FIXED_NOW);
    assert.equal(
      useProgressStore.getState().progress?.taskStatus[taskId].done,
      false
    );

    assert.throws(
      () => useProgressStore.getState().markTaskComplete("d999-t1", FIXED_NOW),
      /does not exist/
    );
  });

  it("refuses completion before a roadmap is loaded", () => {
    assert.throws(
      () => useProgressStore.getState().markTaskComplete("d001-t1", FIXED_NOW),
      /No roadmap is loaded/
    );
  });
});

describe("derived progress", () => {
  it("recomputes day, phase, overall and streak values from taskStatus", () => {
    const { roadmap } = createPlan();
    const firstDay = roadmap.days[0];
    const secondDay = roadmap.days[1];

    completeTasks(
      firstDay.tasks.map((task) => task.id),
      new Date("2026-01-05T09:00:00.000Z")
    );
    completeTasks(
      secondDay.tasks.map((task) => task.id),
      new Date("2026-01-06T09:00:00.000Z")
    );

    const progress = useProgressStore.getState().progress;
    assert.ok(progress);

    const completedTaskTotal = firstDay.tasks.length + secondDay.tasks.length;
    const summary = getProgressSummary(roadmap, progress);
    assert.ok(summary);
    assert.equal(summary.completedTasks, completedTaskTotal);
    assert.equal(summary.completedDays, 2);
    assert.equal(summary.totalDays, 45);
    assert.equal(summary.currentStreak, 2);
    assert.equal(summary.longestStreak, 2);
    assert.equal(
      summary.taskPercent,
      Math.round((completedTaskTotal / summary.totalTasks) * 1000) / 10
    );
    assert.equal(summary.completedMinutes, firstDay.estimatedMinutes + secondDay.estimatedMinutes);

    assert.equal(getCompletedTaskCount(roadmap, progress), completedTaskTotal);
    assert.equal(getCompletedDayCount(roadmap, progress), 2);
    assert.equal(getCurrentStreak(roadmap, progress), 2);

    const completedDays = getCompletedDays(roadmap, progress);
    assert.deepEqual(
      completedDays.map((day) => day.id),
      [firstDay.id, secondDay.id]
    );

    const phaseProgress = getPhaseProgressFor(roadmap, progress, firstDay.phaseId);
    assert.ok(phaseProgress);
    assert.equal(phaseProgress.completedDays, 2);
    assert.equal(phaseProgress.totalDays, 5);
    assert.equal(
      phaseProgress.completedTasks,
      completedTaskTotal
    );

    const allPhases = getAllPhaseProgress(roadmap, progress);
    assert.equal(allPhases.length, 9);
    assert.equal(allPhases[0].phaseId, firstDay.phaseId);
    assert.equal(allPhases[0].completedDays, 2);
  });

  it("resolves today's plan and falls back to the next incomplete day", () => {
    const { roadmap } = createPlan();
    const progress = useProgressStore.getState().progress;
    assert.ok(progress);

    const scheduled = getTodayPlan(roadmap, progress, new Date("2026-01-07T08:00:00"));
    assert.ok(scheduled);
    assert.equal(scheduled.day.id, "d003");
    assert.equal(scheduled.scheduledToday, true);
    assert.equal(scheduled.progress.complete, false);

    // Saturday is not a study day, so continue with the next unfinished day.
    const restDay = getTodayPlan(roadmap, progress, new Date("2026-01-10T08:00:00"));
    assert.ok(restDay);
    assert.equal(restDay.day.id, "d001");
    assert.equal(restDay.scheduledToday, false);

    completeTasks(roadmap.days[0].tasks.map((task) => task.id));
    const next = getTodayPlan(
      roadmap,
      useProgressStore.getState().progress,
      new Date("2026-01-10T08:00:00")
    );
    assert.equal(next?.day.id, "d002");
  });

  it("updates every derived number immediately after a task action", () => {
    const { roadmap } = createPlan();
    const task = roadmap.days[0].tasks[0];
    const before = getProgressSummary(
      roadmap,
      useProgressStore.getState().progress
    );

    useProgressStore.getState().markTaskComplete(task.id, FIXED_NOW);
    const after = getProgressSummary(
      roadmap,
      useProgressStore.getState().progress
    );

    assert.equal(before?.completedTasks, 0);
    assert.equal(after?.completedTasks, 1);
    assert.ok((after?.taskPercent ?? 0) > 0);
    assert.equal(after?.completedMinutes, task.minutes);
  });
});

describe("study setting updates", () => {
  it("rebalances unfinished days while protecting completed work", async () => {
    const { roadmap } = createPlan();
    const protectedDay = roadmap.days[0];
    completeTasks(protectedDay.tasks.map((task) => task.id));

    useRoadmapStore.getState().updateDailyMinutes(45, LATER);

    const updated = useRoadmapStore.getState().roadmap;
    assert.ok(updated);
    assert.equal(updated.version, 2);
    assert.equal(updated.dailyMinutes, 45);
    assert.equal(updated.profileSnapshot.dailyMinutes, 45);
    assert.deepEqual(updated.days[0], protectedDay);
    assert.equal(useProfileStore.getState().profile?.dailyMinutes, 45);

    for (const day of updated.days.slice(1)) {
      const total = day.tasks.reduce((sum, task) => sum + task.minutes, 0);
      assert.equal(day.estimatedMinutes, total);
      assert.ok(total <= 45, `${day.id} uses ${total} minutes`);
    }

    const progress = useProgressStore.getState().progress;
    assert.ok(progress);
    for (const task of protectedDay.tasks) {
      assert.equal(progress.taskStatus[task.id]?.done, true);
    }
    assert.equal(progress.replanHistory.length, 1);
    assert.equal(progress.replanHistory[0].reason, "profile-change");
    assert.equal(progress.replanHistory[0].toVersion, 2);

    // The update survives a refresh together with the protected completions.
    const snapshot = captureSnapshot();
    await reloadFrom(snapshot);

    const restored = useRoadmapStore.getState().roadmap;
    assert.equal(restored?.version, 2);
    assert.equal(useProfileStore.getState().profile?.dailyMinutes, 45);
    assert.equal(
      useProgressStore.getState().progress?.taskStatus[protectedDay.tasks[0].id]
        ?.done,
      true
    );
  });

  it("moves calendar dates without touching tasks when study days change", () => {
    const { roadmap } = createPlan();
    const firstDay = roadmap.days[0];
    completeTasks([firstDay.tasks[0].id]);

    useRoadmapStore.getState().updateDaysPerWeek(7, LATER);

    const updated = useRoadmapStore.getState().roadmap;
    assert.ok(updated);
    assert.equal(updated.version, 2);
    assert.equal(updated.profileSnapshot.daysPerWeek, 7);
    assert.equal(useProfileStore.getState().profile?.daysPerWeek, 7);
    assert.deepEqual(
      updated.days.map((day) => day.plannedDate),
      scheduleStudyDates(START_DATE, 7, 45)
    );
    assert.deepEqual(updated.days[0], firstDay);
    assert.equal(
      useProgressStore.getState().progress?.taskStatus[firstDay.tasks[0].id]
        ?.done,
      true
    );
  });

  it("moves the whole plan when the start date changes", () => {
    const { roadmap } = createPlan();
    const firstDay = roadmap.days[0];
    completeTasks([firstDay.tasks[0].id]);

    useRoadmapStore.getState().updateStartDate("2026-02-01", LATER);

    const updated = useRoadmapStore.getState().roadmap;
    assert.ok(updated);
    assert.equal(updated.version, 2);
    assert.equal(updated.startDate, "2026-02-01");
    assert.equal(updated.profileSnapshot.startDate, "2026-02-01");
    assert.equal(useProfileStore.getState().profile?.startDate, "2026-02-01");
    assert.equal(updated.days[0].plannedDate, "2026-02-01");
    assert.deepEqual(
      updated.days.map((day) => day.plannedDate),
      scheduleStudyDates("2026-02-01", 5, 45)
    );
    assert.deepEqual(updated.days[0].tasks, firstDay.tasks);
  });

  it("updates study settings before a roadmap exists", () => {
    saveProfile();

    useRoadmapStore.getState().updateDailyMinutes(60, LATER);
    useRoadmapStore.getState().updateDaysPerWeek(6, LATER);
    useRoadmapStore.getState().updateStartDate("2026-02-01", LATER);

    const profile = useProfileStore.getState().profile;
    assert.equal(profile?.dailyMinutes, 60);
    assert.equal(profile?.daysPerWeek, 6);
    assert.equal(profile?.startDate, "2026-02-01");
    assert.equal(useRoadmapStore.getState().roadmap, null);
  });

  it("rejects invalid study settings", () => {
    createPlan();

    assert.throws(
      () => useRoadmapStore.getState().updateDailyMinutes(5),
      /dailyMinutes must be/
    );
    assert.throws(
      () => useRoadmapStore.getState().updateDaysPerWeek(0),
      /daysPerWeek must be/
    );
    assert.throws(
      () => useRoadmapStore.getState().updateStartDate("2026-13-01"),
      /Invalid/i
    );

    assert.equal(useRoadmapStore.getState().roadmap?.version, 1);
  });
});

describe("reset behavior", () => {
  it("resetRoadmap clears the plan but keeps the student profile", () => {
    const { profile } = createPlan();
    const taskId = useRoadmapStore.getState().roadmap?.days[0].tasks[0].id;
    assert.ok(taskId);
    completeTasks([taskId]);

    useRoadmapStore.getState().resetRoadmap();

    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(useProgressStore.getState().progress, null);
    assert.equal(useProfileStore.getState().profile?.id, profile.id);
    assert.equal(storage.getItem(STORAGE_KEYS.roadmap), null);
    assert.equal(storage.getItem(STORAGE_KEYS.progress), null);
  });

  it("resetAllLocalData clears every store and persisted key", () => {
    createPlan();
    const taskId = useRoadmapStore.getState().roadmap?.days[0].tasks[0].id;
    assert.ok(taskId);
    completeTasks([taskId]);
    useSettingsStore.getState().updateSettings({ theme: "dark" });

    resetAllLocalData();

    assert.equal(useProfileStore.getState().profile, null);
    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(useProgressStore.getState().progress, null);
    assert.equal(useSettingsStore.getState().settings.theme, "system");

    for (const key of Object.values(STORAGE_KEYS)) {
      assert.equal(storage.getItem(key), null, key);
    }
  });
});

describe("localStorage hydration safety", () => {
  it("does not throw when localStorage is unavailable", async () => {
    resetAllLocalData();
    removeMemoryStorage();

    await assert.doesNotReject(() => rehydrateStores());

    assert.equal(useProfileStore.getState().profile, null);
    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(useProgressStore.getState().progress, null);
    assert.equal(useSettingsStore.getState().settings.theme, "system");
  });

  it("ignores corrupt or invalid persisted data", async () => {
    storage.setItem(STORAGE_KEYS.profile, "{not valid json");
    storage.setItem(
      STORAGE_KEYS.roadmap,
      JSON.stringify({ version: 1, state: { roadmap: { id: "broken" } } })
    );
    storage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({ version: 1, state: { progress: { nope: true } } })
    );

    await assert.doesNotReject(() => rehydrateStores());

    assert.equal(useProfileStore.getState().profile, null);
    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(useProgressStore.getState().progress, null);
  });

  it("keeps defaults until hydration is explicitly requested", async () => {
    const profile = saveProfile();
    const snapshot = captureSnapshot();

    // Wipe state + storage, then put the saved data back on "disk" without
    // hydrating. This is the same state a fresh page render starts from.
    resetAllLocalData();
    for (const [key, value] of Object.entries(snapshot)) {
      storage.setItem(key, value);
    }

    assert.equal(useProfileStore.getState().profile, null);

    await rehydrateStores();

    assert.equal(useProfileStore.getState().profile?.id, profile.id);
  });

  it("discards persisted progress when the roadmap is missing", async () => {
    createPlan();
    const taskId = useRoadmapStore.getState().roadmap?.days[0].tasks[0].id;
    assert.ok(taskId);
    completeTasks([taskId]);

    const snapshot = captureSnapshot();
    delete snapshot[STORAGE_KEYS.roadmap];

    await reloadFrom(snapshot);

    assert.equal(useRoadmapStore.getState().roadmap, null);
    assert.equal(useProgressStore.getState().progress, null);
  });

  it("starts an empty progress log when only a roadmap is persisted", async () => {
    const { roadmap } = createPlan();
    const snapshot = captureSnapshot();
    delete snapshot[STORAGE_KEYS.progress];

    await reloadFrom(snapshot);

    assert.equal(useRoadmapStore.getState().roadmap?.id, roadmap.id);
    assert.equal(
      useProgressStore.getState().progress?.roadmapId,
      roadmap.id
    );
    assert.deepEqual(useProgressStore.getState().progress?.taskStatus, {});
  });
});
