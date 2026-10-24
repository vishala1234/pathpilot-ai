import type { Metadata } from "next";

import { RoadmapView } from "@/components/roadmap/roadmap-view";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Your 45-day PathPilot roadmap: nine phases, day-wise tasks and progress derived from the tasks you complete.",
};

export default function RoadmapPage() {
  return <RoadmapView />;
}
