"use client";

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClockIcon,
  FlameIcon,
  SunIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDayDate,
  formatMinutes,
  type RoadmapDayView,
} from "@/lib/roadmap/view";
import type { TodayPlan } from "@/lib/store/selectors";
import { cn } from "@/lib/utils";

/**
 * "Today's plan" always uses the existing `getTodayPlan` selector through
 * `useTodayPlan`. When the calendar date is a rest day (or has no scheduled
 * plan day), the selector falls back to the next incomplete day.
 */
export function TodayPlanCard({
  today,
  nextIncomplete,
  onOpenDay,
}: {
  today: TodayPlan;
  nextIncomplete: RoadmapDayView | null;
  onOpenDay: (dayId: string) => void;
}) {
  const { day, progress, scheduledToday } = today;
  const done = progress.complete;
  const nextId = nextIncomplete?.day.id;
  const showNextAction = done && nextId && nextId !== day.id;

  return (
    <section
      aria-labelledby="todays-plan-heading"
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        done ? "border-success/40" : "border-primary/30"
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-5",
          done
            ? "border-success/25 bg-success/10"
            : "border-primary/20 bg-primary/5"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-7 place-items-center rounded-lg",
              done
                ? "bg-success/15 text-success"
                : "bg-primary/10 text-primary"
            )}
          >
            <SunIcon className="size-4" />
          </span>
          <h2 id="todays-plan-heading" className="text-sm font-medium">
            Today&apos;s plan
          </h2>
        </div>
        <Badge variant="outline" className="bg-background/70">
          {scheduledToday ? "Scheduled today" : "Next study day"}
        </Badge>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Day {day.index}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDaysIcon className="size-3.5" />
                {formatDayDate(day.plannedDate)}
              </span>
              {done ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle2Icon className="size-3.5" />
                  All tasks complete
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-heading text-lg leading-snug font-medium">
              {day.topic}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {day.goal}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {formatMinutes(day.estimatedMinutes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2Icon className="size-3.5" />
              {progress.completedTasks}/{progress.totalTasks}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {done ? "Day complete" : `${progress.percent}% of this day`}
            </span>
            {progress.completedMinutes > 0 ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <FlameIcon className="size-3" />
                {formatMinutes(progress.completedMinutes)} done
              </span>
            ) : null}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                done ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => onOpenDay(day.id)}>
            {done ? "Review this day" : "Open today's plan"}
            <ArrowRightIcon />
          </Button>
          {showNextAction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenDay(nextId)}
            >
              Next incomplete day
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
