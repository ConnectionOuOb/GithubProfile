import type { UserStats } from "../types.js";

interface GitHubUser {
  name: string | null;
  login: string;
  avatarUrl: string;
  commits: { totalCommitContributions: number };
  reviews: { totalPullRequestReviewContributions: number };
  pullRequests: { totalCount: number };
  repositories: {
    totalCount: number;
    nodes: { stargazers: { totalCount: number } }[];
  };
}

export function extractStats(user: GitHubUser): UserStats {
  const totalStars = user.repositories.nodes.reduce(
    (sum, repo) => sum + repo.stargazers.totalCount,
    0,
  );

  return {
    name: user.name ?? user.login,
    login: user.login,
    avatarUrl: user.avatarUrl,
    totalStars,
    totalCommits: user.commits.totalCommitContributions,
    totalPRs: user.pullRequests.totalCount,
    totalRepos: user.repositories.totalCount,
    totalReviews: user.reviews.totalPullRequestReviewContributions,
  };
}
