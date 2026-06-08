export interface ContributionDay {
  date: string;
  count: number;
}

export interface StreakInfo {
  start: string;
  end: string;
  length: number;
}

export interface StreakStats {
  totalContributions: number;
  firstContribution: string;
  currentStreak: StreakInfo;
  longestStreak: StreakInfo;
}

export interface UserStats {
  name: string;
  login: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
}

export interface ProfileData {
  stats: UserStats;
  streak: StreakStats;
}
