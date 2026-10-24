import type { Metadata } from "next";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Student profile",
  description:
    "Tell PathPilot where you study, where you want to land and how much time you have, then generate your 45-day career roadmap.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
