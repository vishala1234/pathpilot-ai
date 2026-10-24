"use client";

import {
  AlertTriangleIcon,
  CalendarIcon,
  ClockIcon,
  PaletteIcon,
  RefreshCwIcon,
  SettingsIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProfile, useRoadmap, useSettingsStore, useStoresHydrated } from "@/lib/store";
import { useProgressStore } from "@/lib/store/progress";
import { useRoadmapStore } from "@/lib/store/roadmap";
import { resetAllLocalData } from "@/lib/store/reset";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const hydrated = useStoresHydrated();
  const { theme, setTheme } = useTheme();
  const profile = useProfile();
  const roadmap = useRoadmap();
  const settings = useSettingsStore((s) => s.settings);
  const updateDailyMinutes = useRoadmapStore((s) => s.updateDailyMinutes);
  const updateDaysPerWeek = useRoadmapStore((s) => s.updateDaysPerWeek);
  const updateStartDate = useRoadmapStore((s) => s.updateStartDate);
  const resetRoadmap = useRoadmapStore((s) => s.resetRoadmap);

  const [dailyMinutes, setDailyMinutes] = useState(profile?.dailyMinutes?.toString() ?? "90");
  const [daysPerWeek, setDaysPerWeek] = useState(profile?.daysPerWeek?.toString() ?? "5");
  const [startDate, setStartDate] = useState(roadmap?.startDate ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const applyDailyMinutes = () => {
    const minutes = Number(dailyMinutes);
    try {
      updateDailyMinutes(minutes);
      setMessage("Daily minutes updated. Unfinished days rebalanced; completed days protected.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const applyDaysPerWeek = () => {
    const days = Number(daysPerWeek);
    try {
      updateDaysPerWeek(days);
      setMessage("Study days updated. Calendar rescheduled; tasks and completions unchanged.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const applyStartDate = () => {
    try {
      updateStartDate(startDate);
      setMessage("Start date updated. Plan rescheduled from the new start date.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update");
    }
  };

  if (!hydrated) {
    return (
      <>
        <PageHeader
          eyebrow="Settings"
          title="Loading settings"
          description="Reading your saved preferences."
          badge="Loading"
        />
        <div className="container-page py-8 md:py-12">
          <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Profile & preferences"
        description="Manage study schedule, theme and data. Changes use the existing engine rules."
        badge="Local only"
      />

      <div className="container-page space-y-4 py-8 md:py-10">
        {message ? (
          <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {message}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <PaletteIcon className="size-4" />
              Appearance
            </CardTitle>
            <CardDescription>Theme preference saved locally.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(["system", "light", "dark"] as const).map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={theme === t ? "default" : "outline"}
                onClick={() => setTheme(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <ClockIcon className="size-4" />
              Study schedule
            </CardTitle>
            <CardDescription>
              Uses existing rebalance/reschedule actions. Completed work is protected.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Daily minutes (15-480)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={15}
                  max={480}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <Button type="button" onClick={applyDailyMinutes}>Apply</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Days per week (1-7)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <Button type="button" onClick={applyDaysPerWeek}>Apply</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Start date (YYYY-MM-DD)</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <Button type="button" onClick={applyStartDate}>Apply</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <UserIcon className="size-4" />
              Profile
            </CardTitle>
            <CardDescription>
              {profile ? `${profile.name} · ${profile.targetCareerId.replace(/-/g, " ")}` : "No profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline"  render={<a href="/onboarding" />}>Edit in onboarding</Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg text-destructive">
              <AlertTriangleIcon className="size-4" />
              Danger zone
            </CardTitle>
            <CardDescription>Destructive actions require confirmation.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" className="text-destructive"><RefreshCwIcon />Reset roadmap</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset roadmap?</DialogTitle>
                  <DialogDescription>
                    This clears your roadmap and all task progress. Your profile will be kept.
                    You can build a new roadmap from onboarding.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      resetRoadmap();
                      setMessage("Roadmap and progress reset. Profile kept.");
                    }}
                  >
                    Reset roadmap
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger render={<Button variant="destructive"><Trash2Icon />Reset all local data</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset everything?</DialogTitle>
                  <DialogDescription>
                    This removes profile, roadmap, progress, settings and all PathPilot
                    localStorage keys. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      resetAllLocalData();
                      window.location.href = "/";
                    }}
                  >
                    Reset all data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
