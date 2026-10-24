"use client";

import {
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  PlayCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatDayDate,
  formatMinutes,
  type RoadmapDayView,
} from "@/lib/roadmap/view";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  completed: "Completed",
  "in-progress": "In progress",
  upcoming: "Upcoming",
} as const;

export function DayCard({
  dayView,
  selected,
  onSelect,
}: {
  dayView: RoadmapDayView;
  selected: boolean;
  onSelect: () => void;
}) {
  const { day, progress, status } = dayView;
  const StatusIcon =
    status === "completed"
      ? CheckCircle2Icon
      : status === "in-progress"
        ? PlayCircleIcon
        : CircleIcon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Open day ${day.index}: ${day.topic}, ${STATUS_LABELS[status]}`}
      onClick={onSelect}
      className={cn(
        "group flex h-full w-full flex-col gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left transition-colors",
        "hover:border-primary/40 hover:bg-accent/40",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
        status === "completed" && "border-success/25 bg-success/5"
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold tabular-nums",
              status === "completed" &&
                "border-success/30 bg-success/15 text-success",
              status === "in-progress" &&
                "border-primary/40 bg-primary/10 text-primary",
              status === "upcoming" &&
                "border-border bg-background text-muted-foreground"
            )}
          >
            {status === "completed" ? (
              <CheckCircle2Icon className="size-3.5" strokeWidth={2.5} />
            ) : (
              day.index
            )}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Day {day.index}
          </span>
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatDayDate(day.plannedDate)}
        </span>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "line-clamp-2 text-sm leading-snug font-medium",
            status === "completed" && "text-muted-foreground"
          )}
        >
          {day.topic}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" />
            {formatMinutes(day.estimatedMinutes)}
          </span>
          <span>
            {progress.completedTasks}/{progress.totalTasks} tasks
          </span>
        </p>
      </div>

      <div className="mt-auto space-y-1.5">
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress.complete ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium",
              status === "completed" && "text-success",
              status === "in-progress" && "text-primary",
              status === "upcoming" && "text-muted-foreground"
            )}
          >
            <StatusIcon className="size-3" />
            {STATUS_LABELS[status]}
          </span>
          <span className="flex items-center gap-1">
            {dayView.isToday ? (
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                Today
              </Badge>
            ) : dayView.isNext ? (
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                Next up
              </Badge>
            ) : null}
            <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
              {progress.percent}%
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}
