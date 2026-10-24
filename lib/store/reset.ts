import { STORAGE_KEYS } from "@/lib/constants";

import { useProfileStore } from "./profile";
import { useProgressStore } from "./progress";
import { useRoadmapStore } from "./roadmap";
import { removePersistedKey } from "./storage";
import { useSettingsStore } from "./settings";

/**
 * Development/testing escape hatch: clear every PathPilot store and every
 * persisted key (including reserved keys for features that do not exist yet).
 */
export function resetAllLocalData(): void {
  useRoadmapStore.getState().resetRoadmap();
  useProgressStore.getState().resetProgress();
  useProfileStore.getState().clearProfile();
  useSettingsStore.getState().resetSettings();

  for (const key of Object.values(STORAGE_KEYS)) {
    removePersistedKey(key);
  }
}
