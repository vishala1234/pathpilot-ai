import {
  DAYS_PER_PHASE,
  PHASES_PER_CAREER,
  ROADMAP_LENGTH_DAYS,
} from "@/lib/constants";
import { CAREERS_BY_ID, getCareer } from "@/lib/data/careers";
import { profileSchema } from "@/lib/schemas/profile";
import { roadmapSchema } from "@/lib/schemas/roadmap";
import type {
  Career,
  Day,
  Phase,
  Profile,
  ProfileInput,
  Roadmap,
  RoadmapSource,
  SkillGapAnalysis,
} from "@/types";

import { scheduleStudyDates, stableHash, startOfPlanTimestamp } from "./dates";
import { selectPhases } from "./phase-selection";
import { analyzeSkillGap } from "./skill-gap";
import { buildDayGoal, buildDayTasks, totalTaskMinutes } from "./task-builder";

export type GenerateRoadmapOptions = {
  /** Override the deterministic id (useful when importing a backup). */
  roadmapId?: string;
  /** Real wall-clock time for timestamps; omit for fully reproducible output. */
  now?: Date;
  version?: number;
  title?: string;
  source?: RoadmapSource;
};

function hasIdentity(profile: ProfileInput | Profile): profile is Profile {
  const candidate = profile as Partial<Profile>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3).trimEnd()}...`;
}

function padDay(index: number): string {
  return `d${String(index).padStart(3, "0")}`;
}

function generationSeed(profile: ProfileInput): string {
  const skills = [...profile.skills]
    .sort((a, b) => a.skillId.localeCompare(b.skillId))
    .map((skill) => `${skill.skillId}:${skill.level}`)
    .join(",");

  return [
    profile.targetCareerId,
    profile.startDate,
    profile.dailyMinutes,
    profile.daysPerWeek,
    profile.experienceLevel,
    skills,
    [...(profile.customSkills ?? [])].sort().join(","),
  ].join("|");
}

/**
 * Normalise either an onboarding input or a persisted profile into the
 * snapshot embedded in the roadmap. Timestamps default to the plan start date
 * so generation stays reproducible without a clock.
 */
export function buildProfileSnapshot(
  profile: ProfileInput | Profile,
  now?: Date
): Profile {
  const seed = generationSeed(profile);
  const fallbackTimestamp =
    now?.toISOString() ?? startOfPlanTimestamp(profile.startDate);

  if (hasIdentity(profile)) {
    return profileSchema.parse({
      ...profile,
      customSkills: profile.customSkills ?? [],
    });
  }

  return profileSchema.parse({
    ...profile,
    customSkills: profile.customSkills ?? [],
    id: `profile-${stableHash(`${seed}|profile`)}`,
    createdAt: fallbackTimestamp,
    updatedAt: fallbackTimestamp,
  });
}

function remapGapToRoadmapPhases(
  gap: SkillGapAnalysis,
  career: Career,
  phaseIdByTemplateId: Map<string, string>
): SkillGapAnalysis {
  return {
    ...gap,
    gaps: gap.gaps.map((entry) => ({
      ...entry,
      coveredInPhaseIds: entry.coveredInPhaseIds
        .map((templateId) => phaseIdByTemplateId.get(templateId))
        .filter((phaseId): phaseId is string => Boolean(phaseId)),
    })),
  };
}

/**
 * Build the complete 45-day plan from a profile.
 *
 * Fully deterministic: the same profile produces byte-identical roadmaps
 * (including ids and timestamps) unless `now` is supplied. This is the
 * fallback path whenever AI generation is unavailable.
 */
export function generateRoadmap(
  profile: ProfileInput | Profile,
  options: GenerateRoadmapOptions = {}
): Roadmap {
  const snapshot = buildProfileSnapshot(profile, options.now);
  const career = getCareer(snapshot.targetCareerId);

  if (!career) {
    throw new Error(
      `Unknown target career "${snapshot.targetCareerId}". Known careers: ${Object.keys(CAREERS_BY_ID).join(", ")}`
    );
  }

  const gap = analyzeSkillGap(career, snapshot.skills);
  const phasePlans = selectPhases(career, gap, snapshot.experienceLevel);

  if (phasePlans.length !== PHASES_PER_CAREER) {
    throw new Error(
      `Career "${career.id}" produced ${phasePlans.length} phases; expected ${PHASES_PER_CAREER}`
    );
  }

  const totalDays = phasePlans.reduce(
    (sum, plan) => sum + plan.phase.dayCount,
    0
  );
  if (totalDays !== ROADMAP_LENGTH_DAYS) {
    throw new Error(
      `Career "${career.id}" covers ${totalDays} days; expected ${ROADMAP_LENGTH_DAYS}`
    );
  }

  const dates = scheduleStudyDates(
    snapshot.startDate,
    snapshot.daysPerWeek,
    totalDays
  );

  const phaseIdByTemplateId = new Map(
    phasePlans.map((plan) => [plan.phase.id, plan.roadmapPhaseId])
  );

  const phases: Phase[] = phasePlans.map((plan) => ({
    id: plan.roadmapPhaseId,
    title: plan.phase.title,
    order: plan.phase.order,
    summary: plan.phase.summary,
    kind: plan.phase.kind,
    emphasis: plan.emphasis,
    skills: [...plan.phase.skills],
    dayIds: [],
  }));

  const days: Day[] = [];
  let dayIndex = 0;

  for (const plan of phasePlans) {
    if (plan.phase.dayCount !== DAYS_PER_PHASE) {
      throw new Error(
        `Phase "${plan.phase.id}" has ${plan.phase.dayCount} days; expected ${DAYS_PER_PHASE}`
      );
    }

    const phase = phases.find((entry) => entry.id === plan.roadmapPhaseId);
    if (!phase) {
      throw new Error(`Missing roadmap phase "${plan.roadmapPhaseId}"`);
    }

    for (let offset = 0; offset < plan.phase.dayCount; offset += 1) {
      dayIndex += 1;
      const dayId = padDay(dayIndex);
      const topic = plan.phase.topics[offset];
      if (!topic) {
        throw new Error(
          `Phase "${plan.phase.id}" is missing a topic for day ${offset + 1}`
        );
      }

      const tasks = buildDayTasks({
        dayId,
        topic,
        skillIds: plan.phase.skills,
        phaseKind: plan.phase.kind,
        emphasis: plan.emphasis,
        dailyMinutes: snapshot.dailyMinutes,
        allowOptional: snapshot.experienceLevel !== "beginner",
      });

      const day: Day = {
        id: dayId,
        index: dayIndex,
        phaseId: phase.id,
        title: truncate(topic, 120),
        topic,
        goal: buildDayGoal(topic, plan.phase.title, plan.emphasis),
        skills: [...plan.phase.skills],
        plannedDate: dates[dayIndex - 1] ?? null,
        estimatedMinutes: totalTaskMinutes(tasks),
        isProjectDay: plan.phase.kind === "project",
        tasks,
      };

      phase.dayIds.push(dayId);
      days.push(day);
    }
  }

  const seed = generationSeed(snapshot);
  const roadmapId = options.roadmapId ?? `roadmap-${stableHash(seed)}`;
  const createdAt = options.now?.toISOString() ?? startOfPlanTimestamp(snapshot.startDate);

  const roadmap: Roadmap = {
    id: roadmapId,
    title: options.title ?? `${career.title} · 45-Day Roadmap`,
    careerId: career.id,
    careerTitle: career.title,
    profileSnapshot: snapshot,
    version: options.version ?? 1,
    source: options.source ?? "fallback",
    createdAt,
    startDate: snapshot.startDate,
    dailyMinutes: snapshot.dailyMinutes,
    totalDays: days.length,
    totalMinutes: days.reduce((sum, day) => sum + day.estimatedMinutes, 0),
    skillGap: remapGapToRoadmapPhases(gap, career, phaseIdByTemplateId),
    phases,
    days,
  };

  return roadmapSchema.parse(roadmap);
}
