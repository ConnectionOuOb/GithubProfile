import { graphql } from "./client.js";
import { fetchLanguages } from "../stats/languages.js";
import type { ContributionDay, ProfileData, YearlyActivity } from "../types.js";
import { computeStreak } from "../streak/compute.js";
import { extractStats } from "../stats/extract.js";

interface YearCalendar {
  weeks: {
    contributionDays: { date: string; contributionCount: number }[];
  }[];
}

interface YearCollection {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  totalPullRequestReviewContributions: number;
  contributionCalendar: YearCalendar;
}

interface UserQueryResult {
  user: {
    name: string | null;
    login: string;
    avatarUrl: string;
    createdAt: string;
    commits: { totalCommitContributions: number };
    reviews: { totalPullRequestReviewContributions: number };
    pullRequests: { totalCount: number };
    openIssues: { totalCount: number };
    closedIssues: { totalCount: number };
    repositories: {
      nodes: { stargazers: { totalCount: number } }[];
    };
    contributionsCollection: {
      contributionYears: number[];
      contributionCalendar: YearCalendar;
    };
  } | null;
}

const USER_STATS_QUERY = `
  query UserStats($login: String!) {
    user(login: $login) {
      name
      login
      avatarUrl
      createdAt
      commits: contributionsCollection { totalCommitContributions }
      reviews: contributionsCollection { totalPullRequestReviewContributions }
      pullRequests { totalCount }
      openIssues: issues(states: OPEN) { totalCount }
      closedIssues: issues(states: CLOSED) { totalCount }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes { stargazers { totalCount } }
      }
      contributionsCollection {
        contributionYears
        contributionCalendar {
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }
`;

const YEAR_DATA_QUERY = `
  query YearData($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }
`;

function flattenCalendar(calendar: YearCalendar): ContributionDay[] {
  const days: ContributionDay[] = [];
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      days.push({ date: day.date, count: day.contributionCount });
    }
  }
  return days;
}

function sumContributions(calendar: YearCalendar): number {
  let total = 0;
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      total += day.contributionCount;
    }
  }
  return total;
}

function allYears(createdAt: string, contributionYears: number[]): number[] {
  const currentYear = new Date().getFullYear();
  const createdYear = Number(createdAt.slice(0, 4));
  const minYear = Math.max(createdYear, 2005);
  const years = new Set<number>(contributionYears);

  years.add(currentYear);
  for (let y = minYear; y <= currentYear; y++) years.add(y);

  const earliest = contributionYears.at(-1);
  if (earliest !== undefined && earliest < 2005) years.add(earliest);

  return [...years].sort((a, b) => a - b);
}

async function fetchYearData(
  login: string,
  year: number,
  token: string,
): Promise<{ days: ContributionDay[]; activity: YearlyActivity }> {
  const data = await graphql<{
    user: { contributionsCollection: YearCollection };
  }>(
    YEAR_DATA_QUERY,
    {
      login,
      from: `${year}-01-01T00:00:00Z`,
      to: `${year}-12-31T23:59:59Z`,
    },
    token,
  );

  const collection = data.user.contributionsCollection;
  const calendar = collection.contributionCalendar;

  return {
    days: flattenCalendar(calendar),
    activity: {
      year,
      commits: collection.totalCommitContributions,
      pullRequests: collection.totalPullRequestContributions,
      issues: collection.totalIssueContributions,
      reviews: collection.totalPullRequestReviewContributions,
      contributions: sumContributions(calendar),
    },
  };
}

function mergeContributions(days: ContributionDay[]): Map<string, number> {
  const map = new Map<string, number>();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  for (const { date, count } of days) {
    if (date > tomorrow) continue;
    if (date > today && count === 0) continue;
    map.set(date, count);
  }

  return map;
}

export async function fetchProfile(
  username: string,
  token: string,
  options: { excludeRepos?: string[] } = {},
): Promise<ProfileData> {
  const { user } = await graphql<UserQueryResult>(
    USER_STATS_QUERY,
    { login: username },
    token,
  );

  if (!user) {
    throw new Error(`User "${username}" not found.`);
  }

  const years = allYears(
    user.createdAt,
    user.contributionsCollection.contributionYears,
  );

  const yearResults = await Promise.all(
    years.map((year) => fetchYearData(username, year, token)),
  );

  const languages = await fetchLanguages(username, token, options.excludeRepos ?? []);

  const allDays = yearResults.flatMap((r) => r.days);
  const contributions = mergeContributions(allDays);

  return {
    stats: extractStats(user),
    streak: computeStreak(contributions),
    yearly: yearResults.map((r) => r.activity),
    languages,
  };
}
