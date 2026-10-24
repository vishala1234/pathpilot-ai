"use client";

import {
  ArrowRightIcon,
  CalendarCheck2Icon,
  CheckCircle2Icon,
  ClockIcon,
  FlameIcon,
  FolderCodeIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  RouteIcon,
  TargetIcon,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProjectsForCareer } from "@/lib/data/projects";
import { getPhaseProgressFor } from "@/lib/store/selectors";
import {
  useProfile,
  useProgressState,
  useProgressSummary,
  useRoadmap,
  useStoresHydrated,
  useTodayPlan,
} from "@/lib/store";
import { formatMinutes } from "@/lib/roadmap/view";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const hydrated = useStoresHydrated();
  const profile = useProfile();
  const roadmap = useRoadmap();
  const progress = useProgressState();
  const summary = useProgressSummary();
  const todayPlan = useTodayPlan();

  if (!hydrated) {
    return (
      <>
        <PageHeader
          eyebrow="Dashboard"
          title="Loading dashboard"
          description="Computing progress from your taskStatus."
          badge="Loading"
        />
        <div className="container-page py-8 md:py-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!roadmap || !progress || !summary) {
    return (
      <>
        <PageHeader
          eyebrow="Dashboard"
          title="Your progress at a glance"
          description="Build a roadmap to see completion, streaks and today's focus."
          badge="No roadmap"
        />
        <div className="container-page py-8 md:py-12">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="flex flex-col items-center gap-4 px-5 py-10 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <LayoutDashboardIcon className="size-7" />
              </span>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl">Start your journey</h2>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Complete onboarding to generate your 45-day roadmap. Progress
                  updates automatically as you check off tasks.
                </p>
              </div>
              <Button  render={<Link href="/onboarding" className="gap-2" />}>Build roadmap
                  <ArrowRightIcon className="size-4" /></Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const currentPhase = roadmap.phases.find((phase) =>
    phase.dayIds.some((dayId) => {
      const day = roadmap.days.find((d) => d.id === dayId);
      return day && todayPlan?.day.id === day.id;
    })
  );

  const recommended = profile?.targetCareerId
    ? getProjectsForCareer(profile.targetCareerId)[0]
    : null;

  const stats = [
    { label: "Completed tasks", value: `${summary.completedTasks}/${summary.totalTasks}`, icon: CheckCircle2Icon },
    { label: "Completed days", value: `${summary.completedDays}/${summary.totalDays}`, icon: CalendarCheck2Icon },
    { label: "Current streak", value: `${summary.currentStreak} days`, icon: FlameIcon },
    { label: "Study time", value: formatMinutes(summary.completedMinutes), icon: ClockIcon },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`${roadmap.careerTitle} progress`}
        description="All numbers are derived from taskStatus — no duplicates stored."
        badge={`${summary.taskPercent}%`}
        actions={
          <Button  render={<Link href="/roadmap" className="gap-1.5" />}><RouteIcon className="size-4" />
              Go to roadmap</Button>
        }
      />

      <div className="container-page space-y-6 py-8 md:py-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <p className="text-sm font-medium tabular-nums">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="ring-1 ring-foreground/10">
          <CardHeader className="gap-1">
            <CardTitle className="font-heading text-lg">Overall progress</CardTitle>
            <p className="text-xs text-muted-foreground">
              {summary.completedTasks} of {summary.totalTasks} tasks · {formatMinutes(summary.completedMinutes)} of {formatMinutes(summary.totalMinutes)}
            </p>
          </CardHeader>
          <CardContent>
            <Progress value={summary.taskPercent} aria-label={`Overall ${summary.taskPercent}%`} className={cn(summary.taskPercent === 100 && "[&_[data-slot=progress-indicator]]:bg-success")} />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <TargetIcon className="size-4 text-primary" />
                  Today&apos;s plan
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {todayPlan
                    ? todayPlan.scheduledToday
                      ? "Scheduled for today"
                      : "Rest day — showing next incomplete"
                    : "All days complete"}
                </p>
              </div>
              <Button  size="sm" variant="outline" render={<Link href="/roadmap" />}>Open roadmap</Button>
            </CardHeader>
            <CardContent>
              {todayPlan ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Day {todayPlan.day.index}</Badge>
                    <span className="text-sm font-medium">{todayPlan.day.topic}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {todayPlan.progress.completedTasks}/{todayPlan.progress.totalTasks} tasks · {formatMinutes(todayPlan.day.estimatedMinutes)}
                  </p>
                  <Progress value={todayPlan.progress.percent} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Congratulations &mdash; you&apos;ve completed all 45 days.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button  variant="outline" className="w-full justify-between" render={<Link href="/projects" />}><span className="flex items-center gap-2">
                    <FolderCodeIcon className="size-4" />
                    Projects
                  </span>
                  <ArrowRightIcon className="size-4" /></Button>
              <Button  variant="outline" className="w-full justify-between" render={<Link href="/assistant" />}><span className="flex items-center gap-2">
                    <MessageSquareTextIcon className="size-4" />
                    Assistant
                  </span>
                  <ArrowRightIcon className="size-4" /></Button>
              <Button  variant="outline" className="w-full justify-between" render={<Link href="/settings" />}><span className="flex items-center gap-2">
                    <RouteIcon className="size-4" />
                    Settings
                  </span>
                  <ArrowRightIcon className="size-4" /></Button>
            </CardContent>
          </Card>
        </div>

        {recommended ? (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="font-heading text-lg">Recommended project</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Matched to your target career and level
                </p>
              </div>
              <Badge variant="outline" className="capitalize">{recommended.level}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{recommended.title}</p>
                <p className="text-sm text-muted-foreground">{recommended.summary}</p>
              </div>
              <Button  variant="outline" render={<Link href="/projects" />}>View projects</Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
