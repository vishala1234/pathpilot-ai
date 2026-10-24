import { CheckIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
  ONBOARDING_STEPS,
  getStepIndex,
  getStepNumber,
  getStepProgress,
  type OnboardingStepId,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export function WizardProgress({
  currentStep,
}: {
  currentStep: OnboardingStepId;
}) {
  const currentIndex = getStepIndex(currentStep);
  const progress = getStepProgress(currentStep);
  const current = getStepNumber(currentStep);

  return (
    <aside aria-label="Onboarding progress" className="space-y-6">
      <div className="lg:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {current} of {progress.total}
          </span>
          <span className="text-muted-foreground">
            {ONBOARDING_STEPS[currentIndex].title}
          </span>
        </div>
        <Progress
          value={progress.percent}
          aria-label={`Onboarding ${progress.percent}% complete`}
          className="mt-2"
        />
      </div>

      <ol className="hidden gap-1 lg:grid">
        {ONBOARDING_STEPS.map((step, index) => {
          const state =
            index < currentIndex
              ? "complete"
              : index === currentIndex
                ? "current"
                : "upcoming";

          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
                state === "current" && "bg-accent/70 text-accent-foreground",
                state === "upcoming" && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold tabular-nums",
                  state === "complete" &&
                    "border-success/30 bg-success/15 text-success",
                  state === "current" &&
                    "border-primary bg-primary text-primary-foreground",
                  state === "upcoming" &&
                    "border-border bg-background text-muted-foreground"
                )}
              >
                {state === "complete" ? (
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span className={cn(state === "current" && "font-medium")}>
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="hidden rounded-xl border border-border/70 bg-muted/40 p-3.5 text-xs text-muted-foreground lg:block">
        <p className="font-medium text-foreground">45 days, nine phases</p>
        <p className="mt-1 leading-relaxed">
          Every plan is built from the same deterministic engine, so you can
          change answers without losing your place.
        </p>
      </div>
    </aside>
  );
}
