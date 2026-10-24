import type {
  Career,
  ExperienceLevel,
  PhaseEmphasis,
  PhaseTemplate,
  SkillGapAnalysis,
} from "@/types";

export type PhasePlan = {
  phase: PhaseTemplate;
  /** Roadmap-scoped id: `${careerId}-${templatePhaseId}`. */
  roadmapPhaseId: string;
  emphasis: PhaseEmphasis;
  /** Higher means the phase closes more urgent gaps. Used for ordering/UI. */
  priorityScore: number;
  /** Skills in this phase that the student is still missing. */
  focusSkillIds: string[];
  /** True when every skill in the phase already meets the required level. */
  allSkillsMet: boolean;
};

const PHASE_KIND_BONUS: Record<PhaseTemplate["kind"], number> = {
  foundation: 1.2,
  tools: 1,
  core: 1.1,
  advanced: 0.9,
  project: 0.8,
  interview: 0.7,
};

/**
 * Choose and adapt the nine career phases for a student.
 *
 * The 45-day contract (9 phases × 5 days) means every catalog phase is used.
 * "Selection" therefore decides *how* each phase is taught: which phases carry
 * remedial focus, which are revision-only, and which stay balanced. The result
 * always contains all nine phases in prerequisite order.
 */
export function selectPhases(
  career: Career,
  gap: SkillGapAnalysis,
  experienceLevel: ExperienceLevel
): PhasePlan[] {
  const requiredBySkill = new Map(
    career.coreSkills.map((skill) => [skill.skillId, skill])
  );
  const gapBySkill = new Map(gap.gaps.map((entry) => [entry.skillId, entry]));

  const plans = career.phases.map((phase) => {
    const focusSkillIds: string[] = [];
    let priorityScore = 0;
    let criticalCount = 0;
    let metCount = 0;

    for (const skillId of phase.skills) {
      const required = requiredBySkill.get(skillId);
      const gapEntry = gapBySkill.get(skillId);

      if (gapEntry) {
        focusSkillIds.push(skillId);
        const weight = required?.importance === "core" ? 1 : required ? 0.5 : 0.25;
        priorityScore += gapEntry.gap * weight;
        if (gapEntry.priority === "critical") criticalCount += 1;
      } else if (required) {
        metCount += 1;
        priorityScore += 0.25 * (required.importance === "core" ? 1 : 0.5);
      }
    }

    priorityScore *= PHASE_KIND_BONUS[phase.kind];
    const allSkillsMet = focusSkillIds.length === 0 && metCount > 0;

    let emphasis: PhaseEmphasis = "balanced";
    if (criticalCount > 0) {
      emphasis = "focus";
    } else if (allSkillsMet) {
      emphasis = "review";
    } else if (
      experienceLevel === "advanced" &&
      (phase.kind === "foundation" || phase.kind === "tools")
    ) {
      // Advanced students still visit the foundations, but at revision pace.
      emphasis = "review";
    } else if (
      experienceLevel === "beginner" &&
      (phase.kind === "foundation" || phase.kind === "core")
    ) {
      emphasis = "focus";
    }

    return {
      phase,
      roadmapPhaseId: `${career.id}-${phase.id}`,
      emphasis,
      priorityScore: Math.round(priorityScore * 100) / 100,
      focusSkillIds,
      allSkillsMet,
    } satisfies PhasePlan;
  });

  return plans.sort((a, b) => a.phase.order - b.phase.order);
}

/** Phases ranked by how urgently they close gaps, highest first. */
export function rankPhasesByPriority(plans: PhasePlan[]): PhasePlan[] {
  return [...plans].sort(
    (a, b) =>
      b.priorityScore - a.priorityScore || a.phase.order - b.phase.order
  );
}

/** Skills that at least one selected phase will actively remediate. */
export function getTargetedSkillIds(plans: PhasePlan[]): string[] {
  return [...new Set(plans.flatMap((plan) => plan.focusSkillIds))];
}
