import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { renderProfileCard } from "./render/profile-card.js";
import type { ProfileData } from "./types.js";

const mock: ProfileData = {
  stats: {
    name: "Connection",
    login: "ConnectionOuOb",
    avatarUrl: "https://avatars.githubusercontent.com/u/9919?s=120&v=4",
    totalStars: 15,
    totalCommits: 289,
    totalPRs: 671,
    totalIssues: 22,
    totalReviews: 0,
  },
  streak: {
    totalContributions: 4800,
    firstContribution: "2021-03-15",
    currentStreak: { start: "2026-06-05", end: "2026-06-05", length: 1 },
    longestStreak: { start: "2025-11-01", end: "2025-12-18", length: 26 },
  },
};

const output = resolve("profile/card.svg");
const svg = renderProfileCard(mock);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, "utf8");
console.log(`Preview written to ${output}`);
