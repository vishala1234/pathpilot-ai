import type { Metadata } from "next";

import { ProjectsView } from "@/components/projects/projects-view";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Portfolio projects matched to your target career — filter by level, see skills covered and build something to showcase.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
