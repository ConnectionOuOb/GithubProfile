import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchProfile } from "./github/fetch-profile.js";
import { resolveUsername } from "./github/resolve-user.js";
import { loadEnv } from "./load-env.js";
import { renderProfileCard } from "./render/profile-card.js";

loadEnv();

function getToken(): string | undefined {
  for (const key of ["PROFILE_PAT", "GITHUB_PAT", "GITHUB_TOKEN"] as const) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
}

function reportMissingToken(): never {
  if (process.env.GITHUB_ACTIONS) {
    console.error(
      "Missing PROFILE_PAT repository secret.\n" +
        "GitHub → Settings → Secrets and variables → Actions → New secret\n" +
        "Name: PROFILE_PAT  Value: your PAT (read:user + repo)",
    );
  } else {
    console.error("Missing token. Set GITHUB_TOKEN in .env (see .env.example).");
  }
  process.exit(1);
}

const token = getToken() ?? reportMissingToken();

const outputPath = resolve(
  process.env.OUTPUT_PATH ?? "profile/card.svg",
);

const usernameHint =
  process.env.GITHUB_USERNAME ??
  process.env.GITHUB_REPOSITORY_OWNER ??
  process.argv[2];

try {
  const username = await resolveUsername(token, usernameHint);
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
