import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchAvatarDataUri } from "./github/avatar.js";
import { fetchProfile } from "./github/fetch-profile.js";
import { resolveUsername } from "./github/resolve-user.js";
import {
  allHiddenLanguages,
  excludedLanguageNote,
  filterLanguages,
} from "./stats/languages.js";
import { loadEnv } from "./load-env.js";
import { stripXmlWhitespace } from "./render/format.js";
import { renderProfileCard } from "./render/profile-card.js";

loadEnv();

function parseList(value: string | undefined): string[] {
  return value
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
}

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
const outputPath = resolve(process.env.OUTPUT_PATH ?? "profile/card.svg");

const usernameHint =
  process.env.GITHUB_USERNAME ??
  process.env.GITHUB_REPOSITORY_OWNER ??
  process.argv[2];

try {
  const username = await resolveUsername(token, usernameHint);
  const excludeRepos = parseList(process.env.EXCLUDE_REPOS);

  const data = await fetchProfile(username, token, { excludeRepos });
  const avatarDataUri = await fetchAvatarDataUri(data.stats.avatarUrl, token);

  const hideLanguages = parseList(process.env.HIDE_LANGUAGES ?? "JavaScript");
  const langsCount = Math.min(
    20,
    Math.max(1, Number.parseInt(process.env.LANGS_COUNT ?? "20", 10) || 20),
  );

  const languageNote = excludedLanguageNote(data.languages, hideLanguages);
  const languages = filterLanguages(data.languages, {
    count: langsCount,
    hide: allHiddenLanguages(hideLanguages),
  });

  const svg = stripXmlWhitespace(
    renderProfileCard(
      { ...data, languages, excludedLanguageNote: languageNote },
      {
        showReviews: process.env.SHOW_REVIEWS === "true",
        avatarDataUri,
      },
    ),
  );

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, svg, "utf8");

  console.log(`Generated ${outputPath} for @${username}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
