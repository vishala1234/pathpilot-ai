"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  RouteIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExistingRoadmapError,
  ONBOARDING_STEP_COUNT,
  buildReviewData,
  buildRoadmapFromDraft,
  createEmptyDraft,
  findFirstInvalidStep,
  getNextStep,
  getPreviousStep,
  getStepNumber,
  isOnboardingDraftValid,
  patchDraft,
  patchEducation,
  removeSkill,
  setSkillProficiency,
  setSkillSelected,
  validateStep,
  type FieldErrors,
  type OnboardingDraft,
  type OnboardingStepId,
} from "@/lib/onboarding";
import {
  useProgressState,
  useRoadmap,
  useStoresHydrated,
} from "@/lib/store";
import { getProgressSummary } from "@/lib/store/selectors";
import { cn } from "@/lib/utils";

import { WizardProgress } from "./wizard-progress";
import {
  BuildStep,
  CareerStep,
  ExperienceStep,
  ProficiencyStep,
  ReviewStep,
  SkillsStep,
  StartDateStep,
  StudyDaysStep,
  StudyTimeStep,
  WelcomeStep,
} from "./steps";

export function OnboardingWizard() {
  const router = useRouter();
  const hydrated = useStoresHydrated();
  const roadmap = useRoadmap();
  const progress = useProgressState();

  const [startedOver, setStartedOver] = useState(false);
  const [draft, setDraft] = useState<OnboardingDraft>(createEmptyDraft);
  const [stepId, setStepId] = useState<OnboardingStepId>("welcome");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [buildState, setBuildState] = useState<
    "idle" | "building" | "error"
  >("idle");
  const [buildError, setBuildError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const summary = useMemo(
    () => getProgressSummary(roadmap, progress),
    [roadmap, progress]
  );
  const review = useMemo(() => buildReviewData(draft), [draft]);
  const existingState = roadmap
    ? {
        exists: true,
        completedTasks: summary?.completedTasks ?? 0,
        completedDays: summary?.completedDays ?? 0,
      }
    : null;

  if (!hydrated) {
    return <WizardSkeleton />;
  }

  if (roadmap && summary && !startedOver) {
    return (
      <ExistingPlanScreen
        roadmap={roadmap}
        summary={summary}
        onStartOver={() => setStartedOver(true)}
      />
    );
  }

  const updateDraft = (patch: Partial<OnboardingDraft>) => {
    setDraft((current) => patchDraft(current, patch));
  };

  const updateEducation = (patch: Partial<OnboardingDraft["education"]>) => {
    setDraft((current) => patchEducation(current, patch));
  };

  const goBack = () => {
    const previous = getPreviousStep(stepId);
    if (!previous) return;
    setErrors({});
    setBuildError(null);
    setBuildState("idle");
    setStepId(previous);
  };

  const handleContinue = () => {
    if (buildState === "building") return;

    if (stepId === "build") {
      requestBuild();
      return;
    }

    const validation = validateStep(stepId, draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const next = getNextStep(stepId);
    if (next) setStepId(next);
  };

  const goToFirstInvalidStep = () => {
    const firstInvalid = findFirstInvalidStep(draft);
    if (!firstInvalid) return false;
    setStepId(firstInvalid);
    setErrors(validateStep(firstInvalid, draft).errors);
    return true;
  };

  const requestBuild = () => {
    if (!isOnboardingDraftValid(draft)) {
      goToFirstInvalidStep();
      return;
    }

    if (existingState?.exists) {
      setConfirmOpen(true);
      return;
    }

    void runBuild(false);
  };

  const runBuild = async (replaceExisting: boolean) => {
    setConfirmOpen(false);
    setBuildState("building");
    setBuildError(null);

    // Yield once so the loading state paints before the synchronous engine runs.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 250);
    });

    try {
      const result = buildRoadmapFromDraft(draft, { replaceExisting });
      router.push(result.destination);
      router.refresh();
    } catch (error) {
      if (error instanceof ExistingRoadmapError) {
        setBuildState("idle");
        setConfirmOpen(true);
        return;
      }

      setBuildState("error");
      setBuildError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the plan."
      );
    }
  };

  const renderStep = () => {
    switch (stepId) {
      case "welcome":
        return (
          <WelcomeStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onPatch={updateDraft}
            onEducation={updateEducation}
          />
        );
      case "career":
        return (
          <CareerStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onPatch={updateDraft}
          />
        );
      case "skills":
        return (
          <SkillsStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onToggle={(skillId, selected) =>
              setDraft((current) =>
                setSkillSelected(current, skillId, selected)
              )
            }
            onClear={() =>
              setDraft((current) => ({ ...current, skills: [] }))
            }
          />
        );
      case "proficiency":
        return (
          <ProficiencyStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onLevel={(skillId, level) =>
              setDraft((current) =>
                setSkillProficiency(current, skillId, level)
              )
            }
            onRemove={(skillId) =>
              setDraft((current) => removeSkill(current, skillId))
            }
          />
        );
      case "experience":
        return (
          <ExperienceStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onPatch={updateDraft}
          />
        );
      case "study-time":
        return (
          <StudyTimeStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onPatch={updateDraft}
          />
        );
      case "study-days":
        return (
          <StudyDaysStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onPatch={updateDraft}
          />
        );
      case "start-date":
        return (
          <StartDateStep
            draft={draft}
            errors={errors}
            stepId={stepId}
            onPatch={updateDraft}
          />
        );
      case "review":
        return review ? (
          <ReviewStep
            review={review}
            errors={errors}
            stepId={stepId}
          />
        ) : (
          <MissingAnswers onGoBack={goToFirstInvalidStep} />
        );
      case "build":
        return review ? (
          <BuildStep
            review={review}
            existing={existingState}
            building={buildState === "building"}
            error={buildError}
          />
        ) : (
          <MissingAnswers onGoBack={goToFirstInvalidStep} />
        );
    }
  };

  const continueLabel =
    stepId === "build"
      ? "Build my roadmap"
      : stepId === "review"
        ? "Continue to build"
        : "Continue";
  const building = buildState === "building";

  return (
    <>
      <PageHeader
        eyebrow="Student profile"
        title="Set up your flight plan"
        description="Ten quick steps. Your answers stay on this device, and you can change any of them before the plan is built."
        badge={`Step ${getStepNumber(stepId)} of ${ONBOARDING_STEP_COUNT}`}
      />

      <div className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <WizardProgress currentStep={stepId} />

          <div className="min-w-0 space-y-4">
            {existingState?.exists ? (
              <div className="flex gap-2.5 rounded-lg border border-border bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
                <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  Your current roadmap is still intact. Nothing is replaced until
                  you confirm on the final step.
                </p>
              </div>
            ) : null}

            <Card className="ring-1 ring-foreground/10">
              <CardContent className="space-y-6 px-5 py-6 md:px-7 md:py-8">
                {renderStep()}

                <Separator />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goBack}
                    disabled={!getPreviousStep(stepId) || building}
                  >
                    <ArrowLeftIcon />
                    Back
                  </Button>

                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <span className="self-center text-[11px] text-muted-foreground">
                      {stepId === "build"
                        ? "One press and you are on your way."
                        : `Step ${getStepNumber(stepId)} of ${ONBOARDING_STEP_COUNT}`}
                    </span>
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleContinue}
                      disabled={building}
                      className="min-w-36"
                    >
                      {building ? (
                        <>
                          <LoaderCircleIcon className="animate-spin" />
                          Building…
                        </>
                      ) : (
                        <>
                          {continueLabel}
                          {stepId === "build" ? (
                            <SparklesIcon />
                          ) : (
                            <ArrowRightIcon />
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace your current roadmap?</DialogTitle>
            <DialogDescription>
              You already have a 45-day plan. Building this new one will replace
              it and start a fresh progress log.
            </DialogDescription>
          </DialogHeader>

          {existingState?.exists ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
              <p className="font-medium">
                {existingState.completedTasks > 0
                  ? `${existingState.completedTasks} completed ${
                      existingState.completedTasks === 1 ? "task" : "tasks"
                    } will be permanently lost`
                  : "Your current plan has no completed tasks yet"}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                {existingState.completedDays > 0
                  ? `${existingState.completedDays} fully completed ${
                      existingState.completedDays === 1 ? "day" : "days"
                    } will be archived only as part of the old plan. This cannot be undone.`
                  : "There is no way to restore the old plan after replacing it."}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Keep my current plan
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void runBuild(true)}
            >
              Replace and build
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ExistingPlanScreen({
  roadmap,
  summary,
  onStartOver,
}: {
  roadmap: NonNullable<ReturnType<typeof useRoadmap>>;
  summary: NonNullable<ReturnType<typeof getProgressSummary>>;
  onStartOver: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Welcome back"
        title="Your flight plan is already in motion"
        description="You have a saved roadmap on this device. Continue where you left off, or deliberately plan a different route."
        badge="Saved locally"
      />

      <div className="container-page py-8 md:py-12">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="space-y-6 px-5 py-6 md:px-7 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <RouteIcon className="size-5" />
                </span>
                <div>
                  <p className="font-heading text-xl font-medium">
                    {roadmap.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {roadmap.startDate} · {roadmap.days.length} plan days · v
                    {roadmap.version}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {summary.completedTasks} / {summary.totalTasks} tasks
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-medium tabular-nums">
                  {summary.taskPercent}%
                </span>
              </div>
              <Progress
                value={summary.taskPercent}
                aria-label={`Roadmap ${summary.taskPercent}% complete`}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Completed days",
                  value: `${summary.completedDays} / ${summary.totalDays}`,
                },
                {
                  label: "Current streak",
                  value: `${summary.currentStreak} ${
                    summary.currentStreak === 1 ? "day" : "days"
                  }`,
                },
                {
                  label: "Completed minutes",
                  value: `${summary.completedMinutes} min`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-muted/40 p-3.5"
                >
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/roadmap"
                className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
              >
                Continue to my roadmap
                <ArrowRightIcon className="size-4" />
              </Link>
              <Button type="button" variant="outline" size="lg" onClick={onStartOver}>
                Plan a new roadmap
              </Button>
            </div>

            <div className="flex gap-2.5 rounded-lg bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
              <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
              <p>
                Planning a new route does not delete this one immediately. You
                will be asked to confirm before the existing plan and its
                completed tasks are replaced.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MissingAnswers({ onGoBack }: { onGoBack: () => boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
        <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
        <p>Some answers are missing before we can show the review.</p>
      </div>
      <Button type="button" variant="outline" onClick={onGoBack}>
        Go to the missing step
      </Button>
    </div>
  );
}

function WizardSkeleton() {
  return (
    <>
      <PageHeader
        eyebrow="Student profile"
        title="Set up your flight plan"
        description="Loading your saved answers…"
        badge="Loading"
      />
      <div className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="hidden space-y-3 lg:block">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
          <Card>
            <CardContent className="space-y-5 px-5 py-6 md:px-7 md:py-8">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
