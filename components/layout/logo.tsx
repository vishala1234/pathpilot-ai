import { CompassIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  showTagline = true,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 transition-transform duration-300 group-hover:-rotate-6">
        <CompassIcon className="size-5" strokeWidth={1.75} />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-success ring-2 ring-background" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">
          PathPilot <span className="text-success">AI</span>
        </span>
        {showTagline ? (
          <span className="mt-1 text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Career copilot
          </span>
        ) : null}
      </span>
    </Link>
  );
}
