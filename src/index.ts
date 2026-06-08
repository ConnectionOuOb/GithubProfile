import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchProfile } from "./github/fetch-profile.js";
import { renderProfileCard } from "./render/profile-card.js";

const username =
  process.env.GITHUB_USERNAME ??
  process.env.GITHUB_REPOSITORY_OWNER ??
  process.argv[2];

const token = process.env.GITHUB_TOKEN;
const outputPath = resolve(
  process.env.OUTPUT_PATH ?? "profile/card.svg",
);

if (!username) {
  console.error("Missing username. Set GITHUB_USERNAME or pass as argument.");
  process.exit(1);
}

if (!token) {
  console.error("Missing GITHUB_TOKEN.");
  process.exit(1);
}

try {
  const data = await fetchProfile(username, token);
  const svg = renderProfileCard(data, {
    showReviews: process.env.SHOW_REVIEWS === "true",
  });

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, svg, "utf8");

  console.log(`Generated ${outputPath} for @${username}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
