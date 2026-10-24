import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  CURRENT_SCHEMA_VERSION,
  MAX_DAILY_MINUTES,
  MAX_DAYS_PER_WEEK,
  MIN_DAILY_MINUTES,
  MIN_DAYS_PER_WEEK,
  STORAGE_KEYS,
} from "@/lib/constants";
import { generateRoadmap, rebalanceRoadmap, rescheduleRoadmap } from "@/lib/engine";
import { isoDateSchema } from "@/lib/schemas/common";
import { roadmapSchema } from "@/lib/schemas/roadmap";
import type { Profile, ProfileInput, Roadmap } from "@/types";

import { useProfileStore } from "./profile";
import { useProgressStore } from "./progress";
import { registerRoadmapGetter } from "./registry";
import { createSafePersistStorage, removePersistedKey } from "./storage";

export type CreateRoadmapOptions = {
  /** Wall-clock time for timestamps; omit for reproducible fallback output. */
  now?: Date;
};

export type RoadmapStore = {
  roadmap: Roadmap | null;
  /** Set a roadmap (generated, imported or hydrated) and start its progress. */
  setRoadmap: (roadmap: Roadmap | null) => void;
  /** Generate a roadmap from the saved profile (or the profile passed in). */
  createRoadmap: (
    profile?: ProfileInput | Profile,
    options?: CreateRoadmapOptions
  ) => Roadmap;
  /** Change the daily budget; unfinished days are rebuilt, finished days kept. */
  updateDailyMinutes: (minutes: number, now?: Date) => void;
  /** Change study days per week; only calendar dates move. */
  updateDaysPerWeek: (daysPerWeek: number, now?: Date) => void;
  /** Change the plan start date; only calendar dates move. */
  updateStartDate: (startDate: string, now?: Date) => void;
  /** Remove the roadmap and its progress log, keeping the student profile. */
  resetRoadmap: () => void;
};

const roadmapStorage = createSafePersistStorage<Pick<RoadmapStore, "roadmap">>();

function assertDailyMinutes(minutes: number): void {
  if (
    !Number.isInteger(minutes) ||
    minutes < MIN_DAILY_MINUTES ||
    minutes > MAX_DAILY_MINUTES
  ) {
    throw new Error(
      `dailyMinutes must be an integer from ${MIN_DAILY_MINUTES} to ${MAX_DAILY_MINUTES}, got ${minutes}`
    );
  }
}

function assertDaysPerWeek(daysPerWeek: number): void {
  if (
    !Number.isInteger(daysPerWeek) ||
    daysPerWeek < MIN_DAYS_PER_WEEK ||
    daysPerWeek > MAX_DAYS_PER_WEEK
  ) {
    throw new Error(
      `daysPerWeek must be an integer from ${MIN_DAYS_PER_WEEK} to ${MAX_DAYS_PER_WEEK}, got ${daysPerWeek}`
    );
  }
}

export const useRoadmapStore = create<RoadmapStore>()(
  persist(
    (set, get) => {
      /** Progress must always belong to the roadmap currently loaded. */
      const ensureProgress = (roadmap: Roadmap, now: Date) => {
        const progressStore = useProgressStore.getState();
        const current = progressStore.progress;
        if (!current || current.roadmapId !== roadmap.id) {
          return progressStore.startForRoadmap(roadmap.id, now);
        }
        return current;
      };

      const syncProfile = (
        patch: Partial<ProfileInput>,
        now: Date
      ): Profile | null => {
        return useProfileStore.getState().updateProfile(patch, now);
      };

      return {
        roadmap: null,

        setRoadmap: (roadmap) => {
          const parsed = roadmap === null ? null : roadmapSchema.parse(roadmap);
          set({ roadmap: parsed });

          const progressStore = useProgressStore.getState();
          if (!parsed) {
            progressStore.resetProgress();
            removePersistedKey(STORAGE_KEYS.roadmap);
            return;
          }

          const current = progressStore.progress;
          if (!current || current.roadmapId !== parsed.id) {
            progressStore.startForRoadmap(parsed.id);
          }
        },

        createRoadmap: (profile, options) => {
          const source = profile ?? useProfileStore.getState().profile;
          if (!source) {
            throw new Error(
              "A student profile is required before creating a roadmap."
            );
          }

          const roadmap = generateRoadmap(
            source,
            options?.now ? { now: options.now } : undefined
          );
          set({ roadmap });
          useProgressStore.getState().startForRoadmap(roadmap.id, options?.now);
          return roadmap;
        },

        updateDailyMinutes: (minutes, now) => {
          assertDailyMinutes(minutes);
          const timestamp = now ?? new Date();

          // Keep the profile in sync even before a roadmap exists.
          syncProfile({ dailyMinutes: minutes }, timestamp);

          const roadmap = get().roadmap;
          if (!roadmap) return;

          const progress = ensureProgress(roadmap, timestamp);
          const result = rebalanceRoadmap({
            roadmap,
            progress,
            dailyMinutes: minutes,
            now: timestamp,
            reason: "profile-change",
          });

          set({ roadmap: result.roadmap });
          useProgressStore.getState().replaceProgress(result.progress);
        },

        updateDaysPerWeek: (daysPerWeek, now) => {
          assertDaysPerWeek(daysPerWeek);
          const timestamp = now ?? new Date();

          syncProfile({ daysPerWeek }, timestamp);

          const roadmap = get().roadmap;
          if (!roadmap) return;

          const progress = ensureProgress(roadmap, timestamp);
          const result = rescheduleRoadmap({
            roadmap,
            progress,
            daysPerWeek,
            now: timestamp,
            reason: "profile-change",
          });

          set({ roadmap: result.roadmap });
          useProgressStore.getState().replaceProgress(result.progress);
        },

        updateStartDate: (startDate, now) => {
          isoDateSchema.parse(startDate);
          const timestamp = now ?? new Date();

          syncProfile({ startDate }, timestamp);

          const roadmap = get().roadmap;
          if (!roadmap) return;

          const progress = ensureProgress(roadmap, timestamp);
          const result = rescheduleRoadmap({
            roadmap,
            progress,
            startDate,
            now: timestamp,
            reason: "profile-change",
          });

          set({ roadmap: result.roadmap });
          useProgressStore.getState().replaceProgress(result.progress);
        },

        resetRoadmap: () => {
          set({ roadmap: null });
          useProgressStore.getState().resetProgress();
          removePersistedKey(STORAGE_KEYS.roadmap);
        },
      };
    },
    {
      name: STORAGE_KEYS.roadmap,
      version: CURRENT_SCHEMA_VERSION,
      storage: roadmapStorage,
      skipHydration: true,
      partialize: (state) => ({ roadmap: state.roadmap }),
      merge: (persisted, current) => {
        const candidate = (persisted as { roadmap?: unknown } | null | undefined)
          ?.roadmap;
        if (candidate == null) return { ...current, roadmap: null };

        const parsed = roadmapSchema.safeParse(candidate);
        return { ...current, roadmap: parsed.success ? parsed.data : null };
      },
    }
  )
);

// Progress actions validate task ids against the active roadmap through this
// registry, which avoids a roadmap <-> progress import cycle.
registerRoadmapGetter(() => useRoadmapStore.getState().roadmap);
