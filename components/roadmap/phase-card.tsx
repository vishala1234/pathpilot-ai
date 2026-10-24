"use client";

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIcon,
  PlayCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  PHASE_EMPHASIS_LABELS,
  PHASE_KIND_LABELS,
  type RoadmapPhaseView,
} from "@/lib/roadmap/view";
import { cn } from "@/lib/utils";

import { DayList } from "./day-list";

const PHASE_STATUS_LABELS = {
  completed: "Completed",
  current: "Current",
  upcoming: "Upcoming",
} as const;

const PHASE_STATUS_ICONS = {
  completed: CheckCircle2Icon,
  current: PlayCircleIcon,
  upcoming: CircleIcon,
} as const;

export function PhaseCard({
  phaseView,
  expanded,
  selectedDayId,
  onToggle,
  onSelectDay,
}: {
  phaseView: RoadmapPhaseView;
  expanded: boolean;
  selectedDayId: string | null;
  onToggle: () => void;
  onSelectDay: (dayId: string) => void;
}) {
  const { phase, progress, status, days, number } = phaseView;
  const StatusIcon = PHASE_STATUS_ICONS[status];
  const daysId = `phase-${phase.id}-days`;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        status === "current" && "border-primary/40",
        status === "completed" && "border-success/30"
      )}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={daysId}
          className={cn(
            "flex w-full flex-col gap-3 p-4 text-left transition-colors md:p-5",
            "hover:bg-accent/30 focus-visible:bg-accent/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          )}
        >
          <span className="flex w-full items-start justify-between gap-3">
            <span className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl border text-sm font-semibold tabular-nums",
                  status === "completed" &&
                    "border-success/30 bg-success/15 text-success",
                  status === "current" &&
                    "border-primary bg-primary text-primary-foreground",
                  status === "upcoming" &&
                    "border-border bg-muted/40 text-muted-foreground"
                )}
              >
                {status === "completed" ? (
                  <CheckCircle2Icon className="size-4" />
                ) : (
                  number
                )}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-base leading-snug font-medium">
                    {phase.title}
                  </span>
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                    {PHASE_KIND_LABELS[phase.kind]}
                  </Badge>
                  {phase.emphasis !== "balanced" ? (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {PHASE_EMPHASIS_LABELS[phase.emphasis]}
                    </Badge>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {phase.summary}
                </span>
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "hidden items-center gap-1 text-[11px] font-medium sm:inline-flex",
                  status === "completed" && "text-success",
                  status === "current" && "text-primary",
                  status === "upcoming" && "text-muted-foreground"
                )}
              >
                <StatusIcon className="size-3.5" />
                {PHASE_STATUS_LABELS[status]}
              </span>
              {expanded ? (
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              )}
            </span>
          </span>

          <span className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="flex min-w-40 flex-1 items-center gap-2">
              <span
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "block h-full rounded-full transition-all",
                    progress.complete ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${progress.percent}%` }}
                />
              </span>
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {progress.percent}%
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              <strong className="font-medium text-foreground">
                {progress.completedDays}/{progress.totalDays}
              </strong>{" "}
              days
            </span>
            <span className="text-[11px] text-muted-foreground">
              <strong className="font-medium text-foreground">
                {progress.completedTasks}/{progress.totalTasks}
              </strong>{" "}
              tasks
            </span>
          </span>
        </button>
      </h3>

      {expanded ? (
        <div
          id={daysId}
          className="border-t border-border/70 bg-muted/20 p-3 md:p-4"
        >
          <DayList
            days={days}
            selectedDayId={selectedDayId}
            onSelectDay={onSelectDay}
          />
        </div>
      ) : null}
    </article>
  );
}
