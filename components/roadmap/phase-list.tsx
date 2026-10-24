"use client";

import type { RoadmapPhaseView } from "@/lib/roadmap/view";

import { PhaseCard } from "./phase-card";

export function PhaseList({
  phases,
  selectedDayId,
  collapsedPhaseIds,
  onTogglePhase,
  onSelectDay,
}: {
  phases: RoadmapPhaseView[];
  selectedDayId: string | null;
  collapsedPhaseIds: ReadonlySet<string>;
  onTogglePhase: (phaseId: string) => void;
  onSelectDay: (dayId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {phases.map((phaseView) => (
        <PhaseCard
          key={phaseView.phase.id}
          phaseView={phaseView}
          expanded={!collapsedPhaseIds.has(phaseView.phase.id)}
          selectedDayId={selectedDayId}
          onToggle={() => onTogglePhase(phaseView.phase.id)}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
}
