"use client";

import { Settings2Icon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  buildRoadmapView,
  PHASE_KIND_LABELS,
} from "@/lib/roadmap/view";
import {
  useProgressState,
  useRoadmap,
  useStoresHydrated,
  useTodayPlan,
} from "@/lib/store";
import { useProgressStore } from "@/lib/store/progress";
import { cn } from "@/lib/utils";

import { DailyPlan } from "./daily-plan";
import {
  RoadmapEmptyState,
  RoadmapSkeleton,
  RoadmapUnavailableState,
} from "./empty-state";
import { PhaseList } from "./phase-list";
import { ProgressSummaryCard } from "./progress-summary";
import { TodayPlanCard } from "./today-plan";

/**
 * The roadmap route is a read-only projection of the persisted roadmap plus the
 * raw `taskStatus` log. Generation lives in the Step 2 engine; completion lives
 * in `useProgressStore`. This component only selects and renders.
 */
export function RoadmapView() {
  const hydrated = useStoresHydrated();
  const roadmap = useRoadmap();
  const progress = useProgressState();
  const todayPlan = useTodayPlan();
  const toggleTask = useProgressStore((state) => state.toggleTask);

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [collapsedPhaseIds, setCollapsedPhaseIds] = useState<Set<string>>(
    () => new Set()
  );

  const dailyPlanRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  const view = useMemo(
    () =>
      buildRoadmapView(roadmap, progress, {
        todayPlan,
        selectedDayId,
      }),
    [roadmap, progress, todayPlan, selectedDayId]
  );

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      dailyPlanRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedDayId]);

  if (!hydrated) {
    return <RoadmapSkeleton />;
  }

  if (!roadmap) {
    return <RoadmapEmptyState />;
  }

  if (!progress || !view) {
    return (
      <RoadmapUnavailableState
        roadmap={roadmap}
        onStartTracking={() =>
          useProgressStore.getState().startForRoadmap(roadmap.id)
        }
      />
    );
  }

  const selectDay = (dayId: string) => {
    shouldScrollRef.current = true;
    setSelectedDayId(dayId);
  };

  const togglePhase = (phaseId: string) => {
    setCollapsedPhaseIds((current) => {
      const next = new Set(current);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const activeDayId = view.selectedDay.day.id;
  const nextIncomplete =
    view.days.find((entry) => entry.day.id === view.nextIncompleteDayId) ?? null;
  const activePhase = view.phases.find((entry) =>
    entry.days.some((day) => day.day.id === activeDayId)
  );

  return (
    <div id="roadmap-overview">
      <PageHeader
        eyebrow="Your roadmap"
        title={`${roadmap.careerTitle} flight plan`}
        description={
          <>
            45 days across nine phases, starting {roadmap.startDate}. Progress is
            derived from your checked tasks — nothing is stored twice.
          </>
        }
        badge={`Version ${roadmap.version}`}
        actions={
          <>
            <Link
              href="/onboarding"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-1.5"
              )}
            >
              <Settings2Icon className="size-4" />
              Adjust profile
            </Link>
            <a
              href="#daily-plan"
              className={cn(buttonVariants(), "gap-1.5")}
            >
              <SparklesIcon className="size-4" />
              Today&apos;s plan
            </a>
          </>
        }
      />

      <div className="container-page space-y-6 py-8 md:py-10">
        <ProgressSummaryCard roadmap={roadmap} summary={view.summary} />

        {view.today ? (
          <TodayPlanCard
            today={view.today}
            nextIncomplete={nextIncomplete}
            onOpenDay={selectDay}
          />
        ) : (
          <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-4 text-sm text-success">
            <p className="font-medium">Every plan day is complete.</p>
            <p className="mt-0.5 text-xs text-success/80">
              All {view.summary.totalTasks} tasks across 45 days are checked off.
              Revisit any day below to review your work.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-labelledby="phases-heading" className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2
                  id="phases-heading"
                  className="font-heading text-xl font-medium"
                >
                  Nine phases, 45 days
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Expand a phase to browse its days. Select any day to open its
                  tasks beside the roadmap.
                </p>
              </div>
              {activePhase ? (
                <p className="text-[11px] text-muted-foreground">
                  Selected: {PHASE_KIND_LABELS[activePhase.phase.kind]} ·{" "}
                  {activePhase.phase.title}
                </p>
              ) : null}
            </div>

            <PhaseList
              phases={view.phases}
              selectedDayId={activeDayId}
              collapsedPhaseIds={collapsedPhaseIds}
              onTogglePhase={togglePhase}
              onSelectDay={selectDay}
            />
          </section>

          <div ref={dailyPlanRef} id="daily-plan" className="scroll-mt-20">
            <div className="lg:sticky lg:top-20">
              <DailyPlan
                view={view}
                dayView={view.selectedDay}
                progress={progress}
                onSelectDay={selectDay}
                onToggleTask={toggleTask}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
