import type { StreakStats } from "../types.js";

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);

  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return dates;
}

export function computeStreak(
  contributions: Map<string, number>,
): StreakStats {
  const sorted = [...contributions.keys()].sort();
  if (sorted.length === 0) {
    throw new Error("No contributions found.");
  }

  const first = sorted[0];
  const today = sorted.at(-1)!;
  const dates = dateRange(first, today);

  const stats: StreakStats = {
    totalContributions: 0,
    firstContribution: "",
    currentStreak: { start: first, end: first, length: 0 },
    longestStreak: { start: first, end: first, length: 0 },
  };

  for (const date of dates) {
    const count = contributions.get(date) ?? 0;
    stats.totalContributions += count;

    if (count > 0) {
      stats.currentStreak.length += 1;
      stats.currentStreak.end = date;

      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = date;
      }
      if (!stats.firstContribution) {
        stats.firstContribution = date;
      }
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak = { ...stats.currentStreak };
      }
    } else if (date !== today) {
      stats.currentStreak = { start: today, end: today, length: 0 };
    }
  }

  return stats;
}
