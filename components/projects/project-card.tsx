"use client";

import {
  ArrowUpRightIcon,
  ClockIcon,
  Code2Icon,
  TargetIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SKILLS_BY_ID } from "@/lib/data/skills";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = {
  beginner: "border-success/30 bg-success/15 text-success",
  intermediate: "border-primary/30 bg-primary/10 text-primary",
  advanced: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
} as const;

export function ProjectCard({
  project,
  recommended = false,
}: {
  project: Project;
  recommended?: boolean;
}) {
  const skills = project.skills
    .map((skillId) => SKILLS_BY_ID[skillId]?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <Card
      className={cn(
        "h-full ring-1 ring-foreground/5 transition-shadow hover:shadow-sm",
        recommended && "ring-primary/40"
      )}
    >
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="font-heading text-lg">{project.title}</CardTitle>
          <div className="flex items-center gap-1.5">
            {recommended ? (
              <Badge variant="secondary" className="gap-1">
                <TargetIcon className="size-3" />
                Recommended
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className={cn("capitalize", LEVEL_STYLES[project.level])}
            >
              {project.level}
            </Badge>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3.5" />
            {project.estimatedHours}h estimated
          </span>
          <span className="inline-flex items-center gap-1">
            <Code2Icon className="size-3.5" />
            Repo: {project.repoName}
          </span>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Why it matters
          </p>
          <p className="mt-1 text-xs leading-relaxed">{project.whyItMatters}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Skills covered
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-[11px]">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Deliverables
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
            {project.deliverables.map((item) => (
              <li key={item} className="flex gap-2">
                <ArrowUpRightIcon className="mt-0.5 size-3 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-[11px] text-muted-foreground">
          Add to your portfolio as a concrete project to showcase on resumes.
        </p>
      </CardFooter>
    </Card>
  );
}
