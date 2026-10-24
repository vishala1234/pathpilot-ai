"use client";

import { CheckCircle2Icon, ListChecksIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { isTaskDone } from "@/lib/engine";
import type { RoadmapDayView } from "@/lib/roadmap/view";
import type { ProgressState } from "@/types";
import { cn } from "@/lib/utils";

import { TaskCard } from "./task-card";

export function TaskList({
  dayView,
  progress,
  onToggleTask,
}: {
  dayView: RoadmapDayView;
  progress: ProgressState;
  onToggleTask: (taskId: string) => void;
}) {
  const tasks = [...dayView.day.tasks].sort((a, b) => a.order - b.order);
  const completed = dayView.progress.completedTasks;
  const total = dayView.progress.totalTasks;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecksIcon className="size-4 text-primary" />
          <h4 className="text-sm font-medium">
            {total} {total === 1 ? "task" : "tasks"}
          </h4>
          <Badge
            variant={dayView.progress.complete ? "secondary" : "outline"}
            className={cn(
              dayView.progress.complete &&
                "border-success/30 bg-success/15 text-success"
            )}
          >
            {completed} / {total} done
          </Badge>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium",
            dayView.progress.complete
              ? "text-success"
              : "text-muted-foreground"
          )}
        >
          {dayView.progress.complete ? (
            <>
              <CheckCircle2Icon className="size-3.5" />
              Day complete
            </>
          ) : (
            `${dayView.progress.percent}% of this day`
          )}
        </span>
      </div>

      <Progress
        value={dayView.progress.percent}
        aria-label={`Day ${dayView.day.index} ${dayView.progress.percent}% complete`}
        className={cn(
          dayView.progress.complete &&
            "[&_[data-slot=progress-indicator]]:bg-success"
        )}
      />

      <ul className="space-y-2.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            done={isTaskDone(progress, task.id)}
            onToggle={() => onToggleTask(task.id)}
          />
        ))}
      </ul>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Checking a box writes only that task&apos;s status. Day, phase and
        overall progress are recalculated from your checks.
      </p>
    </div>
  );
}
