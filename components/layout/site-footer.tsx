import Link from "next/link";

import { Logo } from "@/components/layout/logo";

const footerLinks = [
  { label: "Roadmap", href: "/roadmap" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Assistant", href: "/assistant" },
  { label: "Settings", href: "/settings" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="container-page flex flex-col gap-8 py-10 pb-12 md:flex-row md:items-start md:justify-between md:pb-10">
        <div className="space-y-3">
          <Logo showTagline={false} />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Your career goal, broken into days you can actually do. Progress is
            saved locally in your browser.
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Product
            </p>
            <ul className="space-y-2 text-sm">
              {footerLinks.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Workspace
            </p>
            <ul className="space-y-2 text-sm">
              {footerLinks.slice(3).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-border/70 py-5 pb-28 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:pb-5">
        <p>© 2026 PathPilot AI</p>
        <p>Built for students · No account needed</p>
      </div>
    </footer>
  );
}
