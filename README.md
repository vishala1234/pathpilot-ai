# PathPilot AI

An AI career copilot for college students. Tell it your education, current
skills, target career and available study time — it builds a personalized
45-day roadmap and turns it into day-wise tasks you can check off.

**Status: Step 6 complete** — full feature layer: `/projects` filtered by
career/level, `/assistant` with Groq integration and deterministic fallback,
`/dashboard` with derived progress/today's plan, `/settings` for schedule/theme/data
with confirmation dialogs. AI suggestions only, never auto-mutate taskStatus or
roadmap. Groq key server-side only via env vars. No auth/database.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui (Base UI primitives) + lucide-react |
| State | Zustand + `persist` (localStorage) — Step 3 |
| Forms / validation | react-hook-form + Zod — used from Step 1 |
| Charts | Recharts — used from Step 8 (dashboard) |
| AI | Groq (OpenAI-compatible), server-side route handlers — Step 9 |
| Deploy | Vercel |

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

```bash
npm run build          # production build
npm start              # serve the production build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run test           # engine, state-layer and onboarding tests (node:test)
npm run validate:data  # check the career/skill/project catalogs
npm run check          # validate + typecheck + lint + test + build
```

## Environment variables

AI features are optional. Copy the example file and add your Groq key if you
want AI responses:

```bash
cp .env.example .env.local
```

```
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant  # optional
```

Keys are read only in server route handlers — never expose them with a
`NEXT_PUBLIC_` prefix. If no key is present, the assistant uses a deterministic
fallback. The app builds and runs fully without Groq.

## Project structure

```
app/
  layout.tsx                 root layout: fonts, providers, app shell
  page.tsx                   landing page
  onboarding/                student profile wizard        (Step 4)
  roadmap/                   45-day roadmap overview       (Step 5)
  roadmap/day/[dayId]/       day view with task checkboxes (Step 6)
  dashboard/                 career readiness dashboard    (Step 8)
  projects/                  project recommendations       (Step 12)
  assistant/                 career assistant              (Step 11)
  settings/                  profile and data              (Step 7)
  icon.svg                   app icon
  globals.css                design tokens + Tailwind theme

components/
  layout/                    app shell, top nav, mobile tabs, footer, page header
  marketing/                 landing page hero preview
  ui/                        shadcn/ui primitives
  onboarding/ roadmap/ day/ dashboard/ projects/ assistant/ progress/
                             reserved for feature components
  onboarding/                wizard, step panels, progress, shared fields

lib/
  nav.ts                     navigation definition (single source of truth)
  utils.ts                   cn() helper
  constants.ts               roadmap length, limits, storage keys
  schemas/                   Zod schemas (source of truth for all data)
  data/                      skills, careers, projects, task templates
  engine/                    deterministic engines: skill gap, roadmap, progress, replan
  store/                     Zustand stores, persistence, selectors and hooks
  onboarding/                wizard steps, draft, validation, review, build
  ai/                        reserved for later steps

types/                       inferred TypeScript domain types
scripts/validate-data.ts     catalog integrity checker
hooks/                       custom hooks
```

## Domain foundation

Data flows one way: **Zod schema → inferred type → catalog → engine**.

- `lib/schemas/*` defines the shape of every domain object and the cross-field
  rules (phase topics must match `dayCount`, roadmap days must reference real
  phases, a career must teach every skill it requires).
- `types/*` only re-exports `z.infer` aliases, so runtime and compile-time
  shapes can never drift.
- `lib/data/skills.ts` holds **83 skills** across eight categories.
- `lib/data/careers.ts` holds **8 career tracks**, each with a description,
  core skills and required levels, nine phases and **45 day-topics**
  (9 × 5).
- `lib/data/projects.ts` holds **16 portfolio projects**, at least two per
  career, tagged by level and skills.
- `lib/data/task-templates.ts` turns any phase topic into a realistic task
  set, plus a fully-formed sample day. This is the fallback path when AI is
  unavailable or offline.
- `lib/engine/skill-gap.ts` compares a profile's skills with a career
  template. Importance is weighted (core 1, supporting 0.5, bonus 0.25) and
  every result is deterministic — the AI never decides what is missing.

`npm run validate:data` checks unique ids, schema conformance, catalog
cross-references, phase sequencing, 45-day coverage and task weights.

## Roadmap engine

`lib/engine/` is pure and deterministic. There is no AI, clock or randomness on
the default path — the same profile always produces a byte-identical roadmap.

1. **Profile snapshot** — accepts onboarding input or a persisted profile and
   normalises it (ids and timestamps default to `startDate`, so output is
   reproducible).
2. **Skill gap** — `analyzeSkillGap` compares the profile with the career's
   required skills. The AI never decides what is missing.
3. **Phase adaptation** — all nine career phases are kept (the 45-day contract),
   but each gets an emphasis: `focus` for urgent gaps, `review` when skills are
   already met or the student is advanced, otherwise `balanced`. Task mix and
   minute allocation shift accordingly.
4. **Day + task generation** — every phase contributes five days, one catalog
   topic each. `buildDayTasks` uses phase-kind blueprints (foundation, tools,
   core, advanced, project, interview) split across the student's
   `dailyMinutes` exactly. Each task gets a stable id (`d003-t2`), title,
   description, type, minutes, topic and related skills. Beginners get only
   required work; everyone else may get optional stretch tasks.
5. **Calendar placement** — `scheduleStudyDates` puts plan days on study days
   using `daysPerWeek`; plan day 1 is always `startDate`.
6. **Progress** — `calculateProgress` derives every number from
   `progress.taskStatus`. A day is complete only when all of its tasks are
   done. Percentages, minutes and streaks are computed, never stored.
7. **Replanning** — `rebalanceRoadmap` rebuilds unprotected days for a new daily
   budget, leaves any day with completed work byte-identical, bumps the roadmap
   version and appends a `ReplanEvent` to history.

`npm run test` covers the plan contract (45 days, 9 × 5 phases, one topic per
day), task ids and fields, daily minute limits, calendar placement, determinism,
derived progress and completed-day protection.

## State layer

The client state lives in `lib/store/` and is intentionally split by concern:

| Store | Persisted | Owns |
| --- | --- | --- |
| `useProfileStore` | `pathpilot.profile.v1` | student profile + edits |
| `useRoadmapStore` | `pathpilot.roadmap.v1` | roadmap, creation, replans, study settings |
| `useProgressStore` | `pathpilot.progress.v1` | `taskStatus` only |
| `useSettingsStore` | `pathpilot.settings.v1` | theme + UI preferences |

**Progress is never stored twice.** `useProgressStore` keeps raw task
completions; overall, day, phase and streak values are recomputed from
`taskStatus` with the Step 2 engine. `lib/store/selectors.ts` exposes pure
read-only selectors (`getProgressSummary`, `getTodayPlan`, `getCompletedDays`,
`getPhaseProgressFor`, `getRoadmapVersion`, …) and `lib/store/hooks.ts` wraps
them in memoised React hooks.

Study settings stay on the profile/roadmap rather than in the settings store:

- `updateDailyMinutes` → profile + `rebalanceRoadmap` (unstarted days rebuilt,
  completed days protected).
- `updateDaysPerWeek` / `updateStartDate` → profile + `rescheduleRoadmap`
  (calendar dates move, task lists and completions stay byte-identical).
- `resetRoadmap` clears the roadmap and progress but keeps the profile;
  `resetAllLocalData` clears every store and every PathPilot key.

Persistence is browser-only and hydration-safe: every store uses
`skipHydration: true`, so server/prerender output and the first client render
show the same defaults. `StoreHydration` (a null-rendering client component in
the root providers) calls `rehydrateStores()` after mount, which also
reconciles orphan roadmap/progress pairs. The custom persist storage resolves
`localStorage` lazily, validates persisted data with the same Zod schemas, and
silently drops corrupt or unavailable storage.

`npm run test` also covers store initialization, profile/roadmap persistence
across a simulated refresh, task completion, derived progress, settings updates,
reset behavior and hydration safety with missing/corrupt storage.

## Onboarding

`/onboarding` renders a client-side wizard with ten ordered steps:

1. Welcome (name + education)
2. Target career — all eight catalog careers, exactly one selection
3. Current skills — all 83 catalog skills, searchable, zero allowed
4. Proficiency — Basics / Working / Strong for each selected skill
5. Experience level
6. Daily study minutes (presets plus a custom 15–480 field)
7. Study days per week (1–7)
8. Start date
9. Review — profile, schedule and deterministic skill-gap summary
10. Build — generates the roadmap

`lib/onboarding/` keeps the flow typed and testable:

- `steps.ts` — canonical step order, next/previous and progress helpers.
- `draft.ts` — the in-progress answer sheet and pure update helpers; answers
  survive back/forward navigation.
- `validation.ts` — per-step Zod validation plus `toProfileInput`, which parses
  the complete draft with the same `profileInputSchema` the stores use.
- `review.ts` — derived review data and schedule summary from
  `analyzeSkillGap` + `scheduleStudyDates`; no AI.
- `build.ts` — the single build path: validate → protect existing plan → save
  profile via `useProfileStore` → `useRoadmapStore.createRoadmap`, which also
  initialises progress. No generation logic is duplicated in the UI.

**Existing plans are protected.** If a roadmap is already stored, the wizard
shows a continue/replace screen first, and `buildRoadmapFromDraft` throws a
typed `ExistingRoadmapError` unless `replaceExisting: true` is passed. The UI
only sets that flag after the student confirms in a dialog that names how many
completed tasks and days would be lost.

`npm run test` covers initial state, navigation, required-field validation,
career and skill selection, proficiency, study preferences, review data,
successful generation, profile persistence across refresh, navigation to
`/roadmap` and existing-roadmap protection.

## Design system

- Warm paper background with a forest-green primary and a fresh green success
  color used for completed tasks and days.
- Geist for UI text, Instrument Serif for display headings.
- Light and dark themes via `next-themes`; toggle in the top-right.
- All shadcn variables live in `app/globals.css`.

## Build plan

| Step | Scope | Status |
| --- | --- | --- |
| 0 | Scaffold, Tailwind, shadcn, folder structure, nav shell | ✅ |
| 1 | Domain types, Zod schemas, career/skill seed catalog | ✅ |
| 2 | Deterministic roadmap generator, scheduling, progress math | ✅ |
| 3 | Zustand stores + localStorage persistence | ✅ |
| 4 | Onboarding wizard | ✅ |
| 5 | Roadmap overview + task completion | ✅ |
| 6 | Projects, Assistant, Dashboard, Settings + AI integration | ✅ |
| 7 | Persistence hardening (reload, reset, export) | |
| 8 | Readiness dashboard | |
| 9 | Groq AI generation with template fallback | |
| 10 | Replanning when tasks are missed | |
| 11 | Career assistant | |
| 12 | Project recommendations | |
| 13 | Polish, mobile pass, deploy | |

## Notes

- Progress is stored locally in the browser. No account, no backend.
- Persisted keys are versioned (`pathpilot.*.v1`); bump
  `CURRENT_SCHEMA_VERSION` when a store shape changes.
- The project lives inside a OneDrive folder — if the dev server starts
  missing file changes, exclude the folder from OneDrive sync or pause sync.
