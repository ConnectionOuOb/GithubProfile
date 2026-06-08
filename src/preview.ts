import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { renderProfileCard } from "./render/profile-card.js";
import type { ProfileData } from "./types.js";

const mock: ProfileData = {
  stats: {
    name: "Your Name",
    login: "username",
    avatarUrl: "https://avatars.githubusercontent.com/u/9919?s=120&v=4",
    totalStars: 1284,
    totalCommits: 2341,
    totalPRs: 186,
    totalIssues: 73,
    totalReviews: 412,
  },
  streak: {
    totalContributions: 4821,
    firstContribution: "2021-03-15",
    currentStreak: { start: "2026-05-28", end: "2026-06-05", length: 9 },
    longestStreak: { start: "2025-11-01", end: "2025-12-18", length: 48 },
  },
};

const output = resolve("profile/card.svg");
const svg = renderProfileCard(mock);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, "utf8");
console.log(`Preview written to ${output}`);
