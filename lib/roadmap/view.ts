import { format, parseISO } from "date-fns";

import {
  calculateProgress,
  getDayProgress,
  getNextIncompleteDay,
  getPhaseProgress,
  type DayProgress,
  type PhaseProgress,
} from "@/lib/engine";
import { getTodayPlan, type TodayPlan } from "@/lib/store/selectors";
import type {
  Day,
  Phase,
  PhaseEmphasis,
  PhaseKind,
  ProgressState,
  ProgressSummary,
  Roadmap,
  TaskType,
} from "@/types";

/**
 * Read-only view models for the roadmap screen.
 *
 * The UI never invents roadmap or progress data: every value here comes from
 * the persisted `Roadmap` plus the Step 2 engine, which derives completion from
 * `progress.taskStatus` alone. This module exists so the same derivations can be
 * unit-tested without a DOM.
 */

export const PHASE_KIND_LABELS: Record<PhaseKind, string> = {
  foundation: "Foundation",
  tools: "Tools",
  core: "Core skills",
  advanced: "Advanced",
  project: "Project",
  interview: "Interview prep",
};

export const PHASE_EMPHASIS_LABELS: Record<PhaseEmphasis, string> = {
  focus: "Focus",
  balanced: "Balanced",
  review: "Review",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  learn: "Learn",
  practice: "Practice",
  build: "Build",
  quiz: "Quiz",
  review: "Review",
  project: "Project",
};

export type DayStatus = "completed" | "in-progress" | "upcoming";
export type PhaseStatus = "completed" | "current" | "upcoming";

export type RoadmapDayView = {
  day: Day;
  phase: Phase;
  progress: DayProgress;
  status: DayStatus;
  /** The day the "Today's plan" card points at (scheduled today or next up). */
  isToday: boolean;
  /** The first day with unfinished work. */
  isNext: boolean;
};

export type RoadmapPhaseView = {
  phase: Phase;
  /** 1-based position in the roadmap. */
  number: number;
  progress: PhaseProgress;
  status: PhaseStatus;
  days: RoadmapDayView[];
};

export type RoadmapView = {
  roadmap: Roadmap;
  summary: ProgressSummary;
  phases: RoadmapPhaseView[];
  /** Every day in plan order, flattened for navigation. */
  days: RoadmapDayView[];
  today: TodayPlan | null;
  /** First phase that still has unfinished days, or `null` when all are done. */
  currentPhaseId: string | null;
  nextIncompleteDayId: string | null;
  /** The requested day, else today's plan, else the next incomplete day. */
  selectedDay: RoadmapDayView;
};

export type BuildRoadmapViewOptions = {
  /** Injectable clock; omit in the app so the selector uses the real date. */
  today?: Date;
  /** Reuse an already-computed `useTodayPlan` result to avoid double work. */
  todayPlan?: TodayPlan | null;
  selectedDayId?: string | null;
};

function dayStatus(progress: DayProgress): DayStatus {
  if (progress.complete) return "completed";
  return progress.completedTasks > 0 ? "in-progress" : "upcoming";
}

/**
 * Build the whole screen model in one deterministic pass.
 * Returns `null` when there is no roadmap or its progress log does not belong to
 * it, so the UI can show an honest empty/error state instead of 0% progress.
 */
export function buildRoadmapView(
  roadmap: Roadmap | null,
  progress: ProgressState | null,
  options: BuildRoadmapViewOptions = {}
): RoadmapView | null {
  if (!roadmap || !progress) return null;
  if (progress.roadmapId !== roadmap.id) return null;

  const summary = calculateProgress(roadmap, progress);
  const today =
    options.todayPlan !== undefined
      ? options.todayPlan
      : getTodayPlan(roadmap, progress, options.today);
  const nextIncomplete = getNextIncompleteDay(roadmap, progress);
  const nextIncompleteDayId = nextIncomplete?.id ?? null;

  const phaseContainingNext = nextIncomplete
    ? roadmap.phases.find((phase) => phase.dayIds.includes(nextIncomplete.id))
    : undefined;
  const currentPhaseId = phaseContainingNext?.id ?? null;

  const orderedPhases = [...roadmap.phases].sort((a, b) => a.order - b.order);
  const daysById = new Map(roadmap.days.map((day) => [day.id, day]));

  const phases: RoadmapPhaseView[] = orderedPhases.map((phase, index) => {
    const phaseProgress = getPhaseProgress(phase, roadmap, progress);
    const days = phase.dayIds
      .map((dayId) => daysById.get(dayId))
      .filter((day): day is Day => Boolean(day))
      .map<RoadmapDayView>((day) => {
        const dayProgress = getDayProgress(day, progress);
        return {
          day,
          phase,
          progress: dayProgress,
          status: dayStatus(dayProgress),
          isToday: today?.day.id === day.id,
          isNext: day.id === nextIncompleteDayId,
        };
      });

    return {
      phase,
      number: index + 1,
      progress: phaseProgress,
      status: phaseProgress.complete
        ? "completed"
        : phase.id === currentPhaseId
          ? "current"
          : "upcoming",
      days,
    };
  });

  const days = phases.flatMap((phase) => phase.days);
  const requested = options.selectedDayId
    ? days.find((entry) => entry.day.id === options.selectedDayId)
    : undefined;
  const selectedDay =
    requested ??
    (today ? days.find((entry) => entry.day.id === today.day.id) : undefined) ??
    (nextIncompleteDayId
      ? days.find((entry) => entry.day.id === nextIncompleteDayId)
      : undefined) ??
    days[0];

  if (!selectedDay) return null;

  return {
    roadmap,
    summary,
    phases,
    days,
    today,
    currentPhaseId,
    nextIncompleteDayId,
    selectedDay,
  };
}

/** `Mon, 5 Jan` — display only; the stored value stays an ISO date. */
export function formatDayDate(isoDate: string | null): string {
  if (!isoDate) return "Unscheduled";
  try {
    return format(parseISO(isoDate), "EEE, d MMM");
  } catch {
    return isoDate;
  }
}

/** Compact effort label, e.g. `1h 30m` or `45m`. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** Days in a phase that are fully complete. */
export function countCompletedDays(phase: RoadmapPhaseView): number {
  return phase.progress.completedDays;
}

/** True once every task in the day is done — including optional tasks. */
export function isDayViewComplete(view: RoadmapDayView): boolean {
  return view.progress.complete;
}
