import type { Roadmap } from "@/types";

/**
 * Avoids a circular import between the roadmap and progress stores.
 *
 * The roadmap store registers a getter when it loads. The progress store only
 * needs "the current roadmap" to validate task ids, so a tiny registry is
 * simpler (and easier to reason about) than mutual imports.
 */
type RoadmapGetter = () => Roadmap | null;

let roadmapGetter: RoadmapGetter | null = null;

export function registerRoadmapGetter(getter: RoadmapGetter): void {
  roadmapGetter = getter;
}

export function getRegisteredRoadmap(): Roadmap | null {
  return roadmapGetter?.() ?? null;
}

export function requireRegisteredRoadmap(): Roadmap {
  const roadmap = getRegisteredRoadmap();
  if (!roadmap) {
    throw new Error(
      "No roadmap is loaded. Create or restore a roadmap before changing task completion."
    );
  }
  return roadmap;
}
