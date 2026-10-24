import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from "@/lib/constants";
import {
  createProgressState,
  setTaskCompletion as applyTaskCompletion,
  toggleTask as applyToggleTask,
} from "@/lib/engine";
import { progressStateSchema } from "@/lib/schemas/progress";
import type { ProgressState } from "@/types";

import { requireRegisteredRoadmap } from "./registry";
import { createSafePersistStorage, removePersistedKey } from "./storage";

/**
 * The single source of truth for task completion.
 *
 * Only raw `taskStatus` records are stored. Day, phase, roadmap and streak
 * progress are always derived through `lib/engine/progress.ts` — see
 * `selectors.ts` and `hooks.ts`. Nothing in this store keeps a duplicate
 * percentage that could drift.
 */
export type ProgressStore = {
  progress: ProgressState | null;
  /** Begin a fresh progress log for a roadmap (no completed tasks). */
  startForRoadmap: (roadmapId: string, now?: Date) => ProgressState;
  /** Replace the whole log, e.g. after importing a backup. */
  loadProgress: (progress: ProgressState) => ProgressState;
  /** Replace the log after a replan/rebalance while keeping completions. */
  replaceProgress: (progress: ProgressState) => ProgressState;
  setTaskCompletion: (taskId: string, done: boolean, now?: Date) => void;
  markTaskComplete: (taskId: string, now?: Date) => void;
  markTaskIncomplete: (taskId: string, now?: Date) => void;
  toggleTask: (taskId: string, now?: Date) => void;
  resetProgress: () => void;
};

const progressStorage =
  createSafePersistStorage<Pick<ProgressStore, "progress">>();

function requireProgress(state: {
  progress: ProgressState | null;
}): ProgressState {
  if (!state.progress) {
    throw new Error(
      "No progress log is loaded. Create a roadmap before marking tasks."
    );
  }
  return state.progress;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: null,

      startForRoadmap: (roadmapId, now) => {
        const progress = createProgressState(roadmapId, now);
        set({ progress });
        return progress;
      },

      loadProgress: (next) => {
        const progress = progressStateSchema.parse(next);
        set({ progress });
        return progress;
      },

      replaceProgress: (next) => {
        const progress = progressStateSchema.parse(next);
        set({ progress });
        return progress;
      },

      setTaskCompletion: (taskId, done, now) => {
        const roadmap = requireRegisteredRoadmap();
        const progress = applyTaskCompletion(
          roadmap,
          requireProgress(get()),
          taskId,
          done,
          now
        );
        set({ progress });
      },

      markTaskComplete: (taskId, now) => {
        get().setTaskCompletion(taskId, true, now);
      },

      markTaskIncomplete: (taskId, now) => {
        get().setTaskCompletion(taskId, false, now);
      },

      toggleTask: (taskId, now) => {
        const roadmap = requireRegisteredRoadmap();
        const progress = applyToggleTask(
          roadmap,
          requireProgress(get()),
          taskId,
          now
        );
        set({ progress });
      },

      resetProgress: () => {
        set({ progress: null });
        removePersistedKey(STORAGE_KEYS.progress);
      },
    }),
    {
      name: STORAGE_KEYS.progress,
      version: CURRENT_SCHEMA_VERSION,
      storage: progressStorage,
      skipHydration: true,
      partialize: (state) => ({ progress: state.progress }),
      merge: (persisted, current) => {
        const candidate = (
          persisted as { progress?: unknown } | null | undefined
        )?.progress;
        if (candidate == null) return { ...current, progress: null };

        const parsed = progressStateSchema.safeParse(candidate);
        return { ...current, progress: parsed.success ? parsed.data : null };
      },
    }
  )
);
