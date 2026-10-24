import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { getProjectsForCareer } from "@/lib/data/projects";
import { buildAssistantContext } from "@/lib/ai/assistant";
import { profileInputSchema } from "@/lib/schemas/profile";
import {
  resetAllLocalData,
  useProfileStore,
  useProgressStore,
  useRoadmapStore,
} from "@/lib/store";
import { STORAGE_KEYS } from "@/lib/constants";

const FIXED_NOW = new Date("2026-01-05T09:00:00.000Z");
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

function installMemoryStorage(): MemoryStorage {
  const next = new MemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: next,
    configurable: true,
    writable: true,
  });
  return next;
}

beforeEach(() => {
  installMemoryStorage();
  resetAllLocalData();
});

describe("projects experience", () => {
  it("filters projects by target career", () => {
    const aiProjects = getProjectsForCareer("ai-engineer");
    assert.ok(aiProjects.length >= 1);
    assert.ok(aiProjects.every((p) => p.careerIds.includes("ai-engineer")));
  });

  it("includes required project metadata", () => {
    const projects = getProjectsForCareer("data-scientist");
    assert.ok(projects.length >= 1);
    const project = projects[0];
    assert.ok(project.title);
    assert.ok(project.summary);
    assert.ok(project.whyItMatters);
    assert.ok(Array.isArray(project.skills));
    assert.ok(Array.isArray(project.deliverables));
    assert.ok(["beginner", "intermediate", "advanced"].includes(project.level));
  });
});

describe("assistant context", () => {
  it("builds context without roadmap/profile safely", () => {
    const context = buildAssistantContext({ profile: null, roadmap: null, progress: null });
    assert.equal(context.roadmapId, null);
    assert.equal(context.todayPlan, null);
    assert.equal(context.nextIncomplete, null);
    assert.ok(Array.isArray(context.recommendedProjects));
  });

  it("grounds context in profile/roadmap/progress", () => {
    const profile = useProfileStore.getState().saveProfile(
      profileInputSchema.parse({
        name: "Test",
        education: { degree: "B.Tech", branch: "CS", year: 3 },
        targetCareerId: "ai-engineer",
        experienceLevel: "beginner",
        skills: [{ skillId: "python", level: 1 }],
        customSkills: [],
        dailyMinutes: 90,
        daysPerWeek: 5,
        startDate: START_DATE,
      }),
      FIXED_NOW
    );
    const roadmap = useRoadmapStore.getState().createRoadmap(profile, { now: FIXED_NOW });
    const progress = useProgressStore.getState().progress!;
    const context = buildAssistantContext({ profile, roadmap, progress });
    assert.equal(context.targetCareer, "ai-engineer");
    assert.equal(context.experienceLevel, "beginner");
    assert.equal(context.dailyMinutes, 90);
    assert.ok(context.roadmapId);
    assert.ok(context.todayPlan);
    assert.ok(context.overallProgress);
  });

  it("does not leak full localStorage into context", () => {
    const context = buildAssistantContext({});
    const serialized = JSON.stringify(context);
    assert.ok(!serialized.includes(STORAGE_KEYS.profile));
    assert.ok(!serialized.includes(STORAGE_KEYS.progress));
    assert.ok(!serialized.includes(STORAGE_KEYS.roadmap));
  });
});

describe("dashboard state", () => {
  it("derives progress from taskStatus only", () => {
    const profile = useProfileStore.getState().saveProfile(
      profileInputSchema.parse({
        name: "Test",
        education: { degree: "B.Tech", branch: "CS", year: 3 },
        targetCareerId: "data-scientist",
        experienceLevel: "beginner",
        skills: [{ skillId: "python", level: 1 }],
        customSkills: [],
        dailyMinutes: 60,
        daysPerWeek: 5,
        startDate: START_DATE,
      }),
      FIXED_NOW
    );
    const roadmap = useRoadmapStore.getState().createRoadmap(profile, { now: FIXED_NOW });
    useProgressStore.getState().markTaskComplete(roadmap.days[0].tasks[0].id, FIXED_NOW);
    const summary = useProgressStore.getState().progress;
    assert.ok(summary);
    // Progress is stored as taskStatus only
    assert.ok(summary.taskStatus);
  });
});
