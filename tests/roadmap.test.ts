import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DAYS_PER_PHASE, PHASES_PER_CAREER, ROADMAP_LENGTH_DAYS } from "@/lib/constants";
import { getCareer } from "@/lib/data/careers";
import { SKILLS_BY_ID } from "@/lib/data/skills";
import {
  calculateProgress,
  createProgressState,
  generateRoadmap,
  getDayProgress,
  getNextIncompleteDay,
  getPhaseProgress,
  isDayComplete,
  rebalanceRoadmap,
  scheduleStudyDates,
  setTaskCompletion,
} from "@/lib/engine";
import { profileInputSchema } from "@/lib/schemas/profile";
import { roadmapSchema } from "@/lib/schemas/roadmap";
import type { ProfileInput, Roadmap } from "@/types";

const START_DATE = "2026-01-05";
const NOW = new Date("2026-01-05T09:00:00.000Z");

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

function generate(overrides: Partial<ProfileInput> = {}): Roadmap {
  return generateRoadmap(profileInput(overrides));
}

function completeTasks(
  roadmap: Roadmap,
  taskIds: string[],
  now = NOW
): ReturnType<typeof createProgressState> {
  let progress = createProgressState(roadmap.id, now);
  for (const taskId of taskIds) {
    progress = setTaskCompletion(roadmap, progress, taskId, true, now);
  }
  return progress;
}

describe("generateRoadmap — plan shape", () => {
  it("generates exactly 45 days", () => {
    const roadmap = generate();

    assert.equal(roadmap.days.length, ROADMAP_LENGTH_DAYS);
    assert.equal(roadmap.totalDays, ROADMAP_LENGTH_DAYS);
    assert.deepEqual(
      roadmap.days.map((day) => day.index),
      Array.from({ length: ROADMAP_LENGTH_DAYS }, (_, index) => index + 1)
    );
  });

  it("generates 9 phases with exactly 5 days each", () => {
    const roadmap = generate();

    assert.equal(roadmap.phases.length, PHASES_PER_CAREER);
    for (const phase of roadmap.phases) {
      assert.equal(phase.dayIds.length, DAYS_PER_PHASE, `phase ${phase.id}`);
    }

    const grouped = roadmap.phases.map((phase) =>
      roadmap.days.filter((day) => day.phaseId === phase.id)
    );
    assert.deepEqual(
      grouped.map((days) => days.length),
      Array.from({ length: PHASES_PER_CAREER }, () => DAYS_PER_PHASE)
    );

    // Every day belongs to exactly one phase and phases follow their order.
    assert.equal(
      roadmap.days.reduce((sum, days) => sum + (days.phaseId ? 1 : 0), 0),
      ROADMAP_LENGTH_DAYS
    );
    const phaseOrder = roadmap.phases.map((phase) => phase.order);
    assert.deepEqual(phaseOrder, [...phaseOrder].sort((a, b) => a - b));
  });

  it("gives every day one topic from its career template", () => {
    const roadmap = generate();
    const career = getCareer(roadmap.careerId);
    assert.ok(career);

    const templateTopics = new Set(
      career.phases.flatMap((phase) => phase.topics)
    );

    for (const phase of roadmap.phases) {
      const days = roadmap.days.filter((day) => day.phaseId === phase.id);
      const topics = days.map((day) => day.topic);
      assert.equal(new Set(topics).size, DAYS_PER_PHASE, `phase ${phase.id}`);
    }

    for (const day of roadmap.days) {
      assert.ok(templateTopics.has(day.topic), `unknown topic "${day.topic}"`);
      assert.ok(day.goal.length >= 10);
      assert.ok(day.skills.length >= 1);
      for (const skillId of day.skills) {
        assert.ok(SKILLS_BY_ID[skillId], `unknown skill "${skillId}"`);
      }
    }
  });

  it("produces a roadmap that satisfies the Zod schema", () => {
    const roadmap = generate();
    assert.doesNotThrow(() => roadmapSchema.parse(roadmap));
  });

  it("maps the skill-gap analysis onto roadmap phase ids", () => {
    const roadmap = generate();
    assert.ok(roadmap.skillGap);

    const phaseIds = new Set(roadmap.phases.map((phase) => phase.id));
    for (const entry of roadmap.skillGap.gaps) {
      for (const phaseId of entry.coveredInPhaseIds) {
        assert.ok(phaseIds.has(phaseId), `unknown phase id "${phaseId}"`);
      }
    }

    // Career-scoped ids keep two careers from colliding in persistence.
    for (const phase of roadmap.phases) {
      assert.ok(phase.id.startsWith(`${roadmap.careerId}-`));
    }
  });
});

describe("generateRoadmap — tasks", () => {
  it("creates globally unique, well-formed task ids", () => {
    const roadmap = generate();
    const seen = new Set<string>();

    for (const day of roadmap.days) {
      assert.equal(day.tasks.length >= 3, true, `day ${day.id} needs 3+ tasks`);
      day.tasks.forEach((task, index) => {
        assert.match(task.id, new RegExp(`^${day.id}-t\\d+$`));
        assert.equal(task.id, `${day.id}-t${index + 1}`);
        assert.equal(task.order, index + 1);
        assert.equal(seen.has(task.id), false, `duplicate task id ${task.id}`);
        seen.add(task.id);
      });
    }

    assert.equal(seen.size, roadmap.days.reduce((sum, day) => sum + day.tasks.length, 0));
  });

  it("fills in every required task field", () => {
    const roadmap = generate();

    for (const day of roadmap.days) {
      for (const task of day.tasks) {
        assert.ok(task.title.length >= 3);
        assert.ok(task.description.length >= 10);
        assert.equal(task.topic, day.topic);
        assert.ok(
          ["learn", "practice", "build", "quiz", "review", "project"].includes(
            task.type
          )
        );
        assert.ok(task.skillIds.length >= 1);
        for (const skillId of task.skillIds) {
          assert.ok(
            day.skills.includes(skillId),
            `task ${task.id} uses skill outside its day`
          );
        }
      }
    }
  });

  it("keeps every day within the student's available minutes", () => {
    for (const dailyMinutes of [45, 90, 150, 240]) {
      const roadmap = generate({ dailyMinutes });

      for (const day of roadmap.days) {
        const taskTotal = day.tasks.reduce((sum, task) => sum + task.minutes, 0);
        assert.equal(day.estimatedMinutes, taskTotal, `day ${day.id}`);
        assert.ok(
          taskTotal <= dailyMinutes,
          `day ${day.id} uses ${taskTotal} of ${dailyMinutes} minutes`
        );
        assert.ok(taskTotal > 0);
        for (const task of day.tasks) {
          assert.ok(Number.isInteger(task.minutes));
          assert.ok(task.minutes >= 5 && task.minutes <= 240, task.id);
        }
      }

      assert.equal(
        roadmap.totalMinutes,
        roadmap.days.reduce((sum, day) => sum + day.estimatedMinutes, 0)
      );
    }
  });

  it("adapts task mix to available time without changing the day count", () => {
    const small = generate({ dailyMinutes: 45 });
    const large = generate({ dailyMinutes: 240 });

    assert.equal(small.days.length, ROADMAP_LENGTH_DAYS);
    assert.equal(large.days.length, ROADMAP_LENGTH_DAYS);
    assert.ok(
      large.days[0].tasks.length >= small.days[0].tasks.length,
      "more time should allow at least as many tasks"
    );
  });

  it("only marks tasks optional for non-beginners and keeps 3 required tasks", () => {
    const beginner = generate({ experienceLevel: "beginner" });
    const advanced = generate({ experienceLevel: "advanced" });

    for (const day of beginner.days) {
      assert.equal(
        day.tasks.some((task) => task.optional),
        false,
        `beginner day ${day.id} should have no optional tasks`
      );
    }

    for (const day of advanced.days) {
      const required = day.tasks.filter((task) => !task.optional);
      assert.ok(required.length >= 3, `day ${day.id} needs 3 required tasks`);
    }
  });
});

describe("generateRoadmap — calendar dates", () => {
  it("starts on the start date and places days on study days", () => {
    const roadmap = generate({ daysPerWeek: 5 });
    const dates = roadmap.days.map((day) => day.plannedDate);

    assert.equal(dates[0], START_DATE);
    for (const date of dates) {
      assert.match(date ?? "", /^\d{4}-\d{2}-\d{2}$/);
    }

    // 5 consecutive study days, then a two-day break.
    const expected = scheduleStudyDates(START_DATE, 5, ROADMAP_LENGTH_DAYS);
    assert.deepEqual(dates, expected);
    assert.equal(dates[5], "2026-01-12");

    const timestamps = dates.map((date) => Date.parse(`${date}T00:00:00.000Z`));
    assert.deepEqual(timestamps, [...timestamps].sort((a, b) => a - b));
    assert.equal(new Set(dates).size, ROADMAP_LENGTH_DAYS);
  });

  it("supports every day of the week", () => {
    const roadmap = generate({ daysPerWeek: 7 });
    const dates = roadmap.days.map((day) => day.plannedDate);

    assert.deepEqual(dates, scheduleStudyDates(START_DATE, 7, ROADMAP_LENGTH_DAYS));
    assert.equal(dates[1], "2026-01-06");
  });
});

describe("generateRoadmap — determinism", () => {
  it("produces byte-identical roadmaps for the same profile", () => {
    const first = generate();
    const second = generate();

    assert.deepEqual(first, second);
    assert.equal(first.id, second.id);
    assert.equal(first.createdAt, second.createdAt);
  });

  it("changes the plan when the profile changes", () => {
    const beginner = generate({ experienceLevel: "beginner" });
    const advanced = generate({ experienceLevel: "advanced" });
    const longer = generate({ dailyMinutes: 180 });

    assert.notEqual(beginner.id, advanced.id);
    assert.notEqual(beginner.id, longer.id);
    assert.notDeepEqual(
      beginner.days[0].tasks.map((task) => task.minutes),
      longer.days[0].tasks.map((task) => task.minutes)
    );
  });

  it("rejects unknown careers with a helpful error", () => {
    assert.throws(
      () => generate({ targetCareerId: "space-pirate" }),
      /Unknown target career "space-pirate"/
    );
  });
});

describe("progress — derived from taskStatus only", () => {
  it("starts at zero and advances only through completed tasks", () => {
    const roadmap = generate();
    const empty = createProgressState(roadmap.id, NOW);
    const initial = calculateProgress(roadmap, empty);

    assert.equal(initial.completedTasks, 0);
    assert.equal(initial.completedDays, 0);
    assert.equal(initial.taskPercent, 0);
    assert.equal(initial.completedMinutes, 0);
    assert.equal(initial.totalDays, ROADMAP_LENGTH_DAYS);

    const day1 = roadmap.days[0];
    const partial = setTaskCompletion(roadmap, empty, day1.tasks[0].id, true, NOW);
    const partialSummary = calculateProgress(roadmap, partial);

    assert.equal(partialSummary.completedTasks, 1);
    assert.equal(partialSummary.completedDays, 0);
    assert.equal(isDayComplete(day1, partial), false);

    const dayProgress = getDayProgress(day1, partial);
    assert.equal(dayProgress.completedTasks, 1);
    assert.equal(dayProgress.totalTasks, day1.tasks.length);
    assert.equal(dayProgress.complete, false);
  });

  it("counts a day complete only when every task is done", () => {
    const roadmap = generate();
    const day1 = roadmap.days[0];
    const progress = completeTasks(
      roadmap,
      day1.tasks.map((task) => task.id)
    );
    const summary = calculateProgress(roadmap, progress);

    assert.equal(isDayComplete(day1, progress), true);
    assert.equal(summary.completedDays, 1);
    assert.equal(summary.completedTasks, day1.tasks.length);
    assert.equal(summary.completedMinutes, day1.estimatedMinutes);
    assert.equal(
      summary.taskPercent,
      Math.round((day1.tasks.length / summary.totalTasks) * 1000) / 10
    );
    assert.equal(
      summary.minutePercent,
      Math.round((day1.estimatedMinutes / summary.totalMinutes) * 1000) / 10
    );
    assert.equal(getNextIncompleteDay(roadmap, progress)?.id, roadmap.days[1].id);
  });

  it("computes phase progress from its days", () => {
    const roadmap = generate();
    const phase = roadmap.phases[0];
    const phaseDays = roadmap.days.filter((day) => day.phaseId === phase.id);
    const progress = completeTasks(
      roadmap,
      phaseDays.flatMap((day) => day.tasks.map((task) => task.id))
    );
    const phaseProgress = getPhaseProgress(phase, roadmap, progress);

    assert.equal(phaseProgress.totalDays, DAYS_PER_PHASE);
    assert.equal(phaseProgress.completedDays, DAYS_PER_PHASE);
    assert.equal(phaseProgress.percent, 100);
    assert.equal(phaseProgress.complete, true);
  });

  it("tracks streaks from completion timestamps", () => {
    const roadmap = generate();
    let progress = createProgressState(roadmap.id, new Date("2026-01-05T09:00:00.000Z"));

    progress = setTaskCompletion(
      roadmap,
      progress,
      roadmap.days[0].tasks[0].id,
      true,
      new Date("2026-01-05T09:00:00.000Z")
    );
    progress = setTaskCompletion(
      roadmap,
      progress,
      roadmap.days[1].tasks[0].id,
      true,
      new Date("2026-01-06T09:00:00.000Z")
    );
    progress = setTaskCompletion(
      roadmap,
      progress,
      roadmap.days[2].tasks[0].id,
      true,
      new Date("2026-01-07T09:00:00.000Z")
    );

    const summary = calculateProgress(roadmap, progress);
    assert.equal(summary.currentStreak, 3);
    assert.equal(summary.longestStreak, 3);
  });

  it("rejects progress from another roadmap", () => {
    const roadmap = generate();
    const other = generate({ dailyMinutes: 120 });
    const wrongProgress = createProgressState(other.id, NOW);

    assert.throws(() => calculateProgress(roadmap, wrongProgress), /belongs to roadmap/);
  });
});

describe("rebalanceRoadmap — completed work is protected", () => {
  it("never changes a day that has a completed task", () => {
    const roadmap = generate({ dailyMinutes: 90 });
    const protectedDays = [roadmap.days[0], roadmap.days[2]];
    const progress = completeTasks(
      roadmap,
      protectedDays.flatMap((day) => day.tasks.map((task) => task.id))
    );

    const result = rebalanceRoadmap({
      roadmap,
      progress,
      dailyMinutes: 60,
      now: new Date("2026-01-10T12:00:00.000Z"),
    });

    assert.deepEqual(result.protectedDayIds, ["d001", "d003"]);
    for (const original of protectedDays) {
      const current = result.roadmap.days.find((day) => day.id === original.id);
      assert.deepEqual(current, original);
    }

    for (const dayId of result.updatedDayIds) {
      assert.equal(result.protectedDayIds.includes(dayId), false);
    }

    // Rebuilt days adopt the new budget; protected days keep their original work.
    for (const day of result.roadmap.days) {
      const total = day.tasks.reduce((sum, task) => sum + task.minutes, 0);
      assert.equal(day.estimatedMinutes, total);
      if (result.protectedDayIds.includes(day.id)) {
        const original = roadmap.days.find((entry) => entry.id === day.id);
        assert.equal(total, original?.estimatedMinutes);
        continue;
      }
      assert.ok(total <= 60, `day ${day.id} still uses ${total} minutes`);
    }

    assert.equal(result.roadmap.version, roadmap.version + 1);
    assert.equal(result.roadmap.dailyMinutes, 60);
    assert.equal(result.roadmap.profileSnapshot.dailyMinutes, 60);
    assert.equal(result.roadmap.createdAt, roadmap.createdAt);
    assert.equal(result.roadmap.id, roadmap.id);

    assert.equal(result.progress.roadmapId, roadmap.id);
    assert.equal(result.progress.replanHistory.length, 1);
    assert.equal(result.progress.replanHistory[0].fromVersion, roadmap.version);
    assert.equal(result.progress.replanHistory[0].toVersion, result.roadmap.version);
    assert.deepEqual(
      result.progress.replanHistory[0].affectedDayIds,
      result.updatedDayIds
    );

    // Completion records survive the replan untouched.
    for (const day of protectedDays) {
      for (const task of day.tasks) {
        assert.equal(result.progress.taskStatus[task.id]?.done, true);
      }
    }
  });

  it("protects a partially completed day as a whole", () => {
    const roadmap = generate();
    const day = roadmap.days[4];
    const progress = completeTasks(roadmap, [day.tasks[1].id]);

    const result = rebalanceRoadmap({
      roadmap,
      progress,
      dailyMinutes: 45,
      now: new Date("2026-01-10T12:00:00.000Z"),
    });

    assert.deepEqual(result.protectedDayIds, [day.id]);
    assert.deepEqual(
      result.roadmap.days.find((entry) => entry.id === day.id),
      day
    );
    assert.equal(result.updatedDayIds.includes(day.id), false);
  });

  it("rebuilds every day when nothing is completed", () => {
    const roadmap = generate({ dailyMinutes: 120 });
    const progress = createProgressState(roadmap.id, NOW);

    const result = rebalanceRoadmap({
      roadmap,
      progress,
      dailyMinutes: 45,
      now: new Date("2026-01-10T12:00:00.000Z"),
    });

    assert.equal(result.protectedDayIds.length, 0);
    assert.equal(result.updatedDayIds.length, ROADMAP_LENGTH_DAYS);
    assert.equal(result.roadmap.version, 2);
    assert.equal(result.roadmap.days.length, ROADMAP_LENGTH_DAYS);
    assert.doesNotThrow(() => roadmapSchema.parse(result.roadmap));
  });

  it("rejects an invalid daily budget and mismatched progress", () => {
    const roadmap = generate();
    const progress = createProgressState(roadmap.id, NOW);
    const other = generate({ dailyMinutes: 120 });

    assert.throws(
      () => rebalanceRoadmap({ roadmap, progress, dailyMinutes: 5 }),
      /dailyMinutes must be/
    );
    assert.throws(
      () =>
        rebalanceRoadmap({
          roadmap,
          progress: createProgressState(other.id, NOW),
        }),
      /belongs to roadmap/
    );
  });
});
