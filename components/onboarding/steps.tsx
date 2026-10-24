"use client";

import {
  addDays,
  format,
  nextMonday,
} from "date-fns";
import {
  ArrowLeftRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  GraduationCapIcon,
  LoaderCircleIcon,
  RocketIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TargetIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CAREERS } from "@/lib/data/careers";
import { SKILLS_BY_CATEGORY, SKILLS_BY_ID } from "@/lib/data/skills";
import {
  DAILY_MINUTES_HELP,
  DAILY_MINUTES_OPTIONS,
  DAYS_PER_WEEK_OPTIONS,
  EXPERIENCE_OPTIONS,
  PROFICIENCY_OPTIONS,
  buildSchedule,
  formatDailyMinutes,
  formatReviewDate,
  formatShortReviewDate,
  formatStudyDays,
  getProficiencyLabel,
  type EducationDraft,
  type FieldErrors,
  type OnboardingDraft,
  type ReviewData,
} from "@/lib/onboarding";
import { SKILL_CATEGORY_LABELS } from "@/lib/schemas/skill";
import type { Proficiency, SkillCategory } from "@/types";
import { cn } from "@/lib/utils";

import { FieldError, FieldHint, StepErrorSummary, StepIntro } from "./field";

type StepProps = {
  draft: OnboardingDraft;
  errors: FieldErrors;
  stepId: string;
};

const YEAR_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
const SKILL_CATEGORIES = Object.keys(SKILLS_BY_CATEGORY) as SkillCategory[];

function optionCardClass(selected: boolean): string {
  return cn(
    "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors",
    "hover:border-primary/40 hover:bg-accent/40",
    "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
    selected && "border-primary/60 bg-primary/5 hover:bg-primary/5"
  );
}

export function WelcomeStep({
  draft,
  errors,
  stepId,
  onPatch,
  onEducation,
}: StepProps & {
  onPatch: (patch: Partial<OnboardingDraft>) => void;
  onEducation: (patch: Partial<EducationDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <StepIntro
        title="Welcome aboard"
        description="Before we draw the map, tell us where you study. This details your roadmap header and lets the plan speak to your level — it stays on this device."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="student-name">
            Your name{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="student-name"
            value={draft.name}
            onChange={(event) => onPatch({ name: event.target.value })}
            placeholder="e.g. Asha Rao"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "student-name-error" : undefined}
          />
          <FieldError id="student-name-error" message={errors.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="degree">Degree</Label>
          <Input
            id="degree"
            value={draft.education.degree}
            onChange={(event) => onEducation({ degree: event.target.value })}
            placeholder="e.g. B.Tech"
            aria-invalid={Boolean(errors["education.degree"])}
            aria-describedby={
              errors["education.degree"] ? "degree-error" : undefined
            }
          />
          <FieldError
            id="degree-error"
            message={errors["education.degree"]}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branch">Branch / major</Label>
          <Input
            id="branch"
            value={draft.education.branch}
            onChange={(event) => onEducation({ branch: event.target.value })}
            placeholder="e.g. Computer Science"
            aria-invalid={Boolean(errors["education.branch"])}
            aria-describedby={
              errors["education.branch"] ? "branch-error" : undefined
            }
          />
          <FieldError
            id="branch-error"
            message={errors["education.branch"]}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="college">
            College{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="college"
            value={draft.education.college}
            onChange={(event) => onEducation({ college: event.target.value })}
            placeholder="e.g. National Institute of Technology"
            autoComplete="organization"
            aria-invalid={Boolean(errors["education.college"])}
            aria-describedby={
              errors["education.college"] ? "college-error" : undefined
            }
          />
          <FieldError
            id="college-error"
            message={errors["education.college"]}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm leading-none font-medium">
          Current year of study
        </legend>
        <RadioGroup
          value={draft.education.year ?? 0}
          onValueChange={(value) => onEducation({ year: value })}
          aria-label="Current year of study"
          className="grid grid-cols-3 gap-2 sm:grid-cols-6"
        >
          {YEAR_LABELS.map((label, index) => {
            const year = index + 1;
            const selected = draft.education.year === year;
            return (
              <label
                key={year}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 py-2.5 text-sm transition-colors hover:border-primary/40",
                  "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  selected && "border-primary/60 bg-primary/5"
                )}
              >
                <RadioGroupItem value={year} />
                <span>{label} year</span>
              </label>
            );
          })}
        </RadioGroup>
        <FieldError
          id="year-error"
          message={errors["education.year"]}
        />
      </fieldset>

      <div className="flex gap-2.5 rounded-lg bg-muted/50 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
        <GraduationCapIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          PathPilot is built for college students. No account, no upload — your
          answers live in this browser only.
        </p>
      </div>
    </div>
  );
}

export function CareerStep({
  draft,
  errors,
  stepId,
  onPatch,
}: StepProps & { onPatch: (patch: Partial<OnboardingDraft>) => void }) {
  return (
    <div className="space-y-6">
      <StepIntro
        title="Where do you want to land?"
        description="Pick one target career. The whole plan — phases, projects and interview prep — is built around it."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <RadioGroup
        value={draft.targetCareerId ?? ""}
        onValueChange={(value) => onPatch({ targetCareerId: value })}
        aria-label="Target career"
        className="grid gap-3 sm:grid-cols-2"
      >
        {CAREERS.map((career) => {
          const selected = draft.targetCareerId === career.id;
          return (
            <label
              key={career.id}
              className={cn(
                optionCardClass(selected),
                "h-full flex-col gap-3"
              )}
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="flex items-start gap-3">
                  <RadioGroupItem value={career.id} className="mt-1" />
                  <span>
                    <span className="block font-heading text-base font-medium">
                      {career.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-primary">
                      {career.tagline}
                    </span>
                  </span>
                </span>
                <Badge variant="outline" className="shrink-0">
                  {career.estimatedDays} days
                </Badge>
              </span>
              <span className="block pl-7 text-xs leading-relaxed text-muted-foreground">
                {career.description}
              </span>
            </label>
          );
        })}
      </RadioGroup>
      <FieldError id="career-error" message={errors.targetCareerId} />
    </div>
  );
}

export function SkillsStep({
  draft,
  errors,
  stepId,
  onToggle,
  onClear,
}: StepProps & {
  onToggle: (skillId: string, selected: boolean) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo(() => {
    return SKILL_CATEGORIES.map((category) => {
      const skills = SKILLS_BY_CATEGORY[category].filter((skill) => {
        if (!normalizedQuery) return true;
        const haystack = [
          skill.name,
          skill.description,
          ...skill.aliases,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      return { category, skills };
    }).filter((group) => group.skills.length > 0);
  }, [normalizedQuery]);

  return (
    <div className="space-y-5">
      <StepIntro
        title="What can you already do?"
        description="Tick anything you have used — even once in a class project. This is not a test; it only adjusts where your plan starts."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 83 skills…"
            aria-label="Search skills"
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">
            {draft.skills.length} selected
          </Badge>
          {draft.skills.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
            >
              Clear all
            </Button>
          ) : null}
        </div>
      </div>

      <p className="rounded-lg bg-muted/50 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <SparklesIcon className="mr-1.5 inline size-3.5 -translate-y-px text-primary" />
        Nothing selected is perfectly fine — a true beginner gets a plan that
        starts from the foundations.
      </p>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No skills match “{query}”. Try a broader search.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map(({ category, skills }) => (
            <section key={category} className="space-y-2.5">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {SKILL_CATEGORY_LABELS[category]}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {skills.length}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {skills.map((skill) => {
                  const selected = draft.skills.some(
                    (entry) => entry.skillId === skill.id
                  );
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onToggle(skill.id, !selected)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors",
                        "hover:border-primary/40 hover:bg-accent/40",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected && "border-primary/60 bg-primary/5 hover:bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-[4px] border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-transparent"
                        )}
                        aria-hidden="true"
                      >
                        {selected ? (
                          <CheckIcon className="size-3" strokeWidth={3} />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {skill.name}
                          {selected ? (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                              Added
                            </Badge>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {skill.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      <FieldError id="skills-error" message={errors.skills} />
    </div>
  );
}

export function ProficiencyStep({
  draft,
  errors,
  stepId,
  onLevel,
  onRemove,
}: StepProps & {
  onLevel: (skillId: string, level: Proficiency) => void;
  onRemove: (skillId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <StepIntro
        title="How comfortable are you?"
        description="A rough self-assessment is enough. “Basics” means you can follow along; “Strong” means you could help someone else."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      {draft.skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm font-medium">No skills selected yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            That is okay — you can continue and start from the foundations.
            Go back a step if you want to add something you have already used.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {draft.skills.map((assessment) => {
            const skill = SKILLS_BY_ID[assessment.skillId];
            if (!skill) return null;

            return (
              <div
                key={assessment.skillId}
                className="rounded-xl border border-border bg-card p-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{skill.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {SKILL_CATEGORY_LABELS[skill.category]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => onRemove(skill.id)}
                    aria-label={`Remove ${skill.name}`}
                  >
                    <Trash2Icon />
                    Remove
                  </Button>
                </div>
                <RadioGroup
                  value={assessment.level}
                  onValueChange={(value) => onLevel(skill.id, value)}
                  aria-label={`${skill.name} proficiency`}
                  className="mt-3 grid grid-cols-3 gap-2"
                >
                  {PROFICIENCY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-2 py-2 text-xs transition-colors hover:border-primary/40",
                        "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                        assessment.level === option.value &&
                          "border-primary/60 bg-primary/5 font-medium"
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            );
          })}
        </div>
      )}
      <FieldError id="proficiency-error" message={errors.skills} />
    </div>
  );
}

export function ExperienceStep({
  draft,
  errors,
  stepId,
  onPatch,
}: StepProps & { onPatch: (patch: Partial<OnboardingDraft>) => void }) {
  return (
    <div className="space-y-6">
      <StepIntro
        title="How much experience do you have?"
        description="This changes the tone and pace of the plan, not the destination. Pick the closest fit — you can always update it later."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <RadioGroup
        value={draft.experienceLevel ?? ""}
        onValueChange={(value) => {
          if (value) onPatch({ experienceLevel: value });
        }}
        aria-label="Experience level"
        className="grid gap-3"
      >
        {EXPERIENCE_OPTIONS.map((option) => {
          const selected = draft.experienceLevel === option.value;
          return (
            <label key={option.value} className={optionCardClass(selected)}>
              <RadioGroupItem value={option.value} className="mt-1" />
              <span>
                <span className="block text-sm font-medium">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
      <FieldError
        id="experience-error"
        message={errors.experienceLevel}
      />
    </div>
  );
}

export function StudyTimeStep({
  draft,
  errors,
  stepId,
  onPatch,
}: StepProps & { onPatch: (patch: Partial<OnboardingDraft>) => void }) {
  return (
    <div className="space-y-6">
      <StepIntro
        title="How much time do you have each day?"
        description="Pick a realistic focused-study budget. Short, consistent sessions beat one heroic weekend."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <RadioGroup
        value={draft.dailyMinutes ?? 0}
        onValueChange={(value) => onPatch({ dailyMinutes: value })}
        aria-label="Daily study minutes"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {DAILY_MINUTES_OPTIONS.map((minutes) => {
          const selected = draft.dailyMinutes === minutes;
          return (
            <label
              key={minutes}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40",
                "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                selected && "border-primary/60 bg-primary/5"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <RadioGroupItem value={minutes} />
                {minutes} minutes
              </span>
              <span className="pl-6 text-[11px] text-muted-foreground">
                {Math.round((minutes / 60) * 10) / 10} hours
              </span>
            </label>
          );
        })}
      </RadioGroup>

      <div className="max-w-xs space-y-1.5">
        <Label htmlFor="custom-minutes">Or enter a custom amount</Label>
        <div className="flex items-center gap-2">
          <Input
            id="custom-minutes"
            type="number"
            inputMode="numeric"
            min={15}
            max={480}
            value={draft.dailyMinutes ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onPatch({
                dailyMinutes: value === "" ? null : Number.parseInt(value, 10),
              });
            }}
            aria-invalid={Boolean(errors.dailyMinutes)}
            aria-describedby="custom-minutes-hint"
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>
        <FieldHint id="custom-minutes-hint">{DAILY_MINUTES_HELP}</FieldHint>
        <FieldError
          id="daily-minutes-error"
          message={errors.dailyMinutes}
        />
      </div>

      {draft.dailyMinutes !== null &&
      Number.isFinite(draft.dailyMinutes) ? (
        <div className="flex gap-2.5 rounded-lg bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
          <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            At <strong className="text-foreground">{formatDailyMinutes(draft.dailyMinutes)}</strong>{" "}
            you will invest about{" "}
            <strong className="text-foreground">
              {Math.round((draft.dailyMinutes * 45) / 60)} hours
            </strong>{" "}
            across the 45-day plan.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function StudyDaysStep({
  draft,
  errors,
  stepId,
  onPatch,
}: StepProps & { onPatch: (patch: Partial<OnboardingDraft>) => void }) {
  return (
    <div className="space-y-6">
      <StepIntro
        title="Which days will you study?"
        description="Choose how many days per week you can commit. Plan days are placed on consecutive study days with rest days between weeks."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <RadioGroup
        value={draft.daysPerWeek ?? 0}
        onValueChange={(value) => onPatch({ daysPerWeek: value })}
        aria-label="Study days per week"
        className="grid grid-cols-4 gap-2 sm:grid-cols-7"
      >
        {DAYS_PER_WEEK_OPTIONS.map((days) => {
          const selected = draft.daysPerWeek === days;
          return (
            <label
              key={days}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border bg-card py-3 transition-colors hover:border-primary/40",
                "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                selected && "border-primary/60 bg-primary/5"
              )}
            >
              <RadioGroupItem value={days} />
              <span className="text-sm font-medium">{days}</span>
              <span className="text-[10px] text-muted-foreground">
                {days === 1 ? "day" : "days"}
              </span>
            </label>
          );
        })}
      </RadioGroup>

      <FieldError id="study-days-error" message={errors.daysPerWeek} />

      {draft.daysPerWeek !== null ? (
        <div className="flex gap-2.5 rounded-lg bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
          <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            You will study{" "}
            <strong className="text-foreground">
              {formatStudyDays(draft.daysPerWeek)}
            </strong>
            . The plan always covers 45 study days; at this pace it finishes in
            about{" "}
            <strong className="text-foreground">
              {Math.ceil((45 / draft.daysPerWeek) * 7)} calendar days
            </strong>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function StartDateStep({
  draft,
  errors,
  stepId,
  onPatch,
}: StepProps & { onPatch: (patch: Partial<OnboardingDraft>) => void }) {
  const schedule =
    draft.startDate && draft.daysPerWeek !== null
      ? buildSchedule(
          draft.startDate,
          draft.daysPerWeek,
          draft.dailyMinutes ?? 0
        )
      : null;

  const today = format(new Date(), "yyyy-MM-dd");
  const monday = format(nextMonday(new Date()), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <StepIntro
        title="When does the plan start?"
        description="Day one lands on the date you choose. Study days follow your weekly rhythm from there."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="start-date">First day of your roadmap</Label>
        <Input
          id="start-date"
          type="date"
          value={draft.startDate}
          onChange={(event) => onPatch({ startDate: event.target.value })}
          aria-invalid={Boolean(errors.startDate)}
          aria-describedby={
            errors.startDate ? "start-date-error" : "start-date-hint"
          }
        />
        <FieldHint id="start-date-hint">
          Format: YYYY-MM-DD. A Monday start usually pairs well with a study
          week.
        </FieldHint>
        <FieldError id="start-date-error" message={errors.startDate} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPatch({ startDate: today })}
        >
          Start today
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPatch({ startDate: monday })}
        >
          Next Monday
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPatch({ startDate: format(addDays(new Date(), 7), "yyyy-MM-dd") })}
        >
          In one week
        </Button>
      </div>

      {schedule ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Schedule preview
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Starts</p>
              <p className="text-sm font-medium">
                {formatReviewDate(schedule.startDate)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Ends</p>
              <p className="text-sm font-medium">
                {formatReviewDate(schedule.endDate)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Rhythm</p>
              <p className="text-sm font-medium">
                {formatStudyDays(schedule.daysPerWeek)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export function ReviewStep({
  review,
  errors,
  stepId,
}: {
  review: ReviewData;
  errors: FieldErrors;
  stepId: string;
}) {
  const { gap } = review;

  return (
    <div className="space-y-6">
      <StepIntro
        title="Ready for a pre-flight check?"
        description="Review your answers and the deterministic skill gap. Nothing is generated until you confirm on the next step."
      />
      <StepErrorSummary errors={errors} stepId={stepId} />

      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <TargetIcon className="size-5" />
            </span>
            <div>
              <p className="font-heading text-lg font-medium">
                {review.career.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {review.career.tagline}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{review.experienceLabel}</Badge>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Readiness today (weighted by required skills)
            </span>
            <span className="font-medium tabular-nums">
              {gap.readinessPercent}%
            </span>
          </div>
          <Progress
            value={gap.readinessPercent}
            aria-label={`Career readiness ${gap.readinessPercent}%`}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Student
          </h3>
          <div className="mt-2 divide-y divide-border/70">
            <ReviewRow label="Name" value={review.profile.name ?? "Not provided"} />
            <ReviewRow
              label="Course"
              value={`${review.profile.education.degree}, ${review.profile.education.branch}`}
            />
            <ReviewRow
              label="Year"
              value={`${YEAR_LABELS[review.profile.education.year - 1] ?? review.profile.education.year} year`}
            />
            {review.profile.education.college ? (
              <ReviewRow
                label="College"
                value={review.profile.education.college}
              />
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Schedule
          </h3>
          <div className="mt-2 divide-y divide-border/70">
            <ReviewRow
              label="Daily study time"
              value={formatDailyMinutes(review.schedule.dailyMinutes)}
            />
            <ReviewRow
              label="Study days"
              value={formatStudyDays(review.schedule.daysPerWeek)}
            />
            <ReviewRow
              label="Starts"
              value={formatReviewDate(review.schedule.startDate)}
            />
            <ReviewRow
              label="Ends"
              value={formatReviewDate(review.schedule.endDate)}
            />
            <ReviewRow
              label="Plan length"
              value={`${review.schedule.planDays} study days`}
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Current skills & proficiency
          </h3>
          <Badge variant="outline">{review.skills.length} selected</Badge>
        </div>
        {review.skills.length === 0 ? (
          <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            No prior skills selected. Your plan will begin with the foundations.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {review.skills.map((skill) => (
              <li
                key={skill.skillId}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2"
              >
                <span className="text-sm">{skill.name}</span>
                <Badge variant="secondary">{skill.levelLabel}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Skill-gap summary
          </h3>
          <span className="text-xs text-muted-foreground">
            {gap.metSkills} of {gap.totalRequiredSkills} skills already met
          </span>
        </div>

        {gap.gaps.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-xs text-success">
            <CheckIcon className="size-4" strokeWidth={3} />
            No gaps for this career. The plan will still add projects and
            interview practice.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {gap.gaps.slice(0, 6).map((entry) => (
              <li
                key={entry.skillId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{entry.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {getProficiencyLabel(entry.currentLevel)} →{" "}
                    {getProficiencyLabel(entry.requiredLevel)} required
                  </p>
                </div>
                <Badge
                  variant={
                    entry.priority === "critical"
                      ? "destructive"
                      : entry.priority === "important"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {entry.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {gap.gaps.length > 6 ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            +{gap.gaps.length - 6} more gaps will be covered in the roadmap.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export function BuildStep({
  review,
  existing,
  building,
  error,
}: {
  review: ReviewData | null;
  existing: {
    exists: boolean;
    completedTasks: number;
    completedDays: number;
  } | null;
  building: boolean;
  error: string | null;
}) {
  const replacesExisting = Boolean(existing?.exists);

  return (
    <div className="space-y-6">
      <StepIntro
        title="Ready for take-off"
        description="We will save your profile, generate the 45-day plan with the deterministic engine, and open it on the roadmap screen."
      />

      {existing?.exists ? (
        <div className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
          <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">A roadmap already exists</p>
            <p className="mt-0.5 text-xs leading-relaxed">
              Building a new plan will replace the current one
              {existing.completedTasks > 0
                ? ` and permanently remove ${existing.completedTasks} completed ${
                    existing.completedTasks === 1 ? "task" : "tasks"
                  }`
                : ""}
              . You will be asked to confirm before anything is lost.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
        >
          <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">We could not build your roadmap</p>
            <p className="mt-0.5 text-xs leading-relaxed">{error}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: TargetIcon,
            label: "Destination",
            value: review?.career.title ?? "Your career",
          },
          {
            icon: CalendarDaysIcon,
            label: "Plan",
            value: "45 days · 9 phases",
          },
          {
            icon: ClockIcon,
            label: "Commitment",
            value: review
              ? `${formatShortReviewDate(review.schedule.startDate)} → ${formatShortReviewDate(review.schedule.endDate)}`
              : "Your schedule",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-3.5"
          >
            <item.icon className="size-4 text-primary" />
            <p className="mt-2 text-[11px] tracking-wide text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <RocketIcon className="size-4 text-primary" />
          What happens when you press build
        </p>
        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
          {[
            "Your profile is saved locally in this browser.",
            "The Step 2 engine generates day-wise tasks within your time budget.",
            "A fresh task log starts at 0%, ready for your first check-off.",
            replacesExisting
              ? "Your current roadmap is replaced only after you confirm."
              : "You land on the roadmap screen with day one ready.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckIcon
                className="mt-0.5 size-3.5 shrink-0 text-success"
                strokeWidth={3}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {building ? (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3"
        >
          <LoaderCircleIcon className="size-4 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">Building your roadmap…</p>
            <p className="text-xs text-muted-foreground">
              Selecting phases, writing tasks and placing study dates.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
        <ArrowLeftRightIcon className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Changed your mind? Go back to any step. Your answers stay exactly where
          you left them until you build.
        </p>
      </div>
    </div>
  );
}
