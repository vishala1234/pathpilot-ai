import { SKILLS_BY_ID } from "@/lib/data/skills";
import type {
  Career,
  SkillAssessment,
  SkillGapAnalysis,
  SkillGapEntry,
  SkillStrength,
} from "@/types";

/** Higher weight means a bigger contribution to readiness. */
export const IMPORTANCE_WEIGHT = {
  core: 1,
  supporting: 0.5,
  bonus: 0.25,
} as const;

const PRIORITY_ORDER = { critical: 0, important: 1, optional: 2 } as const;

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampLevel(level: number): 0 | 1 | 2 | 3 {
  if (level <= 0) return 0;
  if (level >= 3) return 3;
  return Math.round(level) as 1 | 2;
}

function pickPriority(
  importance: keyof typeof IMPORTANCE_WEIGHT,
  gap: number
): SkillGapEntry["priority"] {
  if (importance === "core") {
    return gap >= 2 ? "critical" : "important";
  }
  if (importance === "supporting") {
    return gap >= 2 ? "important" : "optional";
  }
  return "optional";
}

/**
 * Compare a student's self-assessed skills against a career template.
 *
 * This is deliberately deterministic — the AI never decides what a student is
 * missing. Tie-breaking is stable so the same inputs always produce the same
 * output, which keeps generated roadmaps reproducible.
 */
export function analyzeSkillGap(
  career: Career,
  assessments: SkillAssessment[]
): SkillGapAnalysis {
  const currentLevels = new Map<string, 0 | 1 | 2 | 3>();
  for (const assessment of assessments) {
    const previous = currentLevels.get(assessment.skillId) ?? 0;
    currentLevels.set(assessment.skillId, clampLevel(Math.max(previous, assessment.level)));
  }

  const phasesBySkill = new Map<string, string[]>();
  for (const phase of career.phases) {
    for (const skillId of phase.skills) {
      const phaseIds = phasesBySkill.get(skillId) ?? [];
      phaseIds.push(phase.id);
      phasesBySkill.set(skillId, phaseIds);
    }
  }

  const gaps: SkillGapEntry[] = [];
  const strengths: SkillStrength[] = [];

  let weightedRequired = 0;
  let weightedAchieved = 0;

  for (const required of career.coreSkills) {
    const skill = SKILLS_BY_ID[required.skillId];
    const name = skill?.name ?? required.skillId;
    const currentLevel = currentLevels.get(required.skillId) ?? 0;
    const requiredLevel = required.requiredLevel;
    const weight = IMPORTANCE_WEIGHT[required.importance];

    const coverage =
      requiredLevel === 0 ? 1 : Math.min(currentLevel / requiredLevel, 1);
    weightedRequired += weight;
    weightedAchieved += weight * coverage;

    if (currentLevel >= requiredLevel) {
      strengths.push({
        skillId: required.skillId,
        name,
        level: currentLevel,
      });
      continue;
    }

    const gap = (requiredLevel - currentLevel) as 1 | 2 | 3;

    gaps.push({
      skillId: required.skillId,
      name,
      category: skill?.category ?? "professional",
      importance: required.importance,
      requiredLevel,
      currentLevel,
      gap,
      priority: pickPriority(required.importance, gap),
      coveredInPhaseIds: phasesBySkill.get(required.skillId) ?? [],
    });
  }

  gaps.sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (byPriority !== 0) return byPriority;
    if (b.gap !== a.gap) return b.gap - a.gap;
    const byImportance =
      IMPORTANCE_WEIGHT[b.importance] - IMPORTANCE_WEIGHT[a.importance];
    if (byImportance !== 0) return byImportance;
    return a.name.localeCompare(b.name);
  });

  strengths.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return a.name.localeCompare(b.name);
  });

  const readinessPercent =
    weightedRequired === 0 ? 100 : roundOneDecimal((weightedAchieved / weightedRequired) * 100);

  return {
    careerId: career.id,
    targetCareerTitle: career.title,
    readinessPercent,
    totalRequiredSkills: career.coreSkills.length,
    metSkills: strengths.length,
    gaps,
    strengths,
  };
}

/** Skills still missing, most urgent first. */
export function getCriticalGaps(analysis: SkillGapAnalysis): SkillGapEntry[] {
  return analysis.gaps.filter((gap) => gap.priority === "critical");
}

/** Phase ids that close at least one remaining gap, in template order. */
export function getGapPhaseIds(
  analysis: SkillGapAnalysis,
  career: Career
): string[] {
  const needed = new Set(
    analysis.gaps.flatMap((gap) => gap.coveredInPhaseIds)
  );
  return career.phases
    .map((phase) => phase.id)
    .filter((phaseId) => needed.has(phaseId));
}
