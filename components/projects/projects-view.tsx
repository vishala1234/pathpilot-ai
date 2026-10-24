"use client";

import { FolderCodeIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getProjectsForCareer } from "@/lib/data/projects";
import { useProfile, useStoresHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

import { ProjectCard } from "./project-card";

const LEVELS = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export function ProjectsView() {
  const hydrated = useStoresHydrated();
  const profile = useProfile();
  const [levelFilter, setLevelFilter] = useState<(typeof LEVELS)[number]["value"]>("all");

  const projects = useMemo(() => {
    if (!profile?.targetCareerId) return [];
    const careerProjects = getProjectsForCareer(profile.targetCareerId);
    if (levelFilter === "all") return careerProjects;
    return careerProjects.filter((project) => project.level === levelFilter);
  }, [profile?.targetCareerId, levelFilter]);

  if (!hydrated) {
    return (
      <>
        <PageHeader
          eyebrow="Portfolio"
          title="Loading projects"
          description="Finding projects that match your target career."
          badge="Loading"
        />
        <div className="container-page py-8 md:py-12">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!profile?.targetCareerId) {
    return (
      <>
        <PageHeader
          eyebrow="Portfolio"
          title="Projects that prove your skills"
          description="Build a roadmap first to get projects matched to your target career."
          badge="No profile"
        />
        <div className="container-page py-8 md:py-12">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="flex flex-col items-center gap-4 px-5 py-10 text-center md:px-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FolderCodeIcon className="size-7" />
              </span>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl">Build your roadmap first</h2>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                  Project recommendations are filtered by your target career. Complete
                  onboarding to unlock career-matched portfolio projects.
                </p>
              </div>
              <Button  render={<Link href="/onboarding" className="gap-2" />}>Start onboarding
                  <SparklesIcon className="size-4" /></Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const recommendedId = projects[0]?.id;

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects that prove the skills"
        description="Recommended from the catalog based on your target career. Pick one to build after completing its related roadmap phase."
        badge={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        actions={
          <Button  variant="outline" render={<Link href="/assistant" className="gap-1.5" />}>Ask assistant for advice
              <SparklesIcon className="size-4" /></Button>
        }
      />

      <div className="container-page space-y-6 py-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2">
          {LEVELS.map((level) => (
            <Button
              key={level.value}
              type="button"
              size="sm"
              variant={levelFilter === level.value ? "default" : "outline"}
              onClick={() => setLevelFilter(level.value)}
              aria-pressed={levelFilter === level.value}
            >
              {level.label}
            </Button>
          ))}
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <p className="font-heading text-lg">No projects match this filter</p>
              <p className="text-sm text-muted-foreground">
                Try a different level to see more portfolio ideas for your career.
              </p>
              <Button type="button" variant="outline" onClick={() => setLevelFilter("all")}>
                Show all projects
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                recommended={project.id === recommendedId}
              />
            ))}
          </div>
        )}

        <Card className="bg-muted/30">
          <CardContent className="flex flex-col gap-2 px-5 py-4 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">Connect to your roadmap</p>
              <p className="text-xs text-muted-foreground">
                Work on these projects as you reach related phases — they reinforce
                exactly the skills your plan is building.
              </p>
            </div>
            <Button  variant="outline" size="sm" render={<Link href="/roadmap" />}>Go to roadmap</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
