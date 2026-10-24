import { addDays, format, parseISO } from "date-fns";

import { isoDateSchema } from "@/lib/schemas/common";

/** A stable 52-bit-ish FNV-1a hash, rendered in base 36. */
export function stableHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36).padStart(7, "0");
}

/**
 * Place plan days on study days only.
 *
 * A student studying 5 days a week gets five consecutive study dates followed
 * by a two-day gap, regardless of which weekday the plan starts on. Plan day 1
 * always lands on `startDate`.
 */
export function scheduleStudyDates(
  startDate: string,
  daysPerWeek: number,
  totalDays: number
): string[] {
  isoDateSchema.parse(startDate);
  if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
    throw new Error(`daysPerWeek must be an integer from 1 to 7, got ${daysPerWeek}`);
  }
  if (!Number.isInteger(totalDays) || totalDays < 1) {
    throw new Error(`totalDays must be a positive integer, got ${totalDays}`);
  }

  const start = parseISO(startDate);
  const dates: string[] = [];

  for (let index = 0; index < totalDays; index += 1) {
    const week = Math.floor(index / daysPerWeek);
    const dayInWeek = index % daysPerWeek;
    const offset = week * 7 + dayInWeek;
    dates.push(format(addDays(start, offset), "yyyy-MM-dd"));
  }

  return dates;
}

/** Midnight UTC timestamp on the plan start date, used for stable timestamps. */
export function startOfPlanTimestamp(startDate: string): string {
  isoDateSchema.parse(startDate);
  return `${startDate}T00:00:00.000Z`;
}
