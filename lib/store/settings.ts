import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from "@/lib/constants";
import { settingsSchema } from "@/lib/schemas/settings";
import type { Settings, ThemePreference } from "@/types";

import { createSafePersistStorage, removePersistedKey } from "./storage";

export type SettingsStore = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => Settings;
  setTheme: (theme: ThemePreference) => void;
  resetSettings: () => void;
};

function defaultSettings(): Settings {
  return settingsSchema.parse({});
}

const settingsStorage = createSafePersistStorage<Pick<SettingsStore, "settings">>();

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings(),

      updateSettings: (patch) => {
        const settings = settingsSchema.parse({ ...get().settings, ...patch });
        set({ settings });
        return settings;
      },

      setTheme: (theme) => {
        get().updateSettings({ theme });
      },

      resetSettings: () => {
        set({ settings: defaultSettings() });
        removePersistedKey(STORAGE_KEYS.settings);
      },
    }),
    {
      name: STORAGE_KEYS.settings,
      version: CURRENT_SCHEMA_VERSION,
      storage: settingsStorage,
      skipHydration: true,
      partialize: (state) => ({ settings: state.settings }),
      merge: (persisted, current) => {
        const candidate = (
          persisted as { settings?: unknown } | null | undefined
        )?.settings;
        if (candidate == null) {
          return { ...current, settings: defaultSettings() };
        }

        const parsed = settingsSchema.safeParse(candidate);
        return {
          ...current,
          settings: parsed.success ? parsed.data : defaultSettings(),
        };
      },
    }
  )
);
