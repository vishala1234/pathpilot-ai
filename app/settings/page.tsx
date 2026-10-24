import type { Metadata } from "next";

import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage study schedule, theme and data. Uses existing engine actions to rebalance or reschedule safely.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
