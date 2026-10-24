/**
 * Product-wide constants shared by schemas, catalogs and the roadmap engine.
 * Keeping them here prevents the generator, UI and validation from drifting.
 */

/** Every generated roadmap is 45 plan days long. */
export const ROADMAP_LENGTH_DAYS = 45;

/** Career templates are made of nine learning phases. */
export const PHASES_PER_CAREER = 9;

/** Each phase currently covers five plan days. */
export const DAYS_PER_PHASE = 5;

export const MIN_TASKS_PER_DAY = 3;
export const MAX_TASKS_PER_DAY = 6;

export const MIN_TASK_MINUTES = 5;

export const MIN_DAILY_MINUTES = 15;
export const MAX_DAILY_MINUTES = 480;
export const DEFAULT_DAILY_MINUTES = 90;

export const MIN_DAYS_PER_WEEK = 1;
export const MAX_DAYS_PER_WEEK = 7;
export const DEFAULT_DAYS_PER_WEEK = 5;

/** Bumped whenever the persisted client state shape changes. */
export const CURRENT_SCHEMA_VERSION = 1;

/** Default career used by demos and fallback flows. */
export const DEFAULT_CAREER_ID = "ai-engineer";

/** localStorage keys live here so stores and migrations agree. */
export const STORAGE_KEYS = {
  profile: "pathpilot.profile.v1",
  roadmap: "pathpilot.roadmap.v1",
  progress: "pathpilot.progress.v1",
  settings: "pathpilot.settings.v1",
  chat: "pathpilot.chat.v1",
  ui: "pathpilot.ui.v1",
} as const;
