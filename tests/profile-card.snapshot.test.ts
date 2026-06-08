import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { stripXmlWhitespace } from "../src/render/format.js";
import { renderProfileCard } from "../src/render/profile-card.js";
import type { ProfileData } from "../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotPath = resolve(__dirname, "__snapshots__/profile-card.svg");

const mock: ProfileData = {
  stats: {
    name: "Snapshot User",
    login: "snapshot-user",
    avatarUrl: "https://example.com/avatar.png",
    totalStars: 1234,
    totalCommits: 56_789,
    totalPRs: 999,
    totalRepos: 42,
    totalReviews: 12,
  },
  streak: {
    totalContributions: 4800,
    firstContribution: "2021-03-15",
    currentStreak: { start: "2026-06-05", end: "2026-06-05", length: 7 },
    longestStreak: { start: "2025-11-01", end: "2025-12-18", length: 26 },
  },
  yearly: [
    { year: 2024, commits: 124, pullRequests: 210, issues: 6, reviews: 18, contributions: 890 },
    { year: 2025, commits: 98, pullRequests: 312, issues: 9, reviews: 22, contributions: 2100 },
  ],
  languages: [
    { name: "TypeScript", color: "#3178c6", size: 420_000, count: 12 },
    { name: "Python", color: "#3572A5", size: 180_000, count: 5 },
    { name: "UnknownLang", color: "#abcdef", size: 1000, count: 1 },
  ],
  excludedLanguageNote: "1.2M lines of JavaScript are not included in statistics.",
};

test("renderProfileCard matches snapshot", () => {
  const svg = stripXmlWhitespace(
    renderProfileCard(mock, {
      showReviews: true,
      avatarDataUri: undefined,
    }),
  );

  if (process.env.SNAPSHOT_UPDATE === "1") {
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, svg, "utf8");
    return;
  }

  const expected = readFileSync(snapshotPath, "utf8");
  assert.equal(svg, expected);
});
