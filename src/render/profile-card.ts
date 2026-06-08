import type { ProfileData } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { theme as t } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
}

const STREAK = [
  { key: "totalContributions" as const, label: "Contributions" },
  { key: "currentStreak" as const, label: "Current Streak", hot: true },
  { key: "longestStreak" as const, label: "Longest Streak" },
];

function streakValue(
  data: ProfileData,
  key: (typeof STREAK)[number]["key"],
): number {
  if (key === "totalContributions") return data.streak.totalContributions;
  return data.streak[key].length;
}

function statItems(data: ProfileData, showReviews: boolean) {
  const items: { value: number; label: string; color: string }[] = [
    { value: data.stats.totalStars, label: "Stars", color: t.statColors[0] },
    { value: data.stats.totalCommits, label: "Commits", color: t.statColors[1] },
    { value: data.stats.totalPRs, label: "PRs", color: t.statColors[2] },
    { value: data.stats.totalIssues, label: "Issues", color: t.statColors[3] },
  ];
  if (showReviews) {
    items.push({ value: data.stats.totalReviews, label: "Reviews", color: t.accent });
  }
  return items;
}

function defs(): string {
  return `
    <defs>
      <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c9cff"/>
        <stop offset="100%" stop-color="#c084fc"/>
      </linearGradient>
      <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.06)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
      <clipPath id="av"><circle cx="0" cy="0" r="22"/></clipPath>
    </defs>
  `;
}

function header(data: ProfileData): string {
  const name = escapeXml(data.stats.name);
  const login = escapeXml(data.stats.login);
  const avatar = escapeXml(data.stats.avatarUrl);
  const streak = data.streak.currentStreak.length;

  return `
    <g transform="translate(${t.pad}, 22)">
      <circle cx="26" cy="26" r="25" fill="url(#ring)" opacity="0.9"/>
      <circle cx="26" cy="26" r="23" fill="${t.bg}"/>
      <g transform="translate(26, 26)">
        <image href="${avatar}" x="-22" y="-22" width="44" height="44" clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <text x="60" y="22" fill="${t.text}" font-family="${t.font}" font-size="17" font-weight="600" letter-spacing="-0.3">${name}</text>
      <text x="60" y="42" fill="${t.textMuted}" font-family="${t.font}" font-size="12">@${login}</text>
      ${
        streak > 0
          ? `<g transform="translate(${t.width - t.pad * 2 - 108}, 8)">
          <rect width="108" height="28" rx="14" fill="${t.accentGlow}" stroke="${t.panelBorder}" stroke-width="1"/>
          <text x="54" y="18" text-anchor="middle" fill="${t.streakHot}" font-family="${t.font}" font-size="11" font-weight="600">${streak} day streak</text>
        </g>`
          : ""
      }
    </g>
  `;
}

function metricColumn(
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  opts: { hot?: boolean; divider?: boolean } = {},
): string {
  const cx = x + w / 2;
  const valueColor = opts.hot ? t.streakHot : t.text;
  const hotBg = opts.hot
    ? `<rect x="${x + 8}" y="${y - 4}" width="${w - 16}" height="68" rx="10" fill="${t.accentGlow}"/>`
    : "";

  return `
    ${opts.divider ? `<line x1="${x}" y1="${y + 8}" x2="${x}" y2="${y + 56}" stroke="${t.panelBorder}"/>` : ""}
    ${hotBg}
    <text x="${cx}" y="${y + 18}" text-anchor="middle" fill="${t.textDim}" font-family="${t.font}" font-size="9" font-weight="600" letter-spacing="0.8">${label.toUpperCase()}</text>
    <text x="${cx}" y="${y + 46}" text-anchor="middle" fill="${valueColor}" font-family="${t.font}" font-size="${opts.hot ? "28" : "24"}" font-weight="700" letter-spacing="-0.8">${value}</text>
  `;
}

function mainPanel(data: ProfileData, showReviews: boolean): string {
  const panelX = t.pad;
  const panelY = 78;
  const panelW = t.width - t.pad * 2;
  const panelH = 102;
  const streakW = panelW / 3;
  const stats = statItems(data, showReviews);
  const statW = panelW / stats.length;
  const streakY = panelY + 18;
  const statsY = panelY + 62;

  const streakCols = STREAK.map((m, i) =>
    metricColumn(
      panelX + i * streakW,
      streakY,
      streakW,
      m.label,
      compact(streakValue(data, m.key)),
      { hot: "hot" in m && m.hot, divider: i > 0 },
    ),
  ).join("");

  const statCols = stats
    .map((item, i) => {
      const x = panelX + i * statW;
      const cx = x + statW / 2;
      return `
        ${i > 0 ? `<line x1="${x}" y1="${statsY + 6}" x2="${x}" y2="${statsY + 34}" stroke="${t.panelBorder}"/>` : ""}
        <circle cx="${cx}" cy="${statsY + 14}" r="2.5" fill="${item.color}"/>
        <text x="${cx}" y="${statsY + 30}" text-anchor="middle" fill="${t.text}" font-family="${t.font}" font-size="14" font-weight="600">${compact(item.value)}</text>
        <text x="${cx}" y="${statsY + 44}" text-anchor="middle" fill="${t.textDim}" font-family="${t.font}" font-size="9" font-weight="500">${item.label}</text>
      `;
    })
    .join("");

  return `
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}" stroke-width="1"/>
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="40" rx="12" fill="url(#shine)"/>
    <line x1="${panelX + 16}" y1="${panelY + 54}" x2="${panelX + panelW - 16}" y2="${panelY + 54}" stroke="${t.panelBorder}"/>
    ${streakCols}
    ${statCols}
  `;
}

export function renderProfileCard(
  data: ProfileData,
  options: RenderOptions = {},
): string {
  const login = escapeXml(data.stats.login);
  const name = escapeXml(data.stats.name);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${t.width}" height="${t.height}" viewBox="0 0 ${t.width} ${t.height}" role="img" aria-label="GitHub profile for ${login}">
  <title>${name} (@${login})</title>
  ${defs()}
  <rect width="${t.width}" height="${t.height}" rx="${t.radius}" fill="${t.bg}"/>
  <rect x="0.5" y="0.5" width="${t.width - 1}" height="${t.height - 1}" rx="${t.radius}" fill="none" stroke="${t.panelBorder}"/>
  ${header(data)}
  ${mainPanel(data, options.showReviews ?? false)}
</svg>`;
}
