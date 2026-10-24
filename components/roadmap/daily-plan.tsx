"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  TargetIcon,
} from "lucide-react";

import { TaskList } from "@/components/day/task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PHASE_KIND_LABELS,
  formatDayDate,
  formatMinutes,
  type RoadmapDayView,
  type RoadmapView,
} from "@/lib/roadmap/view";
import type { ProgressState } from "@/types";

export function DailyPlan({
  view,
  dayView,
  progress,
  onSelectDay,
  onToggleTask,
}: {
  view: RoadmapView;
  dayView: RoadmapDayView;
  progress: ProgressState;
  onSelectDay: (dayId: string) => void;
  onToggleTask: (taskId: string) => void;
}) {
  const index = view.days.findIndex((entry) => entry.day.id === dayView.day.id);
  const previous = index > 0 ? view.days[index - 1] : null;
  const next = index >= 0 && index < view.days.length - 1 ? view.days[index + 1] : null;
  const { day, phase, progress: dayProgress } = dayView;
  const todayId = view.today?.day.id ?? null;

  return (
    <section
      aria-labelledby="daily-plan-heading"
      className="overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Day {day.index}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDaysIcon className="size-3.5" />
            {formatDayDate(day.plannedDate)}
          </span>
        </div>
        <a
          href="#roadmap-overview"
          className="inline-flex items-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowUpIcon className="size-3" />
          Back to overview
        </a>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">
            Phase {phase.order} · {phase.title} ·{" "}
            {PHASE_KIND_LABELS[phase.kind]}
          </p>
          <h2
            id="daily-plan-heading"
            className="font-heading text-xl leading-snug font-medium"
          >
            {day.topic}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {day.goal}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <TargetIcon className="size-3" />
            {dayProgress.completedTasks}/{dayProgress.totalTasks} tasks
          </span>
          <span>{formatMinutes(day.estimatedMinutes)} planned</span>
          <span>
            {dayProgress.completedMinutes > 0
              ? `${formatMinutes(dayProgress.completedMinutes)} done`
              : "Nothing completed yet"}
          </span>
        </div>

        <TaskList
          dayView={dayView}
          progress={progress}
          onToggleTask={onToggleTask}
        />

        <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!previous}
            onClick={() => previous && onSelectDay(previous.day.id)}
          >
            <ArrowLeftIcon />
            Day {previous?.day.index ?? "—"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!next}
            onClick={() => next && onSelectDay(next.day.id)}
          >
            Day {next?.day.index ?? "—"}
            <ArrowRightIcon />
          </Button>
        </div>

        {!dayProgress.complete && todayId && todayId !== day.id ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onSelectDay(todayId)}
          >
            Jump to today&apos;s plan · Day {view.today?.day.index}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
