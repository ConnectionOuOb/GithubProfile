import { graphql } from "../github/client.js";
import { formatLines } from "../render/format.js";
import type { LanguageStat } from "../types.js";

interface RepoLanguageNode {
  name: string;
  languages: {
    edges: { size: number; node: { name: string; color: string | null } }[];
  };
}

const LANGUAGES_QUERY = `
  query UserLanguages($login: String!) {
    user(login: $login) {
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        nodes {
          name
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

function aggregateLanguages(
  repos: RepoLanguageNode[],
  excludeRepos: string[],
): LanguageStat[] {
  const exclude = new Set(excludeRepos.map((r) => r.toLowerCase()));
  const map = new Map<string, LanguageStat & { repos: Set<string> }>();

  for (const repo of repos) {
    if (exclude.has(repo.name.toLowerCase())) continue;

    for (const edge of repo.languages.edges) {
      const { name, color } = edge.node;
      let entry = map.get(name);
      if (!entry) {
        entry = { name, color: color ?? "#858585", size: 0, count: 0, repos: new Set() };
        map.set(name, entry);
      }
      entry.size += edge.size;
      if (!entry.repos.has(repo.name)) {
        entry.repos.add(repo.name);
        entry.count += 1;
      }
    }
  }

  return [...map.values()]
    .map(({ repos: _repos, ...rest }) => rest)
    .sort((a, b) => b.size - a.size);
}

/** Markup / generated languages excluded from Top Languages by default. */
export const MARKUP_LANGUAGES = [
  "HTML",
  "CSS",
  "SCSS",
  "Sass",
  "Less",
  "Stylus",
  "Markdown",
  "JSON",
  "YAML",
  "XML",
  "SVG",
] as const;

export function allHiddenLanguages(userHide: string[] = []): string[] {
  return [
    ...new Set([...MARKUP_LANGUAGES, ...userHide].map((h) => h.trim()).filter(Boolean)),
  ];
}

function joinEnglish(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`;
}

export function excludedLanguageNote(
  allLangs: LanguageStat[],
  userHide: string[] = [],
): string {
  const hideSet = new Set(allHiddenLanguages(userHide).map((h) => h.toLowerCase()));
  const excluded = allLangs.filter((l) => hideSet.has(l.name.toLowerCase()));
  if (excluded.length === 0) return "";

  const parts = excluded.map((l) => `${formatLines(l.size)} of ${l.name}`);
  return `${joinEnglish(parts)} are not included in statistics.`;
}

export interface LanguageOptions {
  count?: number;
  hide?: string[];
}

export function filterLanguages(
  langs: LanguageStat[],
  { count = 10, hide = [] }: LanguageOptions = {},
): LanguageStat[] {
  const hideSet = new Set(hide.map((h) => h.toLowerCase().trim()).filter(Boolean));
  return langs.filter((l) => !hideSet.has(l.name.toLowerCase())).slice(0, count);
}

export async function fetchLanguages(
  username: string,
  token: string,
  excludeRepos: string[] = [],
): Promise<LanguageStat[]> {
  const data = await graphql<{
    user: { repositories: { nodes: RepoLanguageNode[] } } | null;
  }>(LANGUAGES_QUERY, { login: username }, token);

  if (!data.user) {
    throw new Error(`User "${username}" not found.`);
  }

  return aggregateLanguages(data.user.repositories.nodes, excludeRepos);
}
