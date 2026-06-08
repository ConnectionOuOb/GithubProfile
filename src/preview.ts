import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchAvatarDataUri } from "./github/avatar.js";
import { renderProfileCard } from "./render/profile-card.js";
import type { ProfileData } from "./types.js";

const mock: ProfileData = {
  stats: {
    name: "Connection",
    login: "ConnectionOuOb",
    avatarUrl: "https://avatars.githubusercontent.com/u/69660530?v=4",
    totalStars: 15,
    totalCommits: 295,
    totalPRs: 671,
    totalIssues: 22,
    totalReviews: 48,
  },
  streak: {
    totalContributions: 4800,
    firstContribution: "2021-03-15",
    currentStreak: { start: "2026-06-05", end: "2026-06-05", length: 1 },
    longestStreak: { start: "2025-11-01", end: "2025-12-18", length: 26 },
  },
  yearly: [
    { year: 2022, commits: 42, pullRequests: 18, issues: 5, reviews: 3, contributions: 120 },
    { year: 2023, commits: 86, pullRequests: 45, issues: 8, reviews: 12, contributions: 280 },
    { year: 2024, commits: 124, pullRequests: 210, issues: 6, reviews: 18, contributions: 890 },
    { year: 2025, commits: 98, pullRequests: 312, issues: 9, reviews: 22, contributions: 2100 },
    { year: 2026, commits: 45, pullRequests: 86, issues: 4, reviews: 8, contributions: 1410 },
  ],
  languages: [
    { name: "TypeScript", color: "#3178c6", size: 420_000, count: 12 },
    { name: "Python", color: "#3572A5", size: 180_000, count: 5 },
    { name: "Go", color: "#00ADD8", size: 95_000, count: 3 },
    { name: "C#", color: "#178600", size: 72_000, count: 4 },
    { name: "Shell", color: "#89e051", size: 28_000, count: 6 },
    { name: "HTML", color: "#e34c26", size: 15_000, count: 2 },
  ],
};

const avatarDataUri = await fetchAvatarDataUri(mock.stats.avatarUrl);
const output = resolve("profile/card.svg");
const svg = renderProfileCard(mock, { avatarDataUri, showReviews: true });

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, "utf8");
console.log(`Preview written to ${output}`);
