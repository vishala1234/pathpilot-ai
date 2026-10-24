"use client";

import { useMemo } from "react";

import type { Day, ProgressState, ProgressSummary, Roadmap } from "@/types";

import { useProfileStore } from "./profile";
import { useProgressStore } from "./progress";
import { useRoadmapStore } from "./roadmap";
import {
  getAllPhaseProgress,
  getCompletedDays,
  getDayProgressFor,
  getPhaseProgressFor,
  getProgressSummary,
  getTodayPlan,
  type TodayPlan,
} from "./selectors";
import { useSettingsStore } from "./settings";

/**
 * React bindings for the state layer. These hooks only subscribe to raw state
 * (profile / roadmap / progress) and derive metrics with `useMemo`, so there is
 * still exactly one stored source of truth for completion.
 */

export function useProfile() {
  return useProfileStore((state) => state.profile);
}

export function useSettings() {
  return useSettingsStore((state) => state.settings);
}

export function useRoadmap(): Roadmap | null {
  return useRoadmapStore((state) => state.roadmap);
}

export function useRoadmapVersion(): number | null {
  return useRoadmapStore((state) => state.roadmap?.version ?? null);
}

export function useProgressState(): ProgressState | null {
  return useProgressStore((state) => state.progress);
}

export function useProgressSummary(): ProgressSummary | null {
  const roadmap = useRoadmap();
  const progress = useProgressState();

  return useMemo(
    () => getProgressSummary(roadmap, progress),
    [roadmap, progress]
  );
}

export function useCompletedTaskCount(): number {
  return useProgressSummary()?.completedTasks ?? 0;
}

export function useCurrentStreak(): number {
  return useProgressSummary()?.currentStreak ?? 0;
}

export function useCompletedDays(): Day[] {
  const roadmap = useRoadmap();
  const progress = useProgressState();

  return useMemo(() => getCompletedDays(roadmap, progress), [roadmap, progress]);
}

export function useTodayPlan(today?: Date): TodayPlan | null {
  const roadmap = useRoadmap();
  const progress = useProgressState();

  return useMemo(
    // With no explicit date the plan is recomputed whenever the plan changes;
    // a midnight rollover will refresh on the next render/action.
    () => getTodayPlan(roadmap, progress, today),
    [roadmap, progress, today]
  );
}

export function usePhaseProgress(phaseId: string) {
  const roadmap = useRoadmap();
  const progress = useProgressState();

  return useMemo(
    () => getPhaseProgressFor(roadmap, progress, phaseId),
    [roadmap, progress, phaseId]
  );
}

export function useAllPhaseProgress() {
  const roadmap = useRoadmap();
  const progress = useProgressState();

  return useMemo(
    () => getAllPhaseProgress(roadmap, progress),
    [roadmap, progress]
  );
}

export function useDayProgress(dayId: string) {
  const roadmap = useRoadmap();
  const progress = useProgressState();

  return useMemo(
    () => getDayProgressFor(roadmap, progress, dayId),
    [roadmap, progress, dayId]
  );
}
