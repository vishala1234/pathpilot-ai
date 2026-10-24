import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track overall progress, today's plan, streaks and next steps — all derived from your completed tasks.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
