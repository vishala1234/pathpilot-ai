"use client";

import { ArrowRightIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { isActivePath, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const desktopItems = NAV_ITEMS.filter((item) => item.desktop);

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            {desktopItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            )}
          >
            <SettingsIcon className="size-4" />
          </Link>
          <ThemeToggle />
          <Link
            href="/onboarding"
            className={cn(
              buttonVariants({ size: "sm" }),
              "ml-1 h-8 gap-1.5 px-3 sm:h-9 sm:px-3.5"
            )}
          >
            <span className="hidden sm:inline">Build my roadmap</span>
            <span className="sm:hidden">Start</span>
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
