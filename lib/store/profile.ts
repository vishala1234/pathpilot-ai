import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from "@/lib/constants";
import { buildProfileSnapshot } from "@/lib/engine";
import { profileSchema } from "@/lib/schemas/profile";
import type { Profile, ProfileInput } from "@/types";

import { createSafePersistStorage, removePersistedKey } from "./storage";

export type ProfileStore = {
  /** `null` until onboarding is finished (or until hydration restores it). */
  profile: Profile | null;
  /**
   * Save a new profile. Accepts raw onboarding input or an existing profile;
   * ids and timestamps are normalised by the engine.
   */
  saveProfile: (input: ProfileInput | Profile, now?: Date) => Profile;
  /** Patch an existing profile and keep its identity stable. */
  updateProfile: (patch: Partial<ProfileInput>, now?: Date) => Profile | null;
  clearProfile: () => void;
};

const profileStorage = createSafePersistStorage<Pick<ProfileStore, "profile">>();

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,

      saveProfile: (input, now) => {
        const profile = buildProfileSnapshot(input, now);
        set({ profile });
        return profile;
      },

      updateProfile: (patch, now) => {
        const current = get().profile;
        if (!current) return null;

        const profile = profileSchema.parse({
          ...current,
          ...patch,
          // Identity and creation time never change through an edit.
          id: current.id,
          createdAt: current.createdAt,
          updatedAt: (now ?? new Date()).toISOString(),
        });

        set({ profile });
        return profile;
      },

      clearProfile: () => {
        set({ profile: null });
        removePersistedKey(STORAGE_KEYS.profile);
      },
    }),
    {
      name: STORAGE_KEYS.profile,
      version: CURRENT_SCHEMA_VERSION,
      storage: profileStorage,
      // Rehydrated explicitly on the client so SSR always renders defaults.
      skipHydration: true,
      partialize: (state) => ({ profile: state.profile }),
      merge: (persisted, current) => {
        const candidate = (persisted as { profile?: unknown } | null | undefined)
          ?.profile;
        if (candidate == null) return { ...current, profile: null };

        const parsed = profileSchema.safeParse(candidate);
        return { ...current, profile: parsed.success ? parsed.data : null };
      },
    }
  )
);
