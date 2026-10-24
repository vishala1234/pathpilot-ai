"use client";

import {
  BookOpenIcon,
  CheckIcon,
  ClockIcon,
  FolderKanbanIcon,
  HammerIcon,
  LightbulbIcon,
  RefreshCwIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SKILLS_BY_ID } from "@/lib/data/skills";
import { TASK_TYPE_LABELS } from "@/lib/roadmap/view";
import type { Task, TaskType } from "@/types";
import { cn } from "@/lib/utils";

const TASK_TYPE_ICONS: Record<TaskType, LucideIcon> = {
  learn: BookOpenIcon,
  practice: LightbulbIcon,
  build: HammerIcon,
  quiz: LightbulbIcon,
  review: RefreshCwIcon,
  project: FolderKanbanIcon,
};

export function TaskCard({
  task,
  done,
  onToggle,
}: {
  task: Task;
  done: boolean;
  onToggle: () => void;
}) {
  const Icon = TASK_TYPE_ICONS[task.type];
  const titleId = `task-title-${task.id}`;
  const skills = task.skillIds
    .map((skillId) => SKILLS_BY_ID[skillId]?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <li
      className={cn(
        "flex gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors",
        done && "border-success/30 bg-success/5"
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={() => onToggle()}
        aria-labelledby={titleId}
        aria-label={`Mark "${task.title}" ${
          done ? "incomplete" : "complete"
        }`}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p
            id={titleId}
            className={cn(
              "text-sm leading-snug font-medium",
              done && "text-muted-foreground line-through decoration-success/60"
            )}
          >
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {task.optional ? (
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                Optional
              </Badge>
            ) : null}
            <Badge variant="secondary" className="h-4 gap-1 px-1.5 text-[10px]">
              <Icon className="size-2.5" />
              {TASK_TYPE_LABELS[task.type]}
            </Badge>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" />
            {task.minutes} min
          </span>
          <span className="truncate">Topic: {task.topic}</span>
          {skills.length > 0 ? (
            <span className="truncate">Skills: {skills.join(", ")}</span>
          ) : null}
        </div>

        {done ? (
          <p className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <CheckIcon className="size-3" strokeWidth={3} />
            Completed
          </p>
        ) : null}
      </div>
    </li>
  );
}
