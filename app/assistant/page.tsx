import type { Metadata } from "next";

import { AssistantView } from "@/components/assistant/assistant-view";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "Grounded career coach using your PathPilot profile, roadmap and progress. AI suggestions only, never auto-mutates your plan.",
};

export default function AssistantPage() {
  return <AssistantView />;
}
