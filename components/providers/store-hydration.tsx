"use client";

import { useStoresHydrated } from "@/lib/store";

/**
 * Renders nothing. Its only job is to load persisted state after the first
 * client render, keeping SSR/prerender output deterministic.
 */
export function StoreHydration() {
  useStoresHydrated();
  return null;
}
