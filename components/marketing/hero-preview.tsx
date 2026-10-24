import {
  CheckIcon,
  ClockIcon,
  FlameIcon,
  SparklesIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tasks = [
  { title: "Learn variables", minutes: 20, done: true },
  { title: "Practice data types", minutes: 15, done: true },
  { title: "Solve 3 coding problems", minutes: 30, done: true },
  { title: "Take a short quiz", minutes: 15, done: false },
];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-success/20 via-transparent to-primary/10 blur-2xl"
      />

      <Card className="gap-0 overflow-visible rounded-2xl border border-border/80 shadow-xl shadow-primary/10 ring-1 ring-border/60">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Day 1 · Phase 1
            </p>
            <p className="font-display mt-0.5 text-2xl leading-none">
              Python Basics
            </p>
          </div>
          <Badge className="bg-success/15 text-success" variant="secondary">
            Today
          </Badge>
        </div>

        <div className="space-y-1 px-3 py-4">
          {tasks.map((task) => (
            <div
              key={task.title}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors",
                task.done ? "text-muted-foreground" : "text-foreground"
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                  task.done
                    ? "border-success bg-success text-success-foreground"
                    : "border-input bg-background"
                )}
              >
                {task.done ? (
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                ) : null}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm",
                  task.done && "line-through decoration-success/40"
                )}
              >
                {task.title}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
                <ClockIcon className="size-3" />
                {task.minutes}m
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border/70 bg-muted/40 px-5 py-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Daily progress</span>
            <span className="tabular-nums text-muted-foreground">
              3 of 4 · 75%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full w-[75%] rounded-full bg-success" />
          </div>
        </div>
      </Card>

      <div className="absolute -top-4 -right-3 hidden rotate-2 items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium shadow-md sm:flex">
        <FlameIcon className="size-3.5 text-streak" />
        6-day streak
      </div>

      <div className="absolute -bottom-6 -left-4 hidden w-44 rounded-xl border border-border/80 bg-card p-3 shadow-lg sm:block">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          <SparklesIcon className="size-3 text-success" />
          Overall progress
        </div>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-none">
          38%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full w-[38%] rounded-full bg-primary" />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          12 of 45 days complete
        </p>
      </div>
    </div>
  );
}
