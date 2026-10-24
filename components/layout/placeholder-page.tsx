import { ArrowRightIcon, CheckIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PlaceholderPage({
  icon: Icon,
  eyebrow,
  title,
  description,
  step,
  planned,
  available,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  step: number;
  planned: string[];
  available: string[];
}) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        badge={`Step ${step}`}
        actions={
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            Set up profile
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      <div className="container-page py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border border-dashed border-border bg-card/60 ring-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <CardTitle>This screen is next on the flight plan</CardTitle>
                  <CardDescription>
                    The route is wired up — the content lands in Step {step}.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {planned.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-lg bg-muted/60 px-3 py-2.5 text-sm"
                  >
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Already working
              </Badge>
              <CardTitle className="mt-2">Step 0 is live</CardTitle>
              <CardDescription>
                Shell, navigation and design tokens are in place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {available.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
