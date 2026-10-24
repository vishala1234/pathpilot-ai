import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border/70", className)}>
      <div className="container-page py-10 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            {eyebrow ? (
              <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                {eyebrow}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
                {title}
              </h1>
              {badge ? <Badge variant="secondary">{badge}</Badge> : null}
            </div>
            {description ? (
              <p className="text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
