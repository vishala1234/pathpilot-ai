"use client";

import type { RoadmapDayView } from "@/lib/roadmap/view";

import { DayCard } from "./day-card";

export function DayList({
  days,
  selectedDayId,
  onSelectDay,
}: {
  days: RoadmapDayView[];
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {days.map((dayView) => (
        <DayCard
          key={dayView.day.id}
          dayView={dayView}
          selected={dayView.day.id === selectedDayId}
          onSelect={() => onSelectDay(dayView.day.id)}
        />
      ))}
    </div>
  );
}
