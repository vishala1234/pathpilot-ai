"use client";

import {
  CalendarCheck2Icon,
  CheckCircle2Icon,
  ClockIcon,
  FlameIcon,
  GitBranchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/lib/roadmap/view";
import type { ProgressSummary, Roadmap } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Every number here comes from `ProgressSummary`, which the engine derives from
 * `taskStatus` on each render. Nothing is stored twice.
 */
export function ProgressSummaryCard({
  roadmap,
  summary,
}: {
  roadmap: Roadmap;
  summary: ProgressSummary;
}) {
  const stats = [
    {
      label: "Tasks complete",
      value: `${summary.completedTasks} / ${summary.totalTasks}`,
      hint: `${summary.completedTasks} checked off`,
      icon: CheckCircle2Icon,
    },
    {
      label: "Days complete",
      value: `${summary.completedDays} / ${summary.totalDays}`,
      hint: "All tasks on the day done",
      icon: CalendarCheck2Icon,
    },
    {
      label: "Current streak",
      value: `${summary.currentStreak} ${
        summary.currentStreak === 1 ? "day" : "days"
      }`,
      hint: `Longest ${summary.longestStreak} ${
        summary.longestStreak === 1 ? "day" : "days"
      }`,
      icon: FlameIcon,
    },
    {
      label: "Study time done",
      value: formatMinutes(summary.completedMinutes),
      hint: `of ${formatMinutes(summary.totalMinutes)} planned`,
      icon: ClockIcon,
    },
  ];

  return (
    <Card className="ring-1 ring-foreground/10">
      <CardHeader className="gap-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-lg">
              {roadmap.careerTitle} · 45-day plan
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Starts {roadmap.startDate} · version {roadmap.version} ·{" "}
              {roadmap.source === "template" ? "deterministic plan" : roadmap.source}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <GitBranchIcon className="size-3" />
              v{roadmap.version}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                summary.completedTasks === summary.totalTasks &&
                  "border-success/30 bg-success/15 text-success"
              )}
            >
              {summary.taskPercent}% complete
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Overall progress</span>
            <span className="text-muted-foreground tabular-nums">
              {summary.completedTasks} of {summary.totalTasks} tasks ·{" "}
              {formatMinutes(summary.completedMinutes)} of{" "}
              {formatMinutes(summary.totalMinutes)}
            </span>
          </div>
          <Progress
            value={summary.taskPercent}
            aria-label={`Roadmap ${summary.taskPercent}% complete`}
            className={cn(
              "gap-1.5",
              summary.completedTasks === summary.totalTasks &&
                "[&_[data-slot=progress-indicator]]:bg-success"
            )}
          />
          <p className="text-[11px] text-muted-foreground">
            Percentage counts completed tasks, so optional tasks are included.
            Day completion requires every task on that day.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/70 bg-muted/30 p-3"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <stat.icon className="size-3.5" />
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                  {stat.label}
                </p>
              </div>
              <p className="mt-1.5 text-sm font-medium tabular-nums">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {stat.hint}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
