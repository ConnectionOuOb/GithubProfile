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
  avatarUrl: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalRepos: number;
  totalReviews: number;
}

export interface YearlyActivity {
  year: number;
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  contributions: number;
}

export interface LanguageStat {
  name: string;
  color: string;
  size: number;
  count: number;
}

export interface ProfileData {
  stats: UserStats;
  streak: StreakStats;
  yearly: YearlyActivity[];
  languages: LanguageStat[];
  excludedLanguageNote?: string;
}
