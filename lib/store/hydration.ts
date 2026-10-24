"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useProfileStore } from "./profile";
import { useProgressStore } from "./progress";
import { useRoadmapStore } from "./roadmap";
import { useSettingsStore } from "./settings";

/**
 * Hydration is explicit. All stores use `skipHydration: true`, so the server
 * and the first client render always see the same empty/default state. A
 * client-only effect then loads localStorage, which avoids Next.js hydration
 * mismatches and never touches browser APIs during prerender.
 */

let hydrated = false;
const hydrationListeners = new Set<() => void>();

function setHydrated(value: boolean): void {
  if (hydrated === value) return;
  hydrated = value;
  for (const listener of hydrationListeners) listener();
}

function subscribeToHydration(listener: () => void): () => void {
  hydrationListeners.add(listener);
  return () => {
    hydrationListeners.delete(listener);
  };
}

export function areStoresHydrated(): boolean {
  return hydrated;
}

/**
 * Keep profile, roadmap and progress consistent after loading. A persisted
 * roadmap without progress gets a fresh log; orphan progress is discarded.
 */
export function reconcileStores(): void {
  const roadmap = useRoadmapStore.getState().roadmap;
  const progressStore = useProgressStore.getState();
  const progress = progressStore.progress;

  if (!roadmap) {
    if (progress) progressStore.resetProgress();
    return;
  }

  if (!progress || progress.roadmapId !== roadmap.id) {
    progressStore.startForRoadmap(roadmap.id);
  }
}

/** Load every store from localStorage. Safe to call more than once. */
export async function rehydrateStores(): Promise<void> {
  await Promise.all([
    useProfileStore.persist.rehydrate(),
    useRoadmapStore.persist.rehydrate(),
    useProgressStore.persist.rehydrate(),
    useSettingsStore.persist.rehydrate(),
  ]);

  reconcileStores();
  setHydrated(true);
}

/** Alias used by the provider component. */
export const hydrateStores = rehydrateStores;

/**
 * `true` once localStorage has been read (or found to be unavailable).
 * Uses an external-store subscription so hydration does not cascade renders.
 */
export function useStoresHydrated(): boolean {
  const value = useSyncExternalStore(
    subscribeToHydration,
    areStoresHydrated,
    () => false
  );

  useEffect(() => {
    if (!areStoresHydrated()) {
      void rehydrateStores();
    }
  }, []);

  return value;
}
