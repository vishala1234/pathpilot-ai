import {
  AlertTriangleIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  RouteIcon,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Roadmap } from "@/types";
import { cn } from "@/lib/utils";

export function RoadmapEmptyState() {
  return (
    <>
      <PageHeader
        eyebrow="Your roadmap"
        title="No roadmap yet"
        description="Build a 45-day plan from your target career, current skills and study time. It takes about two minutes."
        badge="Step 1 of your journey"
      />
      <div className="container-page py-8 md:py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center gap-4 px-5 py-10 text-center md:px-8">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <RouteIcon className="size-7" />
            </span>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl">Your flight plan starts here</h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                PathPilot builds every plan from the same deterministic engine:
                nine phases, 45 study days and day-wise tasks sized to your
                available time.
              </p>
            </div>
            <Link
              href="/onboarding"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Build my roadmap
              <ArrowRightIcon className="size-4" />
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Your answers and plan stay in this browser. No account needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/**
 * The roadmap exists but its progress log does not belong to it. We never show
 * a fake 0% — the student can start a fresh log or deliberately replan.
 */
export function RoadmapUnavailableState({
  roadmap,
  onStartTracking,
}: {
  roadmap: Roadmap;
  onStartTracking: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Your roadmap"
        title={roadmap.careerTitle}
        description="We found your saved plan, but its progress log is missing or does not match it."
        badge="Progress unavailable"
      />
      <div className="container-page py-8 md:py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-4 px-5 py-8 md:px-8">
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Task completion cannot be loaded</p>
                <p className="mt-1 text-xs leading-relaxed">
                  The plan itself is intact. Starting a fresh progress log does
                  not change any task in the roadmap, but previous checks — if
                  any — are not available for this plan.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={onStartTracking}>
                <RefreshCwIcon />
                Start tracking this plan
              </Button>
              <Link
                href="/onboarding"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "gap-1.5"
                )}
              >
                Plan a new roadmap
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function RoadmapSkeleton() {
  return (
    <>
      <PageHeader
        eyebrow="Your roadmap"
        title="Loading your flight plan"
        description="Reading your saved plan and task progress from this browser."
        badge="Loading"
      />
      <div className="container-page space-y-6 py-8 md:py-12">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </>
  );
}
