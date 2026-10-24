import {
  MAX_TASKS_PER_DAY,
  MIN_TASKS_PER_DAY,
  MIN_TASK_MINUTES,
} from "@/lib/constants";
import {
  fillTaskTitle,
  PHASE_TASK_BLUEPRINTS,
  type TaskBlueprint,
} from "@/lib/data/task-templates";
import type { PhaseEmphasis, PhaseKind, Task, TaskType } from "@/types";

/**
 * Deterministic task construction. No randomness, no AI: the same topic,
 * phase kind, emphasis and minute budget always produce the same task list.
 */

const EMPHASIS_MULTIPLIER: Record<PhaseEmphasis, Record<TaskType, number>> = {
  focus: {
    learn: 0.8,
    practice: 1.25,
    build: 1.35,
    quiz: 0.9,
    review: 0.7,
    project: 1.1,
  },
  balanced: {
    learn: 1,
    practice: 1,
    build: 1,
    quiz: 1,
    review: 1,
    project: 1,
  },
  review: {
    learn: 0.7,
    practice: 0.85,
    build: 0.8,
    quiz: 1.2,
    review: 1.4,
    project: 0.8,
  },
};

const DESCRIPTION_BY_TYPE: Record<TaskType, (topic: string) => string> = {
  learn: (topic) =>
    `Read or watch one focused explanation of ${topic}, then write three bullets in your own words so you can explain it without notes.`,
  practice: (topic) =>
    `Work through guided exercises on ${topic}. Type every example yourself and mark the step where you needed help.`,
  build: (topic) =>
    `Apply ${topic} in a small build. Keep it deliberately unfinished rather than copying a finished tutorial.`,
  quiz: (topic) =>
    `Answer five questions about ${topic} without looking anything up, then review only the ones you missed.`,
  review: (topic) =>
    `Revisit ${topic} and write down the key idea, one trade-off, and the part you still find confusing.`,
  project: (topic) =>
    `Integrate ${topic} into the capstone and verify the full flow works end to end before you stop.`,
};

const EXTRA_BLUEPRINTS: Record<"medium" | "long", TaskBlueprint[]> = {
  medium: [
    {
      type: "review",
      title: "Consolidate your notes on {topic}",
      share: 0.12,
    },
  ],
  long: [
    {
      type: "review",
      title: "Consolidate your notes on {topic}",
      share: 0.1,
    },
    {
      type: "practice",
      title: "Extra drill: {topic}",
      share: 0.14,
    },
  ],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3).trimEnd()}...`;
}

function adjustBlueprintShares(
  blueprints: TaskBlueprint[],
  emphasis: PhaseEmphasis
): number[] {
  const weights = blueprints.map(
    (blueprint) => blueprint.share * EMPHASIS_MULTIPLIER[emphasis][blueprint.type]
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return blueprints.map(() => 1 / blueprints.length);
  }
  return weights.map((weight) => weight / total);
}

/**
 * Split a minute budget across weighted tasks, in whole minutes, with every
 * task receiving at least `MIN_TASK_MINUTES` and the exact total preserved.
 */
export function allocateTaskMinutes(
  totalMinutes: number,
  shares: number[]
): number[] {
  if (shares.length === 0) return [];
  if (totalMinutes < shares.length * MIN_TASK_MINUTES) {
    throw new Error(
      `Cannot allocate ${totalMinutes} minutes across ${shares.length} tasks without going below ${MIN_TASK_MINUTES} minutes each`
    );
  }

  const remaining = totalMinutes - shares.length * MIN_TASK_MINUTES;
  const shareTotal = shares.reduce((sum, share) => sum + share, 0);
  const normalized =
    shareTotal > 0 ? shares.map((share) => share / shareTotal) : shares.map(() => 1 / shares.length);
  const raw = normalized.map((share) => share * remaining);
  const minutes = raw.map(Math.floor);

  let leftover = remaining - minutes.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let index = 0; index < leftover; index += 1) {
    minutes[order[index % order.length].index] += 1;
  }

  // Safety net: guarantee the total even if floating point drifts.
  leftover = totalMinutes - (minutes.reduce((sum, value) => sum + value, 0) + shares.length * MIN_TASK_MINUTES);
  let cursor = 0;
  while (leftover > 0) {
    minutes[cursor % minutes.length] += 1;
    leftover -= 1;
    cursor += 1;
  }

  return minutes.map((value) => value + MIN_TASK_MINUTES);
}

function candidateBlueprints(
  phaseKind: PhaseKind,
  dailyMinutes: number
): TaskBlueprint[] {
  const base = PHASE_TASK_BLUEPRINTS[phaseKind];
  if (dailyMinutes >= 240 && base.length < MAX_TASKS_PER_DAY - 1) {
    return [...base, ...EXTRA_BLUEPRINTS.long];
  }
  if (dailyMinutes >= 120 && base.length < MAX_TASKS_PER_DAY) {
    return [...base, ...EXTRA_BLUEPRINTS.medium];
  }
  return base;
}

export type BuildDayTasksInput = {
  dayId: string;
  topic: string;
  /** Skills taught by the day's phase; the primary skill rotates per task. */
  skillIds: string[];
  phaseKind: PhaseKind;
  emphasis: PhaseEmphasis;
  dailyMinutes: number;
  /** Beginners get only required tasks; advanced students may skip stretch work. */
  allowOptional?: boolean;
};

export function buildDayTasks({
  dayId,
  topic,
  skillIds,
  phaseKind,
  emphasis,
  dailyMinutes,
  allowOptional = false,
}: BuildDayTasksInput): Task[] {
  const candidates = candidateBlueprints(phaseKind, dailyMinutes);
  const maxTasks = clamp(
    Math.floor(dailyMinutes / MIN_TASK_MINUTES),
    MIN_TASKS_PER_DAY,
    Math.min(MAX_TASKS_PER_DAY, candidates.length)
  );
  const selected = candidates.slice(0, maxTasks);
  const shares = adjustBlueprintShares(selected, emphasis);
  const minutes = allocateTaskMinutes(dailyMinutes, shares);

  const tasks: Task[] = selected.map((blueprint, index) => {
    const task: Task = {
      id: `${dayId}-t${index + 1}`,
      title: truncate(fillTaskTitle(blueprint, topic), 140),
      description: DESCRIPTION_BY_TYPE[blueprint.type](topic),
      topic,
      type: blueprint.type,
      minutes: minutes[index],
      order: index + 1,
      optional: Boolean(blueprint.optional) && allowOptional,
      skillIds: [skillIds[index % skillIds.length] ?? skillIds[0]],
    };

    if (blueprint.resourceHint) {
      task.resourceHint = blueprint.resourceHint;
    }

    return task;
  });

  // A day must always contain at least three required tasks, otherwise the
  // "day complete" rule becomes trivial to game.
  let required = tasks.filter((task) => !task.optional).length;
  for (const task of tasks) {
    if (required >= MIN_TASKS_PER_DAY) break;
    if (task.optional) {
      task.optional = false;
      required += 1;
    }
  }

  return tasks;
}

export function buildDayGoal(
  topic: string,
  phaseTitle: string,
  emphasis: PhaseEmphasis
): string {
  const lead =
    emphasis === "review"
      ? `Refresh ${topic}`
      : emphasis === "focus"
        ? `Close your gap in ${topic}`
        : `Learn and apply ${topic}`;

  const goal = `${lead} as part of ${phaseTitle}. By the end of the day you should be able to use it in a small exercise without step-by-step guidance.`;
  return truncate(goal, 400);
}

export function totalTaskMinutes(tasks: Task[]): number {
  return tasks.reduce((sum, task) => sum + task.minutes, 0);
}
