import { graphql } from "./client.js";
import type { ContributionDay, ProfileData } from "../types.js";
import { computeStreak } from "../streak/compute.js";
import { extractStats } from "../stats/extract.js";

interface YearCalendar {
  weeks: {
    contributionDays: { date: string; contributionCount: number }[];
  }[];
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

const YEAR_CALENDAR_QUERY = `
  query YearCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
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

function yearsToFetch(createdAt: string, contributionYears: number[]): number[] {
  const currentYear = new Date().getFullYear();
  const createdYear = Number(createdAt.slice(0, 4));
  const minYear = Math.max(createdYear, 2005);
  const years = new Set<number>();

  for (let y = minYear; y < currentYear; y++) years.add(y);

  const earliest = contributionYears.at(-1);
  if (earliest !== undefined && earliest < 2005) years.add(earliest);

  return [...years].sort((a, b) => a - b);
}

async function fetchYearCalendar(
  login: string,
  year: number,
  token: string,
): Promise<ContributionDay[]> {
  const data = await graphql<{
    user: { contributionsCollection: { contributionCalendar: YearCalendar } };
  }>(
    YEAR_CALENDAR_QUERY,
    {
      login,
      from: `${year}-01-01T00:00:00Z`,
      to: `${year}-12-31T23:59:59Z`,
    },
    token,
  );

  return flattenCalendar(data.user.contributionsCollection.contributionCalendar);
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
): Promise<ProfileData> {
  const { user } = await graphql<UserQueryResult>(
    USER_STATS_QUERY,
    { login: username },
    token,
  );

  if (!user) {
    throw new Error(`User "${username}" not found.`);
  }

  const currentYearDays = flattenCalendar(
    user.contributionsCollection.contributionCalendar,
  );

  const historicalYears = yearsToFetch(
    user.createdAt,
    user.contributionsCollection.contributionYears,
  );

  const historicalDays = (
    await Promise.all(
      historicalYears.map((year) => fetchYearCalendar(username, year, token)),
    )
  ).flat();

  const contributions = mergeContributions([
    ...historicalDays,
    ...currentYearDays,
  ]);

  return {
    stats: extractStats(user),
    streak: computeStreak(contributions),
  };
}
