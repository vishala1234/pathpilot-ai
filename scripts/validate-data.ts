/**
 * Catalog integrity check. Runs outside Next.js so content errors fail fast
 * instead of surfacing at runtime. Run with `npm run validate:data`.
 */
import {
  DAYS_PER_PHASE,
  PHASES_PER_CAREER,
  ROADMAP_LENGTH_DAYS,
} from "../lib/constants";
import { CAREERS } from "../lib/data/careers";
import { PROJECTS } from "../lib/data/projects";
import { SKILLS } from "../lib/data/skills";
import {
  PHASE_TASK_BLUEPRINTS,
  SAMPLE_TEMPLATE_DAY,
} from "../lib/data/task-templates";
import { careerSchema } from "../lib/schemas/career";
import { daySchema } from "../lib/schemas/roadmap";
import { projectSchema } from "../lib/schemas/project";
import { skillSchema } from "../lib/schemas/skill";

const errors: string[] = [];
const warnings: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function warn(message: string) {
  warnings.push(message);
}

function checkUniqueIds(
  label: string,
  items: { id: string }[]
) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      fail(`${label}: duplicate id "${item.id}"`);
    }
    seen.add(item.id);
  }
}

function reportZodIssues(
  label: string,
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }
) {
  if (result.success || !result.error) return;
  for (const issue of result.error.issues) {
    const path = issue.path.length > 0 ? `.${issue.path.join(".")}` : "";
    fail(`${label}${path}: ${issue.message}`);
  }
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
checkUniqueIds("skills", SKILLS);

for (const skill of SKILLS) {
  reportZodIssues(`skill "${skill.id}"`, skillSchema.safeParse(skill));
}

const skillIds = new Set(SKILLS.map((skill) => skill.id));
const aliasOwners = new Map<string, string>();
for (const skill of SKILLS) {
  for (const alias of skill.aliases) {
    const key = alias.toLowerCase();
    const owner = aliasOwners.get(key);
    if (owner && owner !== skill.id) {
      fail(
        `skills: alias "${alias}" is used by both "${owner}" and "${skill.id}"`
      );
    }
    aliasOwners.set(key, skill.id);
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
checkUniqueIds("projects", PROJECTS);

for (const project of PROJECTS) {
  reportZodIssues(
    `project "${project.id}"`,
    projectSchema.safeParse(project)
  );

  for (const careerId of project.careerIds) {
    if (!CAREERS.some((career) => career.id === careerId)) {
      fail(`project "${project.id}": unknown careerId "${careerId}"`);
    }
  }
  for (const skillId of project.skills) {
    if (!skillIds.has(skillId)) {
      fail(`project "${project.id}": unknown skill "${skillId}"`);
    }
  }
}

const referencedProjectIds = new Set(
  CAREERS.flatMap((career) => career.projectIds)
);
for (const project of PROJECTS) {
  if (!referencedProjectIds.has(project.id)) {
    warn(`project "${project.id}" is not referenced by any career`);
  }
}

// ---------------------------------------------------------------------------
// Careers
// ---------------------------------------------------------------------------
checkUniqueIds("careers", CAREERS);

for (const career of CAREERS) {
  reportZodIssues(
    `career "${career.id}"`,
    careerSchema.safeParse(career)
  );

  if (career.phases.length !== PHASES_PER_CAREER) {
    fail(
      `career "${career.id}": expected ${PHASES_PER_CAREER} phases, found ${career.phases.length}`
    );
  }

  const totalDays = career.phases.reduce(
    (sum, phase) => sum + phase.dayCount,
    0
  );
  if (totalDays !== ROADMAP_LENGTH_DAYS) {
    fail(
      `career "${career.id}": phases cover ${totalDays} days, expected ${ROADMAP_LENGTH_DAYS}`
    );
  }

  const phaseIds = new Set<string>();
  for (const phase of career.phases) {
    if (phaseIds.has(phase.id)) {
      fail(`career "${career.id}": duplicate phase id "${phase.id}"`);
    }
    phaseIds.add(phase.id);

    if (phase.dayCount !== DAYS_PER_PHASE) {
      fail(
        `career "${career.id}" phase "${phase.id}": ${phase.dayCount} days (expected ${DAYS_PER_PHASE})`
      );
    }
    if (phase.topics.length !== phase.dayCount) {
      fail(
        `career "${career.id}" phase "${phase.id}": ${phase.topics.length} topics for ${phase.dayCount} days`
      );
    }

    for (const skillId of phase.skills) {
      if (!skillIds.has(skillId)) {
        fail(
          `career "${career.id}" phase "${phase.id}": unknown skill "${skillId}"`
        );
      }
    }
  }

  for (const required of career.coreSkills) {
    if (!skillIds.has(required.skillId)) {
      fail(`career "${career.id}": unknown core skill "${required.skillId}"`);
    }
    if (required.requiredLevel === 0) {
      fail(
        `career "${career.id}": core skill "${required.skillId}" has requiredLevel 0`
      );
    }
  }

  if (career.projectIds.length < 2) {
    fail(`career "${career.id}": expected at least 2 projects`);
  }
  for (const projectId of career.projectIds) {
    if (!PROJECTS.some((project) => project.id === projectId)) {
      fail(`career "${career.id}": unknown project "${projectId}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Task templates + sample day
// ---------------------------------------------------------------------------
const phaseKinds = Object.keys(PHASE_TASK_BLUEPRINTS) as Array<
  keyof typeof PHASE_TASK_BLUEPRINTS
>;

for (const kind of phaseKinds) {
  const blueprints = PHASE_TASK_BLUEPRINTS[kind];
  if (blueprints.length < 3 || blueprints.length > 6) {
    fail(`task templates "${kind}": expected 3–6 tasks, found ${blueprints.length}`);
  }

  const total = blueprints.reduce((sum, blueprint) => sum + blueprint.share, 0);
  if (Math.abs(total - 1) > 1e-9) {
    fail(`task templates "${kind}": shares total ${total}, expected 1`);
  }

  for (const blueprint of blueprints) {
    if (!blueprint.title.includes("{topic}")) {
      warn(
        `task templates "${kind}": "${blueprint.title}" does not use {topic}`
      );
    }
  }
}

reportZodIssues("sample day", daySchema.safeParse(SAMPLE_TEMPLATE_DAY));

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const summary = [
  `${SKILLS.length} skills`,
  `${CAREERS.length} careers`,
  `${PROJECTS.length} projects`,
  `${CAREERS.length * ROADMAP_LENGTH_DAYS} template plan days`,
].join(" · ");

for (const message of warnings) {
  console.warn(`⚠ ${message}`);
}

if (errors.length > 0) {
  console.error(`\n✗ Catalog validation failed (${errors.length}):`);
  for (const message of errors) {
    console.error(`  - ${message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`✓ Catalog valid — ${summary}`);
  if (warnings.length > 0) {
    console.log(`  ${warnings.length} warning(s)`);
  }
}
