import type { UserStats } from "../types.js";

interface GitHubUser {
  name: string | null;
  login: string;
  commits: { totalCommitContributions: number };
  reviews: { totalPullRequestReviewContributions: number };
  pullRequests: { totalCount: number };
  openIssues: { totalCount: number };
  closedIssues: { totalCount: number };
  repositories: { nodes: { stargazers: { totalCount: number } }[] };
}

export function extractStats(user: GitHubUser): UserStats {
  const totalStars = user.repositories.nodes.reduce(
    (sum, repo) => sum + repo.stargazers.totalCount,
    0,
  );

  return {
    name: user.name ?? user.login,
    login: user.login,
    totalStars,
    totalCommits: user.commits.totalCommitContributions,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.openIssues.totalCount + user.closedIssues.totalCount,
    totalReviews: user.reviews.totalPullRequestReviewContributions,
  };
}
