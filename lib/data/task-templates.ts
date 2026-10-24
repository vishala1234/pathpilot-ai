import { DEFAULT_DAILY_MINUTES, MAX_TASKS_PER_DAY, MIN_TASKS_PER_DAY } from "@/lib/constants";
import type { Day, PhaseKind, TaskType } from "@/types";

/**
 * Blueprints used by the deterministic (fallback) roadmap generator. Each
 * phase kind produces a different rhythm, so a project week never looks like
 * an interview week.
 */
export type TaskBlueprint = {
  type: TaskType;
  /** `{topic}` is replaced with the day's topic from the career template. */
  title: string;
  /** Share of the day's study minutes. All shares in a phase kind sum to 1. */
  share: number;
  optional?: boolean;
  resourceHint?: string;
};

export const PHASE_TASK_BLUEPRINTS: Record<PhaseKind, TaskBlueprint[]> = {
  foundation: [
    {
      type: "learn",
      title: "Learn {topic}",
      share: 0.35,
      resourceHint: "Official docs or a short course section",
    },
    {
      type: "practice",
      title: "Guided practice: {topic}",
      share: 0.3,
      resourceHint: "Type every example yourself",
    },
    {
      type: "build",
      title: "Build a tiny example for {topic}",
      share: 0.2,
    },
    {
      type: "review",
      title: "Summarise {topic} in your own words",
      share: 0.15,
    },
  ],
  tools: [
    {
      type: "learn",
      title: "Learn the essentials of {topic}",
      share: 0.3,
    },
    {
      type: "practice",
      title: "Hands-on drill: {topic}",
      share: 0.35,
      resourceHint: "Work on a real dataset or repo",
    },
    {
      type: "build",
      title: "Apply {topic} to the practice project",
      share: 0.25,
    },
    {
      type: "quiz",
      title: "Self-check: {topic}",
      share: 0.1,
    },
  ],
  core: [
    {
      type: "learn",
      title: "Study the core idea behind {topic}",
      share: 0.28,
    },
    {
      type: "practice",
      title: "Practice {topic} with a worked example",
      share: 0.3,
    },
    {
      type: "build",
      title: "Implement {topic} in the week's exercise",
      share: 0.27,
    },
    {
      type: "quiz",
      title: "Check your understanding of {topic}",
      share: 0.15,
    },
  ],
  advanced: [
    {
      type: "learn",
      title: "Read and take notes on {topic}",
      share: 0.25,
    },
    {
      type: "build",
      title: "Build a working slice of {topic}",
      share: 0.4,
    },
    {
      type: "practice",
      title: "Stretch exercise: {topic}",
      share: 0.2,
      optional: true,
    },
    {
      type: "review",
      title: "Write down the trade-offs in {topic}",
      share: 0.15,
    },
  ],
  project: [
    {
      type: "build",
      title: "Implement: {topic}",
      share: 0.55,
      resourceHint: "Commit at least once before you stop",
    },
    {
      type: "project",
      title: "Integrate {topic} into the capstone",
      share: 0.25,
    },
    {
      type: "review",
      title: "Review progress on {topic} and update the README",
      share: 0.1,
    },
    {
      type: "build",
      title: "Fix the top issue found while building {topic}",
      share: 0.1,
      optional: true,
    },
  ],
  interview: [
    {
      type: "review",
      title: "Review the question bank for {topic}",
      share: 0.25,
    },
    {
      type: "practice",
      title: "Solve 3 timed problems on {topic}",
      share: 0.4,
    },
    {
      type: "quiz",
      title: "Explain {topic} out loud in 2 minutes",
      share: 0.2,
    },
    {
      type: "review",
      title: "Log {topic} mistakes and write the corrected answer",
      share: 0.15,
    },
  ],
};

/**
 * A complete, valid sample day used by tests, stories and the placeholder
 * roadmap screen before generation is wired up.
 */
export const SAMPLE_TEMPLATE_DAY: Day = {
  id: "d001",
  index: 1,
  phaseId: "python-basics",
  title: "Python Basics",
  topic: "Python syntax, variables and data types",
  goal:
    "Run a Python file, use variables and types confidently, and complete a small exercise without help.",
  skills: ["python"],
  plannedDate: null,
  estimatedMinutes: DEFAULT_DAILY_MINUTES,
  isProjectDay: false,
  tasks: [
    {
      id: "d001-t1",
      title: "Learn Python variables and core types",
      description:
        "Read about variables and core types, then write three examples of each type in a scratch file.",
      topic: "Python syntax, variables and data types",
      type: "learn",
      minutes: 25,
      order: 1,
      optional: false,
      skillIds: ["python"],
      resourceHint: "Python tutorial: variables and data types",
    },
    {
      id: "d001-t2",
      title: "Practice type conversions in the REPL",
      description:
        "Convert between integers, floats and strings in the REPL, and note which conversions fail.",
      topic: "Python syntax, variables and data types",
      type: "practice",
      minutes: 25,
      order: 2,
      optional: false,
      skillIds: ["python"],
    },
    {
      id: "d001-t3",
      title: "Write a temperature converter script",
      description:
        "Build a small script that converts Celsius to Fahrenheit, then commit it to your practice repo.",
      topic: "Python syntax, variables and data types",
      type: "build",
      minutes: 25,
      order: 3,
      optional: false,
      skillIds: ["python"],
    },
    {
      id: "d001-t4",
      title: "Summarise the difference between lists and tuples",
      description:
        "Explain the difference in your notes, including one case where each is the better choice.",
      topic: "Python syntax, variables and data types",
      type: "review",
      minutes: 15,
      order: 4,
      optional: false,
      skillIds: ["python"],
    },
  ],
};

/** Generic titles used if a career template is missing a phase title. */
export const FALLBACK_ROADMAP_TITLE = "Your 45-day career roadmap";

export const FALLBACK_TASK_LIMITS = {
  min: MIN_TASKS_PER_DAY,
  max: MAX_TASKS_PER_DAY,
} as const;

/** Replace the `{topic}` placeholder in a blueprint title. */
export function fillTaskTitle(blueprint: TaskBlueprint, topic: string): string {
  return blueprint.title.replaceAll("{topic}", topic);
}
