import {
  ArrowRightIcon,
  BrainIcon,
  CalendarCheckIcon,
  CircleCheckIcon,
  ClockIcon,
  FolderCodeIcon,
  LockIcon,
  MessageSquareTextIcon,
  WandSparklesIcon,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HeroPreview } from "@/components/marketing/hero-preview";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PathPilot AI — Your 45-day career roadmap",
};

const heroStats = [
  { icon: ClockIcon, label: "60–120 min a day" },
  { icon: CalendarCheckIcon, label: "45 days · 9 phases" },
  { icon: LockIcon, label: "Saved in your browser" },
];

const steps = [
  {
    title: "Tell us where you are",
    description:
      "Your year of study, current skills, target career, confidence level and how much time you can give each day.",
  },
  {
    title: "Get a 45-day flight plan",
    description:
      "A skill-gap analysis turns into phases, then into day-wise tasks with realistic minute estimates.",
  },
  {
    title: "Check off one day at a time",
    description:
      "Every task has a checkbox. Finish them all and the day turns green — miss a day and the plan rebalances.",
  },
];

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: BrainIcon,
    title: "Skill-gap analysis",
    description:
      "See exactly which skills stand between you and your target role — and where the roadmap closes each gap.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Day-wise tasks",
    description:
      "Every day has 4–6 concrete tasks with minute estimates that fit the time you actually have.",
  },
  {
    icon: CircleCheckIcon,
    title: "Green-check progress",
    description:
      "Tick a task for an instant green check. Complete the day and it is marked done — permanently saved.",
  },
  {
    icon: WandSparklesIcon,
    title: "A plan that adapts",
    description:
      "Fall behind and the AI rebalances the remaining days without touching the work you already finished.",
  },
  {
    icon: MessageSquareTextIcon,
    title: "Career assistant",
    description:
      "Ask what to focus on today, get a concept explained, or check whether you are internship-ready.",
  },
  {
    icon: FolderCodeIcon,
    title: "Project recommendations",
    description:
      "Portfolio projects pitched at your level, mapped to the skills your target career actually asks for.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-grid mask-fade absolute inset-0 opacity-70" />
          <div className="absolute -top-32 right-0 size-[30rem] rounded-full bg-success/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 size-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container-page py-16 md:py-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <Badge
                variant="outline"
                className="h-6 gap-1.5 rounded-full border-border/80 bg-background/70 px-2.5 text-[11px] font-medium backdrop-blur"
              >
                <span className="size-1.5 rounded-full bg-success" />
                AI career copilot for college students
              </Badge>

              <h1 className="font-display mt-5 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                Your career goal,
                <br />
                broken into{" "}
                <span className="text-gradient italic">
                  days you can finish.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                PathPilot turns &ldquo;I want to be an AI Engineer&rdquo; into a
                personalized 45-day roadmap — with daily tasks, minute
                estimates, green-check progress and an assistant that
                rebalances your plan when life happens.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/onboarding"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 gap-2 rounded-xl px-6 text-[15px] shadow-sm"
                  )}
                >
                  Build my roadmap
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/roadmap"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 gap-2 rounded-xl bg-background/60 px-6 text-[15px] backdrop-blur"
                  )}
                >
                  See the 45-day plan
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {heroStats.map((stat) => (
                  <li key={stat.label} className="inline-flex items-center gap-1.5">
                    <stat.icon className="size-4 text-primary" />
                    {stat.label}
                  </li>
                ))}
              </ul>
            </div>

            <HeroPreview />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border/70">
        <div className="container-page py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              How it works
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
              From &ldquo;I&rsquo;m interested&rdquo; to{" "}
              <span className="italic">interview-ready.</span>
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="bg-card/70">
                <CardHeader>
                  <span className="font-mono text-xs text-primary">
                    0{index + 1}
                  </span>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/70">
        <div className="container-page py-16 md:py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                What&rsquo;s inside
              </p>
              <h2 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
                Everything a plan needs to{" "}
                <span className="italic">actually get finished.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Built for the way students really study: short sessions, busy
              weeks, and a need to see progress.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group transition-colors hover:border-primary/25 hover:bg-accent/30"
              >
                <CardHeader>
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:-rotate-6">
                    <feature.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <CardTitle className="mt-2 text-base">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground md:px-14 md:py-16">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-[0.08]" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">
              45 days from now
            </p>
            <h2 className="font-display mt-3 text-4xl leading-[1.02] tracking-tight md:text-5xl">
              Start with one day.
              <br />
              <span className="italic">Not one giant plan.</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-primary-foreground/80">
              No sign-up, no credit card. Answer five quick questions and your
              first day is waiting.
            </p>
            <Link
              href="/onboarding"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-background px-6 text-[15px] font-medium text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Build my roadmap
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
